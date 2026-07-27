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

  // --- 7. Lucky Customers Filter & Sort Logic (Static HTML in index.html for SEO) ---
  /*
  const customersGrid = document.getElementById("customers-grid");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const sortSelect = document.getElementById("customer-sort");

  ... (Dynamic render disabled for static HTML SEO optimization)
  */

  // --- 8. Mobile Menu Toggle ---

  const menuToggle = document.getElementById("mobile-menu-toggle");
  const mobileNavLinks = document.querySelector(".nav-links");

  if (menuToggle && mobileNavLinks) {
    const hamburgerIcon = menuToggle.querySelector(".hamburger-icon");
    const closeIcon = menuToggle.querySelector(".close-icon");

    const setMenuState = (isActive) => {
      mobileNavLinks.classList.toggle("active", isActive);
      hamburgerIcon.style.display = isActive ? "none" : "block";
      closeIcon.style.display = isActive ? "block" : "none";
    };

    menuToggle.addEventListener("click", () => {
      const isActive = !mobileNavLinks.classList.contains("active");
      setMenuState(isActive);
    });

    // Close menu when a nav link (or the mobile CTA) is clicked
    mobileNavLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    // Close menu when clicking outside of it
    document.addEventListener("click", (e) => {
      const isClickInsideMenu = mobileNavLinks.contains(e.target);
      const isClickOnToggle = menuToggle.contains(e.target);
      if (
        mobileNavLinks.classList.contains("active") &&
        !isClickInsideMenu &&
        !isClickOnToggle
      ) {
        setMenuState(false);
      }
    });

    // Close menu on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileNavLinks.classList.contains("active")) {
        setMenuState(false);
      }
    });
  }
});