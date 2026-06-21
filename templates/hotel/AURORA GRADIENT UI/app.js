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
  wrap.classList.toggle('visible', info.show);
  fill.style.width = info.pct + '%';
  left.textContent = info.step;
  right.textContent = info.label;
}

/* ─── Update Header Subtitle ────────────── */
function updateHeader(pageId) {
  const sub = document.getElementById('header-subtitle');
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
  const slider = event.target;
  const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(90deg, rgba(139,92,246,0.85) ${pct}%, rgba(255,255,255,0.10) ${pct}%)`;
}

/* ─── Initialize sliders ────────────────── */
function initSliders() {
  document.querySelectorAll('.aurora-range').forEach(slider => {
    const val = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 10;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(90deg, rgba(139,92,246,0.85) ${pct}%, rgba(255,255,255,0.10) ${pct}%)`;
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
    s.style.color = parseInt(s.getAttribute('data-val')) <= val ? 'var(--gold)' : '';
    s.style.filter = parseInt(s.getAttribute('data-val')) <= val ? 'drop-shadow(0 0 8px rgba(251,191,36,0.65))' : '';
  });
});

document.addEventListener('mouseout', e => {
  if (!e.target.classList.contains('star')) return;
  const group = e.target.getAttribute('data-group');
  const container = document.getElementById('stars-' + group);
  if (!container) return;
  container.querySelectorAll('.star').forEach(s => {
    const sv = parseInt(s.getAttribute('data-val'));
    const active = sv <= (starRatings[group] || 0);
    s.style.color  = active ? 'var(--gold)' : '';
    s.style.filter = active ? 'drop-shadow(0 0 8px rgba(251,191,36,0.65))' : '';
  });
});

/* ─── Submit Review ─────────────────────── */
function submitReview(type) {
  const tags = buildSummaryTags(type);
  document.getElementById('review-summary-tags').innerHTML =
    tags.map(t => `<span class="review-tag">${t}</span>`).join('');
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

/* ─── Ripple Effect Helper ──────────────── */
function spawnRipple(el, e) {
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

/* ─── Flash Burst Helper ────────────────── */
function spawnFlash(el, e) {
  const rect = el.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
  const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
  const flash = document.createElement('span');
  flash.className = 'btn-click-flash';
  flash.style.setProperty('--click-x', x);
  flash.style.setProperty('--click-y', y);
  el.appendChild(flash);
  flash.addEventListener('animationend', () => flash.remove());
}

/* ─── Init ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSliders();

  /* Star keyboard accessibility */
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setStars(star.getAttribute('data-group'), parseInt(star.getAttribute('data-val')));
      }
    });
  });

  /* Ripple on review-type buttons, option items, back button */
  document.querySelectorAll('.review-type-btn, .option-item, .back-btn').forEach(el => {
    el.addEventListener('click', e => spawnRipple(el, e));
  });

  /* Flash burst on primary buttons */
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', e => spawnFlash(btn, e));
  });

  /* Star pop animation on click */
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
      star.classList.remove('pop-animate');
      void star.offsetWidth; /* force reflow */
      star.classList.add('pop-animate');
    });
  });
});
