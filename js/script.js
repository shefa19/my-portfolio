/* ================================================================ */
/* JAVASCRIPT ARCHITECTURE — Md. Shafaul Islam Portfolio          */
/* ================================================================ */
/* 
   TABLE OF CONTENTS
   -----------------
   1.  Configuration & Constants
   2.  Utility Functions
   3.  DOM Element Selection
   4.  Mobile Navigation
   5.  Smooth Scroll
   6.  Active Navigation Links
   7.  Header Style on Scroll
   8.  Scroll Animations (Intersection Observer)
   9.  Project Interactions
   10. Contact Form
   11. Footer Features
       11.1 Auto Current Year
       11.2 Back to Top Button
       11.3 Social Icon Animations
   12. Performance Optimization
   13. Event Listeners
   14. Initialization
   ================================================================ */

/* ================================================================ */
/* 1. CONFIGURATION & CONSTANTS                                   */
/* ================================================================ */

const CONFIG = {
    // Scroll behavior
    SCROLL_OFFSET: 80,
    SCROLL_THRESHOLD: 300,
    
    // Animation
    ANIMATION_THRESHOLD: 0.1,
    ANIMATION_ROOT_MARGIN: '0px 0px -50px 0px',
    
    // Form
    FORM_SELECTOR: '.contact-form',
    FORM_SUCCESS_DELAY: 3000,
    
    // Performance
    DEBOUNCE_DELAY: 250,
    THROTTLE_DELAY: 100,
    
    // Breakpoints
    BREAKPOINTS: {
        MOBILE: 640,
        TABLET: 768,
        DESKTOP: 1024,
        WIDE: 1280
    }
};

/* ================================================================ */
/* 2. UTILITY FUNCTIONS                                           */
/* ================================================================ */

const Utils = {
    /**
     * Debounce function to limit how often a function is called
     */
    debounce(fn, delay = CONFIG.DEBOUNCE_DELAY) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Throttle function to limit execution rate
     */
    throttle(fn, limit = CONFIG.THROTTLE_DELAY) {
        let inThrottle = false;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /**
     * Safely get an element by selector
     */
    getElement(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch {
            return null;
        }
    },

    /**
     * Safely get multiple elements by selector
     */
    getElements(selector, context = document) {
        try {
            return context.querySelectorAll(selector);
        } catch {
            return [];
        }
    },

    /**
     * Add event listener with safe error handling
     */
    addEvent(el, event, handler) {
        if (el && el.addEventListener) {
            el.addEventListener(event, handler);
        }
    },

    /**
     * Check if an element is in the viewport
     */
    isInViewport(el, offset = 0) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= windowHeight - offset && rect.bottom >= 0;
    }
};

/* ================================================================ */
/* 3. DOM ELEMENT SELECTION                                       */
/* ================================================================ */

const DOM = {
    // Navigation
    mobileToggle: null,
    navList: null,
    navLinks: [],
    header: null,
    
    // Scroll
    backToTopBtn: null,
    scrollElements: [],
    
    // Form
    forms: [],
    
    // Footer
    yearElement: null,
    socialLinks: [],
    
    init() {
        this.mobileToggle = Utils.getElement('.mobile-toggle');
        this.navList = Utils.getElement('.nav-list');
        this.navLinks = Utils.getElements('.nav-link');
        this.header = Utils.getElement('.site-header');
        
        this.backToTopBtn = Utils.getElement('.back-to-top');
        this.scrollElements = Utils.getElements('[data-scroll]');
        
        this.forms = Utils.getElements(CONFIG.FORM_SELECTOR);
        
        this.yearElement = Utils.getElement('#currentYear');
        this.socialLinks = Utils.getElements('.social-link');
    }
};

/* ================================================================ */
/* 4. MOBILE NAVIGATION                                           */
/* ================================================================ */

