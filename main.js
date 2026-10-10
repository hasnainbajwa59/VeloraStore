
const money = n => 'PKR ' + Number(n).toLocaleString('en-PK');
const allProducts = window.VELORA_PRODUCTS || [];
const getCart = () => JSON.parse(localStorage.getItem('velora_cart') || '[]');
const setCart = v => { localStorage.setItem('velora_cart', JSON.stringify(v)); updateCounts(); };
const getWish = () => JSON.parse(localStorage.getItem('velora_wishlist') || '[]');
const setWish = v => { localStorage.setItem('velora_wishlist', JSON.stringify(v)); updateCounts(); };
function updateCounts(){
 const cartCount = getCart().reduce((s,x)=>s+x.qty,0);
 document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=cartCount);
 document.querySelectorAll('[data-wish-count]').forEach(e=>e.textContent=getWish().length);
}
function addToCart(id, qty=1){
 const p=allProducts.find(x=>x.id===id); if(!p)return;
 const c=getCart(); const found=c.find(x=>x.id===id);
 if(found)found.qty+=qty; else c.push({id,qty});
 setCart(c); alert(p.name+' added to your cart.');
}
function toggleWish(id){
 const w=getWish(); const idx=w.indexOf(id);
 if(idx>=0)w.splice(idx,1);else w.push(id);
 setWish(w);
}
function card(p){
 const wished=getWish().includes(p.id);
 return `<article class="product-card">
  <div class="product-image"><a href="product.html?id=${p.id}" target="_blank" rel="noopener noreferrer" aria-label="View ${p.name}"><img loading="lazy" src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='https://placehold.co/700x900/f1eee9/333?text=VELORA+Product'"></a>
  <span class="tag">${p.tag}</span><button class="wish-btn" onclick="toggleWish('${p.id}');this.textContent=this.textContent==='♡'?'♥':'♡'" aria-label="Add ${p.name} to wishlist">${wished?'♥':'♡'}</button></div>
  <div class="product-info"><div class="product-brand">${p.brand}</div><a href="product.html?id=${p.id}" target="_blank" rel="noopener noreferrer"><div class="product-name">${p.name}</div></a>
  <div class="price-row"><span class="price">${money(p.price)}</span><span class="old-price">${money(p.old)}</span></div>
  <div class="product-cta"><button class="small-btn primary" onclick="addToCart('${p.id}')">Add to Cart</button><a class="small-btn" href="product.html?id=${p.id}" target="_blank" rel="noopener noreferrer" style="text-align:center">View Details</a></div></div></article>`;
}
function renderProducts(target, list){
 const el=document.querySelector(target); if(el)el.innerHTML=list.map(card).join('') || '<div class="empty-state">No products match your filters.</div>';
}
function initCatalog(){
 const grid=document.querySelector('#catalog-grid'); if(!grid)return;
 const gender=grid.dataset.gender||'all'; let list=allProducts.filter(p=>gender==='all'||p.gender===gender);
 const path=location.pathname.split('/').pop();
 if(path==='new-arrivals.html') list=list.filter((p,i)=>i>=12 || p.tag.toLowerCase().includes('new'));
 if(path==='best-sellers.html') list=list.filter(p=>['Best Seller','Signature Scent','Gift Pick','Modern Classic'].includes(p.tag));
 if(path==='sale.html') list=list.filter(p=>p.old>p.price);
 const search=document.querySelector('#product-search'), category=document.querySelector('#category-filter'), sort=document.querySelector('#sort-filter');
 const apply=()=>{
  let out=list.slice(); const q=(search?.value||'').toLowerCase().trim();
  if(q)out=out.filter(p=>(p.name+' '+p.brand+' '+p.category).toLowerCase().includes(q));
  if(category?.value)out=out.filter(p=>p.category===category.value);
  if(sort?.value==='low')out.sort((a,b)=>a.price-b.price);
  if(sort?.value==='high')out.sort((a,b)=>b.price-a.price);
  if(sort?.value==='name')out.sort((a,b)=>a.name.localeCompare(b.name));
  renderProducts('#catalog-grid',out);
 };
 [search,category,sort].filter(Boolean).forEach(el=>el.addEventListener('input',apply));
 document.querySelector('#clear-filters')?.addEventListener('click',()=>{if(search)search.value='';if(category)category.value='';if(sort)sort.value='';apply();});
 apply();
}
function initProduct(){
 const root=document.querySelector('#product-detail'); if(!root)return;
 const id=root.dataset.productId || new URLSearchParams(location.search).get('id');
 const p=allProducts.find(x=>x.id===id);
 if(!p){root.innerHTML='<div class="empty-state"><h2>Product not found</h2><a class="btn-lux" href="index.html">Back to home</a></div>';return;}
 document.title=p.name+' | VÉLORA';
 root.innerHTML=`<div class="detail-image"><img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='https://placehold.co/900x1100/f1eee9/333?text=VELORA+Product'"></div>
 <div class="detail-copy"><div class="eyebrow">${p.category} / ${p.gender==='men'?'Men':'Women'}</div><div class="product-brand" style="margin-top:15px">${p.brand}</div><h1>${p.name}</h1><div class="detail-price">${money(p.price)} <span class="old-price">${money(p.old)}</span></div><p>${p.desc}</p>
 <p><strong>Demo product:</strong> Product imagery and listed prices are illustrative and should be verified before real-world sale.</p>
 <span class="detail-label">Available colours</span><div>${p.color.split(', ').map((x,i)=>`<button class="chip ${i===0?'active':''}" onclick="this.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));this.classList.add('active')">${x}</button>`).join('')}</div>
 <span class="detail-label">Sizes / Options</span><div>${p.sizes.split(', ').map((x,i)=>`<button class="chip ${i===0?'active':''}" onclick="this.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));this.classList.add('active')">${x}</button>`).join('')}</div>
 <div class="quantity"><span class="detail-label" style="margin:0">Quantity</span><button onclick="changeQty(-1)">−</button><input id="detail-qty" value="1" min="1" max="20" type="number"><button onclick="changeQty(1)">+</button></div>
 <button class="btn-lux" onclick="addToCart('${p.id}',Math.max(1,Number(document.querySelector('#detail-qty').value)||1))">Add to Cart</button> <button class="btn-lux btn-outline" style="color:var(--ink)" onclick="toggleWish('${p.id}');alert('Wishlist updated.')">♡ Wishlist</button>
 <p style="margin-top:28px"><strong>Delivery:</strong> Estimated delivery details should be confirmed at checkout.<br><strong>Returns:</strong> Review the seller's return policy before ordering.</p><a class="text-link" href="${p.gender}.html">Continue shopping</a></div>`;
 const related=allProducts.filter(x=>x.gender===p.gender&&x.id!==p.id).slice(0,4); renderProducts('#related-products',related);
}
function changeQty(n){const e=document.querySelector('#detail-qty');if(e)e.value=Math.min(20,Math.max(1,(Number(e.value)||1)+n));}
function initCart(){
 const root=document.querySelector('#cart-content');if(!root)return;
 const cart=getCart();
 if(!cart.length){root.innerHTML='<div class="empty-state"><h2>Your bag is waiting</h2><p>Discover something you love.</p><a class="btn-lux" href="index.html">Continue Shopping</a></div>';return;}
 let subtotal=0;
 const rows=cart.map(item=>{const p=allProducts.find(x=>x.id===item.id);if(!p)return '';subtotal+=p.price*item.qty;return `<div class="cart-item"><a href="product.html?id=${p.id}" target="_blank" rel="noopener noreferrer"><img src="${p.image}" alt="${p.name}"></a><div style="flex:1"><div class="product-brand">${p.brand}</div><h3>${p.name}</h3><div class="price">${money(p.price)}</div><div class="quantity"><button onclick="changeCartQty('${p.id}',-1)">−</button><span>${item.qty}</span><button onclick="changeCartQty('${p.id}',1)">+</button></div><button class="text-link" onclick="removeCartItem('${p.id}')">Remove</button></div></div>`;}).join('');
 root.innerHTML=`<div class="cart-layout"><div>${rows}</div><aside class="summary-box"><h3>Order Summary</h3><div class="summary-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-line"><span>Delivery</span><span>Calculated later</span></div><div class="summary-line" style="border-top:1px solid var(--line);padding-top:18px"><strong>Total</strong><strong>${money(subtotal)}</strong></div><a class="btn-lux" href="checkout.html" style="display:block;text-align:center">Continue to Checkout</a><p class="notice">Demo storefront only. No real order or payment is processed.</p></aside></div>`;
}
function changeCartQty(id,n){const c=getCart();const x=c.find(x=>x.id===id);if(x){x.qty+=n;if(x.qty<1)x.qty=1;}setCart(c);initCart();}
function removeCartItem(id){setCart(getCart().filter(x=>x.id!==id));initCart();}
function initWishlist(){
 const root=document.querySelector('#wishlist-grid');if(!root)return;
 const ids=getWish();renderProducts('#wishlist-grid',allProducts.filter(p=>ids.includes(p.id)));
 if(!ids.length)root.innerHTML='<div class="empty-state"><h2>Your wishlist is empty</h2><p>Save your favourite pieces here.</p><a class="btn-lux" href="index.html">Explore Collection</a></div>';
}
document.addEventListener('DOMContentLoaded',()=>{
 updateCounts();initCatalog();initProduct();initCart();initWishlist();
 document.querySelectorAll('.mobile-toggle').forEach(b=>b.addEventListener('click',()=>document.querySelector('.mobile-nav')?.classList.toggle('open')));
 document.querySelectorAll('[data-newsletter]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();alert('Thank you! This demo form does not submit to a mailing service.');f.reset();}));
 document.querySelectorAll('[data-contact-form]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();alert('Thanks for your message. This demo form does not send messages to a server.');f.reset();}));
});

// Collection-page refinements
