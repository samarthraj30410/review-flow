document.addEventListener('DOMContentLoaded', () => {

  // --- 0. Dark and Light Mode Toggle ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme') || 'dark';

  // Apply initially stored theme
  document.documentElement.setAttribute('data-theme', storedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('theme', targetTheme);
    });
  }

  // --- 1. Mobile Menu Toggle ---
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle && navLinks) {
    const hamburgerIcon = menuToggle.querySelector('.hamburger-icon');
    const closeIcon = menuToggle.querySelector('.close-icon');

    menuToggle.addEventListener('click', () => {
      const isActive = navLinks.classList.toggle('active');
      
      if (isActive) {
        hamburgerIcon.style.display = 'none';
        closeIcon.style.display = 'block';
      } else {
        hamburgerIcon.style.display = 'block';
        closeIcon.style.display = 'none';
      }
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburgerIcon.style.display = 'block';
        closeIcon.style.display = 'none';
      });
    });
  }
});
