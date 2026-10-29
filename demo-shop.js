(() => {
  const I = window.MUSUBU_I18N;
  const shop = window.MUSUBU_SHOPS.find(s => s.shop_id === new URLSearchParams(location.search).get('shop'));
  function render() {
    if (!shop) { I.message(document.getElementById('description'), 'notFound'); return; }
    const view = I.shopView(shop);
    const back=document.querySelector('[data-local-link]');back.href='index.html?region='+shop.region+'&lang='+I.lang+'#'+(shop.region==='fukuoka'?'fukuoka-':'')+'shops';
    document.getElementById('name').textContent = view.name;
    const photo = document.getElementById('photo'); photo.hidden = false;
    if (!photo.getAttribute('src')) photo.src = shop.image_url;
    photo.onerror = () => { photo.onerror = null; photo.src = 'assets/shop-placeholder.svg'; };
    document.getElementById('description').textContent = view.description;
    I.message(document.getElementById('hours'), 'demoHours', {hours:view.business_hours});
    const list = document.getElementById('products'); list.replaceChildren();
    view.products.forEach(p => { const li=document.createElement('li'); li.textContent=p.name+' · '+p.price; list.append(li); });
  }
  render(); document.addEventListener('musubu:languagechange',render);
})();
