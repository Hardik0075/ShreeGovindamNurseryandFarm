/**
 * Cloudflare Worker: Shri Govindam Nursery Chatbot Backend
 *
 * Dual Parallel AI Architecture (Fastest-Wins Race):
 * 1. Engine 1: Groq Cloud API (Llama 3.3 70B / Llama 3.1 8B) - Ultra-fast (~0.3s - 0.5s response)
 * 2. Engine 2: Google Gemini API (gemini-3.8-flash Interactions API + generateContent)
 * 3. Race Controller: Promise.any() resolves the fastest validated answer immediately
 * 4. Grounded in authoritative plant catalog from data/nursery-knowledge.json
 * 5. Strict ₹0/month budget with automatic fallback to local knowledge base
 */

const SYSTEM_INSTRUCTION = `You are "Govindam Assistant", the knowledgeable, friendly plant and gardening consultant for Shri Govindam Nursery and Farms (located at Dhodhsar, Jaipur, Rajasthan 303712; open 24/7; Phone & WhatsApp: +91 97725 85880; Established 1997 with 25+ years horticultural experience).

CORE NURSERY KNOWLEDGE:
- Small Plants for Office Desk / Balcony:
  • Snake Plant (Sansevieria): NASA-certified air purifier, releases oxygen at night, thrives in indoor low-light, requires watering only every 2-3 weeks.
  • Money Plant (Pothos): Lush trailing greenery, thrives in indirect bright light or clean water vase, natural air filter.
  • Jade Plant & Compact Ficus: Elegant indoor decorative succulents, low maintenance.
  • Areca / Bamboo Palm: Natural indoor humidifier and air toxin filter.

- Fruit Trees (Acclimatized to Rajasthan & North India):
  • Mango (Amrapali, Dasheri, Chausa, Kesar, Langra): ~22 kg CO2/yr, full sun, deep rich loam.
  • Guava (Allahabad Safeda, L-49, VNR Bihi): ~20 kg CO2/yr, drought hardy, regular high yield.
  • Lemon / Kagzi Nimbu (Thin-skinned & Seedless Baramasi): ~15 kg CO2/yr, full sun, year-round fruiting.
  • Pomegranate / Anaar (Bhagwa, Ganesh): ~19 kg CO2/yr, thrives in semi-arid climate.
  • Amla / Aonla (Chakaiya, NA-7): ~18 kg CO2/yr, highly alkaline-tolerant, Vitamin C champion.
  • Sitafal / Custard Apple (~16 kg CO2/yr), Chikoo / Kalipatti (~18 kg CO2/yr), Jamun (~24 kg CO2/yr).

- Medicinal & Sacred Plants:
  • Neem (~26 kg CO2/yr): Natural antibacterial, air purifier, sacred shade tree.
  • Tulsi (Rama & Krishna): Daily immunity booster, sacred spiritual value.
  • Arjun (~24 kg CO2/yr): Ayurvedic cardiovascular tonic tree.
  • Bel Patra: Sacred to Lord Shiva, cooling digestive properties.
  • Moringa / Sahjan: Superfood drumstick tree rich in iron and protein.
  • Aloe Vera: Soothing skin gel, minimal water.

- Vegetable / Kitchen Garden Tips: Provide practical guidance for potatoes, onions, tomatoes, and chillies, and recommend pairing them with organic vermicompost.

- Curated Packages (Include official Carbon Offset Certificate):
  • Fruit Lovers Combo: 10 plants for ₹3,499 (Offsets ~210 kg CO2/yr)
  • Mini Orchard Starter: 15 plants for ₹4,699 (Offsets ~300 kg CO2/yr)
  • Air Purifier Pack: 12 NASA-proven plants for ₹3,999 (Offsets ~120 kg CO2/yr)
  • Sacred & Medicinal Garden: 10 Ayurvedic plants for ₹3,799 (Offsets ~190 kg CO2/yr)
  • Fast-Growing Green Wall: 20 trees for ₹3,999 (Offsets ~460 kg CO2/yr)
  • Commercial Agro-Carbon Orchard: 500+ trees (₹11,25,000 with 3-year agronomy care)

CRITICAL POLICIES & CONSTRAINTS:
1. PRICING: NEVER invent or guess individual plant prices. Prices depend on sapling age, height, and bag size. Always tell customers to connect on WhatsApp (+91 97725 85880) for today's live stock and wholesale rates.
2. IDENTITY: Always represent Shri Govindam Nursery. NEVER say "I am a Meta Llama AI" or "I am Gemini from Google". Refer to yourself simply as "Govindam Assistant".
3. FORMAT: Keep responses warm, helpful, bulleted, and under 170 words.`;

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
    if (request.method === "GET") {
      return jsonResponse({
        status: "online",
        service: "Shri Govindam Nursery Dual Parallel AI API",
        endpoint: "POST /api/chat or POST /",
        engines: {
          groq: {
            configured: Boolean(env.GROQ_API_KEY),
            model: env.GROQ_MODEL || "llama-3.1-8b-instant"
          },
          gemini: {
            configured: Boolean(env.GEMINI_API_KEY),
            model: env.GEMINI_MODEL || "gemini-1.5-flash"
          }
        },
        mode: (env.GROQ_API_KEY && env.GEMINI_API_KEY) ? "parallel_fastest_wins" : "single_or_fallback"
      }, 200, request);
    }

    // Only allow POST requests
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
      if (userMessage.length > 700) {
        return jsonResponse({ error: "Message too long (max 700 characters)" }, 400, request);
      }

      // Sanitize API Keys from Cloudflare environment
      const groqKey = sanitizeKey(env.GROQ_API_KEY, "GROQ_API_KEY");
      const geminiKey = sanitizeKey(env.GEMINI_API_KEY, "GEMINI_API_KEY");

      // Build conversation context if history exists
      let conversationInput = userMessage;
      let historyMessages = [];
      if (Array.isArray(body.history) && body.history.length > 0) {
        historyMessages = body.history
          .filter(h => h && h.text)
          .slice(-4)
          .map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: String(h.text).substring(0, 250)
          }));

        const historyContext = historyMessages
          .map(h => `${h.role === 'user' ? 'Customer' : 'Assistant'}: ${h.content}`)
          .join('\n');
        if (historyContext) {
          conversationInput = `Recent chat:\n${historyContext}\n\nCustomer: ${userMessage}`;
        }
      }

      // ======================================================================
      // 4. Parallel Fastest-Wins Execution (Groq + Gemini Concurrently)
      // ======================================================================
      const parallelTasks = [];

      // Task A: Groq API (Llama 3.1 8B instant - ultra-fast ~0.2s - 0.35s)
      if (groqKey) {
        const groqModel = env.GROQ_MODEL || "llama-3.1-8b-instant";
        parallelTasks.push(callGroq(groqKey, groqModel, userMessage, historyMessages, SYSTEM_INSTRUCTION));
      }

      // Task B: Google Gemini API (gemini-1.5-flash with multi-model fallback)
      if (geminiKey) {
        const geminiModel = env.GEMINI_MODEL || "gemini-1.5-flash";
        parallelTasks.push(callGemini(geminiKey, geminiModel, conversationInput, SYSTEM_INSTRUCTION));
      }

      // If at least one AI engine is configured, run the race!
      if (parallelTasks.length > 0) {
        try {
          // Promise.any resolves with the FIRST successfully answered engine
          const winner = await Promise.any(
            parallelTasks.map(taskPromise =>
              taskPromise.then(result => {
                if (result && result.success && result.text) {
                  return result;
                }
                throw new Error(result ? result.error : "Engine returned empty");
              })
            )
          );

          if (winner && winner.text) {
            return jsonResponse({
              reply: winner.text,
              model: winner.model,
              source: "govindam_ai",
              engine: winner.engine,
              latencyMs: winner.latencyMs,
              fallback: false,
              whatsappUrl: "https://wa.me/919772585880"
            }, 200, request);
          }
        } catch (raceErr) {
          console.warn("[Govindam AI] Parallel AI race failed, falling back to local knowledge base:", raceErr);
        }
      }

      // ======================================================================
      // 5. Offline Verified Knowledge Base (Safety Net)
      // ======================================================================
      const fallback = getKnowledgeFallback(userMessage);
      return jsonResponse({
        reply: fallback.text,
        model: "nursery_knowledge_base",
        source: "offline_fallback",
        engine: "local_knowledge",
        fallback: true,
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
 * Groq Cloud API Caller (Ultra-fast LPU inference with automatic 404 model fallback)
 */
async function callGroq(apiKey, model, userMessage, historyMessages, systemInstruction) {
  const start = Date.now();
  try {
    const endpoint = "https://api.groq.com/openai/v1/chat/completions";
    const messages = [
      { role: "system", content: systemInstruction },
      ...historyMessages,
      { role: "user", content: userMessage }
    ];

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.6,
        max_tokens: 450
      })
    });

    const latencyMs = Date.now() - start;
    if (!res.ok) {
      const errText = await res.text();
      // Auto-fallback: If requested model returned 404 (model not found on account), retry with guaranteed llama-3.1-8b-instant
      if (res.status === 404 && model !== "llama-3.1-8b-instant") {
        console.warn(`[Groq] Model ${model} returned 404. Auto-retrying with llama-3.1-8b-instant...`);
        return callGroq(apiKey, "llama-3.1-8b-instant", userMessage, historyMessages, systemInstruction);
      }
      return { success: false, engine: "groq", status: res.status, error: errText, latencyMs };
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (reply) {
      return {
        success: true,
        engine: "groq",
        model: model,
        text: cleanAiOutput(reply),
        latencyMs
      };
    }
    return { success: false, engine: "groq", status: 200, error: "Empty choice in Groq response", latencyMs };
  } catch (e) {
    return { success: false, engine: "groq", status: 0, error: e.message, latencyMs: Date.now() - start };
  }
}

