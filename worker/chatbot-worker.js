/**
 * Cloudflare Worker: Shri Govindam Nursery Chatbot Backend
 *
 * Multi-Model Resilient AI Backend:
 * 1. Primary: Google Gen AI Interactions API (POST /v1beta/interactions)
 *    - gemini-3.8-flash (Latest fast reasoning model)
 *    - Auto-failover to gemini-3.5-flash / gemini-2.5-flash if 503 high demand occurs
 * 2. Secondary: Google generateContent API (POST /v1beta/models/...:generateContent)
 *    - gemini-2.5-flash / gemini-2.0-flash
 * 3. Offline Safety Net: Embedded verified nursery knowledge base
 * 4. Strict privacy: Keeps GEMINI_API_KEY completely server-side.
 */

const SYSTEM_INSTRUCTION = `You are "Govindam Assistant", the knowledgeable, helpful gardening expert for Shri Govindam Nursery and Farms (located in Dhodhsar, Jaipur, Rajasthan 303712; open 24/7).

Your instructions:
1. Provide accurate, practical gardening and plant care advice (sunlight, soil, watering, climate adaptation).
2. If asked about plants outside nursery stock (like vegetables, potatoes, onions, or seasonal herbs), give practical care advice warmly, and also suggest Shri Govindam Nursery's fruit trees and green combos for their garden.
3. Fruit trees at nursery: Mango (Amrapali, Dasheri, Chausa, Kesar), Guava (Safeda, L-49, VNR Bihi), Lemon (Kagzi, Seedless), Pomegranate (Bhagwa, Ganesh), Amla (Chakaiya, NA-7), Jamun, Sitafal, Chikoo.
4. Medicinal & Indoor: Neem, Tulsi, Arjun, Bel Patra, Moringa, Snake Plant, Areca Palm, Money Plant.
5. Pricing policy: NEVER guess individual plant prices. Direct pricing and live stock inquiries to WhatsApp (+91 97725 85880).
6. Keep responses clear, friendly, formatted with bullet points, and under 180 words.`;

