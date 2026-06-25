document.addEventListener("DOMContentLoaded", () => {
  // --- 0. Dark and Light Mode Toggle ---
  const themeToggleBtn = document.getElementById("theme-toggle");
  const storedTheme = sessionStorage.getItem("theme") || "dark";

  // Apply initially stored theme
  document.documentElement.setAttribute("data-theme", storedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const targetTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", targetTheme);
      sessionStorage.setItem("theme", targetTheme);
    });
  }

  // --- 1. Star Rating Selection ---
  const starButtons = document.querySelectorAll(".star-btn");
  const ratingInput = document.getElementById("demo-rating");

  if (ratingInput) {
    starButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const val = parseInt(button.getAttribute("data-val"), 10);
        ratingInput.value = val;

        // Update star UI visual state
        starButtons.forEach((btn) => {
          const btnVal = parseInt(btn.getAttribute("data-val"), 10);
          if (btnVal <= val) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });
      });
    });
  }

  // --- 2. Live Demo Google Sheet Logger ---
  const demoForm = document.getElementById("demo-review-form");
  const sheetsTableBody = document.querySelector("#demo-sheets-table tbody");

  if (demoForm && sheetsTableBody) {
    demoForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("demo-name").value.trim();
      const comment = document.getElementById("demo-comment").value.trim();
      const rating = parseInt(ratingInput.value, 10);

      if (rating === 0) {
        alert("Please select a star rating first!");
        return;
      }

      // Get current local timestamp
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      // Create stars visual string
      const goldStars = "★".repeat(rating);
      const emptyStars = "☆".repeat(5 - rating);

      // Create table row
      const tr = document.createElement("tr");
      tr.classList.add("new-row");

      tr.innerHTML = `
        <td>${timestampStr}</td>
        <td>${escapeHTML(name)}</td>
        <td class="star-rating">${goldStars}${emptyStars} (${rating})</td>
        <td>${escapeHTML(comment)}</td>
        <td style="color: var(--success); font-weight: 500;">✓ Logged</td>
      `;

      // Prepend row to table
      sheetsTableBody.insertBefore(tr, sheetsTableBody.firstChild);

      // Reset Form
      demoForm.reset();
      ratingInput.value = "0";
      starButtons.forEach((btn) => btn.classList.remove("active"));

      // Smooth scroll the table wrapper to top to show new row if scrolled down
      const wrapper = document.querySelector(".sheets-table-wrapper");
      if (wrapper) {
        wrapper.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function escapeHTML(str) {
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag] || tag,
    );
  }

  // --- 3. Template Preview Modal Logic ---
  const modal = document.getElementById("preview-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  const previewButtons = document.querySelectorAll(".btn-preview");

  // Modal Dynamic Fields
  const modalShopName = document.getElementById("modal-shop-name");
  const modalShopTag = document.getElementById("modal-shop-tag");
  const modalDetailTitle = document.getElementById("modal-detail-title");
  const modalDetailDesc = document.getElementById("modal-detail-desc");
  const deviceScreen = document.querySelector(".device-screen");
  const deviceBtn = document.querySelector(".device-btn");

  const templatesData = {
    cafe: {
      shopName: "Greenwood Cafe",
      tagline: "Freshly roasted daily",
      title: "Artisanal Cafe Template",
      desc: "Elegant earthy palettes matching artisanal vibes. Responsive columns showing café hours alongside star review input boxes.",
      btnColor: "#d97706",
    },
    salon: {
      shopName: "Lumina Studio & Spa",
      tagline: "Pamper your senses",
      title: "Luxe Salon Template",
      desc: "Sleek visual hierarchy with elegant serif headers, minimalist borders, and soft pink/rose theme accents.",
      btnColor: "#ec4899",
    },
    clinic: {
      shopName: "Apex Dental Care",
      tagline: "Modern dental practices",
      title: "Apex Clinic Template",
      desc: "Clean, clinical theme utilizing light teal colors. Straightforward feedback fields prioritizing customer trust and reliability.",
      btnColor: "#06b6d4",
    },
    restaurant: {
      shopName: "Bistro 108",
      tagline: "Fine dining & local wines",
      title: "The Bistro Template",
      desc: "Warm charcoal backgrounds with red accents. Displays daily specialties beside review form inputs.",
      btnColor: "#f43f5e",
    },
    fitness: {
      shopName: "Iron Core Fitness",
      tagline: "Push your boundaries",
      title: "Gym & Fitness Template",
      desc: "High contrast dark theme utilizing vibrant emerald/neon green tags, designed for quick post-workout reviews.",
      btnColor: "#10b981",
    },
    boutique: {
      shopName: "Velvet & Vine Boutique",
      tagline: "Hand-picked vintage clothes",
      title: "Retail Boutique Template",
      desc: "Creative minimalist space utilizing violet highlights. Focuses on retail items and customer checkout experience reviews.",
      btnColor: "#8b5cf6",
    },
  };

  if (modal && closeBtn) {
    previewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-template");
        const data = templatesData[type];

        if (data) {
          // Update Modal elements
          if (modalShopName) modalShopName.textContent = data.shopName;
          if (modalShopTag) modalShopTag.textContent = data.tagline;
          if (modalDetailTitle) modalDetailTitle.textContent = data.title;
          if (modalDetailDesc) modalDetailDesc.textContent = data.desc;

          // Dynamically style preview screen buttons
          if (deviceBtn) deviceBtn.style.backgroundColor = data.btnColor;

          // Open Modal
          modal.classList.add("active");
        }
      });
    });

    // Close Modal
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove("active");
    }
  }

  // --- 4. Scroll Reveal Animations (IntersectionObserver) ---
  const revealElements = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // --- 5. Navigation Scroll Highlighting ---
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (sections.length > 0 && navLinks.length > 0) {
    window.addEventListener("scroll", () => {
      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute("id");
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
        const href = link.getAttribute("href");
        if (href && href.startsWith("#") && href.slice(1) === current) {
          link.classList.add("active");
        }
      });
    });
  }

  // --- 6. Main Contact Form Simulation ---
  const contactForm = document.getElementById("main-contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert(
        "Thank you for reaching out! I will be in touch with you shortly to set up your custom review flow.",
      );
      contactForm.reset();
    });
  }

  // --- 7. Lucky Customers Filter & Sort Logic ---
  const customersGrid = document.getElementById("customers-grid");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const sortSelect = document.getElementById("customer-sort");

  const luckyCustomersData = [
    {
      name: "Greenwood Cafe",
      category: "Food & Beverage",
      reviews: 1420,
      rating: 4.9,
      launchDate: "2026-01-15",
      domain: "www.greenwoodcafe.co",
      template: "Cafe Layout",
    },
    {
      name: "Lumina Studio & Spa",
      category: "Beauty",
      reviews: 840,
      rating: 4.8,
      launchDate: "2026-03-10",
      domain: "www.luminastudio.co",
      template: "Salon Layout",
    },
    {
      name: "Apex Dental Care",
      category: "Healthcare",
      reviews: 610,
      rating: 4.9,
      launchDate: "2026-04-02",
      domain: "www.apexdental.co",
      template: "Clinic Layout",
    },
    {
      name: "Bistro 108",
      category: "Food & Beverage",
      reviews: 2150,
      rating: 4.7,
      launchDate: "2025-11-20",
      domain: "www.bistro108.co",
      template: "Bistro Layout",
    },
    {
      name: "Iron Core Fitness",
      category: "Fitness",
      reviews: 1110,
      rating: 4.9,
      launchDate: "2026-02-05",
      domain: "www.ironcoregym.co",
      template: "Gym Layout",
    },
    {
      name: "Velvet & Vine Boutique",
      category: "Retail",
      reviews: 490,
      rating: 4.6,
      launchDate: "2026-05-18",
      domain: "www.velvetvine.co",
      template: "Retail Layout",
    },
  ];

  let currentFilter = "all";
  let currentSort = "launch-desc";

  function renderCustomers() {
    if (!customersGrid) return;

    // Filter
    let filtered = luckyCustomersData.filter((item) => {
      if (currentFilter === "all") return true;
      return item.category === currentFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      if (currentSort === "launch-desc") {
        return new Date(b.launchDate) - new Date(a.launchDate);
      } else if (currentSort === "launch-asc") {
        return new Date(a.launchDate) - new Date(b.launchDate);
      } else if (currentSort === "reviews-desc") {
        return b.reviews - a.reviews;
      } else if (currentSort === "rating-desc") {
        return b.rating - a.rating;
      } else if (currentSort === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    // Render HTML
    customersGrid.innerHTML = "";
    if (filtered.length === 0) {
      customersGrid.innerHTML =
        '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">No customers found matching this filter.</div>';
      return;
    }

    filtered.forEach((customer) => {
      const card = document.createElement("div");
      card.className = "customer-card reveal";

      const reviewsFormatted = new Intl.NumberFormat().format(customer.reviews);
      const dateOptions = { year: "numeric", month: "short", day: "numeric" };
      const dateFormatted = new Date(customer.launchDate).toLocaleDateString(
        "en-US",
        dateOptions,
      );

      // Create rating stars representation
      const fullStars = Math.floor(customer.rating);
      const halfStar = customer.rating % 1 !== 0;
      const starsStr =
        "★".repeat(fullStars) +
        (halfStar ? "½" : "") +
        "☆".repeat(5 - Math.ceil(customer.rating));

      card.innerHTML = `
        <div>
          <div class="customer-card-header">
            <div>
              <h3>${customer.name}</h3>
              <span class="customer-industry">${customer.category}</span>
            </div>
            <span class="customer-badge">Active</span>
          </div>
          <div class="customer-card-body">
            <div class="customer-stat-row">
              <span>Reviews Collected:</span>
              <strong>${reviewsFormatted}+</strong>
            </div>
            <div class="customer-stat-row">
              <span>Average Rating:</span>
              <strong style="color: #fbbf24;">${starsStr} (${customer.rating})</strong>
            </div>
            <div class="customer-stat-row">
              <span>Template Installed:</span>
              <strong>${customer.template}</strong>
            </div>
          </div>
        </div>
        <div class="customer-card-footer">
          <a href="#" class="customer-link" onclick="event.preventDefault(); alert('Redirecting to simulated live domain ${customer.domain}... Direct Google Sheet logging pipeline is active.');">
            ${customer.domain}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
          <span class="customer-launch">Launched ${dateFormatted}</span>
        </div>
      `;
      customersGrid.appendChild(card);

      // Observe reveal animation if intersection observer is active
      if (typeof revealObserver !== "undefined") {
        revealObserver.observe(card);
      }
    });
  }

  // Bind filter triggers
  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter");
        renderCustomers();
      });
    });
  }

  // Bind sort trigger
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderCustomers();
    });
  }

  // Run initial render
  renderCustomers();

  // --- 8. Mobile Menu Toggle ---
  const menuToggle = document.getElementById("mobile-menu-toggle");
  const mobileNavLinks = document.querySelector(".nav-links");

  if (menuToggle && mobileNavLinks) {
    const hamburgerIcon = menuToggle.querySelector(".hamburger-icon");
    const closeIcon = menuToggle.querySelector(".close-icon");

    menuToggle.addEventListener("click", () => {
      const isActive = mobileNavLinks.classList.toggle("active");

      if (isActive) {
        hamburgerIcon.style.display = "none";
        closeIcon.style.display = "block";
      } else {
        hamburgerIcon.style.display = "block";
        closeIcon.style.display = "none";
      }
    });

    // Close mobile menu when clicking a link
    mobileNavLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNavLinks.classList.remove("active");
        hamburgerIcon.style.display = "block";
        closeIcon.style.display = "none";
      });
    });
  }
});
