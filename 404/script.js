document.addEventListener("DOMContentLoaded", () => {
  // --- 0. Dark and Light Mode Toggle ---
  const themeToggleBtn = document.getElementById("theme-toggle");
  const storedTheme = sessionStorage.getItem("theme") || "dark";

  document.documentElement.setAttribute("data-theme", storedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const targetTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", targetTheme);
      sessionStorage.setItem("theme", targetTheme);
    });
  }

  // --- 1. Mobile Menu Toggle ---
  const menuToggle = document.getElementById("mobile-menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    const hamburgerIcon = menuToggle.querySelector(".hamburger-icon");
    const closeIcon = menuToggle.querySelector(".close-icon");

    const setMenuState = (isActive) => {
      navLinks.classList.toggle("active", isActive);
      menuToggle.setAttribute("aria-expanded", String(isActive));
      hamburgerIcon.style.display = isActive ? "none" : "block";
      closeIcon.style.display = isActive ? "block" : "none";
    };

    menuToggle.addEventListener("click", () => {
      setMenuState(!navLinks.classList.contains("active"));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("active")) {
        setMenuState(false);
        menuToggle.focus();
      }
    });
  }

  // --- 2. Show the URL that was not found ---
  const pathEl = document.getElementById("attempted-path");
  if (pathEl) {
    pathEl.textContent = window.location.pathname + window.location.search;
  }

  // --- 3. "Go Back" button: use browser history if there is somewhere to go back to ---
  const goBackBtn = document.getElementById("go-back-btn");
  if (goBackBtn) {
    // Only show it if the user actually navigated here from elsewhere on this site
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
      goBackBtn.style.display = "inline-flex";
      goBackBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.history.back();
      });
    }
  }
});