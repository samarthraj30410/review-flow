/**
 * side-pages.js
 * Shared enhancements for all side pages (about, contact, manifesto, privacy, terms).
 * Adds scroll-reveal animations, smooth header parallax, and interactive blue glow effects.
 */
document.addEventListener("DOMContentLoaded", () => {
  // --- Scroll Reveal (IntersectionObserver) ---
  const revealEls = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale"
  );

  if (revealEls.length > 0 && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show everything immediately
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  // --- Blue Glow Card Tilt (subtle mouse-follow effect) ---
  const glowCards = document.querySelectorAll(".glow-tilt");

  glowCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--glow-x", `${x}%`);
      card.style.setProperty("--glow-y", `${y}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--glow-x", "50%");
      card.style.setProperty("--glow-y", "50%");
    });
  });

  // --- Smooth Section Number Counter ---
  const sectionNumbers = document.querySelectorAll(".section-number");
  sectionNumbers.forEach((num) => {
    const text = num.textContent;
    num.style.opacity = "0";
    num.style.transform = "translateY(8px)";

    const numObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              num.style.transition =
                "opacity 0.5s ease, transform 0.5s ease";
              num.style.opacity = "1";
              num.style.transform = "translateY(0)";
            }, 100);
            numObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    numObserver.observe(num);
  });

  // --- Active Nav Link Highlight ---
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.split("#")[0] === currentPage) {
      link.classList.add("active");
    }
  });
});