const MobileNav = {
    /**
     * Initialize mobile navigation
     */
    init() {
        if (!DOM.mobileToggle || !DOM.navList) return;
        
        this.setupToggle();
        this.setupLinkClose();
        this.setupOutsideClick();
        this.setupEscapeKey();
    },

    /**
     * Setup hamburger menu toggle
     */
    setupToggle() {
        Utils.addEvent(DOM.mobileToggle, 'click', () => {
            const isExpanded = DOM.mobileToggle.getAttribute('aria-expanded') === 'true';
            DOM.mobileToggle.setAttribute('aria-expanded', !isExpanded);
            
            if (DOM.navList.classList.contains('nav-open')) {
                this.close();
            } else {
                this.open();
            }
        });
    },

    /**
     * Close menu when a link is clicked
     */
    setupLinkClose() {
        DOM.navLinks.forEach(link => {
            Utils.addEvent(link, 'click', () => {
                if (window.innerWidth < CONFIG.BREAKPOINTS.TABLET) {
                    this.close();
                }
            });
        });
    },

    /**
     * Close menu when clicking outside
     */
    setupOutsideClick() {
        Utils.addEvent(document, 'click', (e) => {
            if (window.innerWidth < CONFIG.BREAKPOINTS.TABLET) {
                const isInsideNav = DOM.navList.contains(e.target);
                const isToggle = DOM.mobileToggle.contains(e.target);
                if (!isInsideNav && !isToggle && DOM.navList.classList.contains('nav-open')) {
                    this.close();
                }
            }
        });
    },

    /**
     * Close menu on Escape key
     */
    setupEscapeKey() {
        Utils.addEvent(document, 'keydown', (e) => {
            if (e.key === 'Escape' && DOM.navList.classList.contains('nav-open')) {
                this.close();
            }
        });
    },

    /**
     * Open mobile menu
     */
    open() {
        DOM.navList.classList.add('nav-open');
        DOM.mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close mobile menu
     */
    close() {
        DOM.navList.classList.remove('nav-open');
        DOM.mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
};

/* ================================================================ */
/* 5. SMOOTH SCROLL                                              */
/* ================================================================ */

const SmoothScroll = {
    /**
     * Initialize smooth scrolling for anchor links
     */
    init() {
        const anchorLinks = Utils.getElements('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            // Skip if it's a mobile toggle or has no href
            if (link === DOM.mobileToggle) return;
            
            Utils.addEvent(link, 'click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = Utils.getElement(targetId);
                if (!targetElement) return;
                
                e.preventDefault();
                
                const targetPosition = targetElement.getBoundingClientRect().top + 
                                       window.pageYOffset - CONFIG.SCROLL_OFFSET;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without causing scroll jump
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
            });
        });
    }
};

/* ================================================================ */
/* 6. ACTIVE NAVIGATION LINKS                                     */
/* ================================================================ */

const ActiveNav = {
    /**
     * Initialize active link tracking
     */
    init() {
        const sections = Utils.getElements('section[id]');
        if (!sections.length || !DOM.navLinks.length) return;
        
        const updateActiveLink = Utils.throttle(() => {
            let currentSection = '';
            const scrollPosition = window.pageYOffset + CONFIG.SCROLL_OFFSET + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSection = section.getAttribute('id');
                }
            });
            
            DOM.navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }, 100);
        
        Utils.addEvent(window, 'scroll', updateActiveLink);
        setTimeout(updateActiveLink, 100);
    }
};

/* ================================================================ */
/* 7. HEADER STYLE ON SCROLL                                     */
/* ================================================================ */

const HeaderScroll = {
    /**
     * Initialize header style changes on scroll
     */
    init() {
        if (!DOM.header) return;
        
        const updateHeader = Utils.throttle(() => {
            if (window.pageYOffset > 20) {
                DOM.header.classList.add('header-scrolled');
            } else {
                DOM.header.classList.remove('header-scrolled');
            }
        }, 50);
        
        Utils.addEvent(window, 'scroll', updateHeader);
        setTimeout(updateHeader, 50);
    }
};

/* ================================================================ */
/* 8. SCROLL ANIMATIONS (INTERSECTION OBSERVER)                   */
/* ================================================================ */

