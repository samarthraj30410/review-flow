/* ════════════════════════════════════════════════════════
   THE PUFFY CLOUD CAFE — Menu Page Interactions
   Filter tabs + reused nav, reveal, cursor glow patterns
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initCursorGlow();
  initMenuFilter();
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

  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle('open');
      menuBtn.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (menuBtn) menuBtn.classList.remove('open');
      if (navLinks) navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
      menuBtn.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('open')) {
      menuBtn.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ─── Scroll Reveal ──────────────────────── */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (prefersReducedMotion()) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      el.classList.add('visible');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: isMobile() ? '0px 0px -30px 0px' : '0px 0px -60px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ─── Cursor Glow ────────────────────────── */
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

/* ─── Menu Category Filter ───────────────── */
function initMenuFilter() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const categorySections = document.querySelectorAll('.menu-category-section[data-section]');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');

      if (category === 'all') {
        // Show all sections
        categorySections.forEach(section => {
          section.classList.remove('hidden-section');
        });
      } else {
        // Show only matching section
        categorySections.forEach(section => {
          if (section.getAttribute('data-section') === category) {
            section.classList.remove('hidden-section');
          } else {
            section.classList.add('hidden-section');
          }
        });
      }

      // Scroll to filter bar smoothly
      const filterSection = document.querySelector('.menu-filter-section');
      if (filterSection) {
        const offset = filterSection.offsetTop - 70;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
}

/* ─── Smooth Interactions ────────────────── */
function initSmoothInteractions() {
  if (prefersReducedMotion()) return;

  const cards = document.querySelectorAll('.menu-item-card, .menu-note-card');

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
