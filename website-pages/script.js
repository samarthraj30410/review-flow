/* ════════════════════════════════════════════════════════
   THE PUFFY CLOUD CAFE — Smooth Interactions
   CPU-heavy animations, no particles
   Responsive-aware: disables hover effects on touch devices
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initCursorGlow();
  initCounterAnimations();
  initSmoothInteractions();
  initResizeHandler();
});

/* ─── Device Detection ───────────────────── */
function isTouchDevice() {
  return ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0) ||
         (window.matchMedia('(hover: none)').matches);
}

function isMobile() {
  return window.innerWidth <= 768;
}

function isSmallScreen() {
  return window.innerWidth <= 480;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ─── Resize Handler ─────────────────────── */
function initResizeHandler() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(resizeTimer);
    document.body.classList.add('resize-animation-stopper');
    resizeTimer = setTimeout(() => {
      document.body.classList.remove('resize-animation-stopper');
    }, 300);

    // Update cursor glow visibility
    const glow = document.getElementById('cursorGlow');
    if (glow) {
      glow.style.display = (isMobile() || isTouchDevice()) ? 'none' : '';
    }

    // Close mobile menu if resizing to desktop
    if (window.innerWidth > 768) {
      const menuBtn = document.getElementById('mobileMenuBtn');
      const navLinks = document.getElementById('navLinks');
      if (menuBtn && navLinks) {
        menuBtn.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });
}

/* ─── Navigation ─────────────────────────── */
function initNavigation() {
  const nav = document.getElementById('mainNav');
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  // Scroll-based nav styling
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 60) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Mobile menu toggle
  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle('open');
      menuBtn.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (menuBtn) menuBtn.classList.remove('open');
      if (navLinks) navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close mobile menu on outside tap
  document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
      menuBtn.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('open')) {
      menuBtn.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Active link highlighting on scroll
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        let currentSection = '';
        sections.forEach(section => {
          const sectionTop = section.offsetTop - 200;
          if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute('id');
          }
        });

        navAnchors.forEach(anchor => {
          anchor.style.color = '';
          if (anchor.getAttribute('href') === '#' + currentSection) {
            anchor.style.color = 'var(--text-light)';
          }
        });
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
}

/* ─── Scroll Reveal ──────────────────────── */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  // If reduced motion, show everything immediately
  if (prefersReducedMotion()) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  // Initial check for elements already in view
  checkReveal(revealElements);

  // Intersection Observer for performance
  const observerOptions = {
    threshold: 0.1,
    // Larger trigger area on mobile to prevent jank
    rootMargin: isMobile() ? '0px 0px -30px 0px' : '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

function checkReveal(elements) {
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      el.classList.add('visible');
    }
  });
}

/* ─── Cursor Glow (CPU-based, desktop only) ─ */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  // Only show on non-touch desktops
  if (isMobile() || isTouchDevice() || prefersReducedMotion()) {
    glow.style.display = 'none';
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;
  const ease = 0.08;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateGlow() {
    glowX += (mouseX - glowX) * ease;
    glowY += (mouseY - glowY) * ease;

    glow.style.transform = `translate(${glowX - 150}px, ${glowY - 150}px)`;

    requestAnimationFrame(animateGlow);
  }

  animateGlow();
}

/* ─── Counter Animations ─────────────────── */
function initCounterAnimations() {
  const counters = document.querySelectorAll('.stat-number[data-count]');

  if (prefersReducedMotion()) {
    // Show final values immediately
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'), 10);
      counter.textContent = (target >= 1000 ? target.toLocaleString() : target) + '+';
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = isMobile() ? 1500 : 2000; // Faster on mobile
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic for smooth deceleration
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(easedProgress * target);

    if (target >= 1000) {
      el.textContent = current.toLocaleString() + '+';
    } else {
      el.textContent = current + '+';
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ─── Smooth Interactions ────────────────── */
function initSmoothInteractions() {
  const touch = isTouchDevice();
  const mobile = isMobile();
  const reducedMotion = prefersReducedMotion();

  // Skip all hover-based interactions on touch devices or reduced motion
  if (reducedMotion) return;

  // ── Clay card press effect (works on both touch and mouse) ──
  const interactiveCards = document.querySelectorAll(
    '.category-card, .product-card, .feature-card, .testimonial-card, .stat-item'
  );

  interactiveCards.forEach(card => {
    const pressStart = () => {
      card.style.transition = 'transform 0.15s ease';
      card.style.transform = 'scale(0.97)';
    };
    const pressEnd = () => {
      card.style.transition = 'var(--transition-bounce)';
      card.style.transform = '';
    };

    // Mouse events
    card.addEventListener('mousedown', pressStart);
    card.addEventListener('mouseup', pressEnd);
    card.addEventListener('mouseleave', pressEnd);

    // Touch events
    card.addEventListener('touchstart', pressStart, { passive: true });
    card.addEventListener('touchend', pressEnd, { passive: true });
    card.addEventListener('touchcancel', pressEnd, { passive: true });
  });

  // ── Desktop-only hover interactions ──
  if (!touch && !mobile) {
    // Smooth tilt effect on product cards (CPU-based)
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / centerY * -4;
        const rotateY = (x - centerX) / centerX * 4;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'var(--transition-bounce)';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.15s ease';
      });
    });

    // Magnetic button effect
    document.querySelectorAll('.btn-clay-primary, .btn-clay-secondary, .cta-btn, .nav-cta').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });

    // Gallery hover parallax
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const img = item.querySelector('img');
        if (img) {
          img.style.transform = `scale(1.1) translate(${(x - 0.5) * -10}px, ${(y - 0.5) * -10}px)`;
        }
      });

      item.addEventListener('mouseleave', () => {
        const img = item.querySelector('img');
        if (img) {
          img.style.transition = 'transform 0.5s ease';
          img.style.transform = '';
        }
      });

      item.addEventListener('mouseenter', () => {
        const img = item.querySelector('img');
        if (img) {
          img.style.transition = 'transform 0.15s ease';
        }
      });
    });
  }

  // ── Parallax (reduced on mobile, disabled on reduced motion) ──
  if (!mobile) {
    let heroTicking = false;
    window.addEventListener('scroll', () => {
      if (!heroTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroSection = document.querySelector('.hero-section');

          if (heroSection && scrollY < window.innerHeight * 1.5) {
            // Parallax on orbs
            document.querySelectorAll('.hero-section .hero-orb').forEach((orb, i) => {
              const speed = 0.15 + i * 0.1;
              orb.style.transform = `translateY(${scrollY * speed}px)`;
            });

            // Parallax on hero content
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
              heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
              heroContent.style.opacity = Math.max(0, 1 - scrollY / (window.innerHeight * 0.6));
            }
          }

          heroTicking = false;
        });
        heroTicking = true;
      }
    }, { passive: true });
  }

  // Ensure hero title is visible
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.style.opacity = '1';
  }
}
