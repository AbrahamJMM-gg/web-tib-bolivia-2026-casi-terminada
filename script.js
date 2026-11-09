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


/* ── SPONSORS MARQUEE ──────────────────
   Duplica automáticamente el grupo de logos para que el carrusel pueda
   reiniciar en continuidad, sin el salto visible del final al principio. */
(function initSponsorsMarquee() {
  const scroll = document.getElementById('sponsorsScroll');
  if (!scroll || !scroll.children.length) return;

  const firstGroup = document.createElement('div');
  firstGroup.className = 'sponsors-group';

  Array.from(scroll.children).forEach(item => firstGroup.appendChild(item));
  const secondGroup = firstGroup.cloneNode(true);
  secondGroup.setAttribute('aria-hidden', 'true');

  scroll.append(firstGroup, secondGroup);

  const track = scroll.parentElement;
  const previousButton = track?.querySelector('.sponsors-arrow-left');
  const nextButton = track?.querySelector('.sponsors-arrow-right');
  if (!track || !previousButton || !nextButton) return;

  let offset = 0;
  let manualMode = false;
  let resetAfterTransition = false;

  function setOffset(value, animate = true) {
    scroll.style.transition = animate ? 'transform .45s ease' : 'none';
    offset = value;
    scroll.style.setProperty('--sponsors-offset', `${offset}px`);
  }

  function enterManualMode() {
    if (manualMode) return;

    const transform = getComputedStyle(scroll).transform;
    const currentX = transform !== 'none' ? new DOMMatrix(transform).m41 : 0;
    const groupWidth = firstGroup.getBoundingClientRect().width;
    offset = groupWidth ? ((-currentX % groupWidth) + groupWidth) % groupWidth : 0;
    manualMode = true;
    scroll.classList.add('manual');
    setOffset(offset, false);
  }

  function move(direction) {
    enterManualMode();
    const groupWidth = firstGroup.getBoundingClientRect().width;
    const step = track.clientWidth * 0.8;

    if (direction > 0 && offset + step >= groupWidth) {
      resetAfterTransition = true;
      setOffset(groupWidth);
      return;
    }

    if (direction < 0 && offset - step < 0) {
      setOffset(offset + groupWidth, false);
      setOffset(offset + groupWidth - step);
      return;
    }

    setOffset(offset + direction * step);
  }

  scroll.addEventListener('transitionend', event => {
    if (event.propertyName !== 'transform' || !resetAfterTransition) return;
    resetAfterTransition = false;
    setOffset(0, false);
  });

  previousButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
})();


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


/* ── CONTACTO: SELECTOR DE FORMULARIO ─── */
/* El menú de pestañas muestra un solo formulario a la vez. Cada botón
   .ctab tiene data-cform que corresponde al id del panel (#cform-<valor>). */
document.querySelectorAll('.ctab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.cform;
    document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cform-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('cform-' + target);
    if (panel) panel.classList.add('active');
  });
});


/* ── CONTACTO: enrutar cualquier botón con data-cform ───
   Cualquier elemento con data-cform="prensa|inscripcion|general" (botones
   "Información y Participa", "Contáctanos", el menú "Infórmate", etc.)
   activa automáticamente la pestaña correspondiente dentro de #contacto
   antes de que el scroll suave lo lleve a la sección. Así, sin importar
   desde qué parte de la web se llegue, el usuario ya ve el formulario
   correcto abierto. */
function activateContactTab(cformTarget) {
  if (!cformTarget) return;
  const tabBtn = document.querySelector(`.ctab[data-cform="${cformTarget}"]`);
  if (tabBtn) tabBtn.click();
}

document.querySelectorAll('[data-cform]').forEach(el => {
  el.addEventListener('click', () => activateContactTab(el.dataset.cform));
});


/* ── MENÚ "INFÓRMATE" (desktop + mobile) ─
   Cada pregunta de .informate-q enruta a un ancla. La activación de la
   pestaña de #contacto (si trae data-cform) la maneja el listener
   genérico de arriba; aquí solo se cierra el desplegable/menú móvil. */
