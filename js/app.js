
const TELEGRAM = "https://t.me/merxio_manager";

/* ---------- utils ---------- */
const qs = (s,root=document)=>root.querySelector(s);
const qsa = (s,root=document)=>Array.from(root.querySelectorAll(s));
const euro = n => new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n);

async function loadProducts(){
  const res = await fetch('data/products.json', {cache:'no-store'});
  return await res.json();
}

function slugify(s){
  return (s||'').toString().toLowerCase()
    .replace(/[^\w]+/g,'-').replace(/^-+|-+$/g,'');
}

/* ---------- cards ---------- */
function makeCard(p){
  const el = document.createElement('article');
  el.className = 'card reveal' + (p.in_stock===false ? ' oos' : '');
  const img = (p.images && p.images[0]) ? p.images[0] : 'images/hero.jpg';
  const mats = (p.materials && p.materials.length) ? p.materials.join(' / ') : 'wool / acrylic';
  const size = p.size ? `${p.size}` : '';
  const id = p.id || slugify(p.title);

  el.innerHTML = `
    <div class="card-media">
      <img src="${img}" alt="${p.title}">
      <div class="badges">
        ${size ? `<span class="badge size">${size}</span>` : ''}
        ${p.in_stock===false ? `<span class="badge oos">Sold out</span>` : ''}
      </div>
    </div>
    <div class="card-body">
      <div class="title">${p.title}</div>
      <div class="meta">${mats}</div>
      <div class="price">${euro(p.price||0)}</div>
      <a class="cta ghost" href="product.html?id=${encodeURIComponent(id)}">View</a>
    </div>`;
  return el;
}

/* ---------- render catalog ---------- */
async function renderCatalog(){
  const wrap = qs('#catalog-grid'); if(!wrap) return;
  const items = await loadProducts();

  const shapeSel = qs('#f-shape');
  const sizeSel = qs('#f-size');

  const pass = p => {
    const sOk = !shapeSel || !shapeSel.value || p.shape === shapeSel.value;
    const zOk = !sizeSel || !sizeSel.value || (p.size && p.size === sizeSel.value);
    return sOk && zOk;
  };

  function draw(){
    wrap.innerHTML = '';
    items.filter(pass).forEach(p => wrap.appendChild(makeCard(p)));
    applyReveals();
  }
  shapeSel && shapeSel.addEventListener('change', draw);
  sizeSel && sizeSel.addEventListener('change', draw);
  draw();
}

/* ---------- render product page ---------- */
function getQueryParam(name){
  return new URLSearchParams(location.search).get(name);
}

async function renderProduct(){
  const gallery = qs('#gallery'); if(!gallery) return;
  const items = await loadProducts();
  const id = getQueryParam('id');
  const prod = items.find(p => (p.id && p.id===id) || slugify(p.title)===id) || items[0];

  // gallery
  gallery.innerHTML = '';
  (prod.images||[]).forEach(src=>{
    const a = document.createElement('a');
    a.href = src; a.dataset.lightbox='p';
    const img = document.createElement('img'); img.src = src; img.alt = prod.title;
    a.appendChild(img); gallery.appendChild(a);
  });

  // text
  qs('[data-p-title]') && (qs('[data-p-title]').textContent = prod.title);
  const mats = (prod.materials && prod.materials.length) ? prod.materials.join(' / ') : 'wool / acrylic';
  qs('[data-p-meta]') && (qs('[data-p-meta]').textContent = mats);

  // price by size
  const priceEl = qs('[data-p-price]');
  const sizeSel = qs('#p-size');
  const base = prod.price || 0;
  const map = {'Ø120':1,'120×170':1.2,'140×200':1.4,'160×230':1.6};
  function upd(){ const k = map[sizeSel.value]||1; priceEl.textContent=euro(Math.round(base*k)); }
  if(sizeSel && priceEl){ sizeSel.value = prod.size || '120×170'; upd(); sizeSel.addEventListener('change', upd); }

  // telegram
  qsa('[data-telegram]').forEach(a => a.href = TELEGRAM);
}

/* ---------- featured on home ---------- */
async function renderFeatured(){
  const wrap = qs('#featured-grid'); if(!wrap) return;
  const items = await loadProducts();
  wrap.innerHTML = '';
  items.filter(p=>p.featured).slice(0,6).forEach(p => wrap.appendChild(makeCard(p)));
  applyReveals();
}

/* ---------- reveals ---------- */
function applyReveals(){
  const els = qsa('.reveal');
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target);} });
  },{threshold:.15});
  els.forEach(el=>obs.observe(el));
}

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  qsa('[data-telegram]').forEach(a => a.href = TELEGRAM);
  renderFeatured(); renderCatalog(); renderProduct(); applyReveals();
});


/* dark toggle removed */



/* === Patch 05 JS marker === */
document.addEventListener('DOMContentLoaded', ()=>{
  try{
    const nav = document.querySelector('.nav');
    const menu = nav ? nav.querySelector('.menu') : null;
    console.log('[RugFlag] JS v05 loaded. viewport=', window.innerWidth, 'menu=', menu);
    if(menu){
      const cs = getComputedStyle(menu);
      console.log('[RugFlag] menu display:', cs.display, 'overflowX:', cs.overflowX);
    }
  }catch(e){ console.log('[RugFlag] JS v05 error', e); }
});
