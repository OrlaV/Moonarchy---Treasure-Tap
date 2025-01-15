// ui-manager.js
export class UIManager { // Ajout du mot-clé 'export'
    constructor() {
      this.setupTheme();
      this.setupNavbar();
    }
  
    setupTheme() {
      const faction = localStorage.getItem('faction');
      if (faction === 'azurians') {
        document.body.classList.add('theme-azurians');
      } else if (faction === 'crimsons') {
        document.body.classList.add('theme-crimsons');
      }
    }
  
    setupNavbar() {
      const navItems = document.querySelectorAll('.navbar .nav-item');
      
      navItems.forEach(item => {
        item.addEventListener('click', () => {
          navItems.forEach(nav => nav.classList.remove('active'));
          item.classList.add('active');
  
          navItems.forEach(nav => {
            const img = nav.querySelector('img');
            if (img) {
              img.src = nav.classList.contains('active') 
                ? nav.getAttribute('data-active-src')
                : nav.getAttribute('data-default-src');
            }
          });
        });
      });
  
      // Initialize active state based on current page
      const currentPage = window.location.pathname.split('/').pop().split('.')[0];
      navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes(currentPage)) {
          item.classList.add('active');
          const img = item.querySelector('img');
          if (img) {
            img.src = item.getAttribute('data-active-src');
          }
        }
      });
    }
  }

// Si vous voulez aussi exporter une instance par défaut
export const uiManager = new UIManager();