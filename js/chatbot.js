/**
 * Govindam Assistant - Free AI Chatbot Frontend
 * Shri Govindam Nursery and Farms
 *
 * Connects to the Cloudflare Worker Gemini proxy backend when available,
 * and gracefully falls back to the embedded verified knowledge base when offline or rate-limited.
 * Never invents prices or stock availability. Always provides WhatsApp click-to-chat handoff.
 */

class GovindamChatbot {
    constructor() {
        this.isOpen = false;
        this.isLoading = false;
        this.conversationHistory = [];
        this.plantData = {
            Mango: { category: 'Fruit', carbon: 22, sunlight: 'Full sun (6-8 hrs)', care: 'Well-draining deep loam, moderate watering', benefits: 'Delicious fruits, excellent shade, high carbon absorption (~22 kg/yr)' },
            Guava: { category: 'Fruit', carbon: 20, sunlight: 'Full sun', care: 'Drought tolerant once established, prune after fruiting', benefits: 'Vitamin C rich, heavy fruiting, hardy' },
            Pomegranate: { category: 'Fruit', carbon: 19, sunlight: 'Full sun', care: 'Thrives in dry climates, well-drained sandy loam', benefits: 'Antioxidant rich, ideal for Rajasthan climate' },
            "Aonla (Amla)": { category: 'Fruit & Medicinal', carbon: 18, sunlight: 'Full sun', care: 'Extremely drought hardy, tolerates alkaline soils', benefits: 'Super-rich Vitamin C, Ayurvedic Rasayana, long life' },
            Amla: { category: 'Fruit & Medicinal', carbon: 18, sunlight: 'Full sun', care: 'Extremely drought hardy, tolerates alkaline soils', benefits: 'Super-rich Vitamin C, Ayurvedic Rasayana, long life' },
            Sitafal: { category: 'Fruit', carbon: 16, sunlight: 'Full sun', care: 'Minimal water, tolerates rocky/poor soils', benefits: 'Custard apple fruits, highly drought-resilient' },
            Chikoo: { category: 'Fruit', carbon: 18, sunlight: 'Full sun', care: 'Deep alluvium soil, regular moderate watering', benefits: 'Sweet evergreen fruit tree, dense shade' },
            Lemon: { category: 'Fruit', carbon: 15, sunlight: 'Full sun (5-6 hrs)', care: 'Moist well-draining soil, organic compost every 2-3 months', benefits: 'Year-round fresh lemons, culinary & medicinal' },
            Nimbu: { category: 'Fruit', carbon: 15, sunlight: 'Full sun (5-6 hrs)', care: 'Moist well-draining soil, organic compost every 2-3 months', benefits: 'Year-round fresh lemons, culinary & medicinal' },
            Jamun: { category: 'Fruit', carbon: 24, sunlight: 'Full sun', care: 'Moist fertile soil, fast growing', benefits: 'Diabetic-friendly fruit, dense shade, high carbon storage (~24 kg/yr)' },
            Neem: { category: 'Medicinal', carbon: 26, sunlight: 'Full sun', care: 'Drought hardy, thrives in almost any soil', benefits: 'Natural pesticide, air purifier, sacred & Ayurvedic champion (~26 kg/yr)' },
            Tulsi: { category: 'Medicinal & Sacred', carbon: 6, sunlight: 'Morning sun (4-5 hrs)', care: 'Water when topsoil dries, well-aerated potting mix', benefits: 'Sacred plant, immunity booster, cough and cold relief' },
            Arjun: { category: 'Medicinal', carbon: 24, sunlight: 'Full sun', care: 'Fertile moist soil, protect sapling in early years', benefits: 'Famous Ayurvedic cardiovascular & heart health tree' },
            BelPatra: { category: 'Sacred & Medicinal', carbon: 18, sunlight: 'Full sun', care: 'Very low water, drought resilient', benefits: 'Sacred to Lord Shiva, cooling digestive properties' },
            Moringa: { category: 'Medicinal', carbon: 18, sunlight: 'Full sun', care: 'Well-draining soil, minimal water, fast growing', benefits: 'Superfood drumstick tree rich in iron and protein' },
            AloeVera: { category: 'Medicinal', carbon: 6, sunlight: 'Bright indirect light', care: 'Water once every 2 weeks, cactus potting mix', benefits: 'Skin soothing, digestive benefits, minimal care' },
            MoneyPlant: { category: 'Decorative & Indoor', carbon: 12, sunlight: 'Bright indirect light', care: 'Moderate watering once a week, easy water propagation', benefits: 'NASA air purifier, aesthetic indoor creeper' },
            Ficus: { category: 'Decorative & Indoor', carbon: 23, sunlight: 'Bright indirect light', care: 'Let top inch dry between watering', benefits: 'Statement indoor foliage, strong air purification' },
            SnakePlant: { category: 'Decorative & Indoor', carbon: 8, sunlight: 'Any light condition', care: 'Water once every 2-3 weeks, hates overwatering', benefits: 'Releases oxygen at night, virtually indestructible' },
            Sagwan: { category: 'Timber', carbon: 30, sunlight: 'Full sun', care: 'Deep well-drained fertile soil', benefits: 'Highest value commercial timber, champion carbon absorber (~30 kg/yr)' },
            Teak: { category: 'Timber', carbon: 30, sunlight: 'Full sun', care: 'Deep well-drained fertile soil', benefits: 'Highest value commercial timber, champion carbon absorber (~30 kg/yr)' },
            Poplar: { category: 'Timber', carbon: 25, sunlight: 'Full sun', care: 'Moist soil, rapid growth', benefits: 'Quick agroforestry, fast shade and windbreak' },
            Potato: { category: 'Vegetable / Tuber', carbon: 2, sunlight: 'Full sun (6+ hrs)', care: 'Deep loose well-drained sandy loam, hill up soil around stems as shoots grow, keep evenly moist', benefits: 'High yielding kitchen garden crop, rich in carbohydrates and potassium' },
            Onion: { category: 'Vegetable / Allium', carbon: 2, sunlight: 'Full sun (6-8 hrs)', care: 'Loose rich soil with good drainage, shallow planting with bulb tops exposed, stop watering when tops fall over', benefits: 'Essential culinary staple, antioxidant rich, great companion crop' },
            Tomato: { category: 'Vegetable', carbon: 3, sunlight: 'Full sun (6-8 hrs)', care: 'Fertile compost-rich soil, deep root watering, provide stake or cage support', benefits: 'Prolific fruiting, rich in Lycopene and Vitamin C' },
            Chilli: { category: 'Vegetable / Spice', carbon: 2, sunlight: 'Full sun (5-6 hrs)', care: 'Warm climate, well-draining potting mix, water when topsoil feels dry', benefits: 'High yielding hot chillies, natural pest deterrent' }
        };

        this.init();
    }