export default {
  async fetch(request, env) {
    // 1. CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request),
      });
    }

    // 2. Health check for GET /
    const url = new URL(request.url);
    if (request.method === "GET") {
      return jsonResponse({
        status: "online",
        service: "Shri Govindam Nursery Chatbot API",
        endpoint: "POST /api/chat or POST /",
        hasApiKey: Boolean(env.GEMINI_API_KEY),
        primaryModel: env.GEMINI_MODEL || "gemini-3.8-flash",
        api: "Google Interactions API with Multi-Model Failover (gemini-3.8-flash, gemini-3.5-flash, gemini-2.5-flash)"
      }, 200, request);
    }

    // Only allow POST requests (accepts /api/chat, /, or /chat)
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed. Send POST with JSON body: {\"message\": \"...\"}" }, 405, request);
    }

    try {
      // 3. Parse and validate request
      const body = await request.json().catch(() => null);
      if (!body || typeof body.message !== "string") {
        return jsonResponse({ error: "Invalid request: 'message' string is required" }, 400, request);
      }

      const userMessage = body.message.trim();
      if (userMessage.length === 0) {
        return jsonResponse({ error: "Message cannot be empty" }, 400, request);
      }
      if (userMessage.length > 600) {
        return jsonResponse({ error: "Message too long (max 600 characters)" }, 400, request);
      }

      // Check for API key in Cloudflare environment
      const rawKey = env.GEMINI_API_KEY;
      if (!rawKey) {
        const fallback = getKnowledgeFallback(userMessage);
        return jsonResponse({
          reply: fallback.text,
          model: "nursery_knowledge_base",
          source: "offline_fallback",
          fallback: true,
          whatsappUrl: "https://wa.me/919772585880"
        }, 200, request);
      }

      // Sanitize API Key: remove accidental quotes, whitespace, or "GEMINI_API_KEY=" prefix
      let apiKey = rawKey.trim();
      apiKey = apiKey.replace(/^GEMINI_API_KEY\s*=\s*/i, '');
      apiKey = apiKey.replace(/^["']|["']$/g, '').trim();

      // Interactions API endpoint & model candidates
      const interactionsUrl = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(apiKey)}`;
      const preferredModel = env.GEMINI_MODEL || "gemini-3.8-flash";
      const interactionCandidates = [
        preferredModel,
        "gemini-3.5-flash",
        "gemini-2.5-flash"
      ].filter((m, i, arr) => arr.indexOf(m) === i);

      // Build conversation context if history exists
      let conversationInput = userMessage;
      if (Array.isArray(body.history) && body.history.length > 0) {
        const historyContext = body.history
          .filter(h => h && h.text)
          .slice(-4)
          .map(h => `${h.role === 'user' ? 'Customer' : 'Assistant'}: ${String(h.text).substring(0, 200)}`)
          .join('\n');
        if (historyContext) {
          conversationInput = `Recent chat:\n${historyContext}\n\nCustomer: ${userMessage}`;
        }
      }

      // ======================================================================
      // 1. Call Google Interactions API with Multi-Model Failover
      // ======================================================================
      const attempts = [];

      for (const modelName of interactionCandidates) {
        const result = await callInteractions(
          interactionsUrl,
          apiKey,
          modelName,
          conversationInput,
          SYSTEM_INSTRUCTION
        );

        attempts.push({ api: "interactions", model: modelName, status: result.status, error: result.error });

        if (result.success && result.text) {
          return jsonResponse({
            reply: result.text,
            model: modelName,
            source: "google_gemini_ai",
            api: "interactions",
            fallback: false,
            whatsappUrl: "https://wa.me/919772585880"
          }, 200, request);
        }

        // If 400 Bad Request or 403 Forbidden, do not spam other models
        if (result.status === 400 || result.status === 403) {
          break;
        }

        // If 503 (high demand) or 429 (rate limit), pause briefly before trying next model
        if (result.status === 503 || result.status === 429) {
          await new Promise(r => setTimeout(r, 600));
        }
      }

      // ======================================================================
      // 2. Secondary Failover: Try generateContent API
      // ======================================================================
      const generateCandidates = ["gemini-2.0-flash", "gemini-1.5-flash"];
      for (const genModel of generateCandidates) {
        const genResult = await callGenerateContent(
          apiKey,
          genModel,
          conversationInput,
          SYSTEM_INSTRUCTION
        );

        attempts.push({ api: "generateContent", model: genModel, status: genResult.status, error: genResult.error });

        if (genResult.success && genResult.text) {
          return jsonResponse({
            reply: genResult.text,
            model: genModel,
            source: "google_gemini_ai",
            api: "generateContent",
            fallback: false,
            whatsappUrl: "https://wa.me/919772585880"
          }, 200, request);
        }
      }

      // ======================================================================
      // 3. Offline Verified Knowledge Base (when Google AI is busy or offline)
      // ======================================================================
      const lastAttempt = attempts[0] || {};
      let parsedMessage = "";
      try {
        const errObj = JSON.parse(lastAttempt.error);
        parsedMessage = errObj?.error?.message || "";
      } catch (e) {
        parsedMessage = lastAttempt.error || "Service Unavailable";
      }

      const knowledge = getKnowledgeFallback(userMessage);
      if (knowledge && knowledge.text) {
        return jsonResponse({
          reply: knowledge.text,
          model: "nursery_knowledge_base",
          source: "offline_fallback",
          aiStatus: `Model ${lastAttempt.model} (${lastAttempt.status}): ${parsedMessage}`,
          attempts: attempts,
          fallback: true,
          whatsappUrl: "https://wa.me/919772585880"
        }, 200, request);
      }

      return jsonResponse({
        reply: `🌱 Govindam Assistant is experiencing high inquiry traffic at the moment. Please try again shortly, or message our specialists directly on WhatsApp (+91 97725 85880)!`,
        fallback: true,
        statusCode: lastStatus,
        errorDetail: lastError,
        whatsappUrl: "https://wa.me/919772585880"
      }, 200, request);

    } catch (err) {
      console.error("Worker unhandled error:", err);
      const emergency = getKnowledgeFallback(userMessage || "");
      return jsonResponse({
        reply: emergency.text,
        model: "nursery_knowledge_base",
        source: "emergency_fallback",
        fallback: true,
        whatsappUrl: "https://wa.me/919772585880"
      }, 200, request);
    }
  }
};

/**
 * Execute call to Google Interactions API (POST /v1beta/interactions)
 * Clean standard payload matching official GenAI SDK interactions.create.
 */
async function callInteractions(endpoint, apiKey, model, input, systemInstruction) {
  try {
    const payload = {
      model: model,
      input: input
    };
    if (systemInstruction) {
      payload.system_instruction = systemInstruction;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    const status = res.status;
    const rawText = await res.text();

    if (!res.ok) {
      return { success: false, status, error: rawText };
    }

    const data = JSON.parse(rawText);
    let extracted = "";

    // 1. Direct output_text
    if (typeof data.output_text === "string" && data.output_text.trim()) {
      extracted = data.output_text;
    }
    // 2. Steps array with model_output
    else if (Array.isArray(data.steps)) {
      for (const step of data.steps) {
        if (step.type === "model_output") {
          if (Array.isArray(step.content)) {
            for (const c of step.content) {
              if (c && c.type === "text" && c.text) extracted += c.text;
              else if (typeof c === "string") extracted += c;
            }
          } else if (typeof step.text === "string") {
            extracted += step.text;
          }
        }
      }
    }
    // 3. Candidates fallback
    else if (Array.isArray(data.candidates)) {
      extracted = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    if (extracted.trim()) {
      return { success: true, text: extracted.trim(), data };
    }

    return { success: false, status, error: "Empty model output in response: " + rawText };
  } catch (err) {
    return { success: false, status: 0, error: err.message };
  }
}

/**
 * Execute call to Google generateContent API (POST /v1beta/models/...:generateContent)
 * Backup channel if Interactions API has a demand spike.
 */
async function callGenerateContent(apiKey, model, input, systemInstruction) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: input }] }]
    };
    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, status: res.status, error: err };
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && text.trim()) {
      return { success: true, text: text.trim(), data };
    }
    return { success: false, status: res.status, error: "Empty response" };
  } catch (err) {
    return { success: false, status: 0, error: err.message };
  }
}

/**
 * Verified Govindam Nursery Knowledge Base
 */
function getKnowledgeFallback(query) {
  const q = String(query).toLowerCase().trim();

  // Multi-Plant Matcher
  const plantMap = [
    { name: "Lemon / Kagzi Nimbu", icon: "🍋", keys: ["lemon", "nimbu", "citrus", "kagzi"], carbon: 15, care: "Full sun (5-6 hrs), moist well-drained soil", highlights: "Thin-skinned Kagzi & Baramasi seedless varieties" },
    { name: "Mango (Grafted)", icon: "🥭", keys: ["mango", "aam", "amrapali", "dasheri", "chausa", "langra", "kesar"], carbon: 22, care: "Full sun (6-8 hrs), deep fertile loam", highlights: "Amrapali, Dasheri, Chausa, Kesar grafted" },
    { name: "Chikoo (Kalipatti)", icon: "🍈", keys: ["chikoo", "chiku", "sapota", "kalipatti"], carbon: 18, care: "Full sun, deep alluvium soil", highlights: "Sweet evergreen fruit tree, dense shade" },
    { name: "Pomegranate (Anaar)", icon: "🍎", keys: ["pomegranate", "anaar", "anar", "bhagwa", "ganesh"], carbon: 19, care: "Full sun, dry sandy loam", highlights: "Bhagwa & Ganesh (heat hardy for Rajasthan)" },
    { name: "Guava (Safeda / L-49)", icon: "🍈", keys: ["guava", "amrood", "amrud", "safeda", "bihi"], carbon: 20, care: "Full sun, drought hardy", highlights: "Allahabad Safeda, L-49, VNR Bihi" },
    { name: "Amla / Aonla", icon: "🌿", keys: ["amla", "aonla", "chakaiya"], carbon: 18, care: "Full sun, alkaline-tolerant", highlights: "Chakaiya, NA-7 (Vitamin C champion)" },
    { name: "Jamun (Grafted)", icon: "🫐", keys: ["jamun"], carbon: 24, care: "Full sun, moist soil", highlights: "Diabetic health fruit, high carbon storage" },
    { name: "Sitafal (Custard Apple)", icon: "🍈", keys: ["sitafal", "custard apple", "sharifa"], carbon: 16, care: "Low water, rocky/sandy soil", highlights: "Drought-resilient custard apple" },
    { name: "Neem", icon: "🌿", keys: ["neem"], carbon: 26, care: "Drought hardy, almost any soil", highlights: "Antibacterial, natural pesticide, air purifier" },
    { name: "Tulsi (Holy Basil)", icon: "🌱", keys: ["tulsi"], carbon: 6, care: "Morning sun (4-5 hrs)", highlights: "Rama & Krishna Tulsi, daily immunity booster" },
    { name: "Arjun", icon: "🌳", keys: ["arjun"], carbon: 24, care: "Fertile moist soil", highlights: "Ayurvedic heart-health medicinal tree" },
    { name: "Bel Patra", icon: "🍃", keys: ["bel", "belpatra", "bael"], carbon: 18, care: "Full sun, minimal water", highlights: "Sacred to Lord Shiva, cooling digestion" },
    { name: "Snake Plant", icon: "🪴", keys: ["snake plant", "sansevieria"], carbon: 8, care: "Low water, any light", highlights: "Releases oxygen at night, NASA air purifier" }
  ];

  const matched = plantMap.filter(p => p.keys.some(k => q.includes(k)));

  if (matched.length > 1) {
    const totalCO2 = matched.reduce((sum, p) => sum + p.carbon, 0);
    const details = matched.map(p => 
      `• ${p.icon} **${p.name}**\n  ☀️ **Care**: ${p.care}\n  🌍 **Carbon**: ~${p.carbon} kg CO₂/yr | ✨ **Highlights**: ${p.highlights}`
    ).join("\n\n");

    return {
      text: `🌿 **Guide for Your Selected Plants (${matched.length} Trees):**\n\n${details}\n\n🌍 **Combined Carbon Absorption:** ~${totalCO2} kg CO₂ / year!\n\n💰 **Ordering & Sizes**: We have saplings from 1-2 years up to mature trees. Message us directly on WhatsApp (+91 97725 85880) for today's live stock and combo prices!`
    };
  }

  // Vegetables / Kitchen Garden
  if (q.includes("potato") || q.includes("aloo") || q.includes("alu")) {
    return {
      text: `🥔 **Potato Care Guide (Govindam Gardening Essentials):**\n\n• **Soil**: Deep, loose, well-draining sandy loam with rich compost (pH 5.5-6.5).\n• **Sunlight**: 6+ hours of direct sunlight.\n• **Watering**: Keep soil consistently moist but never waterlogged. Stop watering when foliage begins to yellow.\n• **Hilling**: Mound soil around stems as they grow to protect developing tubers from greening.\n\n🌱 *At Shri Govindam Nursery, we also provide rich organic vermicompost and fruit trees to pair with your kitchen garden. WhatsApp us (+91 97725 85880) for supplies!*`
    };
  }

  if (q.includes("onion") || q.includes("pyaz") || q.includes("piyaz")) {
    return {
      text: `🧅 **Onion Care Guide (Govindam Gardening Essentials):**\n\n• **Soil**: Loose, fertile, well-drained loam rich in organic matter.\n• **Sunlight**: Full sun (6-8 hours daily).\n• **Planting Depth**: Keep bulbs shallow (top of the bulb exposed to sunlight).\n• **Watering**: Regular shallow watering; stop watering when tops start falling over to cure the bulbs.\n\n🌱 *Shri Govindam Nursery (Dhodhsar, Jaipur) is open 24/7. Connect on WhatsApp (+91 97725 85880) for garden plants and organic compost!*`
    };
  }

  // Single fruit tree checks
  if (q.includes("mango") || q.includes("aam")) {
    return {
      text: `🥭 **Mango Varieties Available at Shri Govindam Nursery:**\n\n• **Amrapali**: Compact hybrid, regular heavy bearer.\n• **Dasheri**: North Indian aromatic sweet mango.\n• **Chausa**: Rich, sweet late-season mango.\n• **Langra & Kesar**: Highly adaptable, delicious flavor.\n\n☀️ **Care**: Full sun (6-8 hrs), deep fertile loam soil.\n💬 Message on WhatsApp (+91 97725 85880) for live stock & price list!`
    };
  }

  if (q.includes("lemon") || q.includes("nimbu")) {
    return {
      text: `🍋 **Lemon Care & Varieties at Govindam Nursery:**\n\n• **Kagzi Lemon**: Thin-skinned, heavy juicing.\n• **Seedless / Baramasi**: Year-round fruiting.\n\n🌱 **Care Tips:**\n• **Sunlight**: 5-6 hours of direct sun daily.\n• **Watering**: Water when top inch of soil feels dry.\n• **Nutrients**: Add vermicompost or cow manure every 2-3 months.\n💬 Chat on WhatsApp (+91 97725 85880) for orders!`
    };
  }

  return {
    text: `🌱 **Govindam Nursery Assistant:**\n\nWe specialize in grafted fruit trees (Mango, Guava, Lemon, Pomegranate), medicinal plants (Neem, Tulsi, Arjun), and certified carbon-offset packages.\n\nAsk about any plant's care or sunlight requirements, or connect directly with our horticulturists on WhatsApp (+91 97725 85880)!`
  };
}

function getCorsHeaders(request) {
  const origin = request ? request.headers.get("Origin") : "*";
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-goog-api-key",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data, status = 200, request = null) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(request),
    },
  });
}
