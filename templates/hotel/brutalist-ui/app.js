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
  if (wrap) wrap.classList.toggle("visible", info.show);
  if (fill) fill.style.width = info.pct + "%";
  if (left) left.textContent = info.step;
  if (right) right.textContent = info.label;
}

/* ─── Update Header Subtitle ────────────── */
function updateHeader(pageId) {
  const sub = document.getElementById("header-subtitle");
  if (!sub) return;
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

  // Find the slider by ID prefix — avoids relying on implicit `event`
  const sliderId = targetId
    .replace("-val", "")
    .replace("overall-exp", "overall-experience");
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;
  // Use brutalist colors for slider fill
  slider.style.background = `linear-gradient(90deg, #ff00ff ${pct}%, #fff ${pct}%)`;
}

/* ─── Initialize sliders ────────────────── */
function initSliders() {
  document.querySelectorAll(".glass-range").forEach((slider) => {
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
      parseInt(s.getAttribute("data-val")) <= val ? "var(--primary-color)" : "";
  });
});

document.addEventListener("mouseout", (e) => {
  if (!e.target.classList.contains("star")) return;
  const group = e.target.getAttribute("data-group");
  const container = document.getElementById("stars-" + group);
  if (!container) return;
  container.querySelectorAll(".star").forEach((s) => {
    const sv = parseInt(s.getAttribute("data-val"));
    s.style.color =
      sv <= (starRatings[group] || 0) ? "var(--primary-color)" : "";
  });
});

/* ─── Submit Review ─────────────────────── */
function submitReview(type) {
  const tags = buildSummaryTags(type);
  const summaryEl = document.getElementById("review-summary-tags");
  if (summaryEl) {
    summaryEl.innerHTML = tags
      .map((t) => `<span class="review-tag">${t}</span>`)
      .join("");
  }
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
  if (!t) return;
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

/* ─── Menu System Logic ──────────────────── */
let cart = [];
let itemCounts = {};

function filterMenu(category, btnElement, event) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("btn-primary");
    btn.classList.add("ghost");
    btn.style.border = "2px solid transparent";
    btn.style.background = "transparent";
    btn.style.color = "inherit";
  });
  btnElement.classList.remove("ghost");
  btnElement.classList.add("btn-primary");
  btnElement.style.border = "2px solid #000";
  btnElement.style.background = "";
  btnElement.style.color = "";

  if (event && event.target && typeof brutalShake === "function") {
    brutalShake(event.target);
    brutalStamp(event.target, event);
  } else if (btnElement && typeof brutalShake === "function") {
    brutalShake(btnElement);
  }

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

  if (event && event.target && typeof brutalShake === "function") {
    brutalShake(event.target);
    brutalStamp(event.target, event);
  } else if (btnElement && typeof brutalShake === "function") {
    brutalShake(btnElement);
  }
}

/* ─── Brutalist Shake Effect ───────────── */
function brutalShake(el) {
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation =
    "brutalShake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both";
}

/* ─── Stamp / Slam Effect on Buttons ───── */
function brutalStamp(el, e) {
  const rect = el.getBoundingClientRect();
  const stamp = document.createElement("span");
  stamp.className = "brutal-stamp";
  stamp.style.left = e.clientX - rect.left + "px";
  stamp.style.top = e.clientY - rect.top + "px";
  el.appendChild(stamp);
  stamp.addEventListener("animationend", () => stamp.remove());
}

/* ─── Screen Jolt ──────────────────────── */
function screenJolt() {
  document.body.classList.add("jolt");
  setTimeout(() => document.body.classList.remove("jolt"), 300);
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

  // Review type buttons — gentle stamp only, no shake/jolt
  document.querySelectorAll(".review-type-btn").forEach((el) => {
    el.addEventListener("click", (e) => {
      brutalStamp(el, e);
    });
  });

  // Submit & back buttons — shake + stamp, no screen jolt
  document.querySelectorAll(".btn-primary, .back-btn").forEach((el) => {
    el.addEventListener("click", (e) => {
      brutalShake(el);
      brutalStamp(el, e);
    });
  });

  // Option items get a shake
  document.querySelectorAll(".option-item").forEach((el) => {
    el.addEventListener("click", () => {
      brutalShake(el);
    });
  });

  // Star pop animation on click
  document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", () => {
      star.style.animation = "none";
      void star.offsetWidth;
      star.style.animation =
        "starSlam 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both";
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
      var html = '<div class="form-group" style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 16px;">';
      
      html += '<div style="flex-grow: 1;">';
      html += '<label class="form-label" style="font-size: 15px;">Rating for <b>' + key + '</b></label>';
      html += '<div class="stars" id="stars-' + safeId + '" role="group">';
      for (var i = 1; i <= 5; i++) {
        var activeClass = i <= foodStarRatings[key] ? 'active' : '';
        html += '<span class="star ' + activeClass + '" data-val="' + i + '" onclick="setFoodStars(\'' + key + '\', ' + i + ')">&#9733;</span>';
      }
      html += '</div>';
      html += '</div>';
      
      // Dish Image Portal
      html += '<div class="review-dish-img-box" style="width: 80px; height: 80px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: rgba(0,0,0,0.1); border: 1px dashed rgba(255,255,255,0.3);">';
      html += '  <img src="" alt="' + key + '" style="width: 100%; height: 100%; object-fit: cover; display: block;" />';
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

  showToast('Review submitted - thank you!');
  navigateTo('thankyou');
}
