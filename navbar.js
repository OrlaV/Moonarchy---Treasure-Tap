// Fonction pour gérer l'état actif de la navbar
function setupNavbar() {
    const navItems = document.querySelectorAll('.navbar .nav-item');
  
    navItems.forEach(item => {
      item.addEventListener('click', function(event) {
        // Le comportement par défaut (navigation) est laissé intact
  
        // Supprime la classe 'active' de tous les nav-items
        navItems.forEach(nav => nav.classList.remove('active'));
  
        // Ajoute la classe 'active' au nav-item cliqué
        this.classList.add('active');
  
        // Met à jour l'image source pour chaque nav-item
        navItems.forEach(nav => {
          const img = nav.querySelector('img');
          if (nav.classList.contains('active')) {
            img.src = nav.getAttribute('data-active-src');
          } else {
            img.src = nav.getAttribute('data-default-src');
          }
        });
  
        // La navigation se fait automatiquement via le lien href
      });
    });
  }
  
  // Fonction pour initialiser la navbar en fonction de la page actuelle
  function initializeNavbar() {
    const navItems = document.querySelectorAll('.navbar .nav-item');
    const currentPage = window.location.pathname.split('/').pop().split('.')[0]; // Ex: 'home' de 'home.html'
  
    navItems.forEach(item => {
      const page = item.getAttribute('href').split('.')[0]; // 'home' de 'home.html'
      const img = item.querySelector('img');
  
      if (page === currentPage) {
        item.classList.add('active');
        img.src = item.getAttribute('data-active-src');
      } else {
        item.classList.remove('active');
        img.src = item.getAttribute('data-default-src');
      }
    });
  
    setupNavbar(); // Configurer les événements après avoir initialisé l'état actif
  }
  
  // Initialisation de la navbar après le chargement du DOM
  document.addEventListener('DOMContentLoaded', () => {
    initializeNavbar();
  });