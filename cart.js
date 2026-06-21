/* ─── AUTOZENT — CART.JS ───
   Panier + Checkout complet — fonctionne sur TOUTES les pages.
   Ajouter <script src="cart.js"></script> avant </body>.
────────────────────────────────────────────────────────── */

const CART_INSTALL_PRICE = 170;
const CART_PAYPAL_CLIENT_ID = 'Abqu6FdE3XYNkDDW-SvqOcNVitZBPRFMX7amxS02Ol-LpMGRgJ4X_JYDPvouN5Hjf2V5jr-avclGuIak'; // ← remplacer

// ══════════════════════════════════════════════
// INJECTION HTML (drawer + modal paiement)
// ══════════════════════════════════════════════
(function injectHTML() {
  if (document.getElementById('cartDrawer')) return;

  document.body.insertAdjacentHTML('beforeend', `
  <!-- OVERLAY PANIER -->
  <div id="cartOverlayGlobal" onclick="cartClose()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1800;backdrop-filter:blur(2px);transition:opacity .3s;"></div>

  <!-- DRAWER PANIER -->
  <div id="cartDrawer" style="position:fixed;top:0;right:-440px;width:420px;max-width:100vw;height:100vh;background:#fff;z-index:1900;display:flex;flex-direction:column;box-shadow:-8px 0 32px rgba(0,0,0,.15);transition:right .35s cubic-bezier(.22,.68,0,1.2);">
    <div style="padding:1.4rem 1.6rem;border-bottom:1px solid #EFEFED;display:flex;align-items:center;justify-content:space-between;">
      <div style="font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800;">🛒 Mon panier</div>
      <div style="display:flex;gap:.6rem;align-items:center;">
        <button onclick="cartClear()" id="btnCartClear" style="background:none;border:1.5px solid #D8D6D0;color:#9A9891;padding:.3rem .8rem;border-radius:6px;font-size:.75rem;cursor:pointer;font-family:'Outfit',sans-serif;">Vider</button>
        <button onclick="cartClose()" style="background:#EFEFED;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;color:#5C5A55;">×</button>
      </div>
    </div>
    <div id="cartBodyGlobal" style="flex:1;overflow-y:auto;padding:1.2rem 1.6rem;"></div>
    <div id="cartFooterGlobal" style="display:none;padding:1.2rem 1.6rem;border-top:1px solid #EFEFED;background:#F8F7F5;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.9rem;">
        <div>
          <div id="cartItemCountGlobal" style="font-size:.85rem;color:#5C5A55;"></div>
          <div id="cartTotalGlobal" style="font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;color:#F4600C;"></div>
        </div>
        <div style="text-align:right;font-size:.72rem;color:#9A9891;">TVA incluse<br>Facture par email</div>
      </div>
      <button onclick="cartCheckout()" style="width:100%;background:#F4600C;color:#fff;border:none;padding:.9rem;border-radius:10px;font-weight:600;font-size:.92rem;cursor:pointer;font-family:'Outfit',sans-serif;">Passer au paiement →</button>
    </div>
  </div>

  <!-- MODAL PAIEMENT -->
  <div id="cartModalPay" style="display:none;position:fixed;inset:0;background:rgba(22,22,20,.55);backdrop-filter:blur(4px);z-index:2100;align-items:center;justify-content:center;padding:1.5rem;">
    <div style="background:#fff;border-radius:20px;padding:2rem;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.18);position:relative;">
      <button onclick="cartClosePayModal()" style="position:absolute;top:1rem;right:1rem;background:#EFEFED;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;color:#5C5A55;">×</button>

      <!-- CONTENU PAIEMENT -->
      <div id="cartPayContent">
        <h3 style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;margin-bottom:1.2rem;">Finaliser la commande</h3>

        <!-- RÉCAP -->
        <div id="cartPaySummary" style="background:#F8F7F5;border-radius:10px;padding:1rem;margin-bottom:1.2rem;max-height:160px;overflow-y:auto;"></div>

        <!-- INFOS CLIENT -->
        <div style="margin-bottom:.9rem;">
          <label style="font-size:.8rem;font-weight:600;color:#5C5A55;display:block;margin-bottom:.35rem;">Nom complet *</label>
          <input type="text" id="cartBuyerName" placeholder="Jean Dupont" style="width:100%;background:#F8F7F5;border:1.5px solid #EFEFED;color:#161614;padding:.7rem 1rem;border-radius:6px;font-size:.92rem;outline:none;font-family:'Outfit',sans-serif;">
        </div>
        <div style="margin-bottom:.9rem;">
          <label style="font-size:.8rem;font-weight:600;color:#5C5A55;display:block;margin-bottom:.35rem;">Email * (pour la facture)</label>
          <input type="email" id="cartBuyerEmail" placeholder="jean@email.com" style="width:100%;background:#F8F7F5;border:1.5px solid #EFEFED;color:#161614;padding:.7rem 1rem;border-radius:6px;font-size:.92rem;outline:none;font-family:'Outfit',sans-serif;">
        </div>
        <div style="margin-bottom:1.2rem;">
          <label style="font-size:.8rem;font-weight:600;color:#5C5A55;display:block;margin-bottom:.35rem;">Téléphone</label>
          <input type="tel" id="cartBuyerPhone" placeholder="06 12 34 56 78" style="width:100%;background:#F8F7F5;border:1.5px solid #EFEFED;color:#161614;padding:.7rem 1rem;border-radius:6px;font-size:.92rem;outline:none;font-family:'Outfit',sans-serif;">
        </div>

        <!-- TOTAL -->
        <div style="background:#FFF4EE;border:1px solid rgba(244,96,12,.2);border-radius:10px;padding:.9rem 1.2rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;">
          <span style="font-size:.85rem;color:#5C5A55;">Total TTC</span>
          <span id="cartPayTotal" style="font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;color:#F4600C;">0€</span>
        </div>

        <!-- PAYPAL -->
        <div id="cartPaypalContainer"></div>

        <!-- DIVIDER -->
        <div style="text-align:center;font-size:.75rem;color:#9A9891;margin:.8rem 0;position:relative;">
          <span style="background:#fff;padding:0 .8rem;position:relative;z-index:1;">ou payer par carte</span>
          <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:#EFEFED;z-index:0;"></div>
        </div>

        <!-- CARTE -->
        <button onclick="cartPayByCard()" style="width:100%;background:#191C1F;color:#fff;border:none;border-radius:10px;padding:.82rem;font-weight:600;font-size:.88rem;cursor:pointer;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;gap:.5rem;">💳 Payer par carte bancaire</button>
        <p style="text-align:center;font-size:.7rem;color:#9A9891;margin-top:.5rem;">🔒 Paiement sécurisé SSL</p>
      </div>

      <!-- SUCCÈS -->
      <div id="cartPaySuccess" style="display:none;text-align:center;padding:1.5rem 1rem;">
        <div style="font-size:3.5rem;margin-bottom:1rem;">✅</div>
        <h3 style="font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;margin-bottom:.4rem;">Commande confirmée !</h3>
        <p style="font-size:.88rem;color:#5C5A55;">Facture envoyée à <strong id="cartOrderEmail"></strong></p>
        <div id="cartOrderRef" style="font-family:'JetBrains Mono',monospace;background:#F8F7F5;border:1px solid #EFEFED;padding:.4rem 1rem;border-radius:6px;font-size:.78rem;display:inline-block;margin:.8rem 0;"></div>
        <p style="font-size:.82rem;color:#5C5A55;margin-top:.4rem;">On vous contacte sous <strong>24h</strong> pour l'installation ou la livraison.</p>
        <button onclick="cartClosePayModal();cartClear();" style="background:#F4600C;color:#fff;border:none;padding:.8rem 2rem;border-radius:10px;font-weight:600;cursor:pointer;margin-top:1.2rem;font-family:'Outfit',sans-serif;">Fermer</button>
      </div>
    </div>
  </div>

  <!-- MODAL FORMULAIRE CARTE -->
  <div id="cartModalCarte" style="display:none;position:fixed;inset:0;background:rgba(22,22,20,.55);backdrop-filter:blur(4px);z-index:2200;align-items:center;justify-content:center;padding:1.5rem;">
    <div style="background:#fff;border-radius:20px;padding:2rem;width:100%;max-width:420px;box-shadow:0 16px 48px rgba(0,0,0,.18);position:relative;">
      <button onclick="cartCloseCarteModal()" style="position:absolute;top:1rem;right:1rem;background:#EFEFED;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1.1rem;">×</button>
      <h3 style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;margin-bottom:1.2rem;">💳 Paiement par carte</h3>
      <div style="margin-bottom:.9rem;">
        <label style="font-size:.8rem;font-weight:600;color:#5C5A55;display:block;margin-bottom:.35rem;">Numéro de carte *</label>
        <input type="text" id="ccNum" maxlength="19" placeholder="1234 5678 9012 3456" style="width:100%;background:#F8F7F5;border:1.5px solid #EFEFED;padding:.7rem 1rem;border-radius:6px;font-size:.92rem;outline:none;font-family:'Outfit',sans-serif;" oninput="this.value=this.value.replace(/[^0-9]/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19)">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:.9rem;">
        <div>
          <label style="font-size:.8rem;font-weight:600;color:#5C5A55;display:block;margin-bottom:.35rem;">Expiration *</label>
          <input type="text" id="ccExp" maxlength="5" placeholder="MM/AA" style="width:100%;background:#F8F7F5;border:1.5px solid #EFEFED;padding:.7rem 1rem;border-radius:6px;font-size:.92rem;outline:none;font-family:'Outfit',sans-serif;" oninput="this.value=this.value.replace(/[^0-9]/g,'').replace(/^(.{2})(.+)/,'$1/$2').slice(0,5)">
        </div>
        <div>
          <label style="font-size:.8rem;font-weight:600;color:#5C5A55;display:block;margin-bottom:.35rem;">CVV *</label>
          <input type="text" id="ccCvv" maxlength="3" placeholder="123" style="width:100%;background:#F8F7F5;border:1.5px solid #EFEFED;padding:.7rem 1rem;border-radius:6px;font-size:.92rem;outline:none;font-family:'Outfit',sans-serif;" oninput="this.value=this.value.replace(/[^0-9]/g,'')">
        </div>
      </div>
      <div style="margin-bottom:1.2rem;">
        <label style="font-size:.8rem;font-weight:600;color:#5C5A55;display:block;margin-bottom:.35rem;">Nom sur la carte *</label>
        <input type="text" id="ccName" placeholder="JEAN DUPONT" style="width:100%;background:#F8F7F5;border:1.5px solid #EFEFED;padding:.7rem 1rem;border-radius:6px;font-size:.92rem;outline:none;font-family:'Outfit',sans-serif;">
      </div>
      <p style="font-size:.72rem;color:#9A9891;text-align:center;margin-bottom:.8rem;">🔒 Paiement sécurisé SSL</p>
      <button id="ccPayBtn" onclick="cartSubmitCard()" style="width:100%;background:#F4600C;color:#fff;border:none;padding:.9rem;border-radius:10px;font-weight:600;font-size:.92rem;cursor:pointer;font-family:'Outfit',sans-serif;">Payer <span id="ccPayAmount"></span></button>
    </div>
  </div>
  `);
})();

