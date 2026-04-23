import { supabase } from './supabase.js'

const STORAGE_URL = 'https://fvdzdyjkwrjollhhhxaw.supabase.co/storage/v1/object/public/vehicules/'

let currentVehicle = null
let existingPhotos  = []
let newPhotoFiles   = []
let photosToDelete  = []

// ── AUTH ────────────────────────────────────────────────
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  session ? showDashboard() : showLogin()
}

function showLogin() {
  document.getElementById('login-section').style.display    = 'flex'
  document.getElementById('dashboard-section').style.display = 'none'
}

function showDashboard() {
  document.getElementById('login-section').style.display    = 'none'
  document.getElementById('dashboard-section').style.display = 'block'
  loadVehicles()
}

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault()
  const email    = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value
  const errEl    = document.getElementById('login-error')
  errEl.textContent = ''

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    errEl.textContent = 'Email ou mot de passe incorrect.'
  } else {
    showDashboard()
  }
})

document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabase.auth.signOut()
  showLogin()
})

// ── LOAD VEHICLES ────────────────────────────────────────
async function loadVehicles() {
  const { data, error } = await supabase
    .from('vehicules')
    .select('id, marque, modele, annee, prix, nb_vues, actif, photos(url_photo, ordre)')
    .order('date_publication', { ascending: false })

  if (error || !data) return

  const total     = data.length
  const actifs    = data.filter(v => v.actif).length
  const totalVues = data.reduce((sum, v) => sum + (v.nb_vues || 0), 0)

  document.getElementById('stat-total').textContent = total
  document.getElementById('stat-actif').textContent = actifs
  document.getElementById('stat-vues').textContent  = totalVues.toLocaleString('fr-FR')

  const tbody = document.getElementById('vehicles-tbody')
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">Aucune annonce.</td></tr>`
    return
  }

  tbody.innerHTML = data.map(v => {
    const photos = (v.photos || []).sort((a, b) => a.ordre - b.ordre)
    const img    = photos.length ? photos[0].url_photo : '/vente.jpeg'
    return `
      <tr>
        <td><img src="${img}" alt="${v.marque} ${v.modele}" /></td>
        <td>
          <div class="v-name">${v.marque} ${v.modele}</div>
          <div class="v-sub">${v.annee}</div>
        </td>
        <td class="v-price">${Number(v.prix).toLocaleString('fr-FR')} €</td>
        <td class="v-views">${v.nb_vues || 0}</td>
        <td>
          <label class="toggle">
            <input type="checkbox" ${v.actif ? 'checked' : ''}
              onchange="toggleActif('${v.id}', this.checked)" />
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <button class="btn-edit"   onclick="openEdit('${v.id}')">Modifier</button>
          <button class="btn-delete" onclick="deleteVehicle('${v.id}')">Supprimer</button>
        </td>
      </tr>`
  }).join('')
}

// ── TOGGLE ACTIF ─────────────────────────────────────────
window.toggleActif = async (id, actif) => {
  await supabase.from('vehicules').update({ actif }).eq('id', id)
  loadVehicles()
}

// ── DELETE ───────────────────────────────────────────────
window.deleteVehicle = async (id) => {
  if (!confirm('Supprimer cette annonce définitivement ?')) return
  await supabase.from('photos').delete().eq('vehicule_id', id)
  await supabase.from('vehicules').delete().eq('id', id)
  loadVehicles()
}

// ── OPEN ADD FORM ────────────────────────────────────────
document.getElementById('btn-add').addEventListener('click', () => {
  currentVehicle = null
  existingPhotos = []
  newPhotoFiles  = []
  photosToDelete = []
  resetForm()
  document.getElementById('form-title').textContent = 'Nouvelle annonce'
  document.getElementById('form-modal').style.display = 'flex'
})

// ── OPEN EDIT FORM ───────────────────────────────────────
window.openEdit = async (id) => {
  const { data: v } = await supabase
    .from('vehicules')
    .select('*, photos(id, url_photo, ordre)')
    .eq('id', id)
    .single()

  currentVehicle = v
  existingPhotos = (v.photos || []).slice().sort((a, b) => a.ordre - b.ordre)
  newPhotoFiles  = []
  photosToDelete = []

  resetForm()
  fillForm(v)
  renderExistingPhotos()
  document.getElementById('form-title').textContent = 'Modifier l\'annonce'
  document.getElementById('form-modal').style.display = 'flex'
}

// ── CLOSE MODAL ──────────────────────────────────────────
document.getElementById('btn-close-modal').addEventListener('click', closeModal)
document.getElementById('form-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('form-modal')) closeModal()
})
function closeModal() {
  document.getElementById('form-modal').style.display = 'none'
  document.getElementById('save-error').textContent = ''
}

// ── FORM HELPERS ─────────────────────────────────────────
function fillForm(v) {
  const fields = [
    'marque','modele','annee','prix','kilometrage','energie','boite',
    'nb_portes','nb_places','date_mec','type_vehicule','couleur',
    'puissance_fiscale','puissance_din','description','prix_jour'
  ]
  fields.forEach(f => {
    const el = document.getElementById('f-' + f)
    if (el) el.value = v[f] ?? ''
  })
  const permisEl = document.getElementById('f-permis')
  if (permisEl) permisEl.value = v.permis === false ? 'false' : 'true'
  const actifEl = document.getElementById('f-actif')
  if (actifEl) actifEl.checked = v.actif !== false
  const catEl = document.getElementById('f-categorie')
  if (catEl) { catEl.value = v.categorie || 'vente'; window.toggleLocationFields() }
}

