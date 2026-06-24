/* ─── State ─────────────────────────────── */
const starRatings = { cleanliness: 0, comfort: 0, amenities: 0, wifi: 0 };
let currentPage = 'choose';

/* ─── Page Navigation ───────────────────── */
function navigateTo(pageId) {
  const current = document.querySelector('.page.active');
  const next = document.getElementById('page-' + pageId);
  if (!next || current === next) return;

  // Animate out
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
    choose: { show: false, pct: 0, step: '', label: '' },
    food: { show: true, pct: 50, step: 'Step 1 of 2', label: 'Food & Dining' },
    management: { show: true, pct: 50, step: 'Step 1 of 2', label: 'Management' },
    hotel: { show: true, pct: 50, step: 'Step 1 of 2', label: 'Hotel Experience' },
    thankyou: { show: true, pct: 100, step: 'Completed!', label: '✓ Submitted' },
  };

  const info = map[pageId] || map.choose;
  if(wrap) wrap.classList.toggle('visible', info.show);
  if(fill) fill.style.width = info.pct + '%';
  if(left) left.textContent = info.step;
  if(right) right.textContent = info.label;
}

/* ─── Update Header Subtitle ────────────── */
function updateHeader(pageId) {
  const sub = document.getElementById('header-subtitle');
  if(!sub) return;
  const subs = {
    choose: 'We value your experience',
    food: 'Tell us about your dining experience',
    management: 'Help us improve our service',
    hotel: 'Rate your overall stay',
    thankyou: 'Review submitted successfully',
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
  // Use brutalist colors for slider fill
  slider.style.background = `linear-gradient(90deg, #ff00ff ${pct}%, #fff ${pct}%)`;
}

/* ─── Initialize sliders ────────────────── */
function initSliders() {
  document.querySelectorAll('.glass-range').forEach(slider => {
    const val = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 10;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(90deg, #ff00ff ${pct}%, #fff ${pct}%)`;
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
    s.style.color = parseInt(s.getAttribute('data-val')) <= val ? 'var(--primary-color)' : '';
  });
});

document.addEventListener('mouseout', e => {
  if (!e.target.classList.contains('star')) return;
  const group = e.target.getAttribute('data-group');
  const container = document.getElementById('stars-' + group);
  if (!container) return;
  container.querySelectorAll('.star').forEach(s => {
    const sv = parseInt(s.getAttribute('data-val'));
    s.style.color = sv <= (starRatings[group] || 0) ? 'var(--primary-color)' : '';
  });
});

/* ─── Submit Review ─────────────────────── */
function submitReview(type) {
  const tags = buildSummaryTags(type);
  const summaryEl = document.getElementById('review-summary-tags');
  if(summaryEl) {
    summaryEl.innerHTML = tags.map(t => `<span class="review-tag">${t}</span>`).join('');
  }
  showToast('✓ Review submitted — thank you!');
  navigateTo('thankyou');
}

/* ─── Build summary tags ────────────────── */
function buildSummaryTags(type) {
  const tags = [];

  if (type === 'food') {
    const meals = [...document.querySelectorAll('input[name="meals"]:checked')]
      .map(i => i.value);
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
  if(!t) return;
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

/* ─── Brutalist Shake Effect ───────────── */
function brutalShake(el) {
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'brutalShake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both';
}

/* ─── Stamp / Slam Effect on Buttons ───── */
function brutalStamp(el, e) {
  // Create a stamp burst element
  const rect = el.getBoundingClientRect();
  const stamp = document.createElement('span');
  stamp.className = 'brutal-stamp';
  stamp.style.left = (e.clientX - rect.left) + 'px';
  stamp.style.top = (e.clientY - rect.top) + 'px';
  el.appendChild(stamp);
  stamp.addEventListener('animationend', () => stamp.remove());
}

/* ─── Screen Jolt ──────────────────────── */
function screenJolt() {
  document.body.classList.add('jolt');
  setTimeout(() => document.body.classList.remove('jolt'), 300);
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

  // Review type buttons — gentle stamp only, no shake/jolt
  document.querySelectorAll('.review-type-btn').forEach(el => {
    el.addEventListener('click', e => {
      brutalStamp(el, e);
    });
  });

  // Submit & back buttons — shake + stamp, no screen jolt
  document.querySelectorAll('.btn-primary, .back-btn').forEach(el => {
    el.addEventListener('click', e => {
      brutalShake(el);
      brutalStamp(el, e);
    });
  });

  // Option items get a shake
  document.querySelectorAll('.option-item').forEach(el => {
    el.addEventListener('click', () => {
      brutalShake(el);
    });
  });

  // Star pop animation on click
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
      star.style.animation = 'none';
      void star.offsetWidth;
      star.style.animation = 'starSlam 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both';
    });
  });
});
