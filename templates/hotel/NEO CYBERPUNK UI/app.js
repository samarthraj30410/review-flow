/**
 * Nexus Tower Hotel — Neo Cyberpunk Guest Review System
 *
 * Configuration & Event Handlers
 * (Same architecture as the Liquid Glass UI template)
 */

const CONFIG = {
  // Replace with the hotel's actual public profile links
  googleReviewUrl: "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID",
  tripAdvisorUrl: "https://www.tripadvisor.com/UserReview-g187147-d000000-Nexus_Tower_Hotel.html",

  // Google Sheets Apps Script Webhook URL
  // Setup tutorial included in the main project repository
  webhookUrl: "https://script.google.com/macros/s/AKfycbz_example_webhook_url/exec"
};

document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let currentRating = 0;

  // DOM Elements
  const stages = {
    rating:  document.getElementById('stage-rating'),
    high:    document.getElementById('stage-high-rating'),
    low:     document.getElementById('stage-low-rating'),
    success: document.getElementById('stage-success')
  };

  const starButtons  = document.querySelectorAll('.star-btn');
  const ratingInput  = document.getElementById('selected-rating');
  const ratingLabel  = document.getElementById('rating-text-feedback');
  const backButtons  = document.querySelectorAll('.btn-back');
  const grievanceForm = document.getElementById('grievance-form');
  const submitBtn    = grievanceForm ? grievanceForm.querySelector('.btn-submit') : null;

  // Rating descriptors — cyberpunk flavour
  const ratingDescriptors = {
    1: "CRITICAL_FAILURE",
    2: "BELOW_THRESHOLD",
    3: "NOMINAL_OUTPUT",
    4: "HIGH_PERFORMANCE",
    5: "MAXIMUM_EFFICIENCY"
  };

  // Bind Redirect Links from Config
  const googleBtn      = document.getElementById('google-review-btn');
  const tripAdvisorBtn = document.getElementById('tripadvisor-review-btn');
  if (googleBtn)      googleBtn.href      = CONFIG.googleReviewUrl;
  if (tripAdvisorBtn) tripAdvisorBtn.href = CONFIG.tripAdvisorUrl;

  /**
   * Transition between stages
   */
  function showStage(targetStageKey) {
    Object.values(stages).forEach(stage => {
      if (stage) stage.classList.remove('active');
    });

    const targetStage = stages[targetStageKey];
    if (targetStage) targetStage.classList.add('active');
  }

  /**
   * Reset form values and active star ratings
   */
  function resetForm() {
    currentRating = 0;
    if (ratingInput) ratingInput.value = "0";
    if (ratingLabel) ratingLabel.textContent = "SELECT_RATING_TO_CONTINUE";

    starButtons.forEach(btn => btn.classList.remove('active'));
    if (grievanceForm) grievanceForm.reset();
    if (submitBtn) submitBtn.classList.remove('loading');
  }

  // Bind Star Button Click Listeners
  starButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      const val = parseInt(button.getAttribute('data-val'), 10);
      if (ratingLabel) {
        ratingLabel.textContent = ratingDescriptors[val] || "SELECT_RATING_TO_CONTINUE";
        ratingLabel.style.color = "var(--cyan)";
      }
    });

    button.addEventListener('mouseleave', () => {
      if (ratingLabel) {
        if (currentRating > 0) {
          ratingLabel.textContent = ratingDescriptors[currentRating];
        } else {
          ratingLabel.textContent = "SELECT_RATING_TO_CONTINUE";
        }
        ratingLabel.style.color = "var(--text-muted)";
      }
    });

    button.addEventListener('click', () => {
      const val = parseInt(button.getAttribute('data-val'), 10);
      currentRating = val;
      if (ratingInput) ratingInput.value = val;

      starButtons.forEach(btn => {
        const btnVal = parseInt(btn.getAttribute('data-val'), 10);
        if (btnVal <= val) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      setTimeout(() => {
        if (val >= 4) {
          showStage('high');
        } else {
          showStage('low');
        }
      }, 400);
    });
  });

  // Bind Back Button Listeners
  backButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      resetForm();
      showStage('rating');
    });
  });

  // Handle Grievance/Feedback Form Submission
  if (grievanceForm) {
    grievanceForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      const payload = {
        timestamp:  new Date().toISOString(),
        hotelName:  "Nexus Tower Hotel",
        rating:     currentRating,
        guestName:  document.getElementById('guest-name')?.value.trim()     || "Anonymous Guest",
        roomNumber: document.getElementById('guest-room')?.value.trim()     || "N/A",
        guestEmail: document.getElementById('guest-email')?.value.trim()    || "N/A",
        feedback:   document.getElementById('guest-feedback')?.value.trim() || ""
      };

      console.log("Transmitting feedback payload to webhook:", payload);

      try {
        if (CONFIG.webhookUrl && !CONFIG.webhookUrl.includes('example_webhook_url')) {
          await fetch(CONFIG.webhookUrl, {
            method: 'POST',
            mode:   'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body:   JSON.stringify(payload)
          });
        } else {
          // Simulate network latency in demo mode
          await new Promise(resolve => setTimeout(resolve, 1200));
          console.warn("Demo mode: webhook placeholder active. Simulating successful upload.");
        }

        showStage('success');
      } catch (err) {
        console.error("Webhook transmission error:", err);
        // Show offline-safe success fallback to preserve guest experience
        setTimeout(() => { showStage('success'); }, 1000);
      } finally {
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }
      }
    });
  }
});
