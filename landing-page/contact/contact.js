/* ════════════════════════════════════════════════════════
   THE PUFFY CLOUD CAFE — Contact Page Interactions
   Contact-specific JS (shared utilities loaded via shared.js)
════════════════════════════════════════════════════════ */

function runInitContact() {
  initShared();
  initFAQAccordion();
  initFAQSearch();
  initContactForm();
  initContactInteractions();
  initOpenNowBadge();
  initMapInteraction();
  initHeroCTAScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInitContact);
} else {
  runInitContact();
}

/* ─── Hero CTA Smooth Scroll ────────────── */
function initHeroCTAScroll() {
  const heroCTAs = document.querySelectorAll('.hero-cta-btn');
  heroCTAs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navHeight = document.getElementById('mainNav')?.offsetHeight || 70;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });
  });
}

/* ─── Dynamic Open Now Badge ─────────────── */
function initOpenNowBadge() {
  const badge = document.querySelector('.contact-open-badge');
  if (!badge) return;

  function updateBadge() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const hour = now.getHours();

    let isOpen = false;

    if (day >= 1 && day <= 5) {
      // Mon-Fri: 7AM - 10PM
      isOpen = hour >= 7 && hour < 22;
    } else {
      // Sat-Sun: 8AM - 11PM
      isOpen = hour >= 8 && hour < 23;
    }

    if (isOpen) {
      badge.textContent = 'Open Now';
      badge.classList.remove('closed');
    } else {
      badge.textContent = 'Currently Closed';
      badge.classList.add('closed');
    }
  }

  updateBadge();
  // Update every minute
  setInterval(updateBadge, 60000);
}

/* ─── Map Card Interaction ───────────────── */
function initMapInteraction() {
  const mapPlaceholder = document.querySelector('.map-placeholder');
  if (!mapPlaceholder || isTouchDevice()) return;

  if (prefersReducedMotion()) return;

  mapPlaceholder.addEventListener('mousemove', (e) => {
    const rect = mapPlaceholder.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const pin = mapPlaceholder.querySelector('.map-pin');
    if (pin) {
      pin.style.transform = `translate(${(x - 0.5) * 15}px, ${(y - 0.5) * 15}px) scale(1.05)`;
    }

    const gridBg = mapPlaceholder.querySelector('.map-grid-bg');
    if (gridBg) {
      gridBg.style.backgroundPosition = `${x * 10}px ${y * 10}px`;
    }
  });

  mapPlaceholder.addEventListener('mouseleave', () => {
    const pin = mapPlaceholder.querySelector('.map-pin');
    if (pin) {
      pin.style.transition = 'transform 0.5s ease';
      pin.style.transform = '';
      setTimeout(() => { pin.style.transition = ''; }, 500);
    }

    const gridBg = mapPlaceholder.querySelector('.map-grid-bg');
    if (gridBg) {
      gridBg.style.backgroundPosition = '';
    }
  });
}

/* ─── Contact Interactions ───────────────── */
function initContactInteractions() {
  if (prefersReducedMotion()) return;
  initCardPressEffect('.contact-info-card, .location-card, .social-link-card');
}

/* ─── FAQ Accordion (with Accessibility) ─── */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    // Set up ARIA attributes
    const questionId = question.id || `faq-q-${index}`;
    const answerId = answer.id || `faq-a-${index}`;

    question.id = questionId;
    answer.id = answerId;
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', answerId);
    question.setAttribute('role', 'button');
    answer.setAttribute('role', 'region');
    answer.setAttribute('aria-labelledby', questionId);

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherQ = other.querySelector('.faq-question');
          if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
    });

    // Keyboard navigation: Enter/Space to toggle
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  // Arrow key navigation between FAQ items
  const allQuestions = document.querySelectorAll('.faq-question');
  allQuestions.forEach((q, i) => {
    q.setAttribute('tabindex', '0');

    q.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = allQuestions[(i + 1) % allQuestions.length];
        next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = allQuestions[(i - 1 + allQuestions.length) % allQuestions.length];
        prev.focus();
      }
    });
  });
}