function initInformateToggle(wrapId, btnId) {
  const wrap = document.getElementById(wrapId);
  const btn = document.getElementById(btnId);
  if (!wrap || !btn) return;

  function close() {
    wrap.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrap.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (wrap.classList.contains('open') && !wrap.contains(e.target)) close();
  });

  wrap.querySelectorAll('.informate-q').forEach(link => {
    link.addEventListener('click', () => {
      close();
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}
initInformateToggle('navInformate', 'informateBtn');
initInformateToggle('mobileInformate', 'mobileInformateToggle');


/* ── STANDS PLANIMETRÍA ───────────────── */
const PLANI_CONFIGS = {
      /*En esta parde de reserved marcar los stands que ya están reservados 
          Ej: casa: { label: 'Casa Goitia', total: 43, reserved: ['CASA-01'] 
          Ej: patio: { label: 'Patio/Plaza', total: 25, reserved: ['PATIO-01']
          Ej: torres: { label: 'Salon Torres Mall', total: 31, reserved: ['TORRES-01'] */
  casa: { label: 'Casa Goitia', total: 43, reserved: ['',''] },
  patio: { label: 'Patio/Plaza', total: 25, reserved: ['',''] },
  torres: { label: 'Salon Torres Mall', total: 31, reserved: ['',''] }
};

let currentStand = null;

function selectStand(blockId, standId) {
  if (currentStand) {
    const previous = document.querySelector(
      `.plani-cell[data-stand="${currentStand.standId}"][data-block="${currentStand.blockId}"]`
    );
    if (previous) previous.classList.remove('selected');
  }

  currentStand = { blockId, standId };
  const cell = document.querySelector(
    `.plani-cell[data-stand="${standId}"][data-block="${blockId}"]`
  );
  if (cell) cell.classList.add('selected');

  const block = PLANI_CONFIGS[blockId];
  const display = document.getElementById('selectedStandValue');
  if (display) display.textContent = `${block.label} · Stand ${standId}`;

  const input = document.getElementById('standInput');
  if (input) input.value = `${block.label} · ${standId}`;
}

function buildStandsGrid(grid, blockId, config) {
  const columns = 8;
  const reserved = new Set(config.reserved);
  const rows = Math.ceil(config.total / columns);

  for (let row = 0; row < rows; row++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'plani-row';

    const label = document.createElement('div');
    label.className = 'plani-row-label';
    label.textContent = row + 1;
    rowEl.appendChild(label);

    for (let column = 1; column <= columns; column++) {
      const number = row * columns + column;
      if (number > config.total) break;

      const standId = `${blockId.toUpperCase()}-${String(number).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'plani-cell ' + (reserved.has(standId) ? 'reserved' : 'available');
      cell.dataset.block = blockId;
      cell.dataset.stand = standId;
      cell.textContent = String(number).padStart(2, '0');

      if (!reserved.has(standId)) {
        cell.addEventListener('click', () => selectStand(blockId, standId));
      }
      rowEl.appendChild(cell);
    }
    grid.appendChild(rowEl);
  }
}

document.querySelectorAll('.plani-grid[data-plani]').forEach(grid => {
  const blockId = grid.dataset.plani;
  const config = PLANI_CONFIGS[blockId];
  if (config) buildStandsGrid(grid, blockId, config);
});


/* ── FORM SUBMISSIONS → WHATSAPP ───────
   No hay backend ni base de datos: cada formulario arma un mensaje de
   WhatsApp con los datos ingresados y redirige al usuario a
   api.whatsapp.com con el texto ya escrito.
   Para cambiar el número que recibe los mensajes, editar WHATSAPP_NUMBER. */
const WHATSAPP_NUMBER = '59163162160';

const FORM_CONFIGS = {
  standsForm: {
    title: 'Solicitud de Stand — TIB Bolivia 2026',
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'apellido', label: 'Apellido' },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Teléfono' },
      { name: 'empresa', label: 'Empresa' },
      { name: 'tipoStand', label: 'Tipo de stand' },
      { name: 'stand', label: 'Stand seleccionado' },
      { name: 'comentarios', label: 'Comentarios' }
    ]
  },
  contactForm: {
    title: 'Consulta General — TIB Bolivia 2026',
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'apellido', label: 'Apellido' },
      { name: 'email', label: 'Email' },
      { name: 'asunto', label: 'Asunto' },
      { name: 'phone', label: 'Teléfono' },
      { name: 'empresa', label: 'Empresa' },
      { name: 'sector', label: 'Sector' },
      { name: 'sponsor', label: 'Interesado en ser Sponsor', type: 'checkbox' },
      { name: 'adquiereStand', label: 'Interesado en adquirir un Stand', type: 'checkbox' },
      { name: 'anadirConsulta', label: 'Desea añadir una consulta adicional', type: 'checkbox' },
      { name: 'mensaje', label: 'Mensaje' }
    ]
  },
  participateForm: {
    title: 'Solicitud de Inscripción (Empresa) — TIB Bolivia 2026',
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'apellido', label: 'Apellido' },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Teléfono' },
      { name: 'empresa', label: 'Empresa' },
      { name: 'sector', label: 'Sector' },
      { name: 'mensaje', label: 'Mensaje' }
    ]
  },
  prensaForm: {
    title: 'Acreditación de Prensa — TIB Bolivia 2026',
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'apellido', label: 'Apellido' },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Teléfono' },
      { name: 'medio', label: 'Medio de comunicación' }
    ]
  }
};

// Une código de país + número móvil de un .phone-wrap dentro del formulario
function getPhoneValue(form) {
  const wrap = form.querySelector('.phone-wrap');
  if (!wrap) return '';
  const select = wrap.querySelector('.phone-code');
  const manual = wrap.querySelector('.phone-code-manual');
  const tel = wrap.querySelector('input[type="tel"]');
  const code = select && select.value === 'other'
    ? (manual ? manual.value.trim() : '')
    : (select ? select.value : '');
  const number = tel ? tel.value.trim() : '';
  return [code, number].filter(Boolean).join(' ');
}

function buildWhatsAppMessage(title, form, fields) {
  const lines = [`*${title}*`, ''];
  fields.forEach(({ name, label, type }) => {
    if (name === 'phone') {
      const val = getPhoneValue(form);
      if (val) lines.push(`*${label}:* ${val}`);
      return;
    }
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return;
    if (type === 'checkbox') {
      if (el.checked) lines.push(`• ${label}`);
      return;
    }
    const val = (el.value || '').trim();
    if (val) lines.push(`*${label}:* ${val}`);
  });
  return lines.join('\n');
}

function handleForm(formId) {
  const form = document.getElementById(formId);
  const config = FORM_CONFIGS[formId];
  if (!form || !config) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const message = buildWhatsAppMessage(config.title, form, config.fields);
    const waLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

    const btn = form.querySelector('.btn-submit');
    const original = btn ? btn.textContent : '';
    if (btn) {
      btn.textContent = 'Abriendo WhatsApp...';
      btn.disabled = true;
    }

    // Se abre en una pestaña nueva para no sacar al usuario de la página
    window.open(waLink, '_blank', 'noopener');

    if (btn) {
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1500);
    }
  });
}

handleForm('participateForm');
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

    // Si el destino está dentro de una subpestaña de Actividades (#etab-feria o #etab-eventos),
    // asegurarse de que esa subpestaña esté activa antes de calcular la posición de scroll
    const parentPanel = target.closest('.etab-panel');
    if (parentPanel && window.activateEventsTab) {
      const panelId = parentPanel.id.replace('etab-', '');
      window.activateEventsTab(panelId);
    }

    // Pequeño timeout para permitir que el display:block calcule la altura real si el panel estaba oculto
    setTimeout(() => {
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 76;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset - 10,
        behavior: 'smooth'
      });
    }, 50);
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


/* ═══════════════════════════════════════════════════════════════
   FASE 1 — SUBPESTAÑAS: EVENTOS TIB / FERIA TIB
   ───────────────────────────────────────────────────────────────
   Controla el sistema de dos subpestañas dentro de #actividades.

   Comportamiento:
   · Al hacer clic en un botón .etab, se activa el panel .etab-panel
     correspondiente y se desactiva el otro.
   · El botón activo recibe la clase .active y aria-selected="true".
   · Los paneles inactivos tienen display:none (definido en CSS).
   · La pestaña activa por defecto al cargar es "EVENTOS TIB".
   · Si se llega a la sección con un hash como #actividades?tab=feria
     se podría extender en el futuro (preparado con data-etab).

   Para agregar más pestañas en el futuro: añadir un botón .etab con
   data-etab="[nombre]" y un panel .etab-panel con id="etab-[nombre]".
═══════════════════════════════════════════════════════════════ */
(function initEventsTabs() {
  /* Seleccionar todos los botones de pestaña dentro de #actividades */
  const tabs   = document.querySelectorAll('#actividades .etab');
  const panels = document.querySelectorAll('#actividades .etab-panel');

  if (!tabs.length || !panels.length) return; // Salir si la sección no existe

  /**
   * Activa la pestaña que coincide con targetId y oculta el resto.
   * @param {string} targetId — valor de data-etab del botón clickeado
   */
  function activateTab(targetId) {
    /* Actualizar botones */
    tabs.forEach(btn => {
      const isActive = btn.dataset.etab === targetId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    /* Actualizar paneles */
    panels.forEach(panel => {
      /* El id del panel sigue el patrón "etab-[nombre]" */
      const isActive = panel.id === 'etab-' + targetId;
      panel.classList.toggle('active', isActive);

      /* Re-disparar las animaciones .reveal dentro del panel
         para que el IntersectionObserver las detecte al hacerse visible */
      if (isActive) {
        panel.querySelectorAll('.reveal:not(.visible)').forEach(el => {
          revealObserver.observe(el);
        });
      }
    });
  }

  /* Listener de clic para cada botón de pestaña */
  tabs.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.etab));
  });

  /* Estado inicial: activar la primera pestaña (EVENTOS TIB) */
  const firstTab = tabs[0];
  if (firstTab) activateTab(firstTab.dataset.etab);

  /* Exponer globalmente para navegación desde anclas internas */
  window.activateEventsTab = activateTab;
})();
/* ═══ FIN FASE 1 ═════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════
   FASE 4 — LIGHTBOX / VISOR DE FOTOGRAFÍAS SUPERPUESTO
   ───────────────────────────────────────────────────────────────
   Controla la apertura y navegación del visor de fotos superpuesto.
   Permite al usuario examinar el material fotográfico de cada evento
   directamente en la misma página, sin abrir nuevas pestañas.
═══════════════════════════════════════════════════════════════ */
(function initTibLightbox() {
  const modal       = document.getElementById('tibLightbox');
  if (!modal) return;

  const imgEl       = document.getElementById('lightboxImg');
  const phEl        = document.getElementById('lightboxPlaceholder');
  const titleEl     = document.getElementById('lightboxTitle');
  const captionEl   = document.getElementById('lightboxCaption');
  const eventTitleEl= document.getElementById('lightboxEventTitle');
  const counterEl   = document.getElementById('lightboxCounter');
  const prevBtn     = document.getElementById('lightboxPrev');
  const nextBtn     = document.getElementById('lightboxNext');

  let currentGallery = [];
  let currentIndex   = 0;
  let currentEventName = 'Actividad TIB Bolivia';

  // Configuración de galerías según los eventos del documento
  const GALLERY_CONFIGS = {
    cabina: {
      title: 'Inauguración de la primera cabina de Revista Turística',
      caption: 'Espacio informativo y de difusión del potencial turístico nacional en Torres Mall.',
      count: 4,
      images: [] // Colocar aquí las URLs de fotos cuando estén disponibles
    },
    embajadora: {
      title: 'Elección de la Embajadora del Turismo TIB Bolivia 2026',
      caption: 'Gala final y coronación de Evelyn Aguirre como Embajadora del Turismo 2026.',
      count: 4,
      images: []
    },
    foro: {
      title: 'Primer Foro Internacional de Turismo',
      caption: 'Exposición y análisis: “Bolivia Inteligente y Sostenible” con Felipe Vera Omar Soto.',
      count: 4,
      images: []
    },
    taller: {
      title: 'Taller “Mejores ciudades, mejor Bolivia”',
      caption: 'Espacio de formación y desarrollo urbano sostenible orientado al turismo.',
      count: 3,
      images: []
    },
    lanzamiento: {
      title: 'Lanzamiento Oficial de TIB Bolivia 2026',
      caption: 'Acto solemne y firma del pergamino simbólico de la segunda versión en Torres Mall.',
      count: 3,
      images: []
    },
    'dia-23': {
      title: 'Feria Internacional de Negocios · 23 de Octubre',
      caption: 'Recorrido por los stands, empresas participantes y networking comercial.',
      count: 4,
      images: []
    },
    illari: {
      title: 'Primer Festival Gastronómico Internacional ILLARI',
      caption: 'Degustación culinaria, productores y empresas gastronómicas en Casa Goitia.',
      count: 4,
      images: []
    }
  };

  function updateView() {
    const config = GALLERY_CONFIGS[currentGallery] || {
      title: currentEventName,
      caption: 'Registro fotográfico institucional de TIB Bolivia.',
      count: 4,
      images: []
    };

    const total = config.images && config.images.length > 0 ? config.images.length : config.count;
    counterEl.textContent = `${currentIndex + 1} / ${total}`;
    eventTitleEl.textContent = config.title;

    if (config.images && config.images[currentIndex]) {
      imgEl.src = config.images[currentIndex];
      imgEl.alt = `${config.title} - Imagen ${currentIndex + 1}`;
      imgEl.classList.add('has-img');
      phEl.style.display = 'none';
    } else {
      imgEl.classList.remove('has-img');
      imgEl.src = '';
      phEl.style.display = 'flex';
      titleEl.textContent = `${config.title} · Foto ${currentIndex + 1}`;
      captionEl.textContent = config.caption;
    }
  }

  function openLightbox(galleryKey, initialIndex = 0, eventName = '') {
    currentGallery = galleryKey || 'general';
    currentIndex   = initialIndex;
    currentEventName = eventName || 'TIB Bolivia 2026';
    updateView();

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function prevPhoto() {
    const config = GALLERY_CONFIGS[currentGallery] || { count: 4, images: [] };
    const total = config.images && config.images.length > 0 ? config.images.length : config.count;
    currentIndex = (currentIndex - 1 + total) % total;
    updateView();
  }

  function nextPhoto() {
    const config = GALLERY_CONFIGS[currentGallery] || { count: 4, images: [] };
    const total = config.images && config.images.length > 0 ? config.images.length : config.count;
    currentIndex = (currentIndex + 1) % total;
    updateView();
  }

  // Cierre con click en backdrop o botón cerrar
  modal.querySelectorAll('[data-lightbox-close]').forEach(btn => {
    btn.addEventListener('click', closeLightbox);
  });

  // Flechas de navegación
  if (prevBtn) prevBtn.addEventListener('click', prevPhoto);
  if (nextBtn) nextBtn.addEventListener('click', nextPhoto);

  // Navegación con teclado
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
  });

  // Delegación de eventos para botones "Ver galería"
  document.querySelectorAll('.btn-event-gallery[data-gallery]').forEach(btn => {
    btn.addEventListener('click', () => {
      const galleryKey = btn.dataset.gallery;
      const card = btn.closest('.event-card, .prior-launch-card, .day-two-wrap, .illari-block, .clausura-block');
      const title = card ? (card.querySelector('.event-title, .prior-launch-title, .day-two-subtitle, .day-three-h')?.textContent || '') : '';
      openLightbox(galleryKey, 0, title);
    });
  });

  // Delegación de eventos para miniaturas individuales
  document.querySelectorAll('.event-thumbs-grid .thumb-placeholder').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const parentWrap = thumb.closest('.event-card, .prior-launch-card, .day-two-wrap, .illari-block, .clausura-block');
      const galleryBtn = parentWrap ? parentWrap.querySelector('.btn-event-gallery[data-gallery]') : null;
      const galleryKey = galleryBtn ? galleryBtn.dataset.gallery : 'general';
      const siblings = Array.from(thumb.parentElement.children);
      const index = siblings.indexOf(thumb);
      const title = parentWrap ? (parentWrap.querySelector('.event-title, .prior-launch-title, .day-two-subtitle, .day-three-h')?.textContent || '') : '';
      openLightbox(galleryKey, Math.max(0, index), title);
    });
  });

  // Exponer API global por si se requiere invocar programáticamente
  window.openTibLightbox = openLightbox;
  window.closeTibLightbox = closeLightbox;
})();
/* ═══ FIN FASE 4 ═════════════════════════════════════════════════ */