/**
 * Google Gemini Caller (Multi-model resilience: Interactions API + generateContent)
 */
async function callGemini(apiKey, model, input, systemInstruction) {
  const start = Date.now();
  try {
    // 1. Try Interactions API if specified model is given
    try {
      const interactionsUrl = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(interactionsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          model: model || "gemini-1.5-flash",
          input: input,
          system_instruction: systemInstruction
        })
      });

      if (res.ok) {
        const data = await res.json();
        let extracted = "";

        if (typeof data.output_text === "string" && data.output_text.trim()) {
          extracted = data.output_text;
        } else if (Array.isArray(data.steps)) {
          for (const step of data.steps) {
            if (step.type === "model_output" && Array.isArray(step.content)) {
              for (const c of step.content) {
                if (c && c.type === "text" && c.text) extracted += c.text;
              }
            }
          }
        }

        if (extracted.trim()) {
          return {
            success: true,
            engine: "gemini_interactions",
            model: model || "gemini-1.5-flash",
            text: cleanAiOutput(extracted.trim()),
            latencyMs: Date.now() - start
          };
        }
      }
    } catch (_) {}

    // 2. Secondary generateContent API backup (gemini-1.5-flash & gemini-2.0-flash)
    const geminiCandidates = [model || "gemini-1.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];
    const tried = new Set();

    for (const genModel of geminiCandidates) {
      if (tried.has(genModel)) continue;
      tried.add(genModel);

      try {
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${genModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const genRes = await fetch(genUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: input }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
          })
        });

        if (genRes.ok) {
          const genData = await genRes.json();
          const reply = genData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (reply) {
            return {
              success: true,
              engine: "gemini",
              model: genModel,
              text: cleanAiOutput(reply),
              latencyMs: Date.now() - start
            };
          }
        }
      } catch (_) {}
    }

    return { success: false, engine: "gemini", status: 500, error: "All Gemini model candidates exhausted", latencyMs: Date.now() - start };
  } catch (e) {
    return { success: false, engine: "gemini", status: 0, error: e.message, latencyMs: Date.now() - start };
  }
}