const ScrollAnimations = {
    /**
     * Initialize scroll-triggered animations
     */
    init() {
        if (!DOM.scrollElements.length) return;
        
        if (!('IntersectionObserver' in window)) {
            // Fallback: show all elements immediately
            DOM.scrollElements.forEach(el => {
                el.classList.add('scroll-visible');
            });
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-visible');
                }
            });
        }, {
            threshold: CONFIG.ANIMATION_THRESHOLD,
            rootMargin: CONFIG.ANIMATION_ROOT_MARGIN
        });
        
        DOM.scrollElements.forEach(el => {
            observer.observe(el);
        });
    },

    /**
     * Refresh animations for new elements
     */
    refresh() {
        DOM.scrollElements.forEach(el => {
            if (Utils.isInViewport(el, 100)) {
                el.classList.add('scroll-visible');
            }
        });
    }
};

/* ================================================================ */
/* 9. PROJECT INTERACTIONS                                       */
/* ================================================================ */

const Projects = {
    /**
     * Initialize project interactions
     */
    init() {
        // Add any project-specific interactions here
        // For example: hover effects, click handlers, etc.
        this.setupProjectCards();
    },

    /**
     * Setup project card interactions
     */
    setupProjectCards() {
        const projectCards = Utils.getElements('.project-card');
        
        projectCards.forEach(card => {
            // Add focus-within support for keyboard users
            Utils.addEvent(card, 'focusin', () => {
                card.classList.add('focused');
            });
            
            Utils.addEvent(card, 'focusout', () => {
                card.classList.remove('focused');
            });
        });
    }
};

/* ================================================================ */
/* 10. CONTACT FORM                                              */
/* ================================================================ */

