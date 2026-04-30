import { supabase } from './supabase.js'
import { esc } from './esc.js'

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  if (!id) { window.location.href = 'achat.html'; return }

  const { data: v, error } = await supabase
    .from('vehicules')
    .select('*, photos(url_photo, ordre)')
    .eq('id', id)
    .single()

  if (error || !v) { window.location.href = 'achat.html'; return }

  // Increment views (fire and forget)
  supabase.rpc('increment_vues', { vid: id }).then(() => {}, () => {})

  // Page title
  document.title = `${v.marque} ${v.modele} ${v.annee} | GP Motors`

  // Lien contact pré-rempli
  const btnContact = document.getElementById('v-btn-contact')
  if (btnContact) {
    const ref = `${v.marque} ${v.modele} ${v.annee}`
    btnContact.href = `contact.html?vehicule=${encodeURIComponent(ref)}`
  }

  // Header
  document.getElementById('v-badges').textContent =
    `Occasion · ${v.marque}${v.type_vehicule ? ' · ' + v.type_vehicule : ''}`
  document.getElementById('v-title').textContent = `${v.marque} ${v.modele} ${v.annee}`

  // Key info helper
  const set = (elId, val) => {
    const el = document.getElementById(elId)
    if (el) el.textContent = (val !== null && val !== undefined && val !== '') ? val : '—'
  }

  set('k-marque',   v.marque)
  set('k-modele',   v.modele)
  set('k-annee',    v.annee)
  set('k-km',       Number(v.kilometrage).toLocaleString('fr-FR') + ' km')
  set('k-energie',  v.energie)
  set('k-boite',    v.boite)
  set('k-portes',   v.nb_portes)
  set('k-places',   v.nb_places)
  set('k-date-mec', v.date_mec)
  set('k-type',     v.type_vehicule)
  set('k-couleur',  v.couleur)
  set('k-cv',       v.puissance_fiscale ? v.puissance_fiscale + ' Cv' : null)
  set('k-din',      v.puissance_din     ? v.puissance_din     + ' Ch' : null)
  set('k-permis',   v.permis === false   ? 'Sans permis' : 'Avec permis')

  // Price
  document.getElementById('v-price').textContent =
    Number(v.prix).toLocaleString('fr-FR') + ' €'

  // Description (échappée puis newlines remplacés par <br>)
  const descEl = document.getElementById('v-description')
  if (descEl) {
    if (v.description) {
      descEl.innerHTML = esc(v.description).replace(/\n/g, '<br>')
    } else {
      descEl.innerHTML = '<span style="color:rgba(255,255,255,0.3)">Aucune description renseignée.</span>'
    }
  }

  // Gallery
  const photos = (v.photos || []).slice().sort((a, b) => a.ordre - b.ordre)
  if (photos.length === 0) photos.push({ url_photo: '/vente.jpeg' })

  const mainImg        = document.getElementById('main-image')
  const thumbsContainer = document.querySelector('.v-img-thumbs')

  mainImg.src = photos[0].url_photo
  mainImg.alt = `${v.marque} ${v.modele}`

  thumbsContainer.innerHTML = photos.map((p, i) =>
    `<img src="${esc(p.url_photo)}" class="thumb${i === 0 ? ' active' : ''}"
      alt="${esc(v.marque)} ${esc(v.modele)} photo ${i + 1}" />`
  ).join('')

  const thumbs = Array.from(thumbsContainer.querySelectorAll('.thumb'))
  let currentIndex = 0

  function updateGallery(index) {
    thumbs.forEach(t => t.classList.remove('active'))
    thumbs[index].classList.add('active')
    mainImg.src = thumbs[index].src
    currentIndex = index
  }

  thumbs.forEach((t, i) => t.addEventListener('click', () => updateGallery(i)))

  const btnPrev = document.getElementById('btn-prev')
  const btnNext = document.getElementById('btn-next')
  if (btnPrev) btnPrev.addEventListener('click', () =>
    updateGallery((currentIndex - 1 + thumbs.length) % thumbs.length))
  if (btnNext) btnNext.addEventListener('click', () =>
    updateGallery((currentIndex + 1) % thumbs.length))
})
