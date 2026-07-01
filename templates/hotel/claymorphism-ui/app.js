/* ─── State ─────────────────────────────── */
const starRatings = { cleanliness: 0, comfort: 0, amenities: 0, wifi: 0 };
let currentPage = "choose";

/* ─── Page Navigation ───────────────────── */
function navigateTo(pageId) {
  const current = document.querySelector(".page.active");
  const next = document.getElementById("page-" + pageId);
  if (!next || current === next) return;

  // Animate out
  current.style.animation = "pageOut 0.3s cubic-bezier(0.16,1,0.3,1) forwards";
  setTimeout(() => {
    current.classList.remove("active");
    current.style.animation = "";

    next.classList.add("active");
    next.style.animation = "pageIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 280);

  currentPage = pageId;
  if (pageId === 'food-review') { var rc = document.getElementById('review-item-count'); if (rc) rc.textContent = cart.length; } generatePerDishReviews();
  updateProgress(pageId);
  updateHeader(pageId);
}

/* ─── Update Progress Bar ───────────────── */
function updateProgress(pageId) {
  const wrap = document.getElementById("progress-wrap");
  const fill = document.getElementById("progress-fill");
  const left = document.getElementById("progress-label-left");
  const right = document.getElementById("progress-label-right");

  const map = {
    choose: { show: false, pct: 0, step: "", label: "" },
    food: { show: true, pct: 50, step: "Step 1 of 2", label: "Food & Dining" },
    "food-review": { show: true, pct: 75, step: "Step 2 of 2", label: "Food Review" },
    management: {
      show: true,
      pct: 50,
      step: "Step 1 of 2",
      label: "Management",
    },
    hotel: {
      show: true,
      pct: 50,
      step: "Step 1 of 2",
      label: "Hotel Experience",
    },
    thankyou: {
      show: true,
      pct: 100,
      step: "Completed!",
      label: "✓ Submitted",
    },
  };

  const info = map[pageId] || map.choose;
  wrap.classList.toggle("visible", info.show);
  fill.style.width = info.pct + "%";
  left.textContent = info.step;
  right.textContent = info.label;
}

/* ─── Update Header Subtitle ────────────── */
function updateHeader(pageId) {
  const sub = document.getElementById("header-subtitle");
  const subs = {
    choose: "We value your experience",
    food: "Tell us about your dining experience",
    "food-review": "Rate your food experience",
    management: "Help us improve our service",
    hotel: "Rate your overall stay",
    thankyou: "Review submitted successfully",
  };
  sub.style.opacity = "0";
  setTimeout(() => {
    sub.textContent = subs[pageId] || subs.choose;
    sub.style.opacity = "1";
  }, 200);
  sub.style.transition = "opacity 0.2s ease";
}

/* ─── Slider value display ──────────────── */
function updateSlider(targetId, val) {
  const el = document.getElementById(targetId);
  if (el) el.textContent = val;

  // Update track fill color
  const slider = event.target;
  const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;
  // Use purple accent for claymorphism
  slider.style.background = `linear-gradient(90deg, var(--clay-accent) ${pct}%, var(--clay-shadow-inner-dark) ${pct}%)`;
}

/* ─── Initialize sliders ────────────────── */
function initSliders() {
  document.querySelectorAll(".clay-range").forEach((slider) => {
    const val = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 10;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(90deg, var(--clay-accent) ${pct}%, var(--clay-shadow-inner-dark) ${pct}%)`;
  });
}

/* ─── Star Rating ───────────────────────── */
function setStars(group, val) {
  starRatings[group] = val;
  const container = document.getElementById("stars-" + group);
  if (!container) return;
  container.querySelectorAll(".star").forEach((s) => {
    const sv = parseInt(s.getAttribute("data-val"));
    s.classList.toggle("active", sv <= val);
  });
}

/* ─── Hover preview for stars ───────────── */
document.addEventListener("mouseover", (e) => {
  if (!e.target.classList.contains("star")) return;
  const group = e.target.getAttribute("data-group");
  const val = parseInt(e.target.getAttribute("data-val"));
  const container = document.getElementById("stars-" + group);
  if (!container) return;
  container.querySelectorAll(".star").forEach((s) => {
    s.style.color =
      parseInt(s.getAttribute("data-val")) <= val ? "var(--clay-star)" : "";
  });
});

document.addEventListener("mouseout", (e) => {
  if (!e.target.classList.contains("star")) return;
  const group = e.target.getAttribute("data-group");
  const container = document.getElementById("stars-" + group);
  if (!container) return;
  container.querySelectorAll(".star").forEach((s) => {
    const sv = parseInt(s.getAttribute("data-val"));
    s.style.color = sv <= (starRatings[group] || 0) ? "var(--clay-star)" : "";
  });
});

/* ─── Submit Review ─────────────────────── */
function submitReview(type) {
  const tags = buildSummaryTags(type);
  document.getElementById("review-summary-tags").innerHTML = tags
    .map((t) => `<span class="review-tag">${t}</span>`)
    .join("");
  showToast("✓ Review submitted — thank you!");
  navigateTo("thankyou");
}

/* ─── Build summary tags ────────────────── */
function buildSummaryTags(type) {
  const tags = [];

  if (type === "food") {
    const meals = [
      ...document.querySelectorAll('input[name="meals"]:checked'),
    ].map((i) => i.value);
    if (meals.length)
      tags.push(...meals.map((m) => "🍽️ " + m[0].toUpperCase() + m.slice(1)));
    const q = document.getElementById("food-quality");
    if (q) tags.push("Quality: " + q.value + "/10");
  }

  if (type === "food-order") {
    tags.push("Items Ordered: " + cart.length);
    if (cart.length > 0) {
      let itemsStr = cart.join(", ");
      if (itemsStr.length > 40) itemsStr = itemsStr.substring(0, 40) + "...";
      tags.push("Order: " + itemsStr);
    }
  }

  if (type === "management") {
    const helpful = document.querySelector(
      'input[name="staff-helpful"]:checked',
    );
    if (helpful) tags.push("Staff: " + helpful.value);
    const ci = document.getElementById("check-in-rating");
    if (ci && ci.value) tags.push("Check-in: " + ci.value);
  }

  if (type === "hotel") {
    Object.entries(starRatings).forEach(([k, v]) => {
      if (v > 0)
        tags.push(k[0].toUpperCase() + k.slice(1) + ": " + "★".repeat(v));
    });
    const oe = document.getElementById("overall-experience");
    if (oe) tags.push("Overall: " + oe.value + "/10");
  }

  if (!tags.length) tags.push("Review submitted");
  return tags;
}

/* ─── Toast ─────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}

/* ─── Close Portal ──────────────────────── */
function closePortal() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "REVIEW_PORTAL_CLOSE" }, "*");
  } else {
    showToast("Thank you for your feedback!");
    navigateTo("choose");
  }
}

/* ─── Clay Bounce Interaction Helper ────── */
function triggerBounce(el) {
  el.classList.remove("clay-bounce");
  void el.offsetWidth; // force reflow
  el.classList.add("clay-bounce");
}

/* ─── Menu System Logic ──────────────────── */
let cart = [];
let itemCounts = {};

function filterMenu(category, btnElement, event) {
  // Update button active states
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("clay-btn-primary");
    btn.classList.add("clay-btn-secondary");
  });
  btnElement.classList.remove("clay-btn-secondary");
  btnElement.classList.add("clay-btn-primary");

  // Trigger bounce on filter button
  if (event && event.target) {
    triggerBounce(event.target);
  } else if (btnElement) {
    triggerBounce(btnElement);
  }

  // Filter sections
  if (category === "all") {
    document.getElementById("cat-south-indian").style.display = "block";
    document.getElementById("cat-chinese").style.display = "block";
  } else if (category === "south-indian") {
    document.getElementById("cat-south-indian").style.display = "block";
    document.getElementById("cat-chinese").style.display = "none";
  } else if (category === "chinese") {
    document.getElementById("cat-south-indian").style.display = "none";
    document.getElementById("cat-chinese").style.display = "block";
  }
}

function addToOrder(itemName, btnElement, event) {
  cart.push(itemName);
  itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
  document.getElementById("cart-count").textContent = cart.length;
  showToast("✓ Added " + itemName + " to order");

  if (btnElement) {
    const originalText =
      btnElement.getAttribute("data-original-text") ||
      btnElement.textContent.replace(/\s*\(\d+\)$/, "");
    if (!btnElement.hasAttribute("data-original-text")) {
      btnElement.setAttribute("data-original-text", originalText);
    }
    btnElement.textContent = originalText + " (" + itemCounts[itemName] + ")";
  }

  if (event && event.target) {
    triggerBounce(event.target);
  } else if (btnElement) {
    triggerBounce(btnElement);
  }
}

/* ─── Init ──────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initSliders();

  // Keyboard support for stars
  document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setStars(
          star.getAttribute("data-group"),
          parseInt(star.getAttribute("data-val")),
        );
      }
    });
  });

  /* Bounce animation on buttons */
  document
    .querySelectorAll(".btn-primary, .review-type-btn, .back-btn, .option-item")
    .forEach((el) => {
      el.addEventListener("click", () => triggerBounce(el));
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

  // Update the qty-count display
  document.querySelectorAll('.qty-count[data-item="' + itemName + '"]').forEach(function(el) {
    el.textContent = newVal;
    el.style.fontWeight = newVal > 0 ? '700' : '';
  });

  // Enable/disable minus button
  var qtyControl = btnElement.closest('.qty-control');
  if (qtyControl) {
    var minusBtn = qtyControl.querySelector('.minus');
    if (minusBtn) minusBtn.disabled = (newVal === 0);
  }

  // Rebuild cart array from itemCounts
  cart = [];
  for (var key in itemCounts) {
    for (var j = 0; j < itemCounts[key]; j++) {
      cart.push(key);
    }
  }

  // Update cart count
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
  for (var key in itemCounts) {
    if (itemCounts[key] > 0) {
      hasItems = true;
      var safeId = key.replace(/\s+/g, '-');
      if (typeof foodStarRatings[key] === 'undefined') {
        foodStarRatings[key] = 0;
      }
      var html = '<div class="form-group review-dish-container" style="margin-bottom: 24px;">';
      html += '<label class="review-dish-label" style="display: block; margin-bottom: 12px; font-weight: 600;">Rating for <b>' + key + '</b></label>';
      html += '<div class="review-dish-item clay-card" style="border-radius: var(--radius-pill); padding: 12px 24px; display: flex; justify-content: center; align-items: center; width: 100%;">';
      html += '<div class="stars" id="stars-' + safeId + '">';
      for (var i = 1; i <= 5; i++) {
        var activeClass = i <= foodStarRatings[key] ? 'active' : '';
        html += '<span class="star ' + activeClass + '" data-val="' + i + '" onclick="setFoodStars(\'' + key + '\', ' + i + ')">&#9733;</span>';
      }
      html += '</div>';
      html += '</div>';
      html += '</div>';
      container.innerHTML += html;
    }
  }
  
  if (!hasItems) {
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
    showToast('⚠ Please rate: ' + unrated.join(', '));
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

  showToast('✓ Review submitted — thank you!');
  navigateTo('thankyou');
}

/* === Reset All State & Start Fresh === */
function resetAndReview() {
  // Clear cart and counts
  cart = [];
  itemCounts = {};
  foodStarRatings = {};

  // Reset all qty-count displays to 0
  document.querySelectorAll('.qty-count').forEach(function(el) {
    el.textContent = '0';
    el.style.fontWeight = '';
  });

  // Disable all minus buttons
  document.querySelectorAll('.qty-btn.minus').forEach(function(btn) {
    btn.disabled = true;
  });

  // Reset cart count display
  var cartEl = document.getElementById('cart-count');
  if (cartEl) cartEl.textContent = '0';

  // Reset food review form
  var foodForm = document.getElementById('food-review-form');
  if (foodForm) foodForm.reset();

  // Clear dynamic reviews container
  var dynContainer = document.getElementById('dynamic-food-reviews');
  if (dynContainer) dynContainer.innerHTML = '';

  // Reset hotel star ratings too
  for (var key in starRatings) {
    starRatings[key] = 0;
  }
  document.querySelectorAll('.star').forEach(function(s) {
    s.classList.remove('active');
  });

  // Reset management & hotel forms
  var mgmtForm = document.getElementById('management-form');
  if (mgmtForm) mgmtForm.reset();
  var hotelForm = document.getElementById('hotel-form');
  if (hotelForm) hotelForm.reset();

  // Re-init sliders
  initSliders();

  navigateTo('choose');
}
