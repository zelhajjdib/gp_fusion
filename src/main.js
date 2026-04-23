import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const navOverlay = document.getElementById('navOverlay');
  const navClose = document.getElementById('navClose');
  if (hamburger && navOverlay) {
    hamburger.addEventListener('click', () => {
      navOverlay.classList.add('is-open');
      hamburger.classList.add('is-open');
    });
    const close = () => {
      navOverlay.classList.remove('is-open');
      hamburger.classList.remove('is-open');
    };
    if (navClose) navClose.addEventListener('click', close);
    navOverlay.addEventListener('click', e => { if (e.target === navOverlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // Scroll Reveal Animations
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));
});
