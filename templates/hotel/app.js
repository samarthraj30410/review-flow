/**
 * Aurelia Grand Resort & Spa - Guest Review System
 * 
 * Configuration & Event Handlers
 */

const CONFIG = {
  // Replace these with the hotel's actual public profile links
  googleReviewUrl: "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID",
  tripAdvisorUrl: "https://www.tripadvisor.com/UserReview-g187147-d188757-Aurelia_Grand-Paris_Ile_de_France.html",
  
  // Google Sheets Apps Script Webhook URL
  // Setup tutorial included in the main project repository
  webhookUrl: "https://script.google.com/macros/s/AKfycbz_example_webhook_url/exec"
};

document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let currentRating = 0;

  // DOM Elements
  const stages = {
    rating: document.getElementById('stage-rating'),
    high: document.getElementById('stage-high-rating'),
    low: document.getElementById('stage-low-rating'),
    success: document.getElementById('stage-success')
  };

  const starButtons = document.querySelectorAll('.star-btn');
  const ratingInput = document.getElementById('selected-rating');
  const ratingLabel = document.getElementById('rating-text-feedback');
  
  const backButtons = document.querySelectorAll('.btn-back');
  const grievanceForm = document.getElementById('grievance-form');
  const submitBtn = grievanceForm ? grievanceForm.querySelector('.btn-submit') : null;

  // Rating descriptors
  const ratingDescriptors = {
    1: "Poor experience",
    2: "Below expectations",
    3: "Average stay",
    4: "Wonderful stay!",
    5: "Exceptional luxury!"
  };

  // Bind Redirect Links from Config
  const googleBtn = document.getElementById('google-review-btn');
  const tripAdvisorBtn = document.getElementById('tripadvisor-review-btn');
  if (googleBtn) googleBtn.href = CONFIG.googleReviewUrl;
  if (tripAdvisorBtn) tripAdvisorBtn.href = CONFIG.tripAdvisorUrl;

  /**
   * Transition between stages with a subtle delay for optimal user experience
   */
  function showStage(targetStageKey) {
    // Hide all stages
    Object.values(stages).forEach(stage => {
      if (stage) {
        stage.classList.remove('active');
      }
    });

    // Show target stage
    const targetStage = stages[targetStageKey];
    if (targetStage) {
      targetStage.classList.add('active');
    }
  }

  /**
   * Reset form values and active star ratings
   */
  function resetForm() {
    currentRating = 0;
    if (ratingInput) ratingInput.value = "0";
    if (ratingLabel) ratingLabel.textContent = "Select a rating to continue";
    
    starButtons.forEach(btn => btn.classList.remove('active'));
    if (grievanceForm) grievanceForm.reset();
    if (submitBtn) submitBtn.classList.remove('loading');
  }

  // Bind Star Button Click Listeners
  starButtons.forEach(button => {
    // Hover effects label changes
    button.addEventListener('mouseenter', () => {
      const val = parseInt(button.getAttribute('data-val'), 10);
      if (ratingLabel) {
        ratingLabel.textContent = ratingDescriptors[val] || "Select a rating to continue";
        ratingLabel.style.color = "var(--gold-accent)";
      }
    });

    button.addEventListener('mouseleave', () => {
      if (ratingLabel) {
        if (currentRating > 0) {
          ratingLabel.textContent = ratingDescriptors[currentRating];
        } else {
          ratingLabel.textContent = "Select a rating to continue";
        }
        ratingLabel.style.color = "var(--text-muted)";
      }
    });

    // Click handler
    button.addEventListener('click', () => {
      const val = parseInt(button.getAttribute('data-val'), 10);
      currentRating = val;
      if (ratingInput) ratingInput.value = val;

      // Update Star Button Active Visual States
      starButtons.forEach(btn => {
        const btnVal = parseInt(btn.getAttribute('data-val'), 10);
        if (btnVal <= val) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Move to appropriate stage after small delay for tactile feedback
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

      // Gather input values
      const payload = {
        timestamp: new Date().toISOString(),
        hotelName: "Aurelia Grand Resort & Spa",
        rating: currentRating,
        guestName: document.getElementById('guest-name').value.trim() || "Anonymous Guest",
        roomNumber: document.getElementById('guest-room').value.trim() || "N/A",
        guestEmail: document.getElementById('guest-email').value.trim() || "N/A",
        feedback: document.getElementById('guest-feedback').value.trim()
      };

      console.log("Submitting feedback payload to Webhook:", payload);

      try {
        // Only run real fetch request if a custom webhookUrl has been configured (not default template URL)
        if (CONFIG.webhookUrl && !CONFIG.webhookUrl.includes('example_webhook_url')) {
          // Google Apps Script requires CORS 'no-cors' or handling text redirect properly
          await fetch(CONFIG.webhookUrl, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        } else {
          // Simulate local network delay
          await new Promise(resolve => setTimeout(resolve, 1200));
          console.warn("Using placeholder Webhook. Submission simulation successful.");
        }
        
        // Transition to success screen
        showStage('success');
      } catch (err) {
        console.error("Grievance webhook submission failed:", err);
        // Show offline success fallback so experience remains premium for customers
        // while logged in console for diagnostics
        setTimeout(() => {
          showStage('success');
        }, 1000);
      } finally {
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }
      }
    });
  }
});
