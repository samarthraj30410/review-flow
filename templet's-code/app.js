/* ═══════════════════════════════════════════
   BASE TEMPLATE — app.js
   Menu system logic with +/- quantity controls,
   category filtering, and food review flow
   ═══════════════════════════════════════════ */

/* ─── State ─────────────────────────────── */
let itemCounts = {};
let foodStarRating = 0;

/* ─── Quantity Controls ─────────────────── */
function changeQty(itemName, delta, btnElement) {
  const current = itemCounts[itemName] || 0;
  const newVal = Math.max(0, current + delta);
  itemCounts[itemName] = newVal;

  // Update the qty-count display for this item
  const countEls = document.querySelectorAll('.qty-count[data-item="' + itemName + '"]');
  countEls.forEach(function (el) {
    el.textContent = newVal;
    if (newVal > 0) {
      el.style.fontWeight = "700";
    } else {
      el.style.fontWeight = "";
    }
  });

  // Enable/disable minus buttons for this item
  const qtyControl = btnElement.closest(".qty-control");
  if (qtyControl) {
    const minusBtn = qtyControl.querySelector(".minus");
    if (minusBtn) minusBtn.disabled = newVal === 0;
  }

  // Update total cart count
  updateCartCount();
}

function updateCartCount() {
  let total = 0;
  for (const key in itemCounts) {
    total += itemCounts[key];
  }
  const cartEl = document.getElementById("cart-count");
  if (cartEl) cartEl.textContent = total;
}

function getTotalCartCount() {
  let total = 0;
  for (const key in itemCounts) {
    total += itemCounts[key];
  }
  return total;
}

function getOrderedItems() {
  const items = [];
  for (const key in itemCounts) {
    if (itemCounts[key] > 0) {
      items.push(key + " ×" + itemCounts[key]);
    }
  }
  return items;
}

/* ─── Category Filter ──────────────────── */
function filterMenu(category, btnElement) {
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.classList.remove("active");
  });
  btnElement.classList.add("active");

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

/* ─── Food Review Navigation ────────────── */
function goToFoodReview() {
  var total = getTotalCartCount();
  if (total === 0) {
    alert("Please add at least one item to your order first!");
    return;
  }

  // Show food review page, hide menu
  document.querySelector("main").style.display = "none";
  document.querySelector(".cart-trigger-container").style.display = "none";
  document.getElementById("page-food-review").style.display = "block";
  document.getElementById("review-item-count").textContent = total;
  generatePerDishReviews();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBackToMenu() {
  document.getElementById("page-food-review").style.display = "none";
  document.querySelector("main").style.display = "block";
  document.querySelector(".cart-trigger-container").style.display = "";
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
      var html = '<div class="form-group" style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">';
      
      // Dish Image Portal
      html += '<div class="review-dish-img-box" style="width: 100px; height: 100px; margin-bottom: 12px; border-radius: 8px; overflow: hidden; background: rgba(0,0,0,0.1); border: 1px dashed rgba(255,255,255,0.3);">';
      html += '  <img src="" alt="' + key + '" style="width: 100%; height: 100%; object-fit: cover; display: block;" />';
      html += '</div>';

      html += '<label class="form-label" style="font-size: 15px;">Rating for <b>' + key + '</b></label>';
      html += '<div class="stars" id="stars-' + safeId + '" role="group">';
      for (var i = 1; i <= 5; i++) {
        var activeClass = i <= foodStarRatings[key] ? 'active' : '';
        html += '<span class="star ' + activeClass + '" data-val="' + i + '" onclick="setFoodStars(\'' + key + '\', ' + i + ')">&#9733;</span>';
      }
      html += '</div>';
      
      html += '</div>';
      container.innerHTML += html;
    }
  }
  
  if (!hasItems) {
    container.innerHTML = '<p style="opacity: 0.7;">No items selected.</p>';
  }
}

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

  var feedback = document.getElementById("food-feedback");
  if (feedback && feedback.value.trim()) {
    tags.push('Feedback: ' + feedback.value.trim());
  }

  alert("Thank you for your review!\n\n" + tags.join(' | '));

  // Reset
  itemCounts = {};
  foodStarRating = 0;
  document.querySelectorAll(".qty-count").forEach(function (el) {
    el.textContent = "0";
    el.style.fontWeight = "";
  });
  document.querySelectorAll(".qty-btn.minus").forEach(function (btn) {
    btn.disabled = true;
  });
  updateCartCount();

  document.getElementById("page-food-review").style.display = "none";
  document.querySelector("main").style.display = "block";
  document.querySelector(".cart-trigger-container").style.display = "";
  if (document.getElementById("food-review-form")) {
    document.getElementById("food-review-form").reset();
  }
  var container = document.getElementById("stars-food-quality");
  if (container) {
    container.querySelectorAll(".star").forEach(function (s) {
      s.classList.remove("active");
    });
  }
}
