// Packages page logic: render packages with Carbon Offset metrics & plant diversification
document.addEventListener('DOMContentLoaded', () => {
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    // Disable AOS animations on mobile to prevent overflow/glitches
    if (typeof AOS !== 'undefined' && isMobile) {
        try { AOS.init({ disable: true }); } catch (e) { }
    }

    const packages = [
        {
            id: 'air_purifier_combo',
            name: 'Air Purifier Pack',
            icon: 'fa-wind',
            plants: ['Spider Plant', 'Bamboo Palm', 'English Ivy', 'Dracaena', 'Philodendron', 'Boston Fern', 'Peace Lily', 'Snake Plant'],
            totalPlants: 12,
            carbonOffset: 120,
            priceINR: 3999,
            value: 'NASA-certified indoor air purifiers. Absorbs household VOCs, toxins, and enhances night-time oxygen.',
            isHot: true
        },
        {
            id: 'holy_garden_combo',
            name: 'Sacred & Medicinal Garden',
            icon: 'fa-spa',
            plants: ['Tulsi', 'Aonla (Amla)', 'BelPatra', 'Ashok', 'Chandan', 'Giloy', 'Aloe Vera', 'Neem', 'Arjun', 'Ashwagandha'],
            totalPlants: 10,
            carbonOffset: 190,
            priceINR: 3799,
            value: 'Holistic Ayurvedic sanctuary. Blend of sacred spiritual value, immunity boosting, and heart-healthy trees.'
        },
        {
            id: 'orchard_starter_combo',
            name: 'Mini Orchard Starter',
            icon: 'fa-tree',
            plants: ['Mango', 'Guava', 'Sitafal', 'Jamun', 'Lemon', 'Pomegranate', 'Chikoo', 'Orange', 'Aonla (Amla)'],
            totalPlants: 15,
            carbonOffset: 300,
            priceINR: 4699,
            value: 'Start your home organic fruit sanctuary with 9 diverse fruit varieties for year-round seasonal harvest.',
            isHot: true
        },
        {
            id: 'fruit_combo',
            name: 'Fruit Lovers Combo',
            icon: 'fa-apple-whole',
            plants: ['Mango', 'Guava', 'Sitafal', 'Pomegranate', 'Orange', 'Lichi'],
            totalPlants: 10,
            carbonOffset: 210,
            priceINR: 3499,
            value: 'Save ~20% vs buying individually. High-yield grafted fruit trees acclimated to Rajasthan climate.'
        },
        {
            id: 'fast_grow_combo',
            name: 'Fast-Growing Green Wall',
            icon: 'fa-bolt',
            plants: ['Neem', 'Poplar', 'Eucalyptus', 'Moringa', 'Arjun'],
            totalPlants: 20,
            carbonOffset: 460,
            priceINR: 3999,
            value: 'High-absorption carbon sink. Grows quick shade, boundary privacy hedge, and natural windbreak in 1 season.'
        },
        {
            id: 'decor_combo',
            name: 'Decorative Paradise',
            icon: 'fa-seedling',
            plants: ['Ficus', 'MoneyPlant', 'Ashok', 'BottleBrush', 'SilverOak'],
            totalPlants: 12,
            carbonOffset: 240,
            priceINR: 2999,
            value: 'Instant aesthetic makeover for villas, bungalows, and lawn landscapes with varied heights and textures.'
        },
        {
            id: 'flower_garden_combo',
            name: 'Flower Garden Paradise',
            icon: 'fa-flower-tulip',
            plants: ['Mogra', 'Ratrani', 'MadhuKamini', 'RaiBel', 'Rose', 'Chameli', 'Gudahal', 'DoubleChandani', 'MadhuMalati', 'Tikoma', 'Voganvilia', 'ChampaRed', 'ChampaWhite'],
            totalPlants: 50,
            carbonOffset: 400,
            priceINR: 5000,
            value: 'Complete pollinator paradise with 13 fragrant flowering varieties. Continuous seasonal blooming.',
            isHot: true
        },
        {
            id: 'medicinal_herbs_combo',
            name: 'Medicinal Herbs Collection',
            icon: 'fa-leaf',
            plants: ['Arjun', 'Parijat', 'Kachnar', 'Amaltash', 'Anjeer', 'BelPatra', 'Aonla', 'Phalsa', 'Jamun'],
            totalPlants: 15,
            carbonOffset: 280,
            priceINR: 4299,
            value: 'Traditional native healing trees supporting biodiversity, soil replenishment, and holistic wellness.'
        },
        {
            id: 'bulk_orchard_combo',
            name: 'Commercial Agro-Carbon Orchard',
            icon: 'fa-fire',
            plants: ['Aonla Chakaiya', 'Mango Amrapali', 'Chikoo Kalpatti', 'Lemon Kagazi', 'Mosambi New Seller'],
            totalPlants: 500,
            carbonOffset: 10500,
            priceINR: 1125000,
            value: 'Large-scale high-density commercial orchard. Includes 3-year survival guidance, agronomy setup & soil assessment.',
            isHot: true,
            isBulk: true
        }
    ];

    initializeLoadingScreen();
    renderPackages(packages);
    populatePackageSelect(packages);
    attachInquiryHandler();
    initializeFloatingLabels();
});

function initializeLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressFill = document.getElementById('progressFill');
    if (!loadingScreen || !progressFill) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) {
        loadingScreen.remove();
        return;
    }

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        progressFill.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => loadingScreen.remove(), 500);
            }, 300);
        }
    }, 80);
}

