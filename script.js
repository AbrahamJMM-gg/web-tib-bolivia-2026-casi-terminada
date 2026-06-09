/* ═══════════════════════════════════════
   TIB BOLIVIA 2026  |  script.js
═══════════════════════════════════════ */


/* ── FAMTRIP MODAL ────────────────────── */
/* Modal de anuncio que aparece al cargar la página.
   También se puede abrir desde el botón "Famtrip" del footer.
   Cierre: botón X, click en backdrop, tecla ESC.

   Para cambiar el comportamiento de apertura inicial, editar la
   constante FAMTRIP_AUTO_OPEN o reemplazar por lógica de sessionStorage. */
(function initFamtripModal() {
  const modal = document.getElementById('famtripModal');
  if (!modal) return;

  const FAMTRIP_AUTO_OPEN = true;       // ← cambiar a false para no abrir automático
  const FAMTRIP_AUTO_DELAY = 600;        // ms antes de abrir (deja respirar al hero)

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Cualquier elemento con data-famtrip-close cierra el modal
  modal.querySelectorAll('[data-famtrip-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  // Cualquier elemento con data-famtrip-open (ej. botón del footer) abre el modal
  document.querySelectorAll('[data-famtrip-open]').forEach(el => {
    el.addEventListener('click', openModal);
  });

  // ESC para cerrar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // Revelar imágenes solo cuando el src real esté cargado (ocultar placeholder)
  modal.querySelectorAll('.famtrip-img img').forEach(img => {
    const wrap = img.parentElement;
    if (!wrap) return;
    if (img.getAttribute('src') && img.complete && img.naturalWidth > 0) {
      wrap.classList.add('has-image');
    }
    img.addEventListener('load', () => {
      if (img.naturalWidth > 0) wrap.classList.add('has-image');
    });
    img.addEventListener('error', () => wrap.classList.remove('has-image'));
  });

  if (FAMTRIP_AUTO_OPEN) {
    window.addEventListener('load', () => {
      setTimeout(openModal, FAMTRIP_AUTO_DELAY);
    });
  }

  // Exponer para uso externo
  window.openFamtripModal = openModal;
  window.closeFamtripModal = closeModal;
})();



/* ── THEME TOGGLE ─────────────────────── */
/* El tema se aplica antes en el <head> para evitar flash. Aquí solo manejamos el toggle. */
(function initTheme() {
  const root = document.documentElement;
  const stored = (() => { try { return localStorage.getItem('tib-theme'); } catch (e) { return null; } })();
  const initial = stored === 'light' || stored === 'dark' ? stored : 'light';
  root.setAttribute('data-theme', initial);

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('tib-theme', t); } catch (e) {}
  }

  function toggle() {
    const current = root.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  const desktopBtn = document.getElementById('themeToggle');
  const mobileBtn  = document.getElementById('mobileThemeToggle');
  if (desktopBtn) desktopBtn.addEventListener('click', toggle);
  if (mobileBtn)  mobileBtn.addEventListener('click', toggle);
})();


/* ── NAVBAR SCROLL ────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


/* ── HAMBURGER MENU ───────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});


/* ── COUNTDOWN ────────────────────────── */
const EVENT_DATE = new Date('2026-10-22T09:00:00-04:00');

function padZ(n, digits = 2) {
  return String(n).padStart(digits, '0');
}

function updateCountdown() {
  const diff = EVENT_DATE - new Date();
  if (diff <= 0) {
    document.getElementById('cd-days').textContent  = '000';
    document.getElementById('cd-hours').textContent = '00';
    document.getElementById('cd-min').textContent   = '00';
    document.getElementById('cd-sec').textContent   = '00';
    return;
  }
  document.getElementById('cd-days').textContent  = padZ(Math.floor(diff / 86400000), 3);
  document.getElementById('cd-hours').textContent = padZ(Math.floor((diff % 86400000) / 3600000));
  document.getElementById('cd-min').textContent   = padZ(Math.floor((diff % 3600000)  / 60000));
  document.getElementById('cd-sec').textContent   = padZ(Math.floor((diff % 60000)    / 1000));
}
updateCountdown();
setInterval(updateCountdown, 1000);


/* ── SCROLL REVEAL ────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => el.classList.add('visible'), el.dataset.delay || 0);
        revealObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

document.querySelectorAll(
  '.benefit-card, .org-card, .part-item, .media-card, .stat-card, .alianza-card, .mh-item'
).forEach((el, i) => {
  el.dataset.delay = (i % 6) * 80;
});


/* ── LOGO PLACEHOLDERS  (sponsors / organizers / alianzas) ──────
   Cada slot tiene <img src="..."> + fallback de texto/iniciales.
   Si el src está vacío (placeholder), se oculta la imagen y se
   muestra el fallback. Cuando se agrega una URL real al src, este
   script marca el contenedor con .has-logo para revelar el <img>
   y ocultar el fallback. */
function refreshLogoPlaceholders() {
  const slots = [
    { sel: '.sponsor-pill img', parentClass: 'has-logo' },
    { sel: '.org-card img[data-logo]', parentSel: '.org-card', parentClass: 'has-logo' },
    { sel: '.alianza-card img[data-logo]', parentSel: '.alianza-card', parentClass: 'has-logo' }
  ];

  slots.forEach(({ sel, parentSel, parentClass }) => {
    document.querySelectorAll(sel).forEach(img => {
      const parent = parentSel ? img.closest(parentSel) : img.parentElement;
      if (!parent) return;

      const hasSrc = !!img.getAttribute('src');
      parent.classList.toggle(parentClass, hasSrc);

      // Si el img falla al cargar, volver al fallback
      img.addEventListener('error', () => {
        parent.classList.remove(parentClass);
      }, { once: true });
    });
  });
}
refreshLogoPlaceholders();
// Exponer para que el cliente pueda refrescar tras inyectar logos dinámicamente
window.refreshLogoPlaceholders = refreshLogoPlaceholders;


