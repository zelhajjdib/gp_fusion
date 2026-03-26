import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  // Sticky header change on scroll
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.background = 'rgba(10, 10, 10, 0.95)';
      header.style.borderBottom = '1px solid var(--color-primary)';
    } else {
      header.style.background = 'var(--color-glass)';
      header.style.borderBottom = '1px solid var(--border-glass)';
    }
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Set active link
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    if (link.getAttribute('href') && currentPath.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
    }
    if (currentPath === '/' && link.getAttribute('href') === 'index.html') {
      link.classList.add('active');
    }
  });
});
