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
});
