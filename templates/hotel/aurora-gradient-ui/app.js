/* ─── State ─────────────────────────────── */
const starRatings = { cleanliness: 0, comfort: 0, amenities: 0, wifi: 0 };
let currentPage = "choose";

/* ─── Page Navigation ───────────────────── */
function navigateTo(pageId) {
  const current = document.querySelector(".page.active");
  const next = document.getElementById("page-" + pageId);
  if (!next || current === next) return;

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
  const slider = event.target;
  const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(90deg, rgba(139,92,246,0.85) ${pct}%, rgba(255,255,255,0.10) ${pct}%)`;
}

/* ─── Initialize sliders ────────────────── */
function initSliders() {
  document.querySelectorAll(".aurora-range").forEach((slider) => {
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
      parseInt(s.getAttribute("data-val")) <= val ? "var(--gold)" : "";
    s.style.filter =
      parseInt(s.getAttribute("data-val")) <= val
        ? "drop-shadow(0 0 8px rgba(251,191,36,0.65))"
        : "";
  });
});

document.addEventListener("mouseout", (e) => {
  if (!e.target.classList.contains("star")) return;
  const group = e.target.getAttribute("data-group");
  const container = document.getElementById("stars-" + group);
  if (!container) return;
  container.querySelectorAll(".star").forEach((s) => {
    const sv = parseInt(s.getAttribute("data-val"));
    const active = sv <= (starRatings[group] || 0);
    s.style.color = active ? "var(--gold)" : "";
    s.style.filter = active ? "drop-shadow(0 0 8px rgba(251,191,36,0.65))" : "";
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

/* ─── Menu System Logic ──────────────────── */
let cart = [];
let itemCounts = {};

function filterMenu(category, btnElement, event) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("btn-primary");
    btn.classList.add("ghost");
    btn.style.border = "1px solid rgba(255,255,255,0.2)";
    btn.style.background = "transparent";
  });
  btnElement.classList.remove("ghost");
  btnElement.classList.add("btn-primary");
  btnElement.style.border = "none";
  btnElement.style.background = "";

  if (event && event.clientX) {
    spawnFlash(btnElement, event);
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

  if (event && event.clientX && typeof spawnFlash === "function") {
    spawnFlash(btnElement, event);
  } else if (event && event.target && typeof spawnRipple === "function") {
    spawnRipple(event.target, event);
  }
}

/* ─── Init ──────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initSliders();

  /* Star keyboard accessibility */
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

  /* Ripple on review-type buttons, option items, back button */
  document
    .querySelectorAll(".review-type-btn, .option-item, .back-btn")
    .forEach((el) => {
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
      allHtml += '<div class="star-row-label" style="margin-bottom: 12px; font-size: 15px; font-weight: 600; color: var(--text-1);">Rating for ' + key + '</div>';
      allHtml += '<div class="stars" id="stars-' + safeId + '" role="group" style="justify-content: flex-start;">';
      for (var i = 1; i <= 5; i++) {
        var activeClass = i <= foodStarRatings[key] ? 'active' : '';
        allHtml += '<span class="star ' + activeClass + '" data-val="' + i + '" onclick="setFoodStars(\'' + key + '\', ' + i + ')">&#9733;</span>';
      }
      allHtml += '</div>';
      allHtml += '</div>';
      
      // Dish Image Portal on the right
      allHtml += '<div class="review-dish-img-box" style="width: 72px; height: 72px; flex-shrink: 0; border-radius: var(--radius-md); overflow: hidden; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); margin-left: 16px;">';
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