// ══════════════════════════════════════════════
// BOUTON PANIER DANS LA NAV
// ══════════════════════════════════════════════
(function injectCartButton() {
  function doInject() {
    const existing = document.getElementById('navCartLink');
    if (existing) {
      existing.removeAttribute('href');
      existing.style.cursor = 'pointer';
      existing.onclick = function(e) { e.preventDefault(); cartToggle(); };
      cartUpdateBadge();
      return;
    }
    const hamburger = document.getElementById('hamburger');
    if (!hamburger) return;
    const btn = document.createElement('a');
    btn.id = 'navCartLink';
    btn.href = '#';
    btn.onclick = function(e) { e.preventDefault(); cartToggle(); };
    btn.style.cssText = 'position:relative;background:#F4600C;color:#fff;border-radius:8px;padding:.4rem .9rem;font-size:.85rem;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:.4rem;cursor:pointer;';
    btn.innerHTML = '🛒 <span id="navCartBadge" style="display:none;background:#fff;color:#F4600C;font-size:.65rem;font-weight:800;border-radius:50%;width:18px;height:18px;align-items:center;justify-content:center;position:absolute;top:-6px;right:-6px;">0</span>';
    hamburger.parentNode.insertBefore(btn, hamburger);
    cartUpdateBadge();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', doInject);
  else doInject();
})();

// ══════════════════════════════════════════════
// API PANIER
// ══════════════════════════════════════════════
function cartGet()       { return JSON.parse(localStorage.getItem('az_cart') || '[]'); }
function cartSave(list)  { localStorage.setItem('az_cart', JSON.stringify(list)); }
function cartTotal(list) { return (list || cartGet()).reduce((s,i) => s + i.unitPrice * i.qty, 0); }
function cartCount(list) { return (list || cartGet()).reduce((s,i) => s + i.qty, 0); }

function cartAdd(productId, withInstall, productName, basePrice) {
  const key  = `${productId}_${withInstall ? 'install' : 'seul'}`;
  const list = cartGet();
  const item = list.find(i => i.key === key);
  const unitPrice = withInstall ? basePrice + CART_INSTALL_PRICE : basePrice;
  if (item) { item.qty++; }
  else { list.push({ key, productId, name: productName, option: withInstall ? 'Avec installation' : 'Produit seul', unitPrice, qty: 1 }); }
  cartSave(list);
  cartRender();
  cartOpen();
}

function cartRemove(key) { cartSave(cartGet().filter(i => i.key !== key)); cartRender(); }

function cartChangeQty(key, delta) {
  const list = cartGet();
  const item = list.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { cartRemove(key); return; }
  cartSave(list); cartRender();
}

function cartClear() { cartSave([]); cartRender(); }

function cartUpdateBadge() {
  const n = cartCount();
  const badge = document.getElementById('navCartBadge');
  if (badge) { badge.textContent = n; badge.style.display = n > 0 ? 'flex' : 'none'; }
}

function cartRender() {
  const list   = cartGet();
  const body   = document.getElementById('cartBodyGlobal');
  const footer = document.getElementById('cartFooterGlobal');
  if (!body) return;
  cartUpdateBadge();

  if (list.length === 0) {
    body.innerHTML = `<div style="text-align:center;padding:3rem 1rem;color:#9A9891;">
      <div style="font-size:3rem;margin-bottom:1rem;">🛒</div>
      <p style="font-weight:600;margin-bottom:.3rem;">Votre panier est vide</p>
      <p style="font-size:.82rem;margin-bottom:1rem;">Ajoutez des produits pour commencer.</p>
      <a href="boutique.html" style="display:inline-block;background:#F4600C;color:#fff;padding:.6rem 1.4rem;border-radius:8px;font-weight:600;font-size:.85rem;text-decoration:none;">Voir la boutique</a>
    </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  body.innerHTML = list.map(item => `
    <div style="display:flex;gap:1rem;padding:1rem 0;border-bottom:1px solid #EFEFED;align-items:flex-start;">
      <div style="width:56px;height:56px;border-radius:8px;background:#F8F7F5;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;">📱</div>
      <div style="flex:1;min-width:0;">
        <div style="font-family:'Syne',sans-serif;font-size:.9rem;font-weight:700;color:#161614;margin-bottom:.15rem;line-height:1.2;">${item.name}</div>
        <div style="font-size:.73rem;color:#9A9891;margin-bottom:.5rem;">${item.option}</div>
        <div style="display:flex;align-items:center;gap:.5rem;">
          <button onclick="cartChangeQty('${item.key}',-1)" style="background:#EFEFED;border:none;border-radius:4px;width:26px;height:26px;font-size:1rem;cursor:pointer;font-weight:700;">−</button>
          <span style="font-size:.88rem;font-weight:600;min-width:20px;text-align:center;">${item.qty}</span>
          <button onclick="cartChangeQty('${item.key}',1)" style="background:#EFEFED;border:none;border-radius:4px;width:26px;height:26px;font-size:1rem;cursor:pointer;font-weight:700;">+</button>
          <button onclick="cartRemove('${item.key}')" style="background:none;border:none;color:#9A9891;cursor:pointer;font-size:.78rem;padding:.2rem .4rem;border-radius:4px;margin-left:.2rem;">🗑 Supprimer</button>
        </div>
      </div>
      <div style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:800;color:#F4600C;white-space:nowrap;">${item.unitPrice * item.qty}€</div>
    </div>
  `).join('');

  const n = cartCount(list);
  document.getElementById('cartItemCountGlobal').textContent = `${n} article${n > 1 ? 's' : ''}`;
  document.getElementById('cartTotalGlobal').textContent = cartTotal(list) + '€';
  if (footer) footer.style.display = 'block';
}

// ══════════════════════════════════════════════
// OUVRIR / FERMER PANIER
// ══════════════════════════════════════════════
function cartOpen() {
  document.getElementById('cartDrawer').style.right = '0';
  document.getElementById('cartOverlayGlobal').style.display = 'block';
  document.body.style.overflow = 'hidden';
  cartRender();
}

function cartClose() {
  document.getElementById('cartDrawer').style.right = '-440px';
  document.getElementById('cartOverlayGlobal').style.display = 'none';
  document.body.style.overflow = '';
}

function cartToggle() {
  document.getElementById('cartDrawer').style.right === '0px' ? cartClose() : cartOpen();
}

// ══════════════════════════════════════════════
// CHECKOUT — MÊME COMPORTEMENT PARTOUT
// ══════════════════════════════════════════════
function cartCheckout() {
  const list = cartGet();
  if (list.length === 0) { alert('Votre panier est vide.'); return; }
  cartClose();

  // Remplir le récap
  const summary = document.getElementById('cartPaySummary');
  summary.innerHTML = list.map(i =>
    `<div style="display:flex;justify-content:space-between;font-size:.82rem;padding:.3rem 0;border-bottom:1px solid #EFEFED;">
      <span>${i.name} <span style="color:#9A9891;">× ${i.qty}</span> <span style="font-size:.72rem;color:#9A9891;">(${i.option})</span></span>
      <strong>${i.unitPrice * i.qty}€</strong>
    </div>`
  ).join('') + `<div style="display:flex;justify-content:space-between;font-size:.88rem;padding:.5rem 0;font-weight:700;"><span>Total</span><span style="color:#F4600C;">${cartTotal(list)}€</span></div>`;

  document.getElementById('cartPayTotal').textContent = cartTotal(list) + '€';
  document.getElementById('cartPayContent').style.display = 'block';
  document.getElementById('cartPaySuccess').style.display = 'none';

  // Afficher le modal paiement
  const modal = document.getElementById('cartModalPay');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Charger PayPal si pas encore chargé
  cartLoadPaypal();
}

function cartClosePayModal() {
  document.getElementById('cartModalPay').style.display = 'none';
  document.body.style.overflow = '';
}

// ── PayPal ──
function cartLoadPaypal() {
  // Vérifier si déjà chargé
  if (window.paypal_sdk || window.paypal) {
    cartRenderPaypal();
    return;
  }
  // Charger le SDK dynamiquement
  if (document.getElementById('paypal-sdk-script')) { setTimeout(cartRenderPaypal, 1000); return; }
  const script = document.createElement('script');
  script.id  = 'paypal-sdk-script';
  script.src = `https://www.paypal.com/sdk/js?client-id=${CART_PAYPAL_CLIENT_ID}&currency=EUR&locale=fr_FR`;
  script.setAttribute('data-namespace', 'paypal_sdk');
  script.onload = cartRenderPaypal;
  document.head.appendChild(script);
}

function cartRenderPaypal() {
  const container = document.getElementById('cartPaypalContainer');
  if (!container) return;
  container.innerHTML = '<div id="cart-paypal-btn"></div>';

  const SDK = window.paypal_sdk || window.paypal;
  if (!SDK) {
    container.innerHTML = `<p style="font-size:.75rem;color:#9A9891;text-align:center;padding:.5rem 0;">⚠️ PayPal SDK non chargé — configurez votre Client ID dans cart.js ligne 6.</p>`;
    return;
  }

  const total = cartTotal();
  const desc  = cartGet().map(i => `${i.name} ×${i.qty}`).join(', ');

  SDK.Buttons({
    style: { layout:'horizontal', color:'gold', shape:'rect', label:'paypal', height:42 },
    createOrder(data, actions) {
      const name  = document.getElementById('cartBuyerName').value.trim();
      const email = document.getElementById('cartBuyerEmail').value.trim();
      if (!name || !email) { alert('Renseignez votre nom et email avant de payer.'); return Promise.reject(); }
      return actions.order.create({
        purchase_units: [{ description: desc, amount: { value: total.toFixed(2), currency_code:'EUR' } }]
      });
    },
    onApprove(data, actions) {
      return actions.order.capture().then(details => {
        cartShowSuccess(details.payer.email_address, `${details.payer.name.given_name} ${details.payer.name.surname}`, details.id);
      });
    },
    onError() { alert('Erreur PayPal. Réessayez ou payez par carte.'); }
  }).render('#cart-paypal-btn');
}

// ── Paiement carte ──
function cartPayByCard() {
  const name  = document.getElementById('cartBuyerName').value.trim();
  const email = document.getElementById('cartBuyerEmail').value.trim();
  if (!name || !email) { alert('Renseignez votre nom et email avant de payer.'); return; }

  document.getElementById('ccPayAmount').textContent = cartTotal() + '€';
  document.getElementById('cartModalCarte').style.display = 'flex';
}

function cartCloseCarteModal() {
  document.getElementById('cartModalCarte').style.display = 'none';
}

function cartSubmitCard() {
  const num  = (document.getElementById('ccNum').value || '').replace(/\s/g,'');
  const exp  = document.getElementById('ccExp').value;
  const cvv  = document.getElementById('ccCvv').value;
  const name = document.getElementById('ccName').value.trim();
  if (!num || num.length < 16 || !exp || exp.length < 5 || !cvv || cvv.length < 3 || !name) {
    alert('Remplissez tous les champs carte.'); return;
  }
  const btn = document.getElementById('ccPayBtn');
  btn.textContent = '⏳ Traitement...';
  btn.disabled = true;

  // TODO : intégrer Stripe ou Revolut Business ici pour le vrai débit
  setTimeout(() => {
    cartCloseCarteModal();
    const email = document.getElementById('cartBuyerEmail').value.trim();
    const bname = document.getElementById('cartBuyerName').value.trim();
    cartShowSuccess(email, bname, 'CARD-' + Date.now());
    btn.textContent = 'Payer';
    btn.disabled = false;
  }, 1200);
}

// ── Succès + Facture ──
function cartShowSuccess(email, name, orderId) {
  const ref = 'AZ-' + Date.now().toString(36).toUpperCase();
  document.getElementById('cartOrderEmail').textContent = email;
  document.getElementById('cartOrderRef').textContent   = 'Réf : ' + ref;
  document.getElementById('cartPayContent').style.display = 'none';
  document.getElementById('cartPaySuccess').style.display = 'block';
  cartGenerateInvoice({ name, email, orderId: ref });
}

function cartGenerateInvoice({ name, email, orderId }) {
  const list = cartGet();
  const date = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
  const rows = list.map(i =>
    `<tr><td>${i.name} (${i.option})</td><td>${i.qty}</td><td>${i.unitPrice}€</td><td>${i.unitPrice*i.qty}€</td></tr>`
  ).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Facture ${orderId}</title>
  <style>body{font-family:sans-serif;max-width:700px;margin:40px auto;font-size:14px;color:#222;}
  .logo{font-size:22px;font-weight:900;}.logo span{color:#F4600C;}
  table{width:100%;border-collapse:collapse;margin:20px 0;}
  th{background:#F4600C;color:#fff;padding:9px;text-align:left;font-size:13px;}
  td{padding:9px;border-bottom:1px solid #eee;font-size:13px;}
  .total td{font-weight:700;background:#FFF4EE;}
  .footer{margin-top:30px;border-top:1px solid #eee;padding-top:14px;color:#999;font-size:12px;}
  @media print{body{margin:20px;}}</style></head><body>
  <div style="display:flex;justify-content:space-between;margin-bottom:30px;">
    <div><div class="logo">Auto<span>Zent</span> Services</div><div style="color:#777;font-size:13px;margin-top:4px;">High-Tech Auto & Mobile — IDF, Oise, Aisne</div></div>
    <div style="text-align:right;"><div style="font-size:16px;font-weight:700;color:#F4600C;">FACTURE</div><div style="color:#777;font-size:13px;">N° ${orderId}<br>${date}</div></div>
  </div>
  <div style="margin-bottom:20px;"><strong>Facturé à :</strong><br>${name}<br>${email}</div>
  <table><thead><tr><th>Description</th><th>Qté</th><th>P.U.</th><th>Total</th></tr></thead>
  <tbody>${rows}<tr class="total"><td colspan="3" style="text-align:right;">TOTAL TTC</td><td>${cartTotal(list)}€</td></tr></tbody></table>
  <p style="font-size:12px;color:#777;">TVA non applicable — Art. 293 B du CGI</p>
  <div class="footer">AutoZent Services · AutoZent Services · Autozentservices@gmail.com · +33 7 77 51 75 30 · Merci pour votre confiance !</div>
  </body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  cartRender();
  cartUpdateBadge();
});