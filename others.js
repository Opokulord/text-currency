// 2. On Window Load (No changes)
window.onload = function () {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      window.location.href = 'auth.html';
    }
    showSection('home');
    initializeStyles();
  };
  
 
  
  // ==========================================
  // 4. Section Navigation (No changes)
  // ==========================================
  function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
  }
  
  
  
  
  // ==========================================
  // 11. Logout Function
  // ==========================================
  function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'auth.html';
  }
  
  // ==========================================
  // 12. Toggle Dark Mode
  // ==========================================
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', mode);
  }
  