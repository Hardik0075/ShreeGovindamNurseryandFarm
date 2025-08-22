// Legal Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // Legal Navigation
    const legalNavItems = document.querySelectorAll('.legal-nav-item');
    const legalSections = document.querySelectorAll('.legal-section');

    // Function to update active navigation item
    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100;

        legalSections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all nav items
                legalNavItems.forEach(item => item.classList.remove('active'));
                // Add active class to current nav item
                legalNavItems[index].classList.add('active');
            }
        });
    }

    // Smooth scrolling for navigation links
    legalNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active navigation on scroll
    window.addEventListener('scroll', updateActiveNav);

    // Initialize active state
    updateActiveNav();

    // Add smooth scroll behavior for all internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Add table of contents functionality
    const policySections = document.querySelectorAll('.policy-section h3');
    if (policySections.length > 0) {
        // Create table of contents for each section
        legalSections.forEach(section => {
            const sectionTitle = section.querySelector('h2');
            if (sectionTitle) {
                const toc = document.createElement('div');
                toc.className = 'table-of-contents';
                toc.innerHTML = '<h4>Table of Contents</h4><ul></ul>';
                
                const tocList = toc.querySelector('ul');
                const headings = section.querySelectorAll('.policy-section h3');
                
                headings.forEach(heading => {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.textContent = heading.textContent;
                    link.href = '#' + heading.id || '#' + heading.textContent.toLowerCase().replace(/\s+/g, '-');
                    li.appendChild(link);
                    tocList.appendChild(li);
                });
                
                // Insert TOC after section title
                sectionTitle.parentNode.insertBefore(toc, sectionTitle.nextSibling);
            }
        });
    }

    // Add print functionality
    const printButton = document.createElement('button');
    printButton.className = 'print-btn';
    printButton.innerHTML = '<i class="fas fa-print"></i> Print Legal Documents';
    printButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-green);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        transition: all 0.3s ease;
    `;
    
    printButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    });
    
    printButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    
    printButton.addEventListener('click', function() {
        window.print();
    });
    
    document.body.appendChild(printButton);

    // Add copy link functionality
    const sectionHeadings = document.querySelectorAll('.legal-section h2');
    sectionHeadings.forEach(heading => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-link-btn';
        copyButton.innerHTML = '<i class="fas fa-link"></i>';
        copyButton.title = 'Copy link to section';
        copyButton.style.cssText = `
            background: none;
            border: none;
            color: var(--primary-green);
            cursor: pointer;
            font-size: 16px;
            margin-left: 10px;
            padding: 5px;
            border-radius: 3px;
            transition: all 0.3s ease;
        `;
        
        copyButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(45, 90, 61, 0.1)';
        });
        
        copyButton.addEventListener('mouseleave', function() {
            this.style.background = 'none';
        });
        
        copyButton.addEventListener('click', function() {
            const sectionId = heading.parentNode.parentNode.id;
            const url = window.location.origin + window.location.pathname + '#' + sectionId;
            
            navigator.clipboard.writeText(url).then(() => {
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.textContent = 'Link copied!';
                successMsg.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--light-green);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    z-index: 1001;
                    font-family: 'Poppins', sans-serif;
                    animation: slideIn 0.3s ease;
                `;
                
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    successMsg.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        document.body.removeChild(successMsg);
                    }, 300);
                }, 2000);
            });
        });
        
        heading.appendChild(copyButton);
    });

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @media print {
            .navbar, .floating-elements, .legal-nav-section, .print-btn, .copy-link-btn {
                display: none !important;
            }
            
            .legal-content {
                padding: 0 !important;
            }
            
            .policy-section {
                page-break-inside: avoid;
            }
        }
    `;
    document.head.appendChild(style);
});
