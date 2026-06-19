document.addEventListener('DOMContentLoaded', () => {

  // --- 0. Dark and Light Theme Toggle ---
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

  // --- 1. Contact Form Submit Logic ---
  const contactForm = document.getElementById('contact-form');
  const successCard = document.getElementById('success-card');
  const backToFormBtn = document.getElementById('btn-back-to-form');

  if (contactForm && successCard) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather input data (in real production, this would be POSTed to an API/Google Apps Script endpoint)
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const bizName = document.getElementById('contact-biz').value.trim();
      const message = document.getElementById('contact-msg').value.trim();

      if (name && email && bizName && message) {
        // Hide the form structure
        contactForm.style.display = 'none';

        // Display the success card block with animations
        successCard.style.display = 'flex';

        // Trigger animations by resetting the HTML checkmark element state (triggers draw animation)
        const checkmark = successCard.querySelector('.success-checkmark');
        if (checkmark) {
          checkmark.style.animation = 'none';
          checkmark.offsetHeight; // Trigger reflow to restart CSS animation
          checkmark.style.animation = '';
        }
      }
    });
  }

  // --- 2. Send Another Message Reset ---
  if (backToFormBtn && contactForm && successCard) {
    backToFormBtn.addEventListener('click', () => {
      // Clear all text inputs
      contactForm.reset();

      // Switch panels
      successCard.style.display = 'none';
      contactForm.style.display = 'flex';
    });
  }

  // --- 3. Mobile Menu Toggle ---
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