/* ─── FAQ Search / Filter ────────────────── */
function initFAQSearch() {
  const faqList = document.querySelector('.faq-list');
  const faqHeader = document.querySelector('.faq-header');
  if (!faqList || !faqHeader) return;

  // Create search input
  const searchWrap = document.createElement('div');
  searchWrap.className = 'faq-search-wrap reveal';
  searchWrap.innerHTML = `
    <span class="faq-search-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;"><path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="rgba(255,255,255,0.5)"/></svg></span>
    <input type="text" class="faq-search-input" placeholder="Search frequently asked questions..." aria-label="Search FAQ">
  `;

  // Create no-results message
  const noResults = document.createElement('div');
  noResults.className = 'faq-no-results';
  noResults.textContent = 'No matching questions found. Try a different search term.';

  // Insert after FAQ header
  faqHeader.after(searchWrap);
  faqList.after(noResults);

  const searchInput = searchWrap.querySelector('.faq-search-input');
  const faqItems = faqList.querySelectorAll('.faq-item');

  // Debounce for smoother typing
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = searchInput.value.toLowerCase().trim();
      let matchCount = 0;

      faqItems.forEach(item => {
        const questionText = item.querySelector('.faq-question span')?.textContent?.toLowerCase() || '';
        const answerText = item.querySelector('.faq-answer p')?.textContent?.toLowerCase() || '';

        if (query === '' || questionText.includes(query) || answerText.includes(query)) {
          item.classList.remove('faq-hidden');
          matchCount++;
        } else {
          item.classList.add('faq-hidden');
        }
      });

      noResults.style.display = (matchCount === 0 && query !== '') ? 'block' : 'none';
    }, 150);
  });
}

/* ─── Contact Form (Real-time Validation) ── */
function initContactForm() {
  const form = document.getElementById('contactFormEl');
  const submitBtn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');

  if (!form) return;

  // Validation rules
  const validators = {
    firstName: {
      validate: (v) => v.trim().length >= 2,
      message: 'First name must be at least 2 characters'
    },
    lastName: {
      validate: (v) => v.trim().length >= 2,
      message: 'Last name must be at least 2 characters'
    },
    email: {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Please enter a valid email address'
    },
    subject: {
      validate: (v) => v !== '',
      message: 'Please select a subject'
    },
    message: {
      validate: (v) => v.trim().length >= 10,
      message: 'Message must be at least 10 characters'
    }
  };

  // Set up real-time validation on each field
  Object.keys(validators).forEach(fieldName => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    // Create error message element
    const errorMsg = document.createElement('span');
    errorMsg.className = 'field-error-msg';
    errorMsg.textContent = validators[fieldName].message;
    field.parentElement.appendChild(errorMsg);

    // Validate on blur
    field.addEventListener('blur', () => {
      validateField(field, fieldName);
    });

    // Clear error on input
    field.addEventListener('input', () => {
      if (field.classList.contains('field-invalid')) {
        validateField(field, fieldName);
      }
    });
  });

  // Character counter for textarea
  const messageField = form.querySelector('[name="message"]');
  if (messageField) {
    const maxChars = 500;
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.textContent = `0 / ${maxChars}`;
    messageField.parentElement.appendChild(counter);

    messageField.addEventListener('input', () => {
      const len = messageField.value.length;
      counter.textContent = `${len} / ${maxChars}`;

      counter.classList.remove('warning', 'limit');
      if (len >= maxChars) {
        counter.classList.add('limit');
        messageField.value = messageField.value.substring(0, maxChars);
        counter.textContent = `${maxChars} / ${maxChars}`;
      } else if (len >= maxChars * 0.8) {
        counter.classList.add('warning');
      }
    });
  }

  function validateField(field, fieldName) {
    const value = field.value;
    const isValid = validators[fieldName].validate(value);
    const errorMsg = field.parentElement.querySelector('.field-error-msg');

    field.classList.remove('field-valid', 'field-invalid');

    if (value === '' && field.type !== 'select-one') {
      // Don't show error for empty untouched fields
      if (errorMsg) errorMsg.classList.remove('show');
      return false;
    }

    if (isValid) {
      field.classList.add('field-valid');
      if (errorMsg) errorMsg.classList.remove('show');
    } else {
      field.classList.add('field-invalid');
      if (errorMsg) errorMsg.classList.add('show');
    }

    return isValid;
  }

  // Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields
    let allValid = true;
    Object.keys(validators).forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field && !validateField(field, fieldName)) {
        allValid = false;
      }
    });

    if (!allValid) {
      // Focus the first invalid field
      const firstInvalid = form.querySelector('.field-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Show loading state
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;

    // Simulate form submission
    setTimeout(() => {
      form.style.display = 'none';
      successMsg.style.display = 'block';

      successMsg.style.opacity = '0';
      successMsg.style.transform = 'translateY(20px)';
      requestAnimationFrame(() => {
        successMsg.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        successMsg.style.opacity = '1';
        successMsg.style.transform = 'translateY(0)';
      });
    }, 1500);
  });
}
