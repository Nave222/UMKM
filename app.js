// app.js - client-side demo logic (static site)
document.getElementById('year').textContent = new Date().getFullYear();

// Sample product data (edit / replace as needed)
const PRODUCTS = [];
const sampleNames = ['Selai Kopi Robusta','Kerajinan Anyaman','Kue Kering Spesial','Minuman Tradisional','Batik Modern','Aksesoris Kulit','Cokelat Artisan','Teh Herbal'];
const categories = ['food','craft','beverage'];
for(let i=1;i<=24;i++){
  PRODUCTS.push({
    id: 'p'+i,
    title: sampleNames[i % sampleNames.length] + ' #' + i,
    category: categories[i % categories.length],
    price: 50000 + (i*2500),
    img: 'https://picsum.photos/seed/p'+i+'/800/600'
  });
}

// state & pagination
let page = 0;
const perPage = 9;
let filtered = PRODUCTS.slice();

const grid = document.getElementById('productGrid');
const countEl = document.getElementById('cartCount');
const cartKey = 'umkm_demo_cart_v1';
let cart = JSON.parse(localStorage.getItem(cartKey) || '{}');

function numberFormat(x){ return new Intl.NumberFormat('id-ID').format(x); }

function renderProducts(reset=false){
  if(reset){ grid.innerHTML=''; page=0; }
  const start = page * perPage;
  const slice = filtered.slice(start, start + perPage);
  slice.forEach(p => {
    const el = document.createElement('div');
    el.className = 'prod';
    el.innerHTML = `
      <img loading="lazy" src="${p.img}" alt="${p.title}">
      <div class="title">${p.title}</div>
      <div class="meta">Kategori: ${p.category}</div>
      <div class="price">Rp ${numberFormat(p.price)}</div>
      <button class="add-btn" data-id="${p.id}">Tambah</button>
    `;
    grid.appendChild(el);
  });
  page++;
}

renderProducts(true);

// load more
document.getElementById('loadMore').addEventListener('click', ()=>{
  if(page * perPage >= filtered.length){ alert('Tidak ada produk lagi'); return; }
  renderProducts();
});

// search & filter
document.getElementById('search').addEventListener('input', (e)=>{
  const q = e.target.value.trim().toLowerCase();
  filtered = PRODUCTS.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  renderProducts(true);
});

document.getElementById('filterCat').addEventListener('change', (e)=>{
  const v = e.target.value;
  filtered = (v === 'all') ? PRODUCTS.slice() : PRODUCTS.filter(p => p.category === v);
  renderProducts(true);
});

// cart functions
function saveCart(){
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
}

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  toast('Produk ditambahkan');
}

function removeFromCart(id){
  if(!cart[id]) return;
  cart[id]--;
  if(cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function clearCart(){
  cart = {};
  saveCart();
  toast('Keranjang dibersihkan');
}

function renderCart(){
  const panel = document.getElementById('cartItems');
  panel.innerHTML = '';
  const ids = Object.keys(cart);
  if(ids.length === 0){
    panel.innerHTML = '<div class="muted small">Keranjang kosong</div>';
    document.getElementById('cartTotal').textContent = 'Rp 0';
    document.getElementById('cartCount').textContent = '0';
    return;
  }
  let total = 0;
  ids.forEach(id=>{
    const p = PRODUCTS.find(x=>x.id===id);
    const qty = cart[id];
    total += p.price * qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `<img src="${p.img}" alt="${p.title}"><div style="flex:1"><div style="font-weight:700">${p.title}</div><div class="muted small">Rp ${numberFormat(p.price)} × ${qty}</div></div><div><button class="btn ghost" data-remove="${id}">-</button></div>`;
    panel.appendChild(div);
  });
  document.getElementById('cartTotal').textContent = 'Rp ' + numberFormat(total);
  document.getElementById('cartCount').textContent = ids.reduce((s,id)=>s+cart[id],0);
}

// event delegation for add/remove
document.body.addEventListener('click', (e)=>{
  const add = e.target.closest('[data-id]');
  if(add){ addToCart(add.dataset.id); return; }
  const rem = e.target.closest('[data-remove]');
  if(rem){ removeFromCart(rem.dataset.remove); return; }
});

// cart panel open/close & actions
const cartPanel = document.getElementById('cartPanel');
document.getElementById('openCart').addEventListener('click', ()=>{ cartPanel.style.display = 'block'; });
document.getElementById('closeCart').addEventListener('click', ()=>{ cartPanel.style.display = 'none'; });
document.getElementById('clearCart').addEventListener('click', clearCart);
document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  if(Object.keys(cart).length === 0){ toast('Keranjang kosong'); return; }
  // demo checkout: open WhatsApp with order summary
  let text = 'Halo, saya mau order:\n';
  Object.keys(cart).forEach(id=>{
    const p = PRODUCTS.find(x=>x.id===id);
    text += `${p.title} x ${cart[id]} - Rp ${numberFormat(p.price * cart[id])}\n`;
  });
  text += 'Terima kasih.';
  const wa = 'https://wa.me/628123456789?text=' + encodeURIComponent(text);
  window.open(wa, '_blank');
});

// contact form demo (sends nowhere - shows success)
document.getElementById('contactForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  document.getElementById('contactResult').textContent = 'Terima kasih — pesan terkirim (demo).';
  e.target.reset();
});

// admin add not included in production build (kept simple)

// delegate remove button inside cart
document.getElementById('cartItems').addEventListener('click', (e)=>{
  const rem = e.target.closest('[data-remove]');
  if(rem){ removeFromCart(rem.dataset.remove); }
});

// toast helper
function toast(msg){
  const el = document.createElement('div');
  el.style.position = 'fixed'; el.style.left='50%'; el.style.transform='translateX(-50%)';
  el.style.bottom='24px'; el.style.background='#0b1220'; el.style.color='#fff'; el.style.padding='10px 14px';
  el.style.borderRadius='10px'; el.style.boxShadow='0 10px 30px rgba(2,6,23,0.4)'; el.style.zIndex=9999;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1600);
}

// init
renderCart();
