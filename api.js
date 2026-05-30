/* ─── AUTOZENT — API.JS ───
   Connexion au backend Django.
   En développement : API_BASE pointe vers localhost:8000
   En production   : changer API_BASE vers l'URL Railway
─────────────────────────────── */

const API_BASE = 'http://localhost:8000/api';
// ↑ PRODUCTION : remplacer par 'https://votre-app.railway.app/api'

/* ── HELPERS ── */
function getToken()  { return localStorage.getItem('az_jwt_access');  }
function getRefresh(){ return localStorage.getItem('az_jwt_refresh'); }
function setTokens(access, refresh) {
  localStorage.setItem('az_jwt_access',  access);
  localStorage.setItem('az_jwt_refresh', refresh);
}
function clearTokens() {
  localStorage.removeItem('az_jwt_access');
  localStorage.removeItem('az_jwt_refresh');
  localStorage.removeItem('az_user_data');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // Ne pas forcer Content-Type pour FormData
  if (options.body instanceof FormData) delete headers['Content-Type'];

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Token expiré → refresh automatique
  if (res.status === 401 && getRefresh()) {
    const refreshed = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: getRefresh() })
    });
    if (refreshed.ok) {
      const data = await refreshed.json();
      setTokens(data.access, getRefresh());
      headers['Authorization'] = `Bearer ${data.access}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = 'agenda.html';
      return null;
    }
  }
  return res;
}

/* ════════════════════════════════════════
   AUTH
════════════════════════════════════════ */
const API = {

  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) return null;
    const data = await res.json();
    setTokens(data.access, data.refresh);
    localStorage.setItem('az_user_data', JSON.stringify(data.user));
    return data.user;
  },

  async logout() {
    const refresh = getRefresh();
    if (refresh) {
      await apiFetch('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh })
      });
    }
    clearTokens();
  },

  getUser() {
    const raw = localStorage.getItem('az_user_data');
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn() { return !!getToken() && !!this.getUser(); },

  /* ── USERS (admin) ── */
  async getEquipe()    { const r = await apiFetch('/users/equipe/'); return r?.ok ? r.json() : []; },
  async getUsers()     { const r = await apiFetch('/users/');        return r?.ok ? r.json() : []; },
  async createUser(data) {
    const r = await apiFetch('/users/', { method:'POST', body: JSON.stringify(data) });
    return r?.ok ? r.json() : null;
  },
  async toggleActive(id)    { const r = await apiFetch(`/users/${id}/toggle_active/`,  { method:'POST' }); return r?.ok ? r.json() : null; },
  async resetPassword(id, newPass) {
    const r = await apiFetch(`/users/${id}/reset_password/`, {
      method:'POST', body: JSON.stringify({ new_password: newPass })
    });
    return r?.ok ? r.json() : null;
  },

  /* ── RDV ── */
  async createRdvPublic(data) {
    const r = await fetch(`${API_BASE}/rdv/public/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.ok;
  },

  async getRdvs(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const r = await apiFetch(`/rdv/${qs ? '?'+qs : ''}`);
    return r?.ok ? r.json() : { results: [] };
  },

  async getRdvSemaine(offset = 0) {
    const r = await apiFetch(`/rdv/semaine/?offset=${offset}`);
    return r?.ok ? r.json() : [];
  },

  async getRdvInbox() {
    const r = await apiFetch('/rdv/inbox/');
    return r?.ok ? r.json() : [];
  },

  async createRdv(data) {
    const r = await apiFetch('/rdv/', { method:'POST', body: JSON.stringify(data) });
    return r?.ok ? r.json() : null;
  },

  async updateRdv(id, data) {
    const r = await apiFetch(`/rdv/${id}/`, { method:'PATCH', body: JSON.stringify(data) });
    return r?.ok ? r.json() : null;
  },

  async deleteRdv(id) {
    const r = await apiFetch(`/rdv/${id}/`, { method:'DELETE' });
    return r?.status === 204;
  },

  async assignerRdv(id, techId, dateConfirmee, heure) {
    const r = await apiFetch(`/rdv/${id}/assigner/`, {
      method: 'POST',
      body: JSON.stringify({ technicien_id: techId, date_confirmee: dateConfirmee, heure })
    });
    return r?.ok ? r.json() : null;
  },

  /* ── RÉALISATIONS ── */
  async getRealisations(service = '') {
    const qs = service ? `?service=${service}` : '';
    const r = await fetch(`${API_BASE}/realisations/${qs}`);
    return r.ok ? r.json() : { results: [] };
  },

  async createRealisation(formData) {
    // formData = FormData avec photo_avant, photo_apres, etc.
    const r = await apiFetch('/realisations/', { method:'POST', body: formData });
    return r?.ok ? r.json() : null;
  },

  async deleteRealisation(id) {
    const r = await apiFetch(`/realisations/${id}/`, { method:'DELETE' });
    return r?.status === 204;
  },

  async togglePubRealisation(id) {
    const r = await apiFetch(`/realisations/${id}/toggle_publie/`, { method:'POST' });
    return r?.ok ? r.json() : null;
  },

  async addAvis(realisationId, data) {
    const r = await fetch(`${API_BASE}/realisations/${realisationId}/avis/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.ok ? r.json() : null;
  },

  /* ── FORMATIONS ── */
  async getFormations() {
    const r = await fetch(`${API_BASE}/formations/`);
    return r.ok ? r.json() : { results: [] };
  },

  async getSessions() {
    const r = await fetch(`${API_BASE}/sessions/`);
    return r.ok ? r.json() : { results: [] };
  },

  async inscrireFormation(sessionId, data) {
    const r = await fetch(`${API_BASE}/sessions/${sessionId}/inscrire/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.ok;
  },
};

/* ════════════════════════════════════════
   OVERRIDE AUTH dans app.js
   Si le backend Django est dispo, on utilise API.login
   Sinon on retombe sur le système localStorage
════════════════════════════════════════ */
async function tryDjangoLogin(nom, pass) {
  try {
    const user = await API.login(nom, pass);
    if (user) return { name: user.first_name || user.username, role: user.role, djangoId: user.id };
    return null;
  } catch(e) {
    // Backend non disponible → fallback sur AUTH local
    return null;
  }
}
