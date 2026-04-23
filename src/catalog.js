import { supabase } from './supabase.js'

const SVG_CAL = `<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>`
const SVG_KM  = `<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12c0 2 .6 3.9 1.6 5.5l1.7-1.1C4.5 15.1 4 13.6 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8c0 1.6-.5 3.1-1.3 4.4l1.7 1.1C23.4 15.9 24 14 24 12c0-5.5-4.5-10-12-10zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm1-2l5-5-1.4-1.4-4.8 4.8 1.2 1.6z"/></svg>`
const SVG_GAS = `<svg viewBox="0 0 24 24"><path d="M12 2H6c-1.1 0-2 .9-2 2v16h10V4c0-1.1-.9-2-2-2zm-2 13H8v-2h2v2zm0-5H8V8h2v2zm6.5-6h-2v2h2v4.8c0 .26-.06.52-.17.75L15 15.3V20h2v-4.1l1.6-2.5c.2-.3.3-.6.3-1V6c0-1.1-.9-2-2-2z"/></svg>`
const SVG_BOX = `<svg viewBox="0 0 24 24"><path fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 5v14 M12 5v14 M19 5v14 M5 12h14"/><circle cx="5" cy="5" r="2.5" fill="var(--color-primary)"/><circle cx="12" cy="5" r="2.5" fill="var(--color-primary)"/><circle cx="19" cy="5" r="2.5" fill="var(--color-primary)"/><circle cx="5" cy="19" r="2.5" fill="var(--color-primary)"/><circle cx="12" cy="19" r="2.5" fill="var(--color-primary)"/><circle cx="19" cy="19" r="2.5" fill="var(--color-primary)"/></svg>`

function fmtKm(n)    { return Number(n).toLocaleString('fr-FR') + ' km' }
function fmtPrice(n) { return Number(n).toLocaleString('fr-FR') + ' €' }