const ContactForm = {
    /**
     * Initialize contact form functionality
     */
    init() {
        DOM.forms.forEach(form => {
            this.setupForm(form);
        });
    },

    /**
     * Setup a single form
     */
    setupForm(form) {
        Utils.addEvent(form, 'submit', async (e) => {
            e.preventDefault();
            
            if (!this.validateForm(form)) {
                return;
            }
            
            await this.submitForm(form);
        });

        // Real-time validation on blur
        const inputs = Utils.getElements('input, textarea', form);
        inputs.forEach(input => {
            Utils.addEvent(input, 'blur', () => {
                this.validateField(input);
            });
            Utils.addEvent(input, 'input', () => {
                this.clearFieldError(input);
            });
        });
    },

    /**
     * Validate all fields in a form
     */
    validateForm(form) {
        const inputs = Utils.getElements('input, textarea', form);
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    },

    /**
     * Validate a single form field
     */
    validateField(input) {
        const errorElement = this.getErrorElement(input);
        let isValid = true;
        let errorMessage = '';
        
        // Required field check
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(input)} is required.`;
        }
        
        // Email validation
        if (input.type === 'email' && input.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value.trim())) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }
        
        // Minimum length check
        if (input.hasAttribute('minlength')) {
            const minLength = parseInt(input.getAttribute('minlength'), 10);
            if (input.value.trim().length < minLength) {
                isValid = false;
                errorMessage = `${this.getFieldLabel(input)} must be at least ${minLength} characters.`;
            }
        }
        
        if (!isValid) {
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.removeAttribute('hidden');
            }
        } else {
            this.clearFieldError(input);
        }
        
        return isValid;
    },

    /**
     * Clear error state for a field
     */
    clearFieldError(input) {
        input.classList.remove('error');
        input.removeAttribute('aria-invalid');
        const errorElement = this.getErrorElement(input);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.setAttribute('hidden', 'hidden');
        }
    },

    /**
     * Get the error element for a field
     */
    getErrorElement(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return null;
        return Utils.getElement('.form-error', formGroup);
    },

    /**
     * Get the label text for a field
     */
    getFieldLabel(input) {
        const label = Utils.getElement(`label[for="${input.id}"]`);
        return label ? label.textContent.trim() : input.getAttribute('name') || 'Field';
    },

    /**
     * Submit form data
     */
    async submitForm(form) {
        const submitButton = Utils.getElement('button[type="submit"]', form);
        const originalText = submitButton ? submitButton.textContent : 'Send Message';
        
        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
            }
            
            const formData = new FormData(form);
            
            // Use FormSubmit's AJAX endpoint
            const response = await fetch('https://formsubmit.co/ajax/sishefa19@gmail.com', {
                method: 'POST',
                body: formData
            });
            
            // FormSubmit returns { success: true } when successful
            // But we need to handle the response safely
            const text = await response.text();
            
            // Check if response contains success
            if (response.ok && (text.includes('success') || text.includes('{"success":true}'))) {
                this.showSuccess(form);
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError(form, 'There was a problem sending your message. Please try again.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    },

    /**
     * Show success message
     */
    showSuccess(form) {
        const messageContainer = this.getOrCreateMessageContainer(form);
        messageContainer.innerHTML = '';
        messageContainer.classList.add('form-success');
        messageContainer.textContent = '✅ Your message was sent successfully! I\'ll get back to you soon.';
        messageContainer.removeAttribute('hidden');
        
        setTimeout(() => {
            messageContainer.setAttribute('hidden', 'hidden');
            messageContainer.textContent = '';
            messageContainer.classList.remove('form-success');
        }, CONFIG.FORM_SUCCESS_DELAY);
    },

    /**
     * Show error message
     */
    showError(form, message) {
        const messageContainer = this.getOrCreateMessageContainer(form);
        messageContainer.innerHTML = '';
        messageContainer.classList.add('form-error');
        messageContainer.textContent = `❌ ${message}`;
        messageContainer.removeAttribute('hidden');
    },

    /**
     * Get or create a message container for form feedback
     */
    getOrCreateMessageContainer(form) {
        let container = Utils.getElement('.form-messages', form);
        if (!container) {
            container = document.createElement('div');
            container.className = 'form-messages';
            container.setAttribute('hidden', 'hidden');
            form.prepend(container);
        }
        return container;
    }
};

/* ================================================================ */
/* 11. FOOTER FEATURES                                            */
/* ================================================================ */

const Footer = {
    /**
     * Initialize footer features
     */
    init() {
        this.setupAutoYear();
        this.setupBackToTop();
        this.setupSocialAnimations();
    },

    /* ----------------------------------------- */
    /* 11.1 AUTO CURRENT YEAR                    */
    /* ----------------------------------------- */
    
    setupAutoYear() {
        if (DOM.yearElement) {
            const currentYear = new Date().getFullYear();
            DOM.yearElement.textContent = currentYear;
        }
    },

    /* ----------------------------------------- */
    /* 11.2 BACK TO TOP BUTTON                   */
    /* ----------------------------------------- */
    
    setupBackToTop() {
        if (!DOM.backToTopBtn) return;
        
        const toggleVisibility = Utils.throttle(() => {
            const scrollY = window.pageYOffset;
            if (scrollY > CONFIG.SCROLL_THRESHOLD) {
                DOM.backToTopBtn.removeAttribute('hidden');
                DOM.backToTopBtn.classList.add('visible');
            } else {
                DOM.backToTopBtn.setAttribute('hidden', 'hidden');
                DOM.backToTopBtn.classList.remove('visible');
            }
        }, 100);
        
        Utils.addEvent(window, 'scroll', toggleVisibility);
        
        // Click handler for smooth scroll to top
        Utils.addEvent(DOM.backToTopBtn, 'click', () => {
            this.scrollToTop();
        });
        
        // Initial check
        toggleVisibility();
    },

    /**
     * Smooth scroll to top using requestAnimationFrame
     */
    scrollToTop() {
        const currentScroll = window.pageYOffset;
        if (currentScroll === 0) return;
        
        function smoothScroll() {
            const scrollY = window.pageYOffset;
            
            if (scrollY > 0) {
                const easeOutCubic = 1 - Math.pow(1 - 0.05, 3);
                const targetScroll = scrollY - (scrollY * 0.12);
                
                window.scrollTo({
                    top: Math.max(0, targetScroll),
                    behavior: 'auto'
                });
                
                if (targetScroll > 1) {
                    requestAnimationFrame(smoothScroll);
                } else {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    // Remove visible class after reaching top
                    DOM.backToTopBtn.classList.remove('visible');
                }
            }
        }
        
        requestAnimationFrame(smoothScroll);
    },

    /* ----------------------------------------- */
    /* 11.3 SOCIAL ICON ANIMATIONS               */
    /* ----------------------------------------- */
    
    setupSocialAnimations() {
        if (!DOM.socialLinks.length) return;
        
        // Apply staggered animation when footer becomes visible
        const footer = Utils.getElement('.site-footer');
        if (!footer) return;
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateSocialIcons();
                        observer.unobserve(footer);
                    }
                });
            }, {
                threshold: 0.1
            });
            
            observer.observe(footer);
        } else {
            // Fallback: animate immediately
            setTimeout(() => this.animateSocialIcons(), 300);
        }
    },

    /**
     * Animate social icons one by one with stagger
     */
    animateSocialIcons() {
        DOM.socialLinks.forEach((link, index) => {
            link.style.opacity = '0';
            link.style.transform = 'scale(0.7) rotate(-10deg)';
            link.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            
            const delay = 200 + (index * 150);
            
            setTimeout(() => {
                link.style.opacity = '1';
                link.style.transform = 'scale(1) rotate(0deg)';
            }, delay);
        });
    }
};

/* ================================================================ */
/* 12. PERFORMANCE OPTIMIZATION                                   */
/* ================================================================ */

const Performance = {
    /**
     * Initialize performance optimizations
     */
    init() {
        this.setupLazyLoading();
        this.setupReducedMotion();
        this.setupResourceHints();
    },

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        const images = Utils.getElements('img[loading="lazy"]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    },

    /**
     * Respect user's motion preferences
     */
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduce-motion');
            // Remove animation classes
            const animatedElements = Utils.getElements('[data-scroll]');
            animatedElements.forEach(el => {
                el.classList.add('scroll-visible');
            });
        }
        
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduce-motion');
            } else {
                document.body.classList.remove('reduce-motion');
            }
        });
    },

    /**
     * Setup resource hints for performance
     */
    setupResourceHints() {
        // Add preconnect for third-party resources if needed
        // Example: document.head.innerHTML += '<link rel="preconnect" href="https://fonts.googleapis.com" />';
    }
};

/* ================================================================ */
/* 13. EVENT LISTENERS                                            */
/* ================================================================ */

const Events = {
    /**
     * Setup global event listeners
     */
    init() {
        // Handle browser back/forward navigation (bfcache)
        Utils.addEvent(window, 'pageshow', (event) => {
            if (event.persisted) {
                // Page was loaded from bfcache
                ScrollAnimations.refresh();
                
                // Re-check back-to-top visibility
                if (DOM.backToTopBtn) {
                    const scrollY = window.pageYOffset;
                    if (scrollY > CONFIG.SCROLL_THRESHOLD) {
                        DOM.backToTopBtn.removeAttribute('hidden');
                        DOM.backToTopBtn.classList.add('visible');
                    }
                }
            }
        });

        // Re-initialize animations after dynamic content updates
        const updateObserver = new MutationObserver(() => {
            const newScrollElements = Utils.getElements('[data-scroll]:not(.scroll-visible)');
            if (newScrollElements.length) {
                ScrollAnimations.refresh();
            }
        });
        
        updateObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Keyboard accessibility: Escape key to blur focused elements
        Utils.addEvent(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.blur) {
                    activeElement.blur();
                }
            }
        });
    }
};

/* ================================================================ */
/* 14. INITIALIZATION                                             */
/* ================================================================ */

/**
 * Initialize all modules when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM element selection
    DOM.init();
    
    // Initialize modules in order of dependency
    MobileNav.init();
    SmoothScroll.init();
    ActiveNav.init();
    HeaderScroll.init();
    ScrollAnimations.init();
    Projects.init();
    ContactForm.init();
    Footer.init();
    Performance.init();
    Events.init();
});

/**
 * Expose modules for debugging (optional)
 */
// window.__portfolio = {
//     CONFIG,
//     Utils,
//     DOM,
//     MobileNav,
//     SmoothScroll,
//     ActiveNav,
//     HeaderScroll,
//     ScrollAnimations,
//     Projects,
//     ContactForm,
//     Footer,
//     Performance,
//     Events
// };