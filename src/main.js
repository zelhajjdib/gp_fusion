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

  // Catalog filtering logic
  const catalogPage = document.querySelector('.catalog-page');
  const btnFilter = document.querySelector('#filter-btn');
  if (catalogPage && btnFilter) {
    const brandInput = document.querySelector('#filter-brand');
    const brandList = document.querySelector('#brand-select-list');
    const brandItems = brandList ? brandList.querySelectorAll('li:not(.custom-select-group)') : [];
    
    const modelSelect = document.querySelector('#filter-model');
    const priceMin = document.querySelector('#filter-price-min');
    const priceMax = document.querySelector('#filter-price-max');
    const yearMin = document.querySelector('#filter-year-min');
    const yearMax = document.querySelector('#filter-year-max');
    const kmMin = document.querySelector('#filter-km-min');
    const kmMax = document.querySelector('#filter-km-max');
    const energySelect = document.querySelector('#filter-energy');
    const gearboxSelect = document.querySelector('#filter-gearbox');
    const sortSelect = document.querySelector('#sort-select');
    const btnReset = document.querySelector('#reset-btn');
    const spanReset = document.querySelector('#reset-span');
    
    const vehicleListView = document.querySelector('.vehicle-list-view');
    const cars = Array.from(vehicleListView.querySelectorAll('.v-card-horizontal'));
    const resultsCount = document.querySelector('#results-count');

    // Make cars clickable entirely
    cars.forEach(car => {
      car.style.cursor = 'pointer';
      car.addEventListener('click', (e) => {
        // Prevent trigger if clicking an existing link to prevent double navigation
        if (!e.target.closest('a') && !e.target.closest('button')) {
          window.location.href = 'vehicule.html';
        }
      });
    });

    if (brandInput && brandList) {
      brandInput.addEventListener('focus', () => brandList.classList.add('show'));
      
      document.addEventListener('click', (e) => {
        if (!brandInput.contains(e.target) && !brandList.contains(e.target)) {
          brandList.classList.remove('show');
        }
      });

      brandInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        brandItems.forEach(li => {
          if (li.textContent.toLowerCase().includes(val)) {
            li.style.display = 'block';
          } else {
            li.style.display = 'none';
          }
        });
        brandList.classList.add('show');
        filterAndSort();
      });

      brandItems.forEach(li => {
        li.addEventListener('click', () => {
          brandInput.value = li.getAttribute('data-value') || li.textContent;
          brandList.classList.remove('show');
          filterAndSort();
        });
      });
    }

    function filterAndSort() {
      const brand = brandInput.value;
      const model = modelSelect.value;
      const pMin = parseInt(priceMin?.value) || 0;
      const pMax = parseInt(priceMax?.value) || 99999999;
      const yMin = parseInt(yearMin.value) || 0;
      const yMax = parseInt(yearMax.value) || 9999;
      const kMin = parseInt(kmMin.value) || 0;
      const kMax = parseInt(kmMax.value) || 9999999;
      const energy = energySelect.value;
      const gearbox = gearboxSelect?.value || 'Toutes';

      let visibleCount = 0;
      const visibleCars = [];

      cars.forEach(car => {
        const cBrand = car.getAttribute('data-brand');
        const cModel = car.getAttribute('data-model');
        const cYear = parseInt(car.getAttribute('data-year'));
        const cKm = parseInt(car.getAttribute('data-km'));
        const cEnergy = car.getAttribute('data-energy');
        const cPrice = parseInt(car.getAttribute('data-price'));
        const cGearbox = car.getAttribute('data-gearbox');

        let match = true;

        if (brand.trim() !== '' && brand.trim().toLowerCase() !== 'toutes') {
          if (!cBrand.toLowerCase().includes(brand.trim().toLowerCase())) match = false;
        }

        if (model !== 'Tous' && cModel !== model) match = false;
        if (cPrice < pMin || cPrice > pMax) match = false;
        if (cYear < yMin || cYear > yMax) match = false;
        if (cKm < kMin || cKm > kMax) match = false;
        if (energy !== 'Toutes' && cEnergy !== energy) match = false;
        if (gearbox !== 'Toutes' && cGearbox !== gearbox) match = false;

        if (match) {
          car.classList.remove('hidden');
          visibleCars.push(car);
          visibleCount++;
        } else {
          car.classList.add('hidden');
        }
      });

      if (resultsCount) {
        resultsCount.textContent = visibleCount + (visibleCount > 1 ? ' véhicules disponibles' : ' véhicule disponible');
      }

      const sortVal = sortSelect.value;
      if (sortVal === 'price-asc') {
        visibleCars.sort((a, b) => parseInt(a.getAttribute('data-price')) - parseInt(b.getAttribute('data-price')));
      } else if (sortVal === 'price-desc') {
        visibleCars.sort((a, b) => parseInt(b.getAttribute('data-price')) - parseInt(a.getAttribute('data-price')));
      } else if (sortVal === 'km-asc') {
        visibleCars.sort((a, b) => parseInt(a.getAttribute('data-km')) - parseInt(b.getAttribute('data-km')));
      } else {
        visibleCars.sort((a, b) => parseInt(b.getAttribute('data-year')) - parseInt(a.getAttribute('data-year')));
      }

      visibleCars.forEach(car => vehicleListView.appendChild(car));
    }

    btnFilter.addEventListener('click', filterAndSort);
    sortSelect.addEventListener('change', filterAndSort);
    
    function performReset() {
      brandInput.value = '';
      modelSelect.value = 'Tous';
      priceMin.value = '';
      priceMax.value = '';
      yearMin.value = '';
      yearMax.value = '';
      kmMin.value = '';
      kmMax.value = '';
      energySelect.value = 'Toutes';
      if(gearboxSelect) gearboxSelect.value = 'Toutes';
      sortSelect.value = 'recent';
      filterAndSort();
    }
    
    if (btnReset) btnReset.addEventListener('click', performReset);
    if (spanReset) spanReset.addEventListener('click', performReset);
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
