// templates/list-of-templates/script.js
document.addEventListener("DOMContentLoaded", () => {
  // Theme Toggle
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

});