function resetForm() {
  document.getElementById('vehicle-form').reset()
  document.getElementById('f-actif').checked = true
  document.getElementById('existing-photos').innerHTML  = ''
  document.getElementById('new-photos-preview').innerHTML = ''
  document.getElementById('save-error').textContent = ''
}

// ── PHOTO HANDLING ───────────────────────────────────────
document.getElementById('f-photos').addEventListener('change', e => {
  newPhotoFiles = [...newPhotoFiles, ...Array.from(e.target.files)]
  e.target.value = ''
  renderNewPhotos()
})

function renderNewPhotos() {
  const container = document.getElementById('new-photos-preview')
  container.innerHTML = newPhotoFiles.map((f, i) => `
    <div class="photo-thumb">
      <img src="${URL.createObjectURL(f)}" alt="Nouvelle photo ${i + 1}" />
      <button type="button" onclick="removeNewPhoto(${i})">×</button>
    </div>`).join('')
}

window.removeNewPhoto = i => {
  newPhotoFiles.splice(i, 1)
  renderNewPhotos()
}

function renderExistingPhotos() {
  const container = document.getElementById('existing-photos')
  container.innerHTML = existingPhotos.map((p, i) => `
    <div class="photo-thumb">
      <img src="${p.url_photo}" alt="Photo ${i + 1}" />
      <button type="button" onclick="removeExistingPhoto(${i}, '${p.id}')">×</button>
    </div>`).join('')
}

window.removeExistingPhoto = (i, photoId) => {
  photosToDelete.push(photoId)
  existingPhotos.splice(i, 1)
  renderExistingPhotos()
}

// ── SAVE ─────────────────────────────────────────────────
document.getElementById('vehicle-form').addEventListener('submit', async e => {
  e.preventDefault()
  const saveBtn = document.getElementById('btn-save')
  const errEl   = document.getElementById('save-error')
  saveBtn.textContent = 'Enregistrement…'
  saveBtn.disabled    = true
  errEl.textContent   = ''

  const get = id => {
    const el = document.getElementById(id)
    return el ? (el.value.trim() || null) : null
  }

  const vehicleData = {
    marque:            get('f-marque'),
    modele:            get('f-modele'),
    annee:             parseInt(get('f-annee')),
    prix:              parseInt(get('f-prix')),
    kilometrage:       parseInt(get('f-kilometrage')),
    energie:           get('f-energie'),
    boite:             get('f-boite'),
    nb_portes:         get('f-nb_portes')         ? parseInt(get('f-nb_portes'))         : null,
    nb_places:         get('f-nb_places')         ? parseInt(get('f-nb_places'))         : null,
    date_mec:          get('f-date_mec'),
    type_vehicule:     get('f-type_vehicule'),
    couleur:           get('f-couleur'),
    puissance_fiscale: get('f-puissance_fiscale') ? parseInt(get('f-puissance_fiscale')) : null,
    puissance_din:     get('f-puissance_din')     ? parseInt(get('f-puissance_din'))     : null,
    description:       get('f-description'),
    permis:            document.getElementById('f-permis').value !== 'false',
    actif:             document.getElementById('f-actif').checked,
    categorie:         get('f-categorie') || 'vente',
    prix_jour:         get('f-prix_jour') ? parseInt(get('f-prix_jour')) : null,
  }

  let vehicleId

  if (currentVehicle) {
    const { error } = await supabase.from('vehicules').update(vehicleData).eq('id', currentVehicle.id)
    if (error) { errEl.textContent = 'Erreur : ' + error.message; saveBtn.textContent = 'Enregistrer l\'annonce →'; saveBtn.disabled = false; return }
    vehicleId = currentVehicle.id

    // Delete removed photos
    if (photosToDelete.length) {
      await supabase.from('photos').delete().in('id', photosToDelete)
    }
  } else {
    const { data, error } = await supabase.from('vehicules').insert(vehicleData).select().single()
    if (error) { errEl.textContent = 'Erreur : ' + error.message; saveBtn.textContent = 'Enregistrer l\'annonce →'; saveBtn.disabled = false; return }
    vehicleId = data.id
  }

  // Upload new photos
  const startOrdre = existingPhotos.length
  for (let i = 0; i < newPhotoFiles.length; i++) {
    const file = newPhotoFiles[i]
    const ext  = file.name.split('.').pop().toLowerCase()
    const path = `${vehicleId}/${Date.now()}_${i}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('vehicules')
      .upload(path, file, { upsert: true })

    if (!uploadError) {
      await supabase.from('photos').insert({
        vehicule_id: vehicleId,
        url_photo:   STORAGE_URL + path,
        ordre:       startOrdre + i,
      })
    }
  }

  closeModal()
  loadVehicles()
  saveBtn.textContent = 'Enregistrer l\'annonce →'
  saveBtn.disabled    = false
})

// ── INIT ─────────────────────────────────────────────────
checkAuth()