    getWhatsAppUrl(customText) {
        if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.whatsapp && SITE_CONFIG.whatsapp.getChatUrl) {
            return SITE_CONFIG.whatsapp.getChatUrl(customText);
        }
        const text = encodeURIComponent(customText || "Hello! I am inquiring about plants from Shri Govindam Nursery.");
        return `https://wa.me/919772585880?text=${text}`;
    }

    getContactPhone() {
        if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.whatsapp && SITE_CONFIG.whatsapp.displayNumber) {
            return SITE_CONFIG.whatsapp.displayNumber;
        }
        return "+91 97725 85880";
    }

    init() {
        this.createChatbotHTML();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }

    createChatbotHTML() {
        if (document.getElementById('chatbot-container')) return;

        const waUrl = this.getWhatsAppUrl("Hello! I'm chatting via your website assistant and have a question.");

        const chatbotHTML = `
            <div id="chatbot-container" class="chatbot-container">
                <div id="chatbot-toggle" class="chatbot-toggle" title="Chat with Govindam Assistant" aria-label="Open chat">
                    <i class="fas fa-seedling"></i>
                    <span class="chatbot-badge">Ask AI</span>
                </div>
                <div id="chatbot-window" class="chatbot-window" role="dialog" aria-label="Govindam Nursery Chat Assistant">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <i class="fas fa-seedling"></i>
                            <span>Govindam Assistant</span>
                        </div>
                        <div class="chat-header-actions">
                            <a href="${waUrl}" target="_blank" class="chat-header-wa" title="Chat directly on WhatsApp" aria-label="Chat on WhatsApp">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                            <button id="chatbot-close" class="chatbot-close" title="Close chat" aria-label="Close chat">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div id="chatbot-messages" class="chatbot-messages" aria-live="polite"></div>
                    <div class="chatbot-input-container">
                        <input type="text" id="chatbot-input" placeholder="Ask about plants, care, combos (e.g. Lemon care)..." maxlength="400" autocomplete="off">
                        <button id="chatbot-send" class="chatbot-send" title="Send message" aria-label="Send message">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="chatbot-quick-actions">
                        <button class="quick-btn" data-action="fruit">🍎 Fruit Trees</button>
                        <button class="quick-btn" data-action="medicinal">🌿 Medicinal</button>
                        <button class="quick-btn" data-action="carbon">🌍 Carbon Offset</button>
                        <button class="quick-btn" data-action="packages">🎁 Combos</button>
                        <button class="quick-btn" data-action="whatsapp">💬 WhatsApp</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    attachEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');
        const quickBtns = document.querySelectorAll('.quick-btn');

        if (toggle) toggle.addEventListener('click', () => this.toggleChatbot());
        if (close) close.addEventListener('click', () => this.closeChatbot());
        if (send) send.addEventListener('click', () => this.handleSendMessage());

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
        }

        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    toggleChatbot() {
        const win = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            win.style.display = 'flex';
            toggle.style.display = 'none';
            setTimeout(() => {
                const inp = document.getElementById('chatbot-input');
                if (inp) inp.focus();
            }, 100);
        } else {
            win.style.display = 'none';
            toggle.style.display = 'flex';
        }
    }

    closeChatbot() {
        this.isOpen = false;
        const win = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        if (win) win.style.display = 'none';
        if (toggle) toggle.style.display = 'flex';
    }

    addMessage(htmlContent, isUser = false, showWhatsAppButton = false) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${isUser ? 'user' : 'bot'}`;

        let waButtonHtml = '';
        if (showWhatsAppButton && !isUser) {
            const waUrl = this.getWhatsAppUrl("Hello! I want to check prices and order plants from Shri Govindam Nursery.");
            waButtonHtml = `
                <div style="margin-top: 8px;">
                    <a href="${waUrl}" target="_blank" class="chat-whatsapp-btn">
                        <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                    </a>
                </div>
            `;
        }

        if (!isUser) {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-seedling"></i>
                </div>
                <div class="message-content">
                    <div>${htmlContent}</div>
                    ${waButtonHtml}
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${this.escapeHtml(htmlContent)}</div>
                <div class="message-avatar user-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addWelcomeMessage() {
        const welcome = `
            🌱 <strong>Welcome to Shri Govindam Nursery and Farms!</strong><br><br>
            I am your virtual assistant. Ask me anything about:
            <br>• Fruit trees, care & watering
            <br>• Medicinal & indoor air-purifying plants
            <br>• Carbon absorption & certified packages
            <br>• Nursery location (Dhodhsar, Jaipur - Open 24/7)
            <br><br>How can I help you green your space today?
        `;
        this.addMessage(welcome, false, false);
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer || document.getElementById('typing-indicator')) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-seedling"></i></div>
            <div class="message-content">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    async handleSendMessage() {
        if (this.isLoading) return;

        const input = document.getElementById('chatbot-input');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        // Display user message
        this.addMessage(text, true);
        input.value = '';
        this.isLoading = true;

        // Show typing indicator
        this.showTypingIndicator();

        // 1. Try sending to the backend Cloudflare Worker (Gemini API)
        const endpoint = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.api && SITE_CONFIG.api.chatbotEndpoint)
            ? SITE_CONFIG.api.chatbotEndpoint
            : 'https://shri-govindam-chatbot.hardiksharma96633.workers.dev/api/chat';

        console.log('[Govindam AI] Calling Backend API:', endpoint);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000); // 25-second timeout (accommodates Gemini thinking & multi-model retry)

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: this.conversationHistory.slice(-4)
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log('[Govindam AI] Response Status:', response.status);

            if (response.ok) {
                const data = await response.json();
                this.hideTypingIndicator();
                this.isLoading = false;
                console.log('[Govindam AI] Received payload from backend:', data);

                // If backend returned a valid reply from live AI
                if (data && data.reply && !data.fallback) {
                    const badge = `<div class="govindam-ai-badge" style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: #1b5e20; background: #e8f5e9; padding: 2px 9px; border-radius: 12px; margin-bottom: 8px; font-weight: 600; border: 1px solid #c8e6c9;"><i class="fas fa-leaf" style="color: #2e7d32; font-size: 10px;"></i> Govindam AI</div><br>`;
                    const formatted = badge + this.formatMarkdown(data.reply);
                    const shouldShowWA = Boolean(
                        data.whatsappUrl ||
                        text.toLowerCase().includes('price') ||
                        text.toLowerCase().includes('cost') ||
                        text.toLowerCase().includes('buy') ||
                        text.toLowerCase().includes('order')
                    );

                    this.addMessage(formatted, false, shouldShowWA);
                    this.conversationHistory.push({ role: 'user', text: text });
                    this.conversationHistory.push({ role: 'model', text: data.reply });
                    return;
                }

                // If backend signaled fallback (e.g. temporary API quota issue)
                if (data && data.fallback) {
                    if (data.reply) {
                        this.addMessage(this.formatMarkdown(data.reply), false, true);
                        this.conversationHistory.push({ role: 'user', text: text });
                        this.conversationHistory.push({ role: 'model', text: data.reply });
                        return;
                    }
                    const localCheck = this.generateLocalFallback(text);
                    if (localCheck.isSpecific) {
                        this.addMessage(localCheck.html, false, localCheck.showWhatsApp);
                        this.conversationHistory.push({ role: 'user', text: text });
                        this.conversationHistory.push({ role: 'model', text: localCheck.text });
                        return;
                    }
                }
            }
        } catch (err) {
            console.warn('[Govindam AI] Backend unreachable or offline, using local engine:', err.message);
        }

        // 2. Offline / Local Engine
        this.hideTypingIndicator();
        this.isLoading = false;

        const fallbackResponse = this.generateLocalFallback(text);
        this.addMessage(fallbackResponse.html, false, fallbackResponse.showWhatsApp);

        this.conversationHistory.push({ role: 'user', text: text });
        this.conversationHistory.push({ role: 'model', text: fallbackResponse.text });
    }

    generateLocalFallback(query) {
        const q = query.toLowerCase().trim();
        const phone = this.getContactPhone();

        // 1. Greetings (Hi, Hello, How are you, etc.)
        if (
            q === 'hi' || q === 'hello' || q === 'hey' ||
            q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey ') ||
            q.includes('hwo are you') || q.includes('how are you') ||
            q.includes('namaste') || q.includes('kaise ho') || q.includes('kese ho') ||
            q.includes('good morning') || q.includes('good evening')
        ) {
            return {
                html: `👋 <strong>Hello! Welcome to Shri Govindam Nursery and Farms!</strong><br><br>
                I am your virtual gardening & plant assistant 🌱. I can help you with:
                <br>• <strong>Fruit Trees & Plant Care:</strong> Sunlight, soil, watering guides
                <br>• <strong>Carbon Offsetting:</strong> High-absorption trees & certified combos
                <br>• <strong>Medicinal & Indoor Plants:</strong> Neem, Tulsi, Snake Plant
                <br>• <strong>Nursery Timings & Location:</strong> Dhodhsar, Jaipur (Open 24/7)
                <br><br>What would you like to explore today?`,
                text: "Hello! Welcome to Shri Govindam Nursery. How can I help you green your space today?",
                showWhatsApp: false,
                isSpecific: true
            };
        }

        // 2. Pricing check - STRICT: Never invent prices
        if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('₹') || q.includes('kitne') || q.includes('paisa')) {
            return {
                html: `💰 <strong>Plant Pricing at Govindam Nursery:</strong><br><br>
                Individual plant prices depend on sapling age, height, and bag size.<br>
                For verified current rates, stock availability, and bulk wholesale discounts, please chat directly with our nursery team on WhatsApp (${phone}).`,
                text: `Individual plant prices depend on age and bag size. Please check via WhatsApp at ${phone}.`,
                showWhatsApp: true,
                isSpecific: true
            };
        }

        // 3. Availability / Stock / Order check
        if (q.includes('available') || q.includes('stock') || q.includes('buy') || q.includes('order') || q.includes('kharid') || q.includes('purchase')) {
            return {
                html: `🌿 <strong>Plant Availability & Orders:</strong><br><br>
                We have over 500+ plant varieties ready at our nursery in Dhodhsar, Jaipur!<br>
                To confirm today's live nursery stock or arrange delivery, please message us on WhatsApp with your required plants.`,
                text: "To confirm stock or order, message us on WhatsApp.",
                showWhatsApp: true,
                isSpecific: true
            };
        }

        // 4. Carbon Offset & CO2 Sequestration queries
        if (q.includes('carbon') || q.includes('co2') || q.includes('offset') || q.includes('absorption') || q.includes('footprint') || q.includes('global warming')) {
            return {
                html: `🌍 <strong>Verified Carbon Offsetting at Govindam:</strong><br><br>
                Plants absorb atmospheric carbon dioxide through natural sequestration. Top carbon absorbers:<br>
                • <strong>Sagwan / Teak:</strong> ~30 kg CO₂ / year (Top timber sink)<br>
                • <strong>Neem:</strong> ~26 kg CO₂ / year (Native Rajasthan champion)<br>
                • <strong>Poplar:</strong> ~25 kg CO₂ / year (Rapid agroforestry)<br>
                • <strong>Jamun:</strong> ~24 kg CO₂ / year (Dense foliage)<br>
                • <strong>Mango:</strong> ~22 kg CO₂ / year (Fruit + High canopy)<br>
                • <strong>Guava:</strong> ~20 kg CO₂ / year (Hardy drought resilient)<br><br>
                <em>Every curated package includes an official Carbon Offset Certificate!</em>`,
                text: "Top carbon absorbers: Sagwan (30 kg/yr), Neem (26 kg/yr), Jamun (24 kg/yr), Mango (22 kg/yr). Check our Packages for certified carbon combos.",
                showWhatsApp: true,
                isSpecific: true
            };
        }

        // 5. Package / Combo deals check
        if (q.includes('package') || q.includes('combo') || q.includes('deal') || q.includes('offer')) {
            return {
                html: `🎁 <strong>Curated Plant Packages & Carbon Offsets:</strong><br><br>
                • <strong>Fruit Lovers Combo:</strong> 10 fruit trees (Mango, Guava, Sitafal, Pomegranate) - ₹3,499 (Offsets ~210 kg CO₂/yr)<br>
                • <strong>Mini Orchard Starter:</strong> 15 fruit trees with 9 species - ₹4,699 (Offsets ~300 kg CO₂/yr)<br>
                • <strong>Air Purifier Pack:</strong> 12 NASA-proven plants - ₹3,999 (Offsets ~120 kg CO₂/yr)<br>
                • <strong>Fast-Growing Green Wall:</strong> 20 rapid trees - ₹3,999 (Offsets ~460 kg CO₂/yr)<br>
                • <strong>Sacred & Medicinal Garden:</strong> 10 Ayurvedic plants - ₹3,799 (Offsets ~190 kg CO₂/yr)<br><br>
                <em>Visit our Packages page for all 9 curated combos with certificates!</em>`,
                text: "Our packages include Fruit Lovers (₹3,499), Mini Orchard (₹4,699), Air Purifier (₹3,999), and Fast-Growing Green Wall (₹3,999).",
                showWhatsApp: true,
                isSpecific: true
            };
        }

        // 6. Multi-plant or specific plant search in database
        const plantAliases = {
            Mango: { aliases: ['mango', 'aam', 'amrapali', 'dasheri', 'chausa', 'langra', 'kesar'], icon: '🥭' },
            Lemon: { aliases: ['lemon', 'nimbu', 'citrus', 'kagzi'], icon: '🍋' },
            Pomegranate: { aliases: ['pomegranate', 'anaar', 'anar', 'bhagwa', 'ganesh'], icon: '🍎' },
            Chikoo: { aliases: ['chikoo', 'chiku', 'sapota', 'kalipatti'], icon: '🍈' },
            Guava: { aliases: ['guava', 'amrood', 'amrud', 'safeda', 'bihi'], icon: '🍈' },
            Amla: { aliases: ['amla', 'aonla', 'chakaiya'], icon: '🌿' },
            Sitafal: { aliases: ['sitafal', 'custard apple', 'sharifa'], icon: '🍈' },
            Jamun: { aliases: ['jamun', 'black plum'], icon: '🫐' },
            Neem: { aliases: ['neem'], icon: '🌿' },
            Tulsi: { aliases: ['tulsi', 'holy basil'], icon: '🌱' },
            Arjun: { aliases: ['arjun', 'terminalia'], icon: '🌳' },
            BelPatra: { aliases: ['bel', 'belpatra', 'bael'], icon: '🍃' },
            Moringa: { aliases: ['moringa', 'sahjan', 'drumstick'], icon: '🌿' },
            SnakePlant: { aliases: ['snake plant', 'sansevieria'], icon: '🪴' },
            MoneyPlant: { aliases: ['money plant', 'pothos'], icon: '🪴' },
            Ficus: { aliases: ['ficus'], icon: '🪴' },
            AloeVera: { aliases: ['aloe', 'aloevera', 'ghritkumari'], icon: '🪴' },
            Teak: { aliases: ['teak', 'sagwan'], icon: '🌲' },
            Poplar: { aliases: ['poplar'], icon: '🌲' },
            Potato: { aliases: ['potato', 'potatoes', 'aloo', 'alu'], icon: '🥔' },
            Onion: { aliases: ['onion', 'onions', 'pyaz', 'piyaz'], icon: '🧅' },
            Tomato: { aliases: ['tomato', 'tomatoes', 'tamatar'], icon: '🍅' },
            Chilli: { aliases: ['chilli', 'chili', 'mirch', 'mirchi'], icon: '🌶️' }
        };

        const matchedPlants = [];
        for (const [plantName, meta] of Object.entries(plantAliases)) {
            const hasMatch = meta.aliases.some(alias => {
                const regex = new RegExp(`\\b${alias}`, 'i');
                return regex.test(q) || q.includes(alias);
            });
            if (hasMatch && this.plantData[plantName]) {
                matchedPlants.push({ name: plantName, icon: meta.icon, ...this.plantData[plantName] });
            }
        }

        // Multi-plant match (e.g. Lemon, Mango, Chiku, Anaar)
        if (matchedPlants.length > 1) {
            let totalCarbon = 0;
            let plantListHtml = '';
            let plantListText = '';

            matchedPlants.forEach(p => {
                totalCarbon += p.carbon;
                plantListHtml += `
                <div style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed #d1e7dd;">
                    <strong>${p.icon} ${p.name}</strong> (${p.category})<br>
                    • <strong>☀️ Sunlight:</strong> ${p.sunlight}<br>
                    • <strong>💧 Care & Soil:</strong> ${p.care}<br>
                    • <strong>🌍 Carbon Absorption:</strong> ~${p.carbon} kg CO₂/year<br>
                    • <strong>✨ Highlights:</strong> ${p.benefits}
                </div>`;
                plantListText += `• ${p.name}: ${p.sunlight}, ${p.care}, ~${p.carbon} kg CO2/yr.\n`;
            });

            return {
                html: `🌿 <strong>Plant Guide for Your Selected Varieties (${matchedPlants.length} Trees):</strong><br><br>
                ${plantListHtml}
                🌍 <strong>Combined Carbon Absorption: ~${totalCarbon} kg CO₂ / year</strong><br><br>
                <em>Tap below to check live sapling sizes & order this combo via WhatsApp!</em>`,
                text: `Selected Plants:\n${plantListText}Combined Carbon Absorption: ~${totalCarbon} kg CO2/year.\nOrder on WhatsApp at ${phone}.`,
                showWhatsApp: true,
                isSpecific: true
            };
        }

        // Single plant match
        if (matchedPlants.length === 1) {
            const p = matchedPlants[0];
            return {
                html: `${p.icon} <strong>${p.name}</strong> (${p.category})<br><br>
                • <strong>☀️ Sunlight:</strong> ${p.sunlight}<br>
                • <strong>💧 Care & Soil:</strong> ${p.care}<br>
                • <strong>🌍 Carbon Absorption:</strong> ~${p.carbon} kg CO₂/year<br>
                • <strong>✨ Benefits:</strong> ${p.benefits}<br><br>
                <em>Tap below to check sapling sizes & order via WhatsApp!</em>`,
                text: `${p.name} (${p.category}): Sunlight: ${p.sunlight}. Care: ${p.care}. Carbon: ~${p.carbon} kg CO2/year.`,
                showWhatsApp: true,
                isSpecific: true
            };
        }

        // 7. Plant categories check
        if (q.includes('fruit') || q.includes('phal') || q.includes('aam') || q.includes('amrud')) {
            return {
                html: `🥭 <strong>Fruit Trees at Shri Govindam Nursery:</strong><br><br>
                • <strong>Mango:</strong> Amrapali, Dasheri, Chausa, Kesar (Full sun, deep soil)<br>
                • <strong>Guava:</strong> Allahabad Safeda, L-49, VNR Bihi (Drought hardy)<br>
                • <strong>Pomegranate:</strong> Bhagwa, Ganesh (Thrives in Rajasthan climate)<br>
                • <strong>Amla (Aonla):</strong> Chakaiya, NA-7 (Vitamin C champion)<br>
                • <strong>Lemon / Kagzi Nimbu:</strong> High fruiting, culinary & medicinal<br>
                • <strong>Sitafal & Chikoo:</strong> Sweet organic fruit yield<br><br>
                <em>Ask me about care for any fruit plant!</em>`,
                text: "Popular fruit trees include Mango, Guava, Pomegranate, Amla, and Lemon. Ask for care tips on any of them!",
                showWhatsApp: true,
                isSpecific: true
            };
        }

        if (q.includes('medicinal') || q.includes('ayurved') || q.includes('herb')) {
            return {
                html: `🌿 <strong>Medicinal & Ayurvedic Plants:</strong><br><br>
                • <strong>Neem:</strong> Air purifier & natural antibacterial (~26 kg CO₂/yr)<br>
                • <strong>Tulsi:</strong> Sacred Rama & Krishna Tulsi for daily immunity<br>
                • <strong>Arjun:</strong> Ayurvedic cardiovascular health tree (~24 kg CO₂/yr)<br>
                • <strong>Bel Patra:</strong> Sacred to Lord Shiva, digestive benefits<br>
                • <strong>Moringa:</strong> Superfood drumstick tree rich in iron/calcium<br>
                • <strong>Aloe Vera:</strong> Soothing gel for skin wellness & digestion`,
                text: "Medicinal plants include Neem, Tulsi, Arjun, Bel Patra, Moringa, and Aloe Vera.",
                showWhatsApp: true,
                isSpecific: true
            };
        }

        // 8. General Care advice
        if (q.includes('care') || q.includes('water') || q.includes('soil') || q.includes('sunlight') || q.includes('fertilizer') || q.includes('khad')) {
            return {
                html: `🌱 <strong>Gardening Care Essentials:</strong><br><br>
                • <strong>Watering:</strong> Water deeply when top 1-2 inches of soil feel dry. Early morning watering prevents fungal diseases.<br>
                • <strong>Sunlight:</strong> Fruit & flowering trees require 6+ hours of direct sunlight. Foliage & indoor plants thrive in bright indirect light.<br>
                • <strong>Soil & Drainage:</strong> Use well-draining sandy loam with 25% organic vermicompost. Always ensure pots have drainage holes.<br>
                • <strong>Nutrition:</strong> Feed with organic manure or neem cake every 30-45 days during active growing seasons.`,
                text: "Water deeply when topsoil feels dry, ensure 6+ hours sun for fruit trees, and feed organic vermicompost every 30 days.",
                showWhatsApp: false,
                isSpecific: false
            };
        }

        // 9. Location / Timings / Contact
        if (q.includes('contact') || q.includes('location') || q.includes('address') || q.includes('kahan') || q.includes('time') || q.includes('open') || q.includes('phone') || q.includes('number')) {
            return {
                html: `📍 <strong>Shri Govindam Nursery and Farms:</strong><br><br>
                • <strong>Address:</strong> Dhodhsar, Jaipur, Rajasthan 303712<br>
                • <strong>Timings:</strong> Open Daily 24 x 7<br>
                • <strong>Phone & WhatsApp:</strong> ${phone}<br>
                • <strong>Email:</strong> sgnd1997@gmail.com<br><br>
                <em>Visit us anytime or tap below to message directly on WhatsApp!</em>`,
                text: `We are located at Dhodhsar, Jaipur, Rajasthan 303712. Open 24/7. Phone & WhatsApp: ${phone}.`,
                showWhatsApp: true,
                isSpecific: true
            };
        }

        // 10. General friendly fallback
        return {
            html: `🌱 <strong>How can I assist you with your garden?</strong><br><br>
            You can ask me about:
            <br>• <strong>Fruit trees:</strong> Mango, Guava, Lemon, Amla, Pomegranate
            <br>• <strong>Medicinal herbs:</strong> Neem, Tulsi, Arjun, Moringa
            <br>• <strong>Carbon offset combos:</strong> CO₂ absorption & packages
            <br>• <strong>Care guides:</strong> Watering, soil, and sunlight
            <br><br>Or chat directly with our nursery specialists on WhatsApp (${phone})!`,
            text: `Feel free to ask about our plants, care guides, or message us on WhatsApp at ${phone}.`,
            showWhatsApp: true,
            isSpecific: false
        };
    }

    handleQuickAction(action) {
        switch (action) {
            case 'fruit':
                this.addMessage('Show me popular fruit plants', true);
                setTimeout(() => {
                    const fallback = this.generateLocalFallback('fruit');
                    this.addMessage(fallback.html, false, fallback.showWhatsApp);
                }, 300);
                break;

            case 'medicinal':
                this.addMessage('Tell me about medicinal plants', true);
                setTimeout(() => {
                    const fallback = this.generateLocalFallback('medicinal');
                    this.addMessage(fallback.html, false, fallback.showWhatsApp);
                }, 300);
                break;

            case 'carbon':
                this.addMessage('How does carbon offsetting work with your plants?', true);
                setTimeout(() => {
                    const fallback = this.generateLocalFallback('carbon');
                    this.addMessage(fallback.html, false, fallback.showWhatsApp);
                }, 300);
                break;

            case 'packages':
                this.addMessage('Show me package deals', true);
                setTimeout(() => {
                    const fallback = this.generateLocalFallback('package');
                    this.addMessage(fallback.html, false, fallback.showWhatsApp);
                }, 300);
                break;

            case 'whatsapp':
                window.open(this.getWhatsAppUrl("Hello! I am contacting you from your website assistant."), '_blank');
                break;
        }
    }

    formatMarkdown(text) {
        if (!text) return '';
        let formatted = this.escapeHtml(text);

        // Bold: **text** -> <strong>text</strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic: *text* -> <em>$1</em>
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Line breaks: \n -> <br>
        formatted = formatted.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

        return formatted;
    }

    escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.govindamChatbot = new GovindamChatbot();
    });
} else {
    window.govindamChatbot = new GovindamChatbot();
}
