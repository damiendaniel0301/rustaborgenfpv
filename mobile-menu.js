// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.querySelector('.sidebar');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const appShell = document.querySelector('.app-shell');

  if (!mobileMenuToggle || !sidebar) return;

  // Toggle menu function
  function toggleMobileMenu() {
    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;

    mobileMenuToggle.setAttribute('aria-expanded', newState);
    sidebar.classList.toggle('mobile-open', newState);

    if (mobileOverlay) {
      mobileOverlay.classList.toggle('active', newState);
    }

    if (appShell) {
      appShell.classList.toggle('mobile-open', newState);
    }

    // Prevent body scroll when menu is open
    document.body.style.overflow = newState ? 'hidden' : '';
  }

  // Close menu function
  function closeMobileMenu() {
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    sidebar.classList.remove('mobile-open');

    if (mobileOverlay) {
      mobileOverlay.classList.remove('active');
    }

    if (appShell) {
      appShell.classList.remove('mobile-open');
    }

    document.body.style.overflow = '';
  }

  // Toggle button click handler
  mobileMenuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Close menu when clicking overlay
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close menu when clicking outside on larger screens
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && e.target !== mobileMenuToggle && !mobileMenuToggle.contains(e.target)) {
        closeMobileMenu();
      }
    }
  });

  // Close menu when a nav button is clicked
  document.querySelectorAll('.nav-button').forEach(function(button) {
    button.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }
    });
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });

  // Handle escape key to close menu
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenuToggle.getAttribute('aria-expanded') === 'true') {
      closeMobileMenu();
      mobileMenuToggle.focus();
    }
  });
});
