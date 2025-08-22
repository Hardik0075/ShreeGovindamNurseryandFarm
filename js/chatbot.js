// Chatbot functionality for Shri Govindam Nursery and Farms
class GovindamChatbot {
    constructor() {
        console.log('GovindamChatbot constructor called');
        this.isOpen = false;
        this.messages = [];
        this.plantData = {
            Mango: { carbon: 20, category: 'Fruit', care: 'Full sun, well-drained soil, regular watering', benefits: 'Delicious fruits, excellent shade tree, high carbon absorption' },
            Guava: { carbon: 15, category: 'Fruit', care: 'Full sun, moderate watering, pruning required', benefits: 'Vitamin C rich fruits, fast growing, medicinal leaves' },
            Pomegranate: { carbon: 10, category: 'Fruit', care: 'Full sun, drought tolerant, minimal care', benefits: 'Antioxidant rich fruits, ornamental flowers, long lifespan' },
            Orange: { carbon: 10, category: 'Fruit', care: 'Full sun, regular watering, citrus fertilizer', benefits: 'Vitamin C fruits, fragrant flowers, evergreen foliage' },
            Lichi: { carbon: 10, category: 'Fruit', care: 'Partial shade, high humidity, rich soil', benefits: 'Sweet exotic fruits, attractive foliage, moderate growth' },
            Neem: { carbon: 20, category: 'Medicinal', care: 'Full sun, drought tolerant, minimal care', benefits: 'Natural pesticide, medicinal properties, air purification' },
            Poplar: { carbon: 22, category: 'Timber', care: 'Full sun, moist soil, fast growing', benefits: 'Rapid growth, windbreak, high carbon sequestration' },
            Eucalyptus: { carbon: 22, category: 'Timber', care: 'Full sun, well-drained soil, drought tolerant', benefits: 'Fast growth, aromatic leaves, medicinal oil' },
            Moringa: { carbon: 18, category: 'Medicinal', care: 'Full sun, well-drained soil, minimal water', benefits: 'Superfood leaves, fast growing, drought resistant' },
            Arjun: { carbon: 20, category: 'Medicinal', care: 'Full sun, moist soil, slow growing', benefits: 'Heart health benefits, strong timber, sacred tree' },
            Ficus: { carbon: 20, category: 'Decorative', care: 'Partial shade, regular watering, humid conditions', benefits: 'Air purification, indoor/outdoor use, low maintenance' },
            MoneyPlant: { carbon: 6, category: 'Decorative', care: 'Indirect light, moderate watering, climbing support', benefits: 'Air purification, easy propagation, good luck symbol' },
            Ashok: { carbon: 18, category: 'Decorative', care: 'Partial shade, regular watering, rich soil', benefits: 'Sacred tree, beautiful foliage, medicinal bark' },
            BottleBrush: { carbon: 10, category: 'Decorative', care: 'Full sun, well-drained soil, drought tolerant', benefits: 'Unique red flowers, attracts birds, evergreen' },
            SilverOak: { carbon: 20, category: 'Timber', care: 'Full sun, well-drained soil, fast growing', benefits: 'Quick shade, windbreak, attractive silver leaves' },
            Tulsi: { carbon: 6, category: 'Medicinal', care: 'Full sun, well-drained soil, regular watering', benefits: 'Sacred plant, medicinal properties, aromatic leaves' },
            "Aonla (Amla)": { carbon: 15, category: 'Fruit', care: 'Full sun, well-drained soil, drought tolerant', benefits: 'Vitamin C rich, medicinal fruit, long lifespan' },
            BelPatra: { carbon: 10, category: 'Sacred', care: 'Full sun, well-drained soil, minimal care', benefits: 'Sacred to Lord Shiva, medicinal leaves, fragrant flowers' },
            Chandan: { carbon: 10, category: 'Sacred', care: 'Partial shade, well-drained soil, slow growing', benefits: 'Fragrant wood, medicinal properties, sacred significance' },
            Jamun: { carbon: 15, category: 'Fruit', care: 'Full sun, moist soil, regular watering', benefits: 'Diabetic-friendly fruit, medicinal bark, shade tree' },
            Lemon: { carbon: 10, category: 'Fruit', care: 'Full sun, well-drained soil, regular watering', benefits: 'Vitamin C fruits, culinary use, fragrant flowers' },
            Gulmohar: { carbon: 18, category: 'Decorative', care: 'Full sun, well-drained soil, drought tolerant', benefits: 'Spectacular red flowers, excellent shade, fast growing' },
            Termelia: { carbon: 10, category: 'Medicinal', care: 'Full sun, well-drained soil, drought tolerant', benefits: 'Medicinal bark, timber use, low maintenance' },
            Conocarpus: { carbon: 15, category: 'Decorative', care: 'Full sun, salt tolerant, minimal care', benefits: 'Windbreak, coastal planting, attractive foliage' },
            Mogra: { carbon: 6, category: 'Flowering', care: 'Partial shade, regular watering, rich soil', benefits: 'Fragrant white flowers, essential oil, ornamental' },
            Ratrani: { carbon: 6, category: 'Flowering', care: 'Partial shade, moderate watering, climbing support', benefits: 'Night-blooming fragrant flowers, ornamental vine' },
            MadhuKamini: { carbon: 6, category: 'Flowering', care: 'Full sun, well-drained soil, regular watering', benefits: 'Sweet fragrant flowers, compact size, ornamental' },
            RaiBel: { carbon: 6, category: 'Sacred', care: 'Full sun, well-drained soil, minimal care', benefits: 'Sacred significance, medicinal properties, fragrant' },
            Rose: { carbon: 6, category: 'Flowering', care: 'Full sun, rich soil, regular watering', benefits: 'Beautiful flowers, fragrance, medicinal petals' },
            Chameli: { carbon: 6, category: 'Flowering', care: 'Partial shade, regular watering, climbing support', benefits: 'Fragrant white flowers, essential oil, ornamental vine' },
            Gudahal: { carbon: 6, category: 'Flowering', care: 'Full sun, regular watering, rich soil', benefits: 'Colorful flowers, medicinal use, attracts butterflies' },
            DoubleChandani: { carbon: 6, category: 'Flowering', care: 'Partial shade, regular watering, rich soil', benefits: 'Double fragrant flowers, ornamental, compact' },
            MadhuMalati: { carbon: 6, category: 'Flowering', care: 'Partial shade, moderate watering, climbing support', benefits: 'Sweet fragrant flowers, ornamental vine, low maintenance' },
            Tikoma: { carbon: 10, category: 'Decorative', care: 'Full sun, well-drained soil, drought tolerant', benefits: 'Yellow trumpet flowers, fast growing, ornamental' },
            Voganvilia: { carbon: 6, category: 'Flowering', care: 'Full sun, well-drained soil, drought tolerant', benefits: 'Colorful bracts, thorny climber, long blooming' },
            ChampaRed: { carbon: 10, category: 'Flowering', care: 'Full sun, well-drained soil, regular watering', benefits: 'Fragrant red flowers, ornamental tree, sacred' },
            ChampaWhite: { carbon: 10, category: 'Flowering', care: 'Full sun, well-drained soil, regular watering', benefits: 'Fragrant white flowers, ornamental tree, sacred' },
            FoxtailPalm: { carbon: 8, category: 'Palm', care: 'Partial shade, well-drained soil, regular watering', benefits: 'Ornamental fronds, compact size, tropical look' },
            FishtailPalm: { carbon: 8, category: 'Palm', care: 'Partial shade, moist soil, high humidity', benefits: 'Unique fishtail leaves, ornamental, indoor/outdoor' },
            ChinesePalm: { carbon: 8, category: 'Palm', care: 'Partial shade, well-drained soil, regular watering', benefits: 'Fan-shaped leaves, cold tolerant, ornamental' },
            ChampionPalm: { carbon: 8, category: 'Palm', care: 'Partial shade, moist soil, regular watering', benefits: 'Large fronds, tropical appearance, ornamental' },
            PhoenixPalm: { carbon: 10, category: 'Palm', care: 'Full sun, well-drained soil, drought tolerant', benefits: 'Date fruits, ornamental, drought resistant' },
            BottlePalm: { carbon: 8, category: 'Palm', care: 'Full sun, well-drained soil, drought tolerant', benefits: 'Unique bottle-shaped trunk, ornamental, low maintenance' }
        };
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div id="chatbot-container" class="chatbot-container">
                <div id="chatbot-toggle" class="chatbot-toggle">
                    <i class="fas fa-seedling"></i>
                    <span class="chatbot-badge">Ask me!</span>
                </div>
                <div id="chatbot-window" class="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <i class="fas fa-seedling"></i>
                            <span>Govindam Assistant</span>
                        </div>
                        <button id="chatbot-close" class="chatbot-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="chatbot-messages" class="chatbot-messages"></div>
                    <div class="chatbot-input-container">
                        <input type="text" id="chatbot-input" placeholder="Ask about plants, packages, or carbon offset..." maxlength="200">
                        <button id="chatbot-send" class="chatbot-send">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="chatbot-quick-actions">
                        <button class="quick-btn" data-action="packages">View Packages</button>
                        <button class="quick-btn" data-action="plants">All Plants</button>
                        <button class="quick-btn" data-action="carbon">Carbon Info</button>
                        <button class="quick-btn" data-action="contact">Contact Us</button>
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

        toggle.addEventListener('click', () => this.toggleChatbot());
        close.addEventListener('click', () => this.closeChatbot());
        send.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    toggleChatbot() {
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            window.style.display = 'flex';
            toggle.style.display = 'none';
            setTimeout(() => {
                document.getElementById('chatbot-input').focus();
            }, 100);
        } else {
            window.style.display = 'none';
            toggle.style.display = 'flex';
        }
    }

