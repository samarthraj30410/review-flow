/* ═══════════════════════════════════════════
   MAXIMALISM UI — app.js
   SPA logic: navigation, stars, sliders, submit
   ═══════════════════════════════════════════ */

/* ─── State ─────────────────────────────── */
const starRatings = { cleanliness: 0, comfort: 0, amenities: 0, wifi: 0 };
let currentPage = 'choose';

/* ─── Page Navigation ───────────────────── */
function navigateTo(pageId) {
  const current = document.querySelector('.page.active');
  const next = document.getElementById('page-' + pageId);
  if (!next || current === next) return;

  current.style.animation = 'pageOut 0.3s cubic-bezier(0.16,1,0.3,1) forwards';
  setTimeout(() => {
    current.classList.remove('active');
    current.style.animation = '';

    next.classList.add('active');
    next.style.animation = 'pageIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 280);

  currentPage = pageId;
  updateProgress(pageId);
  updateHeader(pageId);
}

/* ─── Update Progress Bar ───────────────── */
function updateProgress(pageId) {
  const wrap = document.getElementById('progress-wrap');
  const fill = document.getElementById('progress-fill');
  const left = document.getElementById('progress-label-left');
  const right = document.getElementById('progress-label-right');

  const map = {
    choose:     { show: false, pct: 0,   step: '',            label: '' },
    food:       { show: true,  pct: 50,  step: 'Step 1 of 2', label: 'Food & Dining' },
    management: { show: true,  pct: 50,  step: 'Step 1 of 2', label: 'Management' },
    hotel:      { show: true,  pct: 50,  step: 'Step 1 of 2', label: 'Hotel Experience' },
    thankyou:   { show: true,  pct: 100, step: 'Completed!',  label: '✓ Submitted' },
  };

  const info = map[pageId] || map.choose;
  if (wrap) wrap.classList.toggle('visible', info.show);
  if (fill) fill.style.width = info.pct + '%';
  if (left) left.textContent = info.step;
  if (right) right.textContent = info.label;
}

/* ─── Update Header Subtitle ────────────── */
function updateHeader(pageId) {
  const sub = document.getElementById('header-subtitle');
  if (!sub) return;
  const subs = {
    choose:     'We value your experience',
    food:       'Tell us about your dining experience',
    management: 'Help us improve our service',
    hotel:      'Rate your overall stay',
    thankyou:   'Review submitted successfully',
  };
  sub.style.opacity = '0';
  setTimeout(() => {
    sub.textContent = subs[pageId] || subs.choose;
    sub.style.opacity = '1';
  }, 200);
  sub.style.transition = 'opacity 0.2s ease';
}

/* ─── Slider value display ──────────────── */
function updateSlider(targetId, val) {
  const el = document.getElementById(targetId);
  if (el) el.textContent = val;

  // Find the slider by ID prefix — avoids relying on implicit `event`
  const sliderId = targetId.replace('-val', '').replace('overall-exp', 'overall-experience');
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background =
    `linear-gradient(90deg, rgba(255,45,149,0.8) ${pct}%, rgba(255,255,255,0.06) ${pct}%)`;
}

/* ─── Initialize sliders ────────────────── */
function initSliders() {
  document.querySelectorAll('.glass-range').forEach(slider => {
    const val = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 10;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.background =
      `linear-gradient(90deg, rgba(255,45,149,0.8) ${pct}%, rgba(255,255,255,0.06) ${pct}%)`;
  });
}

/* ─── Star Rating ───────────────────────── */
function setStars(group, val) {
  starRatings[group] = val;
  const container = document.getElementById('stars-' + group);
  if (!container) return;
  container.querySelectorAll('.star').forEach(s => {
    const sv = parseInt(s.getAttribute('data-val'));
    s.classList.toggle('active', sv <= val);
  });
}

/* ─── Hover preview for stars ───────────── */
document.addEventListener('mouseover', e => {
  if (!e.target.classList.contains('star')) return;
  const group = e.target.getAttribute('data-group');
  const val = parseInt(e.target.getAttribute('data-val'));
  const container = document.getElementById('stars-' + group);
  if (!container) return;
  container.querySelectorAll('.star').forEach(s => {
    s.style.color = parseInt(s.getAttribute('data-val')) <= val ? 'var(--neon-lime)' : '';
  });
});

document.addEventListener('mouseout', e => {
  if (!e.target.classList.contains('star')) return;
  const group = e.target.getAttribute('data-group');
  const container = document.getElementById('stars-' + group);
  if (!container) return;
  container.querySelectorAll('.star').forEach(s => {
    const sv = parseInt(s.getAttribute('data-val'));
    s.style.color = sv <= (starRatings[group] || 0) ? 'var(--neon-lime)' : '';
  });
});

/* ─── Submit Review ─────────────────────── */
function submitReview(type) {
  const tags = buildSummaryTags(type);
  const summaryEl = document.getElementById('review-summary-tags');
  if (summaryEl) {
    summaryEl.innerHTML = tags.map(t => `<span class="review-tag">${t}</span>`).join('');
  }
  showToast('✓ Review submitted — thank you!');
  navigateTo('thankyou');
}

/* ─── Build summary tags ────────────────── */
function buildSummaryTags(type) {
  const tags = [];

  if (type === 'food') {
    const meals = [...document.querySelectorAll('input[name="meals"]:checked')].map(i => i.value);
    if (meals.length) tags.push(...meals.map(m => '🍽️ ' + m[0].toUpperCase() + m.slice(1)));
    const q = document.getElementById('food-quality');
    if (q) tags.push('Quality: ' + q.value + '/10');
  }

  if (type === 'management') {
    const helpful = document.querySelector('input[name="staff-helpful"]:checked');
    if (helpful) tags.push('Staff: ' + helpful.value);
    const ci = document.getElementById('check-in-rating');
    if (ci && ci.value) tags.push('Check-in: ' + ci.value);
  }

  if (type === 'hotel') {
    Object.entries(starRatings).forEach(([k, v]) => {
      if (v > 0) tags.push(k[0].toUpperCase() + k.slice(1) + ': ' + '★'.repeat(v));
    });
    const oe = document.getElementById('overall-experience');
    if (oe) tags.push('Overall: ' + oe.value + '/10');
  }

  if (!tags.length) tags.push('Review submitted');
  return tags;
}

/* ─── Toast ─────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ─── Close Portal ──────────────────────── */
function closePortal() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'REVIEW_PORTAL_CLOSE' }, '*');
  } else {
    showToast('Thank you for your feedback!');
    navigateTo('choose');
  }
}