function getWhatsAppUrlForPackage(pkgName) {
    const num = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.whatsapp && SITE_CONFIG.whatsapp.number)
        ? SITE_CONFIG.whatsapp.number
        : '919772585880';
    const text = encodeURIComponent(`Hello! I want to order the "${pkgName}" from Shri Govindam Nursery.`);
    return `https://wa.me/${num}?text=${text}`;
}

function renderPackages(packages) {
    const grid = document.getElementById('packagesGrid');
    if (!grid) return;
    grid.innerHTML = packages.map((pkg, idx) => packageCardHTML(pkg, (idx + 1) * 100)).join('');

    // Attach customize inquiry button clicks
    document.querySelectorAll('[data-inquire]')?.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-inquire');
            const select = document.getElementById('inqPackage');
            if (select) {
                select.value = id;
                select.closest('.form-group')?.classList.add('focused');
                select.dispatchEvent(new Event('change'));
            }
            const form = document.getElementById('customInquiry');
            if (form) {
                const y = form.offsetTop - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });
}

function packageCardHTML(pkg, aosDelay) {
    const popularBanner = pkg.isHot ? '<div class="popular-ribbon"><i class="fas fa-fire"></i> POPULAR CHOICE</div>' : '';
    const bulkNote = pkg.isBulk ? '<div class="bulk-note"><i class="fas fa-handshake"></i> Minimum 500 plants • 3-year agronomy care included</div>' : '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const aosAttributes = isMobile ? '' : `data-aos="fade-up" data-aos-delay="${aosDelay}"`;
    const waLink = getWhatsAppUrlForPackage(pkg.name);

    return `
    <div class="package-card ${pkg.isHot ? 'is-popular-card' : ''}" ${aosAttributes}>
        ${popularBanner}
        <div class="package-header">
            <div class="package-icon"><i class="fas ${pkg.icon}"></i></div>
            <div class="package-header-text">
                <h4>${pkg.name}</h4>
                <span class="package-species-count">${pkg.plants.length} Native & Adapted Species</span>
            </div>
        </div>
        <div class="package-body">
            <div class="package-meta">
                <span class="package-count"><i class="fas fa-tree"></i> <strong>${pkg.totalPlants} Plants</strong></span>
                <span class="package-price"><i class="fas fa-tag"></i> <strong>₹${pkg.priceINR.toLocaleString('en-IN')}</strong></span>
            </div>
            
            <div class="package-carbon-badge">
                <i class="fas fa-leaf"></i>
                <span>Offsets <strong>~${pkg.carbonOffset.toLocaleString('en-IN')} kg CO₂ / year</strong></span>
            </div>

            <div class="package-plants">
                ${pkg.plants.map(p => `<span class="chip">${p}</span>`).join('')}
            </div>

            <div class="package-value">
                <i class="fas fa-circle-check"></i> <span>${pkg.value}</span>
            </div>

            <div class="package-cert-badge">
                <i class="fas fa-certificate"></i> Verified Carbon Offset Certificate Included
            </div>
            ${bulkNote}
        </div>
        <div class="package-actions">
            <a href="${waLink}" target="_blank" class="btn btn-wa"><i class="fab fa-whatsapp"></i> Order on WhatsApp</a>
            <button class="btn btn-secondary" data-inquire="${pkg.id}" data-name="${pkg.name}"><i class="fas fa-sliders"></i> Customize</button>
        </div>
    </div>`;
}

function populatePackageSelect(packages) {
    const select = document.getElementById('inqPackage');
    if (!select) return;
    packages.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.totalPlants} plants - Offsets ~${p.carbonOffset} kg CO₂/yr)`;
        select.appendChild(opt);
    });
}

function attachInquiryHandler() {
    const form = document.getElementById('packageInquiryForm');
    const success = document.getElementById('packageInquirySuccess');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        if (!data.name || !data.phone) return;

        const records = JSON.parse(localStorage.getItem('gn_records') || '[]');
        records.push({
            name: data.name,
            phone: data.phone,
            email: data.email || '',
            package: data.package || '',
            message: data.message || '',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('gn_records', JSON.stringify(records));

        // WhatsApp direct inquiry
        try {
            const num = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.whatsapp && SITE_CONFIG.whatsapp.number)
                ? SITE_CONFIG.whatsapp.number
                : '919772585880';
            const text = encodeURIComponent(`Package Inquiry\nName: ${data.name}\nPhone: ${data.phone}\nPackage: ${data.package || 'Custom'}\nMessage: ${data.message || ''}`);
            window.open(`https://wa.me/${num}?text=${text}`, '_blank');
        } catch (err) { }

        form.reset();
        if (success) {
            success.style.display = 'block';
            setTimeout(() => { success.style.display = 'none'; }, 6000);
        }
    });
}

function initializeFloatingLabels() {
    document.querySelectorAll('.form-group').forEach(group => {
        const input = group.querySelector('.form-input');
        if (!input) return;

        const checkFocus = () => {
            if (input.value && String(input.value).trim() !== '') {
                group.classList.add('focused');
            } else if (input.tagName !== 'SELECT' && input.tagName !== 'TEXTAREA') {
                group.classList.remove('focused');
            }
        };

        // Select and textarea should stay focused above the field to prevent label collision
        if (input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
            group.classList.add('focused');
        }

        input.addEventListener('focus', () => group.classList.add('focused'));
        input.addEventListener('blur', checkFocus);
        input.addEventListener('change', checkFocus);
        input.addEventListener('input', checkFocus);

        checkFocus();
    });
}