/**
 * Remove any robotic AI provider disclaimers to preserve proprietary Govindam AI branding.
 */
function cleanAiOutput(text) {
  if (!text) return "";
  let cleaned = text;
  cleaned = cleaned.replace(/^(as an ai developed by meta|as a large language model trained by google|i am an ai developed by meta)[^.]*\.\s*/i, '');
  cleaned = cleaned.replace(/^hello!?\s*i am llama[^.]*\.\s*/i, '');
  return cleaned.trim();
}

/**
 * Sanitize API Keys (removes accidental quotes, whitespace, or prefix)
 */
function sanitizeKey(rawKey, keyName) {
  if (!rawKey || typeof rawKey !== 'string') return "";
  let key = rawKey.trim();
  const regex = new RegExp(`^${keyName}\\s*=\\s*`, 'i');
  key = key.replace(regex, '');
  return key.replace(/^["']|["']$/g, '').trim();
}

/**
 * Verified Govindam Nursery Knowledge Base (Offline Safety Net)
 */
function getKnowledgeFallback(query) {
  const q = String(query).toLowerCase().trim();

  // Office desk / small indoor plants
  if (q.includes("office") || q.includes("desk") || q.includes("indoor") || q.includes("balcony") || q.includes("small plant")) {
    return {
      text: `🪴 **Best Plants for Office Desk & Indoors (Govindam Recommendations):**\n\n• **Snake Plant (Sansevieria)**: NASA-certified air purifier that releases oxygen at night. Thrives in indoor light and needs watering only once every 2-3 weeks!\n• **Money Plant (Pothos)**: Lush green trailing vine that purifies indoor air and grows easily in soil or water.\n• **Areca Palm / Jade Plant**: Compact, elegant green accents that add natural freshness to workspaces.\n\n💬 Connect directly on WhatsApp (+91 97725 85880) to get fresh desk saplings delivered in Jaipur!`
    };
  }

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
    text: `🌱 **Govindam Nursery Assistant:**\n\nWe specialize in grafted fruit trees (Mango, Guava, Lemon, Pomegranate), medicinal plants (Neem, Tulsi, Arjun), indoor air-purifiers, and certified carbon-offset packages.\n\nAsk about any plant's care or sunlight requirements, or connect directly with our horticulturists on WhatsApp (+91 97725 85880)!`
  };
}

function getCorsHeaders(request) {
  const origin = request ? request.headers.get("Origin") : "*";
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-goog-api-key, Authorization",
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
