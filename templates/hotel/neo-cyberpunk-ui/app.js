/**
 * Nexus Tower Hotel — Neo Cyberpunk Guest Review System
 *
 * Configuration & Event Handlers
 * (Same architecture as the Liquid Glass UI template)
 */

const CONFIG = {
  // Replace with the hotel's actual public profile links
  googleReviewUrl:
    "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID",
  tripAdvisorUrl:
    "https://www.tripadvisor.com/UserReview-g187147-d000000-Nexus_Tower_Hotel.html",

  // Google Sheets Apps Script Webhook URL
  // Setup tutorial included in the main project repository
  webhookUrl:
    "https://script.google.com/macros/s/AKfycbz_example_webhook_url/exec",
};

document.addEventListener("DOMContentLoaded", () => {
  // State variables
  let currentRating = 0;

  // DOM Elements
  const stages = {
    rating: document.getElementById("stage-rating"),
    high: document.getElementById("stage-high-rating"),
    low: document.getElementById("stage-low-rating"),
    success: document.getElementById("stage-success"),
  };

  const starButtons = document.querySelectorAll(".star-btn");
  const ratingInput = document.getElementById("selected-rating");
  const ratingLabel = document.getElementById("rating-text-feedback");
  const backButtons = document.querySelectorAll(".btn-back");
  const grievanceForm = document.getElementById("grievance-form");
  const submitBtn = grievanceForm
    ? grievanceForm.querySelector(".btn-submit")
    : null;

  // Rating descriptors — cyberpunk flavour
  const ratingDescriptors = {
    1: "CRITICAL_FAILURE",
    2: "BELOW_THRESHOLD",
    3: "NOMINAL_OUTPUT",
    4: "HIGH_PERFORMANCE",
    5: "MAXIMUM_EFFICIENCY",
  };

  // Bind Redirect Links from Config
  const googleBtn = document.getElementById("google-review-btn");
  const tripAdvisorBtn = document.getElementById("tripadvisor-review-btn");
  if (googleBtn) googleBtn.href = CONFIG.googleReviewUrl;
  if (tripAdvisorBtn) tripAdvisorBtn.href = CONFIG.tripAdvisorUrl;

  /**
   * Transition between stages
   */
  function showStage(targetStageKey) {
    Object.values(stages).forEach((stage) => {
      if (stage) stage.classList.remove("active");
    });

    const targetStage = stages[targetStageKey];
    if (targetStage) targetStage.classList.add("active");
  }

  /**
   * Reset form values and active star ratings
   */
  function resetForm() {
    currentRating = 0;
    if (ratingInput) ratingInput.value = "0";
    if (ratingLabel) ratingLabel.textContent = "SELECT_RATING_TO_CONTINUE";

    starButtons.forEach((btn) => btn.classList.remove("active"));
    if (grievanceForm) grievanceForm.reset();
    if (submitBtn) submitBtn.classList.remove("loading");
  }

  // Bind Star Button Click Listeners
  starButtons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      const val = parseInt(button.getAttribute("data-val"), 10);
      if (ratingLabel) {
        ratingLabel.textContent =
          ratingDescriptors[val] || "SELECT_RATING_TO_CONTINUE";
        ratingLabel.style.color = "var(--cyan)";
      }
    });

    button.addEventListener("mouseleave", () => {
      if (ratingLabel) {
        if (currentRating > 0) {
          ratingLabel.textContent = ratingDescriptors[currentRating];
        } else {
          ratingLabel.textContent = "SELECT_RATING_TO_CONTINUE";
        }
        ratingLabel.style.color = "var(--text-muted)";
      }
    });

    button.addEventListener("click", () => {
      const val = parseInt(button.getAttribute("data-val"), 10);
      currentRating = val;
      if (ratingInput) ratingInput.value = val;

      starButtons.forEach((btn) => {
        const btnVal = parseInt(btn.getAttribute("data-val"), 10);
        if (btnVal <= val) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      setTimeout(() => {
        if (val >= 4) {
          showStage("high");
        } else {
          showStage("low");
        }
      }, 400);
    });
  });

  // Bind Back Button Listeners
  backButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      resetForm();
      showStage("rating");
    });
  });

  // Handle Grievance/Feedback Form Submission
  if (grievanceForm) {
    grievanceForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;
      }

      const payload = {
        timestamp: new Date().toISOString(),
        hotelName: "Nexus Tower Hotel",
        rating: currentRating,
        guestName:
          document.getElementById("guest-name")?.value.trim() ||
          "Anonymous Guest",
        roomNumber:
          document.getElementById("guest-room")?.value.trim() || "N/A",
        guestEmail:
          document.getElementById("guest-email")?.value.trim() || "N/A",
        feedback: document.getElementById("guest-feedback")?.value.trim() || "",
      };

      console.log("Transmitting feedback payload to webhook:", payload);

      try {
        if (
          CONFIG.webhookUrl &&
          !CONFIG.webhookUrl.includes("example_webhook_url")
        ) {
          await fetch(CONFIG.webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          // Simulate network latency in demo mode
          await new Promise((resolve) => setTimeout(resolve, 1200));
          console.warn(
            "Demo mode: webhook placeholder active. Simulating successful upload.",
          );
        }

        showStage("success");
      } catch (err) {
        console.error("Webhook transmission error:", err);
        // Show offline-safe success fallback to preserve guest experience
        setTimeout(() => {
          showStage("success");
        }, 1000);
      } finally {
        if (submitBtn) {
          submitBtn.classList.remove("loading");
          submitBtn.disabled = false;
        }
      }
    });
  }

  /* ─── Ripple Effect Helper ──────────────── */
  function spawnRipple(el, e) {
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    el.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  }

  /* ─── Flash Burst Helper ────────────────── */
  function spawnFlash(el, e) {
    const rect = el.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%";
    const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%";
    const flash = document.createElement("span");
    flash.className = "btn-click-flash";
    flash.style.setProperty("--click-x", x);
    flash.style.setProperty("--click-y", y);
    el.appendChild(flash);
    flash.addEventListener("animationend", () => flash.remove());
  }

  /* ─── Glitch Flash Helper ─────────────── */
  function spawnGlitch(el) {
    const glitch = document.createElement("span");
    glitch.className = "click-glitch";
    el.appendChild(glitch);
    glitch.addEventListener("animationend", () => glitch.remove());
  }

  /* Ripple + glitch on review-type buttons */
  document.querySelectorAll(".review-type-btn").forEach((el) => {
    el.addEventListener("click", (e) => {
      spawnRipple(el, e);
      spawnGlitch(el);
    });
  });

  /* Ripple on option items, back button */
  document.querySelectorAll(".option-item, .back-btn").forEach((el) => {
    el.addEventListener("click", (e) => spawnRipple(el, e));
  });

  /* Flash burst on primary buttons */
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("click", (e) => spawnFlash(btn, e));
  });

  /* Star pop animation on click */
  document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", () => {
      star.classList.remove("pop-animate");
      void star.offsetWidth; /* force reflow */
      star.classList.add("pop-animate");
    });
  });
});

