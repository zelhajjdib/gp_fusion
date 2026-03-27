import fs from 'fs';

// 1. Update navigation on all 7 existing html files
const files = ['index.html', 'achat.html', 'vente.html', 'location.html', 'diagnostic.html', 'vehicule.html', 'detail.html'];
const newNavStr = `<a href="nettoyage.html">Nettoyage</a>\n        <a href="polissage.html">Polissage</a>\n        <a href="ceramique.html">Céramique</a>\n      </nav>`;

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // regex replaces the exact <a>GP Detail</a> and </nav> reliably regardless of active class
    content = content.replace(/<a href="detail\.html"[^>]*>.*?<\/a>\s*<\/nav>/, newNavStr);
    fs.writeFileSync(file, content);
  }
});

// 2. We no longer use detail.html globally, we use nettoyage, polissage, ceramique.
// We will clone index.html structure but stripped down to serve as a placeholder for these 3 for now, 
// just so they have the proper layout and `<body class="theme-detail">`.
const templateContent = fs.readFileSync('achat.html', 'utf8'); 
const newPages = ['nettoyage.html', 'polissage.html', 'ceramique.html'];

newPages.forEach(page => {
  let pContent = templateContent.replace(/<body[^>]*>/, '<body class="theme-detail" style="background-color: #050505; color: #fff;">');
  const title = page.charAt(0).toUpperCase() + page.split('.')[0].slice(1);
  pContent = pContent.replace(/<title>.*?<\/title>/, `<title>${title} | GP Detail</title>`);
  // Remove the catalog specific stuff to keep it empty
  pContent = pContent.replace(/<main.*?<\/main>/s, `<main style="padding: 150px 0; text-align: center; min-height: 70vh;"><h1>${title} - GP Detail</h1><p style="color:var(--color-primary); font-size: 1.5rem; margin-top:20px;">Page en construction avec thème bleu activé !</p></main>`);
  fs.writeFileSync(page, pContent);
});

console.log('Bulk nav and pages updated successfully.');
