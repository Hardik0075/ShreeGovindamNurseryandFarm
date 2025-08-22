// Advanced animations and interactive effects for Govindam Nursery

// Animation utilities and custom effects
class AnimationController {
    constructor() {
        // Treat mobile as reduced-motion to avoid overflow/glitches
        const isMobileViewport = typeof window !== 'undefined' && window.innerWidth <= 768;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || isMobileViewport;
        this.animations = new Map();
        this.init();
    }
    
    init() {
        this.setupFloatingElements();
        this.setupTypingEffect();
        // Skip setupCounterAnimations if not defined
        if (typeof this.setupCounterAnimations === 'function') {
            this.setupCounterAnimations();
        }
        this.setupMouseFollowEffects();
        this.setupImageLazyLoading();
        this.setupAdvancedHoverEffects();
        
        // Initialize only if motion is not reduced
        if (!this.isReducedMotion) {
            this.startFloatingAnimation();
            this.setupParticleEffects();
        }
    }
    
    // Floating leaves and butterflies animation
    setupFloatingElements() {
        const floatingContainer = document.querySelector('.floating-elements');
        if (!floatingContainer || this.isReducedMotion) return;
        
        // Create additional floating elements dynamically
        this.createFloatingElement('leaf', 'fas fa-leaf', {
            count: 3,
            duration: [15, 20, 18],
            delay: [0, 5, 10],
            position: ['10%', '60%', '85%']
        });
        
        this.createFloatingElement('butterfly', 'fas fa-bug', {
            count: 2,
            duration: [25, 30],
            delay: [2, 15],
            position: ['20%', '60%']
        });
    }
    
    createFloatingElement(type, iconClass, config) {
        const container = document.querySelector('.floating-elements');
        if (!container) return;
        
        for (let i = 0; i < config.count; i++) {
            const element = document.createElement('div');
            element.className = `${type} ${type}-${i + 1}`;
            element.innerHTML = `<i class="${iconClass}"></i>`;
            
            // Set CSS custom properties for animation
            element.style.setProperty('--duration', `${config.duration[i]}s`);
            element.style.setProperty('--delay', `${config.delay[i]}s`);
            element.style.setProperty('--start-position', config.position[i]);
            
            container.appendChild(element);
        }
    }
    
    startFloatingAnimation() {
        const leaves = document.querySelectorAll('.leaf');
        const butterflies = document.querySelectorAll('.butterfly');
        
        // Add random variations to floating elements
        leaves.forEach((leaf, index) => {
            const randomDelay = Math.random() * 5;
            const randomDuration = 15 + Math.random() * 10;
            leaf.style.animationDelay = `${randomDelay}s`;
            leaf.style.animationDuration = `${randomDuration}s`;
        });
        
        butterflies.forEach((butterfly, index) => {
            const randomDelay = Math.random() * 8;
            const randomDuration = 20 + Math.random() * 15;
            butterfly.style.animationDelay = `${randomDelay}s`;
            butterfly.style.animationDuration = `${randomDuration}s`;
        });
    }
    
    // Typing effect for hero title
    setupTypingEffect() {
        const typingElements = document.querySelectorAll('.typing-effect');
        if (this.isReducedMotion) {
            typingElements.forEach(el => el.classList.remove('typing-effect'));
            return;
        }
        
        typingElements.forEach(element => {
            this.typeWriter(element, element.textContent, 100);
        });
    }
    
