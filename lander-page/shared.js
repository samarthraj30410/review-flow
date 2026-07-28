/* ════════════════════════════════════════════════════════
   THE PUFFY CLOUD CAFE — Shared Utilities
   Common JS loaded by every page: nav, scroll reveal,
   cursor glow, device detection, resize handler,
   smooth scroll, back-to-top
════════════════════════════════════════════════════════ */

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
    clearTimeout(resizeTimer);
    document.body.classList.add('resize-animation-stopper');
    resizeTimer = setTimeout(() => {
      document.body.classList.remove('resize-animation-stopper');
    }, 300);

    const glow = document.getElementById('cursorGlow');
    if (glow) {
      glow.style.display = (isMobile() || isTouchDevice()) ? 'none' : '';
    }

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

  // Active link highlighting on scroll (only for anchor links)
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (navAnchors.length > 0) {
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
}

/* ─── Scroll Reveal ──────────────────────── */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (prefersReducedMotion()) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  // Initial check for elements already in view
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      el.classList.add('visible');
    }
  });

  // IntersectionObserver for performance
  const observerOptions = {
    threshold: 0.1,
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

/* ─── Cursor Glow (CPU-based, desktop only) ─ */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  if (isMobile() || isTouchDevice() || prefersReducedMotion()) {
    glow.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
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

/* ─── Smooth Anchor Scrolling ────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById('mainNav')?.offsetHeight || 70;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });

      // Update URL without jump
      history.pushState(null, null, href);
    });
  });
}

/* ─── Back To Top Button ─────────────────── */
function initBackToTop() {
  // Create the button dynamically
  const btn = document.createElement('button');
  btn.className = 'back-to-top-btn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 16V4M10 4L4 10M10 4L16 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  document.body.appendChild(btn);

  // Show/hide based on scroll position
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 600) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  });
}

/* ─── Common Card Press Effect ───────────── */
function initCardPressEffect(selectors) {
  if (prefersReducedMotion()) return;

  const cards = document.querySelectorAll(selectors);

  cards.forEach(card => {
    const pressStart = () => {
      card.style.transition = 'transform 0.15s ease';
      card.style.transform = 'scale(0.97)';
    };
    const pressEnd = () => {
      card.style.transition = 'var(--transition-bounce)';
      card.style.transform = '';
    };

    card.addEventListener('mousedown', pressStart);
    card.addEventListener('mouseup', pressEnd);
    card.addEventListener('mouseleave', pressEnd);
    card.addEventListener('touchstart', pressStart, { passive: true });
    card.addEventListener('touchend', pressEnd, { passive: true });
    card.addEventListener('touchcancel', pressEnd, { passive: true });
  });
}

/* ─── Shared Init (called by each page) ──── */
function initShared() {
  initNavigation();
  initScrollReveal();
  initCursorGlow();
  initResizeHandler();
  initSmoothScroll();
  initBackToTop();
}
