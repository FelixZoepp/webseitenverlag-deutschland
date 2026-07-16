/**
 * Inline-Editor für Demo-Seiten: wird als Script+CSS vor </body> injiziert
 * wenn ein Admin ?edit an die Demo-URL hängt.
 *
 * Features:
 * - Alle h1/h2/h3/p/span-Texte contenteditable
 * - Bilder klickbar → neu generieren
 * - Floating Toolbar mit Save/Cancel/Preview
 * - Änderungen werden als JSON-Patch an die API gesendet
 */

export function inlineEditorScript(demoId: string): string {
  return `
<style>
/* Editor Toolbar */
.demo-editor-bar{position:fixed;top:0;left:0;right:0;z-index:999999;background:#111;color:#fff;font-family:system-ui,sans-serif;font-size:13px;padding:8px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 16px rgba(0,0,0,0.4)}
.demo-editor-bar button{padding:6px 16px;border-radius:6px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;letter-spacing:.04em;transition:.15s}
.demo-editor-bar .save{background:#C8FF00;color:#111}.demo-editor-bar .save:hover{background:#A0D600}
.demo-editor-bar .cancel{background:rgba(255,255,255,.1);color:#fff}.demo-editor-bar .cancel:hover{background:rgba(255,255,255,.2)}
.demo-editor-bar .status{margin-left:auto;font-size:11px;color:rgba(255,255,255,.5)}
body.demo-editing{padding-top:44px!important}

/* Editable Highlights */
body.demo-editing [contenteditable="true"]{outline:2px dashed rgba(200,255,0,.3);outline-offset:2px;border-radius:4px;transition:outline .15s}
body.demo-editing [contenteditable="true"]:hover{outline:2px dashed rgba(200,255,0,.6)}
body.demo-editing [contenteditable="true"]:focus{outline:2px solid #C8FF00;background:rgba(200,255,0,.04)}

/* Image Overlay */
body.demo-editing img{cursor:pointer;transition:filter .15s}
body.demo-editing img:hover{filter:brightness(.7)}
.demo-img-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);opacity:0;transition:opacity .2s;pointer-events:none;z-index:10}
body.demo-editing *:hover>.demo-img-overlay{opacity:1}
.demo-img-btn{background:#C8FF00;color:#111;border:none;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;pointer-events:auto;font-family:system-ui}

/* Section Controls */
body.demo-editing section,body.demo-editing header,body.demo-editing .trust{position:relative}
.demo-section-label{position:absolute;top:4px;right:4px;background:rgba(17,17,17,.85);color:#C8FF00;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;z-index:20;display:none;font-family:system-ui;letter-spacing:.06em;text-transform:uppercase}
body.demo-editing section:hover>.demo-section-label,body.demo-editing header:hover>.demo-section-label{display:block}
</style>

<script>
(function(){
  var demoId = '${demoId}';
  var dirty = false;
  var origHtml = document.documentElement.outerHTML;

  // Toolbar
  var bar = document.createElement('div');
  bar.className = 'demo-editor-bar';
  bar.innerHTML = '<span style="font-weight:700;letter-spacing:-.02em">EDITOR</span>'
    + '<button class="save" id="edSave">Speichern</button>'
    + '<button class="cancel" id="edCancel">Abbrechen</button>'
    + '<button class="cancel" id="edPreview">Vorschau</button>'
    + '<span class="status" id="edStatus">Texte anklicken zum Bearbeiten · Bilder anklicken zum Neu-Generieren</span>';
  document.body.prepend(bar);
  document.body.classList.add('demo-editing');

  // Make all text elements editable
  var selectors = 'h1,h2,h3,p:not(.demo-editor-bar p),.lead,.eyebrow,.chips span,.trust span,li,.pname,.price,figcaption,.cap,.tag,summary,blockquote,cite,.fcard p,.fcard h3,.qcard p,.aname,.ameta,b,small,.stat-card b,.stat-card small,.stat-float b,.stat-float small';
  document.querySelectorAll(selectors).forEach(function(el) {
    if (el.closest('.demo-editor-bar')) return;
    el.setAttribute('contenteditable', 'true');
    el.addEventListener('input', function() { dirty = true; updateStatus(); });
  });

  // Image click → highlight + option
  document.querySelectorAll('img').forEach(function(img) {
    var wrap = img.parentElement;
    if (!wrap || wrap.classList.contains('demo-editor-bar')) return;
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    var ov = document.createElement('div');
    ov.className = 'demo-img-overlay';
    ov.innerHTML = '<button class="demo-img-btn" data-src="' + img.src.replace(/"/g,'&quot;') + '">Bild austauschen</button>';
    wrap.appendChild(ov);
    ov.querySelector('.demo-img-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      var url = prompt('Neue Bild-URL eingeben (oder leer lassen zum Neu-Generieren):');
      if (url === null) return;
      if (url.trim()) {
        img.src = url.trim();
        dirty = true;
        updateStatus();
      } else {
        setStatus('Bild-Generierung nur über /admin/demos → Assets-Button');
      }
    });
  });

  // Section labels
  var sectionNames = {hero:'HERO',trust:'TRUST',benv:'EMPATHIE',empathie:'EMPATHIE',sig:'SIGNATURE',einzug:'SIGNATURE',leist:'LEISTUNGEN',features:'FEATURES',pricing:'PREISE',preise:'PREISE',stim:'STIMMEN',faq:'FAQ',cta:'CTA',resv:'CTA',gallery:'GALERIE',ballsection:'SECTION',why:'WARUM'};
  document.querySelectorAll('section,header').forEach(function(sec) {
    var cls = (sec.className || '').split(' ');
    var name = '';
    for (var i = 0; i < cls.length; i++) { if (sectionNames[cls[i]]) { name = sectionNames[cls[i]]; break; } }
    if (!name && sec.id) name = sec.id.toUpperCase();
    if (!name) name = sec.tagName;
    var label = document.createElement('div');
    label.className = 'demo-section-label';
    label.textContent = name;
    sec.appendChild(label);
  });

  function updateStatus() {
    document.getElementById('edStatus').textContent = dirty ? 'Ungespeicherte Änderungen' : 'Keine Änderungen';
    document.getElementById('edStatus').style.color = dirty ? '#C8FF00' : 'rgba(255,255,255,.5)';
  }
  function setStatus(msg) {
    document.getElementById('edStatus').textContent = msg;
    document.getElementById('edStatus').style.color = '#C8FF00';
  }

  // Save
  document.getElementById('edSave').addEventListener('click', function() {
    if (!dirty) { setStatus('Keine Änderungen'); return; }
    setStatus('Speichert...');
    // Remove editor elements before saving
    bar.remove();
    document.querySelectorAll('.demo-img-overlay,.demo-section-label').forEach(function(el){el.remove()});
    document.querySelectorAll('[contenteditable]').forEach(function(el){el.removeAttribute('contenteditable')});
    document.body.classList.remove('demo-editing');
    document.body.style.paddingTop = '';

    var cleanHtml = '<!DOCTYPE html>' + document.documentElement.outerHTML;

    // Re-add editor (in case save fails)
    document.body.prepend(bar);
    document.body.classList.add('demo-editing');

    fetch('/api/admin/demos/' + demoId, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ action: 'save-html', html: cleanHtml })
    }).then(function(r) { return r.json() }).then(function(data) {
      if (data.error) { setStatus('Fehler: ' + data.error); return; }
      dirty = false;
      setStatus('Gespeichert!');
      setTimeout(function(){ location.reload() }, 1000);
    }).catch(function(e) { setStatus('Netzwerkfehler: ' + e.message); });
  });

  // Cancel
  document.getElementById('edCancel').addEventListener('click', function() {
    if (dirty && !confirm('Änderungen verwerfen?')) return;
    location.href = location.pathname;
  });

  // Preview (toggle editing)
  var previewing = false;
  document.getElementById('edPreview').addEventListener('click', function() {
    previewing = !previewing;
    if (previewing) {
      document.querySelectorAll('[contenteditable]').forEach(function(el){el.setAttribute('contenteditable','false')});
      document.body.classList.remove('demo-editing');
      this.textContent = 'Bearbeiten';
      bar.style.opacity = '.5';
    } else {
      document.querySelectorAll('[contenteditable="false"]').forEach(function(el){el.setAttribute('contenteditable','true')});
      document.body.classList.add('demo-editing');
      this.textContent = 'Vorschau';
      bar.style.opacity = '1';
    }
  });

  updateStatus();
})();
</script>`
}
