/* ─── AUTOZENT — APP.JS ─── */

// ─── NAV ───
(function initNav() {
  const nav = document.querySelector('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    nav && nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Hamburger
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Close on link click (mobile)
  navLinks && navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // Active page
  const page = location.pathname.split('/').pop() || 'index.html';
  navLinks && navLinks.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ─── LANG SWITCHER ───
(function initLang() {
  const saved = localStorage.getItem('az_lang') || 'fr';
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });
  // Apply after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyLang(saved));
  } else {
    applyLang(saved);
  }
})();

// ─── SCROLL REVEAL ───
(function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
})();

// ─── AUTH (localStorage-based, team only) ───
const AUTH = {
  // Team members: { username (prenom), password }
  // Ton ami peut modifier cette liste
  MEMBERS: [
    { name: 'Admin',   pass: 'autozent2025', role: 'admin' },
    { name: 'Ankil',   pass: 'ankil123', role: 'tech' },
    { name: 'Karim',   pass: 'karim123', role: 'tech' },
    { name: 'Youssef', pass: 'youssef123', role: 'tech' },
    { name: 'Ahmed',   pass: 'ahmed123', role: 'tech' },
  ],

  login(name, pass) {
    const member = this.MEMBERS.find(m => m.name.toLowerCase() === name.trim().toLowerCase() && m.pass === pass);
    if (member) {
      localStorage.setItem('az_user', JSON.stringify({ name: member.name, ts: Date.now(), role: member.role }));
      return member;
    }
    return null;
  },

  logout() {
    localStorage.removeItem('az_user');
  },

  getUser() {
    const raw = localStorage.getItem('az_user');
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      // Session expires after 8 hours
      if (Date.now() - u.ts > 8 * 60 * 60 * 1000) { this.logout(); return null; }
      return u;
    } catch { return null; }
  },

  isLoggedIn() { return !!this.getUser(); }
};

// ─── DATA HELPERS ───
const DB = {
  // RDVs
  getRdvs() { return JSON.parse(localStorage.getItem('az_rdvs') || '[]'); },
  saveRdvs(list) { localStorage.setItem('az_rdvs', JSON.stringify(list)); },
  addRdv(rdv) {
    const list = this.getRdvs();
    rdv.id = Date.now();
    list.push(rdv);
    this.saveRdvs(list);
    return rdv;
  },
  deleteRdv(id) {
    this.saveRdvs(this.getRdvs().filter(r => r.id !== id));
  },

  // Réalisations
  getReals() { return JSON.parse(localStorage.getItem('az_reals') || '[]'); },
  saveReals(list) { localStorage.setItem('az_reals', JSON.stringify(list)); },
  addReal(real) {
    const list = this.getReals();
    real.id = Date.now();
    list.push(real);
    this.saveReals(list);
    return real;
  },
  deleteReal(id) {
    this.saveReals(this.getReals().filter(r => r.id !== id));
  },

  // Avis
  getAvis() { return JSON.parse(localStorage.getItem('az_avis') || '[]'); },
  saveAvis(list) { localStorage.setItem('az_avis', JSON.stringify(list)); },
  addAvis(avis) {
    const list = this.getAvis();
    avis.id = Date.now();
    list.push(avis);
    this.saveAvis(list);
    return avis;
  },
};

// ─── MODAL HELPERS ───
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ─── IMAGE → BASE64 HELPER ───
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

// ─── TOAST NOTIFICATION ───
function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;padding:.85rem 1.4rem;border-radius:10px;font-family:'Outfit',sans-serif;font-size:.9rem;font-weight:500;color:#fff;background:${type==='ok'?'#059669':'#DC2626'};box-shadow:0 6px 24px rgba(0,0,0,.18);animation:fadeUp .4s ease both;max-width:320px;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ─── DATE UTILS ───
function padZ(n) { return String(n).padStart(2, '0'); }
function dateToStr(d) { return `${d.getFullYear()}-${padZ(d.getMonth()+1)}-${padZ(d.getDate())}`; }
function todayStr() { return dateToStr(new Date()); }

/* ════════════════════════════════════════
   OVERRIDE LOGIN — Essaye Django d'abord,
   retombe sur les comptes locaux si offline
════════════════════════════════════════ */
AUTH._originalLogin = AUTH.login.bind(AUTH);
AUTH.login = async function(name, pass) { 
  // 1. Essayer Django
  try {
    const djangoUser = await tryDjangoLogin(name, pass);
    if (djangoUser) { /*Lorque je vais connecté le front au backend, je vais devoir supprimé le code a partir de là jursqua return*/
      const member = AUTH.MEMBERS.find(m => m.name.toLowerCase() === djangoUser.name.toLowerCase());
      const role = member?.role || djangoUser.role || 'tech';
      localStorage.setItem('az_user', JSON.stringify({
        name: djangoUser.name,
        role: role,
        djangoId: djangoUser.djangoId,
        ts: Date.now(),
        useDjango: true
      }));
      return { name: djangoUser.name, role };
    }
  } catch(e) { /* backend offline */ }
  // 2. Fallback local
  return this._originalLogin(name, pass);
};

/* ════════════════════════════════════════
   RDV PUBLIC → envoie au backend Django si disponible
   Sinon stocke en localStorage
════════════════════════════════════════ */
async function submitRdvPublic(data) {
  try {
    const ok = await API.createRdvPublic(data);
    if (ok) return { ok: true, source: 'django' };
  } catch(e) { /* offline */ }
  // Fallback local
  DB.addRdv({ ...data, technicien: 'Non assigné', heure: '09:00' });
  return { ok: true, source: 'local' };
}

/* ════════════════════════════════════════
   RÉALISATIONS → charge depuis Django si dispo
════════════════════════════════════════ */
async function loadRealisations(service = '') {
  try {
    const data = await API.getRealisations(service);
    if (data && (data.results || Array.isArray(data))) {
      return Array.isArray(data) ? data : data.results;
    }
  } catch(e) { /* offline */ }
  // Fallback local
  return DB.getReals();
}