    typeWriter(element, text, speed = 100) {
        element.textContent = '';
        let i = 0;
        
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                element.classList.add('typing-complete');
            }
        }, speed);
        
        this.animations.set(element, timer);
    }
    
    // Counter animations for statistics
    // setupCounterAnimations() {
    //     const counters = document.querySelectorAll('.stat-number');
    //     const observerOptions = {
    //         threshold: 0.5,
    //         rootMargin: '0px'
    //     };
        
    //     const observer = new IntersectionObserver((entries) => {
    //         entries.forEach(entry => {
    //             if (entry.isIntersecting && !entry.target.dataset.counted) {
    //                 this.animateCounter(entry.target);
    //                 entry.target.dataset.counted = 'true';
    //             }
    //         });
    //     }, observerOptions);
        
    //     counters.forEach(counter => observer.observe(counter));
    // }
    
    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/\D/g, ''));
        const suffix = element.textContent.replace(/[0-9]/g, '');
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + suffix;
        }, 16);
        
        this.animations.set(element, timer);
    }
    
    // Mouse follow effects
    setupMouseFollowEffects() {
        if (this.isReducedMotion) return;
        
        const cursor = this.createCustomCursor();
        document.addEventListener('mousemove', (e) => {
            this.updateCursor(cursor, e.clientX, e.clientY);
        });
        
        // Special hover effects for interactive elements
        const hoverElements = document.querySelectorAll('.btn, .nav-link, .gallery-card, .preview-card');
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
            });
        });
    }
    
    createCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(45, 90, 61, 0.5);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
            display: none;
        `;
        
        document.body.appendChild(cursor);
        
        // Show cursor only on non-touch devices
        if (!('ontouchstart' in window)) {
            cursor.style.display = 'block';
        }
        
        return cursor;
    }
    
    updateCursor(cursor, x, y) {
        cursor.style.left = `${x - 10}px`;
        cursor.style.top = `${y - 10}px`;
    }
    
    // Advanced hover effects
    setupAdvancedHoverEffects() {
        // 3D card tilt effect
        const cards = document.querySelectorAll('.gallery-card, .preview-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (this.isReducedMotion) return;
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
        
        // Ripple effect for buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });
    }
    
    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    // Particle effects
    setupParticleEffects() {
        if (this.isReducedMotion) return;
        
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        
        hero.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        this.initParticleSystem(canvas, ctx);
    }
    
    initParticleSystem(canvas, ctx) {
        const particles = [];
        const particleCount = 50;
        
        // Resize canvas
        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.alpha = Math.random() * 0.5 + 0.2;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            
            draw() {
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = '#6fad7b';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    // Image lazy loading with fade-in effect
    setupImageLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('fade-in');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Cleanup method
    destroy() {
        this.animations.forEach(animation => {
            if (typeof animation === 'number') {
                clearInterval(animation);
            }
        });
        this.animations.clear();
    }
}

// Scroll-based animations
class ScrollAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupScrollTriggers();
        this.setupProgressIndicator();
        this.setupRevealAnimations();
    }
    
    setupScrollTriggers() {
        const triggers = document.querySelectorAll('[data-scroll-trigger]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const trigger = entry.target.dataset.scrollTrigger;
                    this.executeScrollTrigger(trigger, entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        triggers.forEach(trigger => observer.observe(trigger));
    }
    
    executeScrollTrigger(trigger, element) {
        switch (trigger) {
            case 'fadeInUp':
                element.style.animation = 'fadeInUp 0.8s ease-out forwards';
                break;
            case 'slideInLeft':
                element.style.animation = 'slideInLeft 0.8s ease-out forwards';
                break;
            case 'zoomIn':
                element.style.animation = 'zoomIn 0.8s ease-out forwards';
                break;
        }
    }
    
    setupProgressIndicator() {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-green), var(--secondary-green));
            z-index: 10000;
            transition: width 0.1s ease;
        `;
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            progressBar.style.width = `${scrollPercent}%`;
        });
    }
    
    setupRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });
        
        revealElements.forEach(el => observer.observe(el));
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();
    window.scrollAnimations = new ScrollAnimations();
    
    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .cursor-hover {
            transform: scale(1.5) !important;
            background: rgba(45, 90, 61, 0.8) !important;
        }
        
        .fade-in {
            animation: fadeIn 0.6s ease-out forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .reveal-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s ease-out;
        }
        
        .reveal-on-scroll.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        .page-hidden .floating-elements {
            animation-play-state: paused;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .floating-elements,
            .custom-cursor,
            canvas {
                display: none !important;
            }
        }
    `;
    
    document.head.appendChild(style);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.animationController) {
        window.animationController.destroy();
    }
});