/* ─── Neon Ripple Effect ───────────────── */
function spawnNeonRipple(el, e) {
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2.5;
  const ripple = document.createElement('span');
  ripple.className = 'neon-ripple';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

/* ─── Glow Pulse on buttons ────────────── */
function glowPulse(el) {
  el.classList.add('glow-click');
  setTimeout(() => el.classList.remove('glow-click'), 600);
}

/* ─── Sparkle Burst ────────────────────── */
function spawnSparkles(el, e) {
  const rect = el.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const symbols = ['✦', '✧', '◆', '●', '★'];
  for (let i = 0; i < 5; i++) {
    const spark = document.createElement('span');
    spark.className = 'click-sparkle';
    spark.textContent = symbols[i % symbols.length];
    spark.style.left = cx + 'px';
    spark.style.top = cy + 'px';
    const angle = (i / 5) * 2 * Math.PI + (Math.random() * 0.5);
    const dist = 25 + Math.random() * 35;
    spark.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    spark.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
    el.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove());
  }
}

/* ─── Init ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSliders();

  // Keyboard support for stars
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setStars(star.getAttribute('data-group'), parseInt(star.getAttribute('data-val')));
      }
    });
  });

  // Neon ripple + glow pulse on buttons
  document.querySelectorAll('.review-type-btn, .btn-primary, .back-btn').forEach(el => {
    el.addEventListener('click', e => {
      spawnNeonRipple(el, e);
      glowPulse(el);
      spawnSparkles(el, e);
    });
  });

  // Ripple on option items
  document.querySelectorAll('.option-item').forEach(el => {
    el.addEventListener('click', e => {
      spawnNeonRipple(el, e);
    });
  });

  // Star pop animation on click
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', e => {
      star.classList.remove('star-pop');
      void star.offsetWidth;
      star.classList.add('star-pop');
      // Mini sparkle on star
      spawnSparkles(star.closest('.star-row') || star.parentElement, e);
    });
  });
});