/* === Quantity Controls (replaces addToOrder) === */
function changeQty(itemName, delta, btnElement) {
  var current = itemCounts[itemName] || 0;
  var newVal = Math.max(0, current + delta);
  itemCounts[itemName] = newVal;

  document.querySelectorAll('.qty-count[data-item="' + itemName + '"]').forEach(function(el) {
    el.textContent = newVal;
    el.style.fontWeight = newVal > 0 ? '700' : '';
  });

  var qtyControl = btnElement.closest('.qty-control');
  if (qtyControl) {
    var minusBtn = qtyControl.querySelector('.minus');
    if (minusBtn) minusBtn.disabled = (newVal === 0);
  }

  cart = [];
  for (var key in itemCounts) {
    for (var j = 0; j < itemCounts[key]; j++) {
      cart.push(key);
    }
  }

  var cartEl = document.getElementById('cart-count');
  if (cartEl) cartEl.textContent = cart.length;

  showToast(newVal > current ? '+ Added ' + itemName : '- Removed ' + itemName);
}

/* === Food Star Rating === */
var foodStarRatings = {};

function setFoodStars(itemName, val) {
  foodStarRatings[itemName] = val;
  var safeId = itemName.replace(/\s+/g, '-');
  var container = document.getElementById('stars-' + safeId);
  if (!container) return;
  container.querySelectorAll('.star').forEach(function(s) {
    var sv = parseInt(s.getAttribute('data-val'));
    s.classList.toggle('active', sv <= val);
  });
}

