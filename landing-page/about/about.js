/* ════════════════════════════════════════════════════════
   THE PUFFY CLOUD CAFE — About Page Interactions
   About-specific JS (shared utilities loaded via shared.js)
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initShared();
  initAboutInteractions();
  initTimelineProgress();
  initTeamCardFlip();
});

/* ─── About Interactions ─────────────────── */
function initAboutInteractions() {
  if (prefersReducedMotion()) return;

  // Card press effect for about-page cards
  initCardPressEffect('.value-card, .team-card, .timeline-card');
}

/* ─── Timeline Scroll Progress ───────────── */
function initTimelineProgress() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  // Create the animated progress line
  const progressLine = document.createElement('div');
  progressLine.className = 'timeline-progress-line';
  timeline.appendChild(progressLine);

  // Also light up dots as we scroll past them
  const timelineDots = timeline.querySelectorAll('.timeline-dot');

  if (prefersReducedMotion()) {
    progressLine.style.height = '100%';
    timelineDots.forEach(dot => {
      dot.style.background = 'var(--accent-primary)';
      dot.style.boxShadow = '0 0 12px rgba(124, 77, 255, 0.4)';
    });
    return;
  }

  let ticking = false;
  function updateProgress() {
    const rect = timeline.getBoundingClientRect();
    const timelineTop = rect.top;
    const timelineHeight = rect.height;
    const viewportCenter = window.innerHeight * 0.6;

    // How far into the timeline the viewport center has scrolled
    const scrolledPast = viewportCenter - timelineTop;
    const progress = Math.max(0, Math.min(1, scrolledPast / timelineHeight));

    progressLine.style.height = (progress * 100) + '%';

    // Light up dots as they pass the viewport center
    timelineDots.forEach(dot => {
      const dotRect = dot.getBoundingClientRect();
      if (dotRect.top < viewportCenter) {
        dot.style.background = 'var(--accent-primary)';
        dot.style.boxShadow = '0 0 12px rgba(124, 77, 255, 0.4)';
        dot.style.transform = 'translate(-50%, -50%) scale(1.3)';
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  updateProgress();
}

/* ─── Team Card Flip ─────────────────────── */
function initTeamCardFlip() {
  const teamCards = document.querySelectorAll('.team-card');
  if (teamCards.length === 0) return;

  const touch = isTouchDevice();

  teamCards.forEach(card => {
    // Extract data from existing card for the back
    const name = card.querySelector('h3')?.textContent || '';
    const role = card.querySelector('.team-role')?.textContent || '';
    const bio = card.querySelector('p')?.textContent || '';
    const socialLinks = card.querySelector('.team-social')?.innerHTML || '';

    // Wrap existing content in a front div
    const existingContent = card.innerHTML;
    card.innerHTML = `
      <div class="team-card-inner">
        <div class="team-card-front">
          ${existingContent}
          <div class="team-flip-hint">${touch ? 'Tap to flip' : 'Hover to flip'}</div>
        </div>
        <div class="team-card-back">
          <h3>${name}</h3>
          <span class="team-role-back">${role}</span>
          <p class="team-bio">${bio}</p>
          <div class="team-social">${socialLinks}</div>
        </div>
      </div>
    `;

    if (touch) {
      // Tap to flip on touch devices
      card.addEventListener('click', (e) => {
        // Don't flip if clicking a social link
        if (e.target.closest('a')) return;
        card.classList.toggle('flipped');
      });
    } else {
      // Hover to flip on desktop
      card.addEventListener('mouseenter', () => {
        card.classList.add('flipped');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('flipped');
      });
    }
  });
}
