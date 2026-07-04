/* ============================================================
   PORTFOLIO V2 — Main JavaScript
   Architecture: Modular ES6+
   ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // 1. CONFIGURATION
  // ============================================================
  const CONFIG = {
    SCROLL_OFFSET: 80,
    COUNTER_DURATION: 2000,
    REVEAL_THRESHOLD: 0.15,
    STICKY_OFFSET: 50,
    DEBOUNCE_DELAY: 250,
    THROTTLE_DELAY: 100,
    CURSOR_ACTIVE: window.innerWidth > 768 && !('ontouchstart' in window),
  };

  // ============================================================
  // 2. DOM CACHE
  // ============================================================
  const DOM = {
    body: document.body,
    html: document.documentElement,

    // Navigation
    header: document.getElementById('siteHeader'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileToggle: document.getElementById('mobileToggle'),
    primaryNav: document.getElementById('primaryNav'),

    // Preloader
    preloader: document.getElementById('preloader'),
    preloaderBar: document.getElementById('preloaderBar'),

    // Cursor
    cursorDot: document.getElementById('cursorDot'),
    cursorRing: document.getElementById('cursorRing'),

    // Scroll
    scrollProgress: document.getElementById('scrollProgress'),
    backToTop: document.getElementById('backToTop'),

    // Theme
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.querySelector('.theme-icon'),

    // Contact
    contactForm: document.querySelector('.contact-form'),
    formInputs: document.querySelectorAll('.form-input, .form-textarea'),

    // Sections for reveal
    revealElements: document.querySelectorAll('.reveal, .reveal-scale'),
    staggerElements: document.querySelectorAll('.stagger'),

    // Counters
    statNumbers: document.querySelectorAll('.stat-number'),
  };

  // ============================================================
  // 3. UTILITY HELPERS
  // ============================================================
  const Utils = {
    debounce(fn, delay = CONFIG.DEBOUNCE_DELAY) {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
      };
    },

    throttle(fn, limit = CONFIG.THROTTLE_DELAY) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          fn.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },

    isInViewport(el, threshold = 0) {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const margin = threshold * vh;
      return rect.top < vh - margin && rect.bottom > margin;
    },

    getScrollPosition() {
      return window.pageYOffset || document.documentElement.scrollTop;
    },

    getDocumentHeight() {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
    },

    prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    isTouchDevice() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    getThemePreference() {
      return localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },
  };

  // ============================================================
  // 4. PRELOADER
  // ============================================================
  const Preloader = {
    init() {
      if (!DOM.preloader || !DOM.preloaderBar) return;

      let progress = 0;
      const targetProgress = 100;

      const interval = setInterval(() => {
        const increment = Math.random() * 15 + 5;
        progress = Math.min(progress + increment, targetProgress);
        DOM.preloaderBar.style.width = progress + '%';

        if (progress >= targetProgress) {
          clearInterval(interval);
          this.hide();
        }
      }, 150);

      // Ensure preloader hides even if something goes wrong
      setTimeout(() => {
        if (DOM.preloader && !DOM.preloader.classList.contains('hidden')) {
          this.hide();
        }
      }, 5000);
    },

    hide() {
      if (!DOM.preloader) return;
      DOM.preloader.classList.add('hidden');
      document.body.style.overflow = '';
    },
  };

  // ============================================================
  // 5. CUSTOM CURSOR
  // ============================================================
  const Cursor = {
    isActive: CONFIG.CURSOR_ACTIVE && !Utils.isTouchDevice(),

    init() {
      if (!this.isActive || !DOM.cursorDot || !DOM.cursorRing) {
        this.disable();
        return;
      }

      this.position = { x: 0, y: 0 };
      this.target = { x: 0, y: 0 };
      this.ringTarget = { x: 0, y: 0 };

      document.addEventListener('mousemove', this.onMouseMove.bind(this));
      document.addEventListener('mouseleave', this.onMouseLeave.bind(this));
      document.addEventListener('mouseenter', this.onMouseEnter.bind(this));

      this.animate();

      // Add hover effects for interactive elements
      document.querySelectorAll('a, button, .btn, .project-card, .skill-category, .certificate-card, .education-card, .contact-card')
        .forEach(el => {
          el.addEventListener('mouseenter', () => this.onElementHover(true));
          el.addEventListener('mouseleave', () => this.onElementHover(false));
        });
    },

    onMouseMove(e) {
      this.target.x = e.clientX;
      this.target.y = e.clientY;

      // Update ring with slight delay
      setTimeout(() => {
        this.ringTarget.x = e.clientX;
        this.ringTarget.y = e.clientY;
      }, 30);
    },

    onMouseLeave() {
      DOM.cursorDot.style.opacity = '0';
      DOM.cursorRing.style.opacity = '0';
    },

    onMouseEnter() {
      DOM.cursorDot.style.opacity = '1';
      DOM.cursorRing.style.opacity = '1';
    },

    onElementHover(isHover) {
      if (isHover) {
        DOM.cursorDot.style.width = '12px';
        DOM.cursorDot.style.height = '12px';
        DOM.cursorDot.style.background = 'var(--color-accent)';
        DOM.cursorRing.style.width = '48px';
        DOM.cursorRing.style.height = '48px';
        DOM.cursorRing.style.borderColor = 'var(--color-accent)';
        DOM.cursorRing.style.opacity = '0.6';
      } else {
        DOM.cursorDot.style.width = '6px';
        DOM.cursorDot.style.height = '6px';
        DOM.cursorDot.style.background = 'var(--color-accent)';
        DOM.cursorRing.style.width = '32px';
        DOM.cursorRing.style.height = '32px';
        DOM.cursorRing.style.borderColor = 'var(--color-accent)';
        DOM.cursorRing.style.opacity = '0.4';
      }
    },

    animate() {
      if (!this.isActive) return;

      // Smooth follow for dot
      this.position.x += (this.target.x - this.position.x) * 0.15;
      this.position.y += (this.target.y - this.position.y) * 0.15;

      // Ring follows with slightly different easing
      const ringX = this.position.x + (this.ringTarget.x - this.position.x) * 0.05;
      const ringY = this.position.y + (this.ringTarget.y - this.position.y) * 0.05;

      DOM.cursorDot.style.transform = `translate(${this.position.x}px, ${this.position.y}px) translate(-50%, -50%)`;
      DOM.cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

      requestAnimationFrame(this.animate.bind(this));
    },

    disable() {
      if (DOM.cursorDot) DOM.cursorDot.style.display = 'none';
      if (DOM.cursorRing) DOM.cursorRing.style.display = 'none';
      document.body.style.cursor = 'auto';
    },
  };

  // ============================================================
  // 6. SCROLL PROGRESS
  // ============================================================
  const ScrollProgress = {
    init() {
      if (!DOM.scrollProgress) return;
      window.addEventListener('scroll', Utils.throttle(this.update.bind(this)), { passive: true });
      this.update();
    },

    update() {
      const scrollTop = Utils.getScrollPosition();
      const docHeight = Utils.getDocumentHeight() - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      DOM.scrollProgress.style.width = progress + '%';
    },
  };

  // ============================================================
  // 7. STICKY NAVIGATION
  // ============================================================
  const Navigation = {
    init() {
      if (!DOM.header) return;

      window.addEventListener('scroll', Utils.throttle(this.handleScroll.bind(this)), { passive: true });
      this.handleScroll();

      // Mobile toggle
      if (DOM.mobileToggle && DOM.primaryNav) {
        DOM.mobileToggle.addEventListener('click', this.toggleMobile.bind(this));

        // Close on outside click
        document.addEventListener('click', this.handleOutsideClick.bind(this));

        // Close on ESC
        document.addEventListener('keydown', this.handleEscKey.bind(this));
      }

      // Active link highlighting
      this.initActiveLinks();

      // Smooth scroll for nav links
      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', this.handleSmoothScroll.bind(this));
      });
    },

    handleScroll() {
      const scrollTop = Utils.getScrollPosition();
      const isScrolled = scrollTop > CONFIG.STICKY_OFFSET;

      DOM.header.classList.toggle('scrolled', isScrolled);
    },

    toggleMobile(e) {
      e.stopPropagation();
      const isOpen = DOM.primaryNav.classList.toggle('open');
      DOM.mobileToggle.classList.toggle('active');
      DOM.mobileToggle.setAttribute('aria-expanded', isOpen);

      document.body.style.overflow = isOpen ? 'hidden' : '';
    },

    handleOutsideClick(e) {
      if (!DOM.primaryNav.classList.contains('open')) return;
      if (DOM.primaryNav.contains(e.target) || DOM.mobileToggle.contains(e.target)) return;
      this.closeMobile();
    },

    handleEscKey(e) {
      if (e.key === 'Escape' && DOM.primaryNav.classList.contains('open')) {
        this.closeMobile();
      }
    },

    closeMobile() {
      DOM.primaryNav.classList.remove('open');
      DOM.mobileToggle.classList.remove('active');
      DOM.mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    },

    initActiveLinks() {
      if (!DOM.navLinks.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            DOM.navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
              if (link.classList.contains('active')) {
                link.setAttribute('aria-current', 'section');
              } else {
                link.removeAttribute('aria-current');
              }
            });
          }
        });
      }, { threshold: 0.3 });

      document.querySelectorAll('section[id]').forEach(section => {
        observer.observe(section);
      });
    },

    handleSmoothScroll(e) {
      const targetId = e.currentTarget.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();

      // Close mobile nav if open
      if (DOM.primaryNav.classList.contains('open')) {
        this.closeMobile();
      }

      const offsetTop = targetElement.getBoundingClientRect().top +
        window.pageYOffset -
        CONFIG.SCROLL_OFFSET;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    },
  };

  // ============================================================
  // 8. SCROLL REVEAL
  // ============================================================
  const ScrollReveal = {
    init() {
      if (Utils.prefersReducedMotion()) {
        // Show all elements immediately
        DOM.revealElements.forEach(el => el.classList.add('visible'));
        DOM.staggerElements.forEach(el => el.classList.add('visible'));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // If it's a stagger container, trigger stagger
            if (entry.target.classList.contains('stagger')) {
              entry.target.classList.add('visible');
            }

            // Unobserve after revealing
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: CONFIG.REVEAL_THRESHOLD,
        rootMargin: '0px 0px -50px 0px',
      });

      DOM.revealElements.forEach(el => observer.observe(el));
      DOM.staggerElements.forEach(el => observer.observe(el));

      // Also observe individual children of stagger containers
      document.querySelectorAll('.stagger > *').forEach(el => {
        observer.observe(el);
      });
    },
  };

  // ============================================================
  // 9. ANIMATED COUNTERS
  // ============================================================
  const Counters = {
    animated: false,

    init() {
      if (!DOM.statNumbers.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animated) {
            this.animated = true;
            this.animateCounters();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      // Observe the parent container of counters
      const parent = DOM.statNumbers[0].closest('.stats-grid') ||
        DOM.statNumbers[0].closest('.about-stats') ||
        DOM.statNumbers[0].closest('.about-stats-container');
      if (parent) {
        observer.observe(parent);
      }
    },

    animateCounters() {
      DOM.statNumbers.forEach(el => {
        const text = el.textContent.trim();
        const target = parseFloat(text.replace(/[^0-9.]/g, ''));
        const suffix = text.replace(/[0-9.]/g, '');

        if (isNaN(target)) return;

        const duration = CONFIG.COUNTER_DURATION;
        const startTime = performance.now();
        const isFloat = target % 1 !== 0;

        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;

          if (isFloat) {
            el.textContent = current.toFixed(1) + suffix;
          } else {
            el.textContent = Math.round(current) + suffix;
          }

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = target + suffix;
          }
        };

        requestAnimationFrame(updateCounter);
      });
    },
  };

  // ============================================================
  // 10. THEME TOGGLE
  // ============================================================
  const Theme = {
    currentTheme: Utils.getThemePreference(),

    init() {
      this.applyTheme(this.currentTheme);

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });

      // Setup toggle button
      if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', this.toggle.bind(this));
        this.updateToggleIcon();
      }
    },

    applyTheme(theme) {
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      this.updateToggleIcon();
    },

    toggle() {
      const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.applyTheme(newTheme);
    },

    updateToggleIcon() {
      if (!DOM.themeIcon) return;
      const isDark = this.currentTheme === 'dark';
      DOM.themeIcon.textContent = isDark ? '☀️' : '🌙';
      DOM.themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    },
  };

  // ============================================================
  // 11. CONTACT FORM
  // ============================================================
  const ContactForm = {
    isSubmitting: false,

    init() {
      if (!DOM.contactForm) return;

      DOM.contactForm.addEventListener('submit', this.handleSubmit.bind(this));

      // Real-time validation feedback
      DOM.formInputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => {
          if (input.dataset.valid === 'false') {
            this.validateField(input);
          }
        });
      });
    },

    validateField(input) {
      const value = input.value.trim();
      let isValid = true;
      let errorMessage = '';

      if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
      }

      if (input.type === 'email' && value && !this.isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }

      input.dataset.valid = isValid ? 'true' : 'false';
      input.style.borderColor = isValid ? '' : 'var(--color-danger)';

      // Update or remove error message
      const errorEl = input.parentElement.querySelector('.field-error');
      if (!isValid) {
        if (!errorEl) {
          const newError = document.createElement('span');
          newError.className = 'field-error';
          newError.style.cssText = 'font-size:0.8rem;color:var(--color-danger);margin-top:0.25rem;';
          input.parentElement.appendChild(newError);
        }
        input.parentElement.querySelector('.field-error').textContent = errorMessage;
      } else if (errorEl) {
        errorEl.remove();
      }

      return isValid;
    },

    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    handleSubmit(e) {
      e.preventDefault();

      if (this.isSubmitting) return;

      // Validate all fields
      let allValid = true;
      DOM.formInputs.forEach(input => {
        if (!this.validateField(input)) {
          allValid = false;
        }
      });

      if (!allValid) {
        // Focus first invalid field
        const firstInvalid = document.querySelector('[data-valid="false"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      this.isSubmitting = true;
      const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;

      // Simulate form submission
      setTimeout(() => {
        this.showMessage('Your message has been sent successfully! 🎉', 'success');
        DOM.contactForm.reset();
        DOM.formInputs.forEach(input => {
          input.dataset.valid = 'true';
          input.style.borderColor = '';
          const error = input.parentElement.querySelector('.field-error');
          if (error) error.remove();
        });
        this.isSubmitting = false;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 1500);
    },

    showMessage(text, type) {
      const existing = DOM.contactForm.querySelector('.form-message');
      if (existing) existing.remove();

      const msg = document.createElement('div');
      msg.className = 'form-message';
      msg.style.cssText = `
        padding: var(--space-md);
        border-radius: var(--radius-md);
        margin-top: var(--space-md);
        font-weight: 500;
        text-align: center;
        animation: fadeIn 0.3s ease;
        ${type === 'success' ? 'background: var(--color-success); color: #fff;' :
          'background: var(--color-danger); color: #fff;'}
      `;
      msg.textContent = text;
      DOM.contactForm.appendChild(msg);

      setTimeout(() => {
        if (msg.parentElement) {
          msg.style.opacity = '0';
          msg.style.transition = 'opacity 0.3s ease';
          setTimeout(() => msg.remove(), 300);
        }
      }, 5000);
    },
  };

  // ============================================================
  // 12. BACK TO TOP
  // ============================================================
  const BackToTop = {
    init() {
      if (!DOM.backToTop) return;

      window.addEventListener('scroll', Utils.throttle(this.handleScroll.bind(this)), { passive: true });

      DOM.backToTop.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      });
    },

    handleScroll() {
      const scrollTop = Utils.getScrollPosition();
      const shouldShow = scrollTop > window.innerHeight * 0.5;
      DOM.backToTop.classList.toggle('visible', shouldShow);
    },
  };

  // ============================================================
  // 13. HERO ANIMATIONS
  // ============================================================
  const HeroAnimations = {
    init() {
      if (Utils.prefersReducedMotion()) return;

      const hero = document.querySelector('.section-hero');
      if (!hero) return;

      const elements = hero.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-description, .hero-actions, .hero-visual');

      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.7s ease ${index * 0.1}s, transform 0.7s ease ${index * 0.1}s`;

        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 300 + index * 100);
      });

      // Floating animation for hero image
      const imageWrapper = hero.querySelector('.hero-image-wrapper');
      if (imageWrapper) {
        setInterval(() => {
          imageWrapper.style.transition = 'transform 3s ease-in-out';
          imageWrapper.style.transform = 'translateY(-12px)';
          setTimeout(() => {
            imageWrapper.style.transform = 'translateY(0)';
          }, 3000);
        }, 6000);
      }
    },
  };

  // ============================================================
  // 14. CARD TILT EFFECT
  // ============================================================
  const CardTilt = {
    init() {
      if (Utils.isTouchDevice() || Utils.prefersReducedMotion()) return;

      const cards = document.querySelectorAll('.project-card, .certificate-card, .skill-category, .education-card, .contact-card, .highlight-card');

      cards.forEach(card => {
        card.addEventListener('mousemove', this.handleMove.bind(this));
        card.addEventListener('mouseleave', this.handleLeave.bind(this));
      });
    },

    handleMove(e) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    },

    handleLeave(e) {
      const card = e.currentTarget;
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    },
  };

  // ============================================================
  // 15. IMAGE LAZY LOADING (progressive enhancement)
  // ============================================================
  const ImageLoader = {
    init() {
      if (!('IntersectionObserver' in window)) return;

      const images = document.querySelectorAll('img[loading="lazy"]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.src; // Trigger load
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });

      images.forEach(img => observer.observe(img));
    },
  };

  // ============================================================
  // 16. RESIZE HANDLER
  // ============================================================
  const ResizeHandler = {
    init() {
      window.addEventListener('resize', Utils.debounce(this.handleResize.bind(this)));
    },

    handleResize() {
      // Recalculate any layout-dependent values
      // Update cursor state if needed
      if (window.innerWidth <= 768 && Cursor.isActive) {
        Cursor.isActive = false;
        Cursor.disable();
      } else if (window.innerWidth > 768 && !Cursor.isActive && !Utils.isTouchDevice()) {
        Cursor.isActive = true;
        Cursor.init();
      }
    },
  };

  // ============================================================
  // 17. ACCESSIBILITY — Focus Management
  // ============================================================
  const Accessibility = {
    init() {
      // Ensure all interactive elements are keyboard accessible
      document.querySelectorAll('[tabindex="-1"]').forEach(el => {
        if (el.getAttribute('role') === 'button' || el.tagName === 'BUTTON') {
          el.removeAttribute('tabindex');
        }
      });

      // Add focus styles
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
      });

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
      });

      // Handle reduced motion
      if (Utils.prefersReducedMotion()) {
        document.querySelectorAll('.reveal, .reveal-scale, .stagger').forEach(el => {
          el.classList.add('visible');
        });
      }

      // ARIA live regions for dynamic content
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    },
  };

  // ============================================================
  // 18. CURRENT YEAR IN FOOTER
  // ============================================================
  const FooterYear = {
    init() {
      const yearElement = document.getElementById('currentYear');
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
      }
    },
  };

  // ============================================================
  // 19. EMAILJS CONTACT FORM INTEGRATION
  // ============================================================
  const EmailService = {
    isSending: false,

    init() {
      if (typeof emailjs !== 'undefined') {
        try {
          emailjs.init('gP0OB6dia_KlwraDC');
          console.log('✅ EmailJS initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize EmailJS:', error);
        }
      } else {
        console.warn('❌ EmailJS library not loaded. Using fallback form handling.');
        return;
      }

      const form = document.querySelector('.contact-form');
      if (!form) return;

      form.removeEventListener('submit', ContactForm.handleSubmit);
      form.addEventListener('submit', this.handleSubmit.bind(this));
    },

    async handleSubmit(e) {
      e.preventDefault();

      if (this.isSending) return;

      const form = e.currentTarget;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Validate all fields
      let allValid = true;
      const inputs = form.querySelectorAll('.form-input, .form-textarea');
      inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          allValid = false;
          input.style.borderColor = 'var(--color-danger)';
        } else {
          input.style.borderColor = '';
        }
      });

      if (!allValid) {
        ContactForm.showMessage('Please fill in all required fields.', 'error');
        return;
      }

      // Prepare data
      const formData = {
        name: form.querySelector('#formName').value.trim(),
        email: form.querySelector('#formEmail').value.trim(),
        subject: form.querySelector('#formSubject').value.trim() || 'New Contact Form Message',
        message: form.querySelector('#formMessage').value.trim(),
      };

      console.log('📤 Sending email with data:', formData);

      this.isSending = true;
      submitBtn.innerHTML = 'Sending... <span aria-hidden="true">⏳</span>';
      submitBtn.disabled = true;

      try {
  // EmailJS configuration - ALL CORRECT NOW ✅
  const response = await emailjs.send(
    'portfolio_contact_form',  // ✅ Service ID
    'template_54q6hun',        // ✅ Your correct Template ID
    formData
  );

  console.log('✅ Email sent successfully:', response);
  ContactForm.showMessage('Your message has been sent successfully! 🎉', 'success');
  form.reset();
  
  // Clear validation states
  inputs.forEach(input => {
    input.dataset.valid = 'true';
    input.style.borderColor = '';
    const error = input.parentElement.querySelector('.field-error');
    if (error) error.remove();
  });
} catch (error) {
  console.error('❌ Email sending failed:', error);
  ContactForm.showMessage('Failed to send message. Please try again.', 'error');
} finally {
  this.isSending = false;
  submitBtn.innerHTML = originalText;
  submitBtn.disabled = false;
}
    }
  };

  // ============================================================
  // 20. INITIALIZATION
  // ============================================================
  const App = {
    init() {
      // Initialize modules in order
      Preloader.init();
      Theme.init();
      Navigation.init();
      ScrollProgress.init();
      ScrollReveal.init();
      Counters.init();
      HeroAnimations.init();
      CardTilt.init();
      ImageLoader.init();
      BackToTop.init();
      Accessibility.init();
      ResizeHandler.init();
      FooterYear.init();

      // Initialize Contact Form with EmailJS
      // If EmailJS is not available, use fallback
      if (typeof emailjs !== 'undefined') {
        EmailService.init();
      } else {
        ContactForm.init();
        console.log('📧 Using fallback contact form (EmailJS not loaded)');
      }

      // Cursor should be initialized after theme and other modules
      setTimeout(() => {
        Cursor.init();
      }, 100);

      console.log('🚀 Portfolio V2 initialized successfully');
    },
  };

  // ============================================================
  // 21. DOM READY
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

  // ============================================================
  // 22. EXPOSE FOR DEBUGGING (optional)
  // ============================================================
  // window.__PORTFOLIO = {
  //   App,
  //   Utils,
  //   Theme,
  //   Navigation,
  //   EmailService,
  // };

})();