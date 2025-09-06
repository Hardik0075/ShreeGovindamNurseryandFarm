// Packages page logic: render packages, handle inquiry, and track inquiries for certificate eligibility

document.addEventListener('DOMContentLoaded', () => {
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    // Disable AOS animations on mobile to prevent overflow/glitches
    if (typeof AOS !== 'undefined' && isMobile) {
        try { AOS.init({ disable: true }); } catch(e) {}
    }
    const packages = [
        {
            id: 'fruit_combo',
            name: 'Fruit Lovers Combo',
            icon: 'fa-apple-whole',
            plants: ['Mango', 'Guava', 'Sitafal', 'Pomegranate', 'Orange', 'Lichi'],
            totalPlants: 10,
            priceINR: 3499,
            value: 'Save ~20% vs buying individually. Year-round fruit variety.'
        },
        {
            id: 'fast_grow_combo',
            name: 'Fast-Growing Green Wall',
            icon: 'fa-bolt',
            plants: ['Neem', 'Poplar', 'Eucalyptus', 'Moringa', 'Arjun'],
            totalPlants: 20,
            priceINR: 3999,
            value: 'Grow quick shade and windbreak in one season.'
        },
        {
            id: 'decor_combo',
            name: 'Decorative Paradise',
            icon: 'fa-seedling',
            plants: ['Ficus', 'MoneyPlant', 'Ashok', 'BottleBrush', 'SilverOak'],
            totalPlants: 12,
            priceINR: 2999,
            value: 'Instant makeover for indoor/outdoor aesthetics.'
        },
        {
            id: 'air_purifier_combo',
            name: 'Air Purifier Pack (HOT)',
            icon: 'fa-wind',
            plants: ['Spider Plant', 'Bamboo Palm', 'English Ivy', 'Dracaena', 'Philodendron', 'Boston Fern', 'Peace Lily', 'Snake Plant'],
            totalPlants: 12,
            priceINR: 3999,
            value: 'Advanced air purification with 8 scientifically-proven plants. Removes toxins, improves sleep, and boosts productivity.',
            isHot: true
        },
        {
            id: 'holy_garden_combo',
            name: 'Sacred & Medicinal Garden',
            icon: 'fa-spa',
            plants: ['Tulsi', 'Aonla (Amla)', 'BelPatra', 'Ashok', 'Chandan', 'Giloy', 'Aloe Vera', 'Neem', 'Arjun', 'Ashwagandha'],
            totalPlants: 10,
            priceINR: 3799,
            value: 'Blend of spiritual significance and medicinal benefits.'
        },
        {
            id: 'orchard_starter_combo',
            name: 'Mini Orchard Starter',
            icon: 'fa-tree',
            plants: ['Mango', 'Guava', 'Sitafal', 'Jamun', 'Lemon', 'Pomegranate', 'Chikoo', 'Orange', 'Aonla (Amla)'],
            totalPlants: 15,
            priceINR: 4699,
            value: 'Start your home orchard with diverse fruit varieties.'
        },

        {
            id: 'bulk_orchard_combo',
            name: 'Bulk Orchard Package (HOT)',
            icon: 'fa-fire',
            plants: ['Aonla Chakaiya', 'Mango Amrapali', 'Chikoo Kalpatti', 'Lemon Kagaji', 'Mosambi New Seller'],
            totalPlants: 500,
            priceINR: 1125000,
            value: 'Minimum 500 plants. 3-year care included. Perfect for commercial orchards.',
            isHot: true,
            isBulk: true
        },
        {
            id: 'flower_garden_combo',
            name: 'Flower Garden Paradise (HOT)',
            icon: 'fa-flower-tulip',
            plants: ['Mogra', 'Ratrani', 'MadhuKamini', 'RaiBel', 'Rose', 'Chameli', 'Gudahal', 'DoubleChandani', 'MadhuMalati', 'Tikoma', 'Voganvilia', 'ChampaRed', 'ChampaWhite'],
            totalPlants: 50,
            priceINR: 5000,
            value: 'Complete flower garden with 13 varieties. Instant blooming paradise.',
            isHot: true
        },

        {
            id: 'medicinal_herbs_combo',
            name: 'Medicinal Herbs Collection',
            icon: 'fa-leaf',
            plants: ['Arjun', 'Parijat', 'Kachnar', 'Amaltash', 'Anjeer', 'BelPatra', 'Aonla', 'Phalsa', 'Jamun'],
            totalPlants: 15,
            priceINR: 4299,
            value: 'Traditional medicinal plants with healing properties.'
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
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile) {
        // Skip loading animation on mobile devices
        loadingScreen.remove();
        return;
    }
    
    // Simulate loading progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Hide loading screen after a short delay
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                
                // Remove from DOM after animation completes
                setTimeout(() => {
                    loadingScreen.remove();
                }, 500);
            }, 500);
        }
    }, 100);
}

function renderPackages(packages) {
    const grid = document.getElementById('packagesGrid');
    if (!grid) return;
    grid.innerHTML = packages.map((pkg, idx) => packageCardHTML(pkg, (idx + 1) * 100)).join('');

    // Attach quick inquiry buttons
    document.querySelectorAll('[data-inquire]')?.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-inquire');
            const name = btn.getAttribute('data-name');
            const select = document.getElementById('inqPackage');
            if (select) {
                select.value = id;
                select.dispatchEvent(new Event('change'));
            }
            // Smooth scroll to inquiry form
            const form = document.getElementById('customInquiry');
            if (form) {
                const y = form.offsetTop - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });
}

function packageCardHTML(pkg, aosDelay) {
    const hotBadge = pkg.isHot ? '<div class="hot-badge">HOT</div>' : '';
    const bulkNote = pkg.isBulk ? '<div class="bulk-note">Minimum 500 plants • 3-year care included</div>' : '';

    // Check if mobile to disable animations
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const aosAttributes = isMobile ? '' : `data-aos="fade-up" data-aos-delay="${aosDelay}"`;

    return `
    <div class="package-card" ${aosAttributes}>
        ${hotBadge}
        <div class="package-header">
            <div class="package-icon"><i class="fas ${pkg.icon}"></i></div>
            <h4>${pkg.name}</h4>
        </div>
        <div class="package-body">
            <div class="package-meta">
                <span><i class="fas fa-leaf"></i> ${pkg.totalPlants} plants</span>
                <span><i class="fas fa-tags"></i> ₹${pkg.priceINR.toLocaleString('en-IN')}</span>
            </div>
            <div class="package-plants">
                ${pkg.plants.map(p => `<span class="chip">${p}</span>`).join('')}
            </div>
            <div class="package-value">
                <i class="fas fa-circle-check"></i> ${pkg.value}
            </div>
            ${bulkNote}
        </div>
        <div class="package-actions">
            <button class="btn btn-secondary" data-inquire="${pkg.id}" data-name="${pkg.name}"><i class="fas fa-info-circle"></i> Inquire</button>
            <a href="#customInquiry" class="btn btn-primary" data-inquire="${pkg.id}" data-name="${pkg.name}"><i class="fas fa-pen"></i> Customize</a>
        </div>
    </div>`;
}

function populatePackageSelect(packages) {
    const select = document.getElementById('inqPackage');
    if (!select) return;
    packages.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.totalPlants} plants)`;
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

        // Persist minimal record for verification (legitimacy tracking)
        const records = JSON.parse(localStorage.getItem('gn_records') || '[]');
        records.push({
            type: 'inquiry',
            phone: (data.phone || '').trim(),
            name: (data.name || '').trim(),
            package: data.package || 'custom',
            ts: Date.now()
        });
        localStorage.setItem('gn_records', JSON.stringify(records));

        // UX
        form.style.display = 'none';
        if (success) success.classList.add('show');
        setTimeout(() => {
            if (success) success.classList.remove('show');
            form.reset();
            form.style.display = 'block';
        }, 4000);

        // Toast
        if (typeof showNotification === 'function') {
            showNotification('Inquiry submitted. We will contact you shortly.', 'success');
        }

        // Notify via WhatsApp and Email
        try {
            const phoneForWa = '918290038052';
            const waText = encodeURIComponent(`New Package Inquiry\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email || ''}\nPackage: ${data.package || 'custom'}\nMessage: ${data.message || ''}`);
            window.open(`https://wa.me/${phoneForWa}?text=${waText}`, '_blank');
            const mailSubject = encodeURIComponent(`Package Inquiry: ${data.package || 'custom'}`);
            const mailBody = waText;
            const a = document.createElement('a');
            a.href = `mailto:sgnd1997@gmail.com?subject=${mailSubject}&body=${mailBody}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch(e) { console.error(e); }
    });
}

// Floating label behavior for this page
function initializeFloatingLabels() {
    const groups = document.querySelectorAll('#customInquiry .form-group');
    groups.forEach(group => {
        const input = group.querySelector('.form-input');
        if (!input) return;
        const toggle = () => {
            if (input.value && input.value.toString().trim().length > 0) {
                group.classList.add('focused');
            } else {
                group.classList.remove('focused');
            }
        };
        input.addEventListener('focus', () => group.classList.add('focused'));
        input.addEventListener('blur', toggle);
        input.addEventListener('input', toggle);
        // Initialize state
        toggle();
    });
}