function renderCard(v) {
  const photos = (v.photos || []).slice().sort((a, b) => a.ordre - b.ordre)
  const img = photos.length > 0 ? photos[0].url_photo : '/vente.jpeg'
  return `
    <article class="v-card-horizontal"
      data-brand="${v.marque}" data-model="${v.modele}"
      data-year="${v.annee}" data-km="${v.kilometrage}"
      data-energy="${v.energie}" data-price="${v.prix}"
      data-gearbox="${v.boite}" style="cursor:pointer"
      onclick="window.location.href='vehicule.html?id=${v.id}'"
    >
      <div class="v-card-img-wrap">
        <img src="${img}" alt="${v.marque} ${v.modele}" class="v-card-img" loading="lazy" />
      </div>
      <div class="v-card-body">
        <h2 class="v-card-title">${v.marque} ${v.modele}</h2>
        <p class="v-card-subtitle">${v.description || ''}</p>
        <div class="v-card-specs">
          <div class="v-spec">${SVG_CAL} ${v.annee}</div>
          <div class="v-spec">${SVG_KM} ${fmtKm(v.kilometrage)}</div>
          <div class="v-spec">${SVG_GAS} ${v.energie}</div>
          <div class="v-spec">${SVG_BOX} ${v.boite}</div>
        </div>
        <div class="v-card-footer">
          <div class="v-price">${fmtPrice(v.prix)}</div>
          <a href="vehicule.html?id=${v.id}" class="v-btn"
            onclick="event.stopPropagation()"
            style="text-decoration:none;text-align:center;display:block;padding:12px;border-radius:6px;font-weight:600;">
            Voir l'annonce
          </a>
        </div>
      </div>
    </article>`
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!document.querySelector('.catalog-page')) return

  const listEl       = document.querySelector('.vehicle-list-view')
  const countEl      = document.querySelector('#results-count')
  const brandInput   = document.querySelector('#filter-brand')
  const brandList    = document.querySelector('#brand-select-list')
  const brandItems   = brandList ? [...brandList.querySelectorAll('li:not(.custom-select-group)')] : []
  const modelSel     = document.querySelector('#filter-model')
  const priceMin     = document.querySelector('#filter-price-min')
  const priceMax     = document.querySelector('#filter-price-max')
  const yearMin      = document.querySelector('#filter-year-min')
  const yearMax      = document.querySelector('#filter-year-max')
  const kmMin        = document.querySelector('#filter-km-min')
  const kmMax        = document.querySelector('#filter-km-max')
  const energySel    = document.querySelector('#filter-energy')
  const gearboxSel   = document.querySelector('#filter-gearbox')
  const sortSel      = document.querySelector('#sort-select')
  const btnFilter    = document.querySelector('#filter-btn')
  const btnReset     = document.querySelector('#reset-btn')
  const spanReset    = document.querySelector('#reset-span')

  listEl.innerHTML = `<div style="padding:80px;text-align:center;color:rgba(255,255,255,0.35);font-size:1rem;letter-spacing:.1em;">Chargement des annonces…</div>`

  const { data: vehicles, error } = await supabase
    .from('vehicules')
    .select('*, photos(url_photo, ordre)')
    .eq('actif', true)
    .order('date_publication', { ascending: false })

  if (error || !vehicles) {
    listEl.innerHTML = `<div style="padding:80px;text-align:center;color:rgba(255,255,255,0.35);">Erreur de chargement.</div>`
    return
  }

  const allVehicles = vehicles

  // Populate model filter dynamically
  if (modelSel) {
    const models = [...new Set(vehicles.map(v => v.modele))].sort()
    modelSel.innerHTML = `<option value="Tous">Tous les modèles</option>` +
      models.map(m => `<option value="${m}">${m}</option>`).join('')
  }

  function render(list) {
    listEl.innerHTML = list.length
      ? list.map(renderCard).join('')
      : `<div style="padding:80px;text-align:center;color:rgba(255,255,255,0.35);">Aucun véhicule ne correspond à vos critères.</div>`
    if (countEl) countEl.textContent = list.length + (list.length > 1 ? ' véhicules disponibles' : ' véhicule disponible')
  }

  function filterAndSort() {
    const brand   = (brandInput?.value || '').trim().toLowerCase()
    const model   = modelSel?.value || 'Tous'
    const pMin    = parseInt(priceMin?.value)  || 0
    const pMax    = parseInt(priceMax?.value)  || 99999999
    const yMin    = parseInt(yearMin?.value)   || 0
    const yMax    = parseInt(yearMax?.value)   || 9999
    const kMin    = parseInt(kmMin?.value)     || 0
    const kMax    = parseInt(kmMax?.value)     || 9999999
    const energy  = energySel?.value  || 'Toutes'
    const gearbox = gearboxSel?.value || 'Toutes'
    const sortVal = sortSel?.value    || 'recent'

    let filtered = allVehicles.filter(v => {
      if (brand && !v.marque.toLowerCase().includes(brand)) return false
      if (model !== 'Tous' && v.modele !== model) return false
      if (v.prix < pMin || v.prix > pMax) return false
      if (v.annee < yMin || v.annee > yMax) return false
      if (v.kilometrage < kMin || v.kilometrage > kMax) return false
      if (energy  !== 'Toutes' && v.energie !== energy)  return false
      if (gearbox !== 'Toutes' && v.boite   !== gearbox) return false
      return true
    })

    if      (sortVal === 'price-asc')  filtered.sort((a, b) => a.prix - b.prix)
    else if (sortVal === 'price-desc') filtered.sort((a, b) => b.prix - a.prix)
    else if (sortVal === 'km-asc')     filtered.sort((a, b) => a.kilometrage - b.kilometrage)
    else filtered.sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication))

    render(filtered)
  }

  // Brand autocomplete
  if (brandInput && brandList) {
    brandInput.addEventListener('focus', () => brandList.classList.add('show'))
    document.addEventListener('click', e => {
      if (!brandInput.contains(e.target) && !brandList.contains(e.target))
        brandList.classList.remove('show')
    })
    brandInput.addEventListener('input', e => {
      const val = e.target.value.toLowerCase()
      brandItems.forEach(li => { li.style.display = li.textContent.toLowerCase().includes(val) ? 'block' : 'none' })
      brandList.classList.add('show')
      filterAndSort()
    })
    brandItems.forEach(li => {
      li.addEventListener('click', () => {
        brandInput.value = li.getAttribute('data-value') || li.textContent
        brandList.classList.remove('show')
        filterAndSort()
      })
    })
  }

  if (btnFilter) btnFilter.addEventListener('click', filterAndSort)
  if (sortSel)   sortSel.addEventListener('change', filterAndSort)

  function performReset() {
    if (brandInput)  brandInput.value = ''
    if (modelSel)    modelSel.value   = 'Tous'
    if (priceMin)    priceMin.value   = ''
    if (priceMax)    priceMax.value   = ''
    if (yearMin)     yearMin.value    = ''
    if (yearMax)     yearMax.value    = ''
    if (kmMin)       kmMin.value      = ''
    if (kmMax)       kmMax.value      = ''
    if (energySel)   energySel.value  = 'Toutes'
    if (gearboxSel)  gearboxSel.value = 'Toutes'
    if (sortSel)     sortSel.value    = 'recent'
    filterAndSort()
  }

  if (btnReset)  btnReset.addEventListener('click', performReset)
  if (spanReset) spanReset.addEventListener('click', performReset)

  render(allVehicles)
})
