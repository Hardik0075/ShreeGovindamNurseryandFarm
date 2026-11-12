/**
 * Shri Govindam Nursery and Farms
 * Global Site Configuration & Dynamic Hydration Helper
 *
 * Single Source of Truth for business contact info, social links,
 * and API endpoints. Edit this file to update contact details across the entire site.
 */

const SITE_CONFIG = {
    businessName: "Shri Govindam Nursery and Farms",
    tagline: "Bringing Green to Life - One Tree at a Time!",

    // WhatsApp Configuration (Change number here to update everywhere)
    whatsapp: {
        number: "919772585880", // Format: Country code + number without '+' or spaces
        displayNumber: "+91 97725 85880",
        defaultMessage: "Hello! I am interested in plants from Shri Govindam Nursery.",
        getChatUrl: function (customMessage) {
            const msg = encodeURIComponent(customMessage || this.defaultMessage);
            return `https://wa.me/${this.number}?text=${msg}`;
        }
    },

    // Direct Contact Details
    contact: {
        phone: "+91 97725 85880",
        phoneRaw: "+919772585880",
        email: "sgnd1997@gmail.com",
        address: "Dhodhsar, Jaipur, Rajasthan 303712, India",
        timings: {
            monSat: "Monday - Saturday: 7:00 AM - 7:00 PM",
            sun: "Sunday: 8:00 AM - 6:00 PM",
            nurseryOpen: "Open daily 24 x 7"
        }
    },

    // Social Media Links
    social: {
        whatsapp: "https://wa.me/919772585880",
        instagram: "https://www.instagram.com/shrigovindamnursery?igsh=Mzg2dTV4amVjdTMx",
        twitter: "https://x.com/DhodhsarSh75198?t=9Ieh8o9FsUQofdTCNlZCNA&s=09",
        facebook: "https://www.facebook.com/share/1BEGhCb4tR/"
    },

    // AI Chatbot Backend Configuration (Cloudflare Worker endpoint)
    api: {
        // Replace with your deployed Cloudflare Worker URL once created:
        chatbotEndpoint: "https://shri-govindam-chatbot.hardiksharma96633.workers.dev/api/chat"
    }
};

/**
 * Auto-hydrates contact details, WhatsApp links, and phone numbers across the DOM.
 * Runs automatically when the document is ready.
 */
function hydrateSiteConfig() {
    // 1. Update all WhatsApp links
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        const currentHref = link.getAttribute('href');
        // If link already has custom text, preserve it; otherwise use default
        const match = currentHref.match(/[?&]text=([^&]+)/);
        if (match && match[1]) {
            link.href = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${match[1]}`;
        } else {
            link.href = SITE_CONFIG.whatsapp.getChatUrl();
        }
    });

    // 2. Update all tel: links
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.href = `tel:${SITE_CONFIG.contact.phoneRaw}`;
    });

    // 3. Update all mailto: links
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        const currentHref = link.getAttribute('href');
        const queryParams = currentHref.includes('?') ? currentHref.substring(currentHref.indexOf('?')) : '';
        link.href = `mailto:${SITE_CONFIG.contact.email}${queryParams}`;
    });

    // 4. Update elements marked with data-config attributes if any
    document.querySelectorAll('[data-config="phone"]').forEach(el => {
        el.textContent = SITE_CONFIG.contact.phone;
    });
    document.querySelectorAll('[data-config="whatsapp"]').forEach(el => {
        el.textContent = SITE_CONFIG.whatsapp.displayNumber;
    });
    document.querySelectorAll('[data-config="email"]').forEach(el => {
        el.textContent = SITE_CONFIG.contact.email;
    });
    document.querySelectorAll('[data-config="address"]').forEach(el => {
        el.textContent = SITE_CONFIG.contact.address;
    });
}

// Run hydration when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateSiteConfig);
} else {
    hydrateSiteConfig();
}