    closeChatbot() {
        this.isOpen = false;
        document.getElementById('chatbot-window').style.display = 'none';
        document.getElementById('chatbot-toggle').style.display = 'flex';
    }

    addMessage(message, isUser = false) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${isUser ? 'user' : 'bot'}`;
        
        if (!isUser) {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-seedling"></i>
                </div>
                <div class="message-content">${message}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${message}</div>
                <div class="message-avatar user-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addWelcomeMessage() {
        const welcomeMsg = `
            🌱 Welcome to Shri Govindam Nursery and Farms! I'm here to help you with:
            <br>• Plant information & carbon absorption
            <br>• Package deals & pricing
            <br>• Planting advice & care tips
            <br>• Contact information
            <br><br>How can I assist you today?
        `;
        this.addMessage(welcomeMsg);
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, true);
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Process message after a short delay
        setTimeout(() => {
            this.hideTypingIndicator();
            this.processMessage(message);
        }, 1000);
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-seedling"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    processMessage(message) {
        const lowerMessage = message.toLowerCase();
        let response = '';

        // Plant-specific queries
        if (lowerMessage.includes('carbon') || lowerMessage.includes('absorption') || lowerMessage.includes('offset')) {
            response = this.handleCarbonQuery(lowerMessage);
        }
        // Package queries
        else if (lowerMessage.includes('package') || lowerMessage.includes('combo') || lowerMessage.includes('deal')) {
            response = this.handlePackageQuery();
        }
        // Plant care queries
        else if (lowerMessage.includes('care') || lowerMessage.includes('water') || lowerMessage.includes('sunlight')) {
            response = this.handleCareQuery();
        }
        // Contact queries
        else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('address')) {
            response = this.handleContactQuery();
        }
        // Price queries
        else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('₹')) {
            response = this.handlePriceQuery();
        }
        // Specific plant queries
        else if (this.containsPlantName(lowerMessage)) {
            response = this.handlePlantQuery(lowerMessage);
        }
        // Greeting
        else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            response = "Hello! 🌱 Welcome to Shri Govindam Nursery and Farms. I'm here to help you with plants, packages, and carbon offset information. What would you like to know?";
        }
        // Default response
        else {
            response = this.getDefaultResponse();
        }

        this.addMessage(response);
    }

    containsPlantName(message) {
        return Object.keys(this.plantData).some(plant =>
            message.includes(plant.toLowerCase()) ||
            message.includes(plant.toLowerCase().replace(/[()]/g, ''))
        );
    }

    handleAllPlantsQuery() {
        const categories = {
            'Fruit Plants': [],
            'Medicinal Plants': [],
            'Decorative Plants': [],
            'Flowering Plants': [],
            'Palm Trees': [],
            'Sacred Plants': [],
            'Timber Trees': []
        };

        // Categorize plants
        Object.keys(this.plantData).forEach(plant => {
            const data = this.plantData[plant];
            switch(data.category) {
                case 'Fruit':
                    categories['Fruit Plants'].push(`${plant} (${data.carbon} kg CO₂/year)`);
                    break;
                case 'Medicinal':
                    categories['Medicinal Plants'].push(`${plant} (${data.carbon} kg CO₂/year)`);
                    break;
                case 'Decorative':
                    categories['Decorative Plants'].push(`${plant} (${data.carbon} kg CO₂/year)`);
                    break;
                case 'Flowering':
                    categories['Flowering Plants'].push(`${plant} (${data.carbon} kg CO₂/year)`);
                    break;
                case 'Palm':
                    categories['Palm Trees'].push(`${plant} (${data.carbon} kg CO₂/year)`);
                    break;
                case 'Sacred':
                    categories['Sacred Plants'].push(`${plant} (${data.carbon} kg CO₂/year)`);
                    break;
                case 'Timber':
                    categories['Timber Trees'].push(`${plant} (${data.carbon} kg CO₂/year)`);
                    break;
            }
        });

        let response = `🌱 <strong>Complete Plant Collection at Shri Govindam Nursery and Farms:</strong><br><br>`;

        Object.keys(categories).forEach(category => {
            if (categories[category].length > 0) {
                response += `<strong>🌿 ${category}:</strong><br>`;
                categories[category].forEach(plant => {
                    response += `• ${plant}<br>`;
                });
                response += `<br>`;
            }
        });

        response += `💡 <strong>Ask me about any specific plant for detailed care instructions and benefits!</strong>`;
        return response;
    }

    handleCarbonQuery(message) {
        if (message.includes('mango')) {
            return `🥭 Mango trees absorb approximately <strong>20 kg CO₂ per year</strong>. They're excellent for carbon offset and provide delicious fruits! Our mango varieties include Amrapali and Chausa.`;
        } else if (message.includes('neem')) {
            return `🌿 Neem trees are carbon champions, absorbing <strong>20 kg CO₂ per year</strong>. They also have medicinal properties and act as natural pesticides!`;
        } else {
            return `🌱 Our plants absorb varying amounts of CO₂ annually:
            <br>• High absorbers (20+ kg): Mango, Neem, Poplar, Eucalyptus, Ficus
            <br>• Medium absorbers (10-18 kg): Guava, Moringa, Ashok, Gulmohar
            <br>• Small plants (6-10 kg): Tulsi, Rose, Mogra, Money Plant
            <br><br>Would you like specific information about any plant?`;
        }
    }

    handlePackageQuery() {
        return `🎁 Our popular package deals:
        <br><br><strong>🍎 Fruit Lovers Combo - ₹3,499</strong>
        <br>10 plants including Mango, Guava, Pomegranate
        <br><br><strong>🌬️ Air Purifier Pack - ₹3,999</strong>
        <br>12 scientifically-proven air purifying plants
        <br><br><strong>🌟 Decorative Paradise - ₹2,999</strong>
        <br>12 beautiful decorative plants
        <br><br>Visit our packages page for more details!`;
    }

    handleCareQuery() {
        return `🌱 <strong>General Plant Care Tips:</strong>
        <br>• <strong>Watering:</strong> Water when topsoil feels dry
        <br>• <strong>Sunlight:</strong> Most plants need 4-6 hours daily
        <br>• <strong>Soil:</strong> Well-draining soil is essential
        <br>• <strong>Fertilizer:</strong> Use organic compost monthly
        <br><br>We provide detailed care instructions with every plant purchase!`;
    }

    handleContactQuery() {
        return `📞 <strong>Contact Shri Govindam Nursery and Farms:</strong>
        <br>• Phone: +91 82900 38052
        <br>• WhatsApp: +91 82900 38052
        <br>• Email: sgnd1997@gmail.com
        <br>• Address: Dhodhsar, Jaipur, Rajasthan 303712
        <br><br>We're here to help with all your gardening needs! 🌿`;
    }

    handlePriceQuery() {
        return `💰 <strong>Our Pricing:</strong>
        <br>• Individual plants: ₹50 - ₹500 (varies by type & size)
        <br>• Package deals: ₹2,999 - ₹4,699
        <br>• Bulk orders: Special discounts available
        <br><br>Contact us for specific plant prices and bulk discounts!`;
    }

    handlePlantQuery(message) {
        const plantName = Object.keys(this.plantData).find(plant =>
            message.includes(plant.toLowerCase()) ||
            message.includes(plant.toLowerCase().replace(/[()]/g, ''))
        );

        if (plantName) {
            const data = this.plantData[plantName];
            const carbonLevel = data.carbon >= 20 ? 'high' : data.carbon >= 10 ? 'medium' : 'low';

            return `🌱 <strong>${plantName}</strong><br><br>
            <strong>🌿 Category:</strong> ${data.category}<br>
            <strong>🌍 Carbon Absorption:</strong> ${data.carbon} kg CO₂ per year (${carbonLevel} absorber)<br>
            <strong>🌱 Care Instructions:</strong> ${data.care}<br>
            <strong>✨ Benefits:</strong> ${data.benefits}<br><br>
            💡 This plant is perfect for ${data.category.toLowerCase()} purposes and contributes significantly to environmental health!`;
        }

        return this.getDefaultResponse();
    }

    handleQuickAction(action) {
        switch(action) {
            case 'packages':
                this.addMessage('Show me package deals', true);
                setTimeout(() => this.addMessage(this.handlePackageQuery()), 500);
                break;
            case 'plants':
                this.addMessage('Show me all available plants', true);
                setTimeout(() => this.addMessage(this.handleAllPlantsQuery()), 500);
                break;
            case 'carbon':
                this.addMessage('Tell me about carbon absorption', true);
                setTimeout(() => this.addMessage(this.handleCarbonQuery('carbon')), 500);
                break;
            case 'contact':
                this.addMessage('How can I contact you?', true);
                setTimeout(() => this.addMessage(this.handleContactQuery()), 500);
                break;
        }
    }

    getDefaultResponse() {
        const responses = [
            "I'd be happy to help! You can ask me about plant care, carbon absorption, package deals, or contact information. 🌱",
            "I'm here to assist with all your nursery needs! Try asking about specific plants, packages, or carbon offset information. 🌿",
            "Feel free to ask about our plants, pricing, care tips, or how to contact us. What interests you most? 🌱"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Govindam Chatbot...');
    try {
        new GovindamChatbot();
        console.log('Chatbot initialized successfully!');
    } catch (error) {
        console.error('Error initializing chatbot:', error);
    }
});