function generatePerDishReviews() {
  var container = document.getElementById('dynamic-food-reviews');
  if (!container) return;
  container.innerHTML = '';
  
  var hasItems = false;
  var allHtml = '<div class="star-group" style="margin-bottom: 24px;">';
  for (var key in itemCounts) {
    if (itemCounts[key] > 0) {
      hasItems = true;
      var safeId = key.replace(/\s+/g, '-');
      if (typeof foodStarRatings[key] === 'undefined') {
        foodStarRatings[key] = 0;
      }
      
      allHtml += '<div class="star-row" style="margin-bottom: 0;">';
      allHtml += '<div style="flex-grow: 1;">';
      allHtml += '<div class="star-row-label" style="margin-bottom: 12px; font-size: 15px; color: var(--cyan);">Rating for ' + key + '</div>';
      allHtml += '<div class="stars" id="stars-' + safeId + '" role="group" style="justify-content: flex-start;">';
      
      for (var i = 1; i <= 5; i++) {
        var activeClass = i <= foodStarRatings[key] ? 'active' : '';
        allHtml += '<span class="star ' + activeClass + '" data-val="' + i + '" onclick="setFoodStars(\'' + key + '\', ' + i + ')">&#9733;</span>';
      }
      allHtml += '</div>';
      allHtml += '</div>';
      
      // Dish Image Portal on the right
      allHtml += '<div class="review-dish-img-box" style="width: 72px; height: 72px; flex-shrink: 0; border-radius: var(--radius-sm); overflow: hidden; background: rgba(0,245,255,0.05); border: 1px solid var(--border-dim); margin-left: 16px;">';
      allHtml += '  <img src="" alt="' + key + '" style="width: 100%; height: 100%; object-fit: cover; display: block;" />';
      allHtml += '</div>';

      allHtml += '</div>';
    }
  }
  allHtml += '</div>';
  
  if (hasItems) {
    container.innerHTML = allHtml;
  } else {
    container.innerHTML = '<p style="opacity: 0.7;">No items selected.</p>';
  }
}

/* === Submit Food Review === */
function submitFoodReview() {
  // Validate: all ordered items must have a star rating
  var unrated = [];
  for (var key in itemCounts) {
    if (itemCounts[key] > 0) {
      if (!foodStarRatings[key] || foodStarRatings[key] === 0) {
        unrated.push(key);
      }
    }
  }
  if (unrated.length > 0) {
    showToast('⚠ RATE_REQUIRED: ' + unrated.join(', '));
    return;
  }

  var tags = [];
  var orderedItems = [];
  for (var key in itemCounts) {
    if (itemCounts[key] > 0) {
      orderedItems.push(key + ' x' + itemCounts[key]);
    }
  }
  if (orderedItems.length > 0) {
    tags.push('Ordered: ' + orderedItems.join(', '));
  }
  
  // Add per-dish ratings
  for (var key in foodStarRatings) {
    if (foodStarRatings[key] > 0 && itemCounts[key] > 0) {
      tags.push(key + ': ' + String.fromCharCode(9733).repeat(foodStarRatings[key]));
    }
  }

  var recommend = document.querySelector('input[name="food-recommend"]:checked');
  if (recommend) {
    tags.push('Recommend: ' + recommend.value);
  }

  var feedback = document.getElementById('food-feedback');
  if (feedback && feedback.value.trim()) {
    tags.push('Feedback: ' + feedback.value.trim().substring(0, 60));
  }

  if (!tags.length) tags.push('Food review submitted');

  var summaryEl = document.getElementById('review-summary-tags');
  if (summaryEl) {
    summaryEl.innerHTML = tags.map(function(t) { return '<span class="review-tag">' + t + '</span>'; }).join('');
  }

  showToast('✓ TRANSMISSION_COMPLETE');
  navigateTo('thankyou');
}
