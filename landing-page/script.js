/* ════════════════════════════════════════════════════════
   THE PUFFY CLOUD CAFE — Home Page Interactions
   Home-specific JS (shared utilities loaded via shared.js)
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initShared();
  initCounterAnimations();
  initHomeInteractions();
  initTestimonialCarousel();
  initGalleryLightbox();
});

/* ─── Counter Animations ─────────────────── */
function initCounterAnimations() {
  const counters = document.querySelectorAll('.stat-number[data-count]');

  if (prefersReducedMotion()) {
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
  const duration = isMobile() ? 1500 : 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
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

/* ─── Home Interactions ──────────────────── */
function initHomeInteractions() {
  const touch = isTouchDevice();
  const mobile = isMobile();
  const reducedMotion = prefersReducedMotion();

  if (reducedMotion) return;

  // Card press effect for all interactive cards
  initCardPressEffect(
    '.category-card, .product-card, .feature-card, .testimonial-card, .stat-item'
  );

  // Desktop-only hover interactions
  if (!touch && !mobile) {
    // Smooth tilt on product cards
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

  // Parallax (desktop only)
  if (!mobile) {
    let heroTicking = false;
    window.addEventListener('scroll', () => {
      if (!heroTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroSection = document.querySelector('.hero-section');

          if (heroSection && scrollY < window.innerHeight * 1.5) {
            document.querySelectorAll('.hero-section .hero-orb').forEach((orb, i) => {
              const speed = 0.15 + i * 0.1;
              orb.style.transform = `translateY(${scrollY * speed}px)`;
            });

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

/* ─── Testimonial Auto-Rotate Carousel ───── */
function initTestimonialCarousel() {
  const grid = document.querySelector('.testimonials-grid');
  const cards = document.querySelectorAll('.testimonial-card');

  if (!grid || cards.length === 0) return;

  // On mobile, show one card at a time with auto-rotation
  if (!isMobile()) {
    // On desktop, all cards are visible — just add dot navigation for visual flair
    return;
  }

  let currentIndex = 0;
  let autoPlayTimer = null;
  let isPaused = false;

  // Hide all cards except the first
  cards.forEach((card, i) => {
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    if (i !== 0) {
      card.style.opacity = '0';
      card.style.position = 'absolute';
      card.style.top = '0';
      card.style.left = '0';
      card.style.right = '0';
      card.style.pointerEvents = 'none';
      card.style.transform = 'translateX(30px)';
    }
  });

  // Make grid relative for absolute positioning
  grid.style.position = 'relative';
  grid.style.display = 'block';
  grid.style.minHeight = cards[0].offsetHeight + 'px';

  // Create dots
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  // Insert dots after the grid
  grid.parentElement.insertBefore(dotsContainer, grid.nextSibling);

  function goToSlide(index) {
    if (index === currentIndex) return;

    const direction = index > currentIndex ? 1 : -1;

    // Fade out current
    cards[currentIndex].style.opacity = '0';
    cards[currentIndex].style.pointerEvents = 'none';
    cards[currentIndex].style.transform = `translateX(${-30 * direction}px)`;

    // Fade in new
    cards[index].style.transform = `translateX(${30 * direction}px)`;
    requestAnimationFrame(() => {
      cards[index].style.opacity = '1';
      cards[index].style.pointerEvents = 'auto';
      cards[index].style.transform = 'translateX(0)';
    });

    // Update dots
    dotsContainer.children[currentIndex].classList.remove('active');
    dotsContainer.children[index].classList.add('active');

    currentIndex = index;
  }

  function nextSlide() {
    goToSlide((currentIndex + 1) % cards.length);
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      if (!isPaused) nextSlide();
    }, 5000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // Pause on touch interaction
  grid.addEventListener('touchstart', () => {
    isPaused = true;
  }, { passive: true });

  grid.addEventListener('touchend', () => {
    isPaused = false;
    startAutoPlay();
  }, { passive: true });

  // Swipe support
  let touchStartX = 0;
  grid.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  grid.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        goToSlide((currentIndex + 1) % cards.length);
      } else {
        goToSlide((currentIndex - 1 + cards.length) % cards.length);
      }
    }
  }, { passive: true });

  if (!prefersReducedMotion()) {
    startAutoPlay();
  }
}

/* ─── Gallery Lightbox ───────────────────── */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length === 0) return;

  // Collect image data
  const images = [];
  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-item-overlay span');
    if (img) {
      images.push({
        src: img.src,
        alt: img.alt,
        caption: caption ? caption.textContent : img.alt
      });
    }
  });

  // Create lightbox DOM
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Close lightbox">✕</button>
      <button class="lightbox-nav prev" aria-label="Previous image">‹</button>
      <button class="lightbox-nav next" aria-label="Next image">›</button>
      <img src="" alt="" />
      <div class="lightbox-caption"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const lightboxImg = overlay.querySelector('img');
  const lightboxCaption = overlay.querySelector('.lightbox-caption');
  const closeBtn = overlay.querySelector('.lightbox-close');
  const prevBtn = overlay.querySelector('.lightbox-nav.prev');
  const nextBtn = overlay.querySelector('.lightbox-nav.next');

  let currentImageIndex = 0;

  function openLightbox(index) {
    currentImageIndex = index;
    updateLightboxImage();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    const image = images[currentImageIndex];
    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt;
    lightboxCaption.textContent = image.caption;
  }

  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateLightboxImage();
  }

  function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateLightboxImage();
  }

  // Click handlers
  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', prevImage);
  nextBtn.addEventListener('click', nextImage);

  // Close on overlay click (not content)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
    }
  });

  // Touch swipe for lightbox
  let lightboxTouchX = 0;
  overlay.addEventListener('touchstart', (e) => {
    lightboxTouchX = e.changedTouches[0].clientX;
  }, { passive: true });

  overlay.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - lightboxTouchX;
    if (Math.abs(diff) > 60) {
      if (diff < 0) nextImage();
      else prevImage();
    }
  }, { passive: true });
}