/* ── PHONE CODE "OTRO" ────────────────── */
/* Cuando se selecciona "Otro" en el código de país, aparece un input manual */
document.querySelectorAll('.phone-wrap').forEach(wrap => {
  const select = wrap.querySelector('.phone-code');
  const manual = wrap.querySelector('.phone-code-manual');
  if (!select || !manual) return;

  select.addEventListener('change', () => {
    if (select.value === 'other') {
      wrap.classList.add('manual-on');
      manual.focus();
    } else {
      wrap.classList.remove('manual-on');
      manual.value = '';
    }
  });
});


/* ── VISITOR TABS ─────────────────────── */
document.querySelectorAll('.vtab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.vtab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.vtab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const content = document.getElementById('tab-' + target);
    if (content) content.classList.add('active');
  });
});


/* ── STANDS PLANIMETRÍA ───────────────── */
(function buildStandsGrid() {
  const grid = document.getElementById('planiGrid');
  if (!grid) return;

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = 8;
  const reserved = new Set(['A3','A7','B2','B5','C4','C8','D1','D6','E3','E7']);

  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'plani-row';

    const label = document.createElement('div');
    label.className = 'plani-row-label';
    label.textContent = row;
    rowEl.appendChild(label);

    for (let c = 1; c <= cols; c++) {
      const id = row + c;
      const cell = document.createElement('div');
      cell.className = 'plani-cell ' + (reserved.has(id) ? 'reserved' : 'available');
      cell.dataset.stand = id;
      cell.textContent = id;

      if (!reserved.has(id)) {
        cell.addEventListener('click', () => selectStand(id));
      }
      rowEl.appendChild(cell);
    }
    grid.appendChild(rowEl);
  });
})();

let currentStand = null;

function selectStand(standId) {
  if (currentStand) {
    const prev = document.querySelector(`.plani-cell[data-stand="${currentStand}"]`);
    if (prev) prev.classList.remove('selected');
  }
  currentStand = standId;
  const cell = document.querySelector(`.plani-cell[data-stand="${standId}"]`);
  if (cell) cell.classList.add('selected');

  const display = document.getElementById('selectedStandValue');
  if (display) display.textContent = 'Stand ' + standId;

  const input = document.getElementById('standInput');
  if (input) input.value = standId;
}


/* ── FORM SUBMISSIONS ─────────────────── */
function handleForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const original = btn.textContent;

    btn.textContent = 'Enviando...';
    btn.disabled = true;
    btn.style.opacity = '.7';

    setTimeout(() => {
      btn.textContent = '✓ Enviado con éxito';
      btn.style.background = 'var(--c3)';
      btn.style.color = '#0A1512';

      setTimeout(() => {
        form.reset();
        // Reset también del manual phone code
        form.querySelectorAll('.phone-wrap').forEach(w => w.classList.remove('manual-on'));
        btn.textContent = original;
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.background = '';
        btn.style.color = '';

        if (formId === 'standsForm') {
          currentStand = null;
          document.querySelectorAll('.plani-cell.selected').forEach(c => c.classList.remove('selected'));
          const display = document.getElementById('selectedStandValue');
          if (display) display.textContent = 'Ninguno';
          const input = document.getElementById('standInput');
          if (input) input.value = '';
        }
      }, 3000);
    }, 1200);
  });
}

handleForm('participateForm');
handleForm('visitorForm');
handleForm('prensaForm');
handleForm('contactForm');
handleForm('standsForm');


/* ── SMOOTH ANCHOR SCROLL ─────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 76;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth'
    });
  });
});


/* ── ACTIVE NAV LINK ──────────────────── */
const sections  = document.querySelectorAll('section[id], div[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  },
  { threshold: 0.4 }
);
sections.forEach(s => activeObserver.observe(s));


/* ── HERO INITIAL REVEAL ──────────────── */
document.querySelectorAll('.hero .reveal').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.12) + 's';
  requestAnimationFrame(() => el.classList.add('visible'));
});


/* ── LOAD MEDIA PREVIEW IMAGES ────────── */
/* Carga automáticamente la imagen de portada (og:image) de cada link de cobertura mediática.
   Si falla la carga, mantiene el SVG original como respaldo. */
document.querySelectorAll('.mc-icon[data-url]').forEach(iconDiv => {
  const url = iconDiv.getAttribute('data-url');
  if (!url) return;

  fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
    .then(response => response.json())
    .then(data => {
      // Buscar la imagen en diferentes posibles ubicaciones del JSON de respuesta
      const imageUrl = data.data?.image?.url || 
                       data.data?.image || 
                       data.image?.url ||
                       null;
      
      if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Portada del artículo';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.display = 'block';
        
        // Si la imagen falla al cargar, mantiene el SVG original
        img.onerror = () => {
          img.remove();
        };
        
        // Limpia el contenido anterior y agrega la imagen
        iconDiv.innerHTML = '';
        iconDiv.appendChild(img);
      }
    })
    .catch(error => {
      // Si la API falla, mantiene el SVG original
      console.log('No se pudo cargar la imagen para:', url);
    });
});
