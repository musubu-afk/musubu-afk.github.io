(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const shops = window.MUSUBU_SHOPS;
  const region=()=>window.MUSUBU_REGION?.current||new URLSearchParams(location.search).get('region')||'nonsan';
  const currentShops=()=>shops.filter(s=>s.region===region());
  const I = window.MUSUBU_I18N, t = (key, vars) => I.t(key, vars);
  const label = category => t('category_' + category);
  const msg = (id, key, vars) => I.message($(id), key, vars);
  let selectedCategory = null, cachedRows = null, statsLoaded=false;
  const dialog = $('shopDialog');
  let client = null, activeShop = null, channel = null, stats = new Map();
  let requestVersion = 0, pending = false, lastSubmission = null, voucherUsed = false;
  const fallback = 'assets/shop-placeholder.svg';
  function imageError(event) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = event.currentTarget.dataset.fallback || fallback;
  }
  $('detailImage').onerror = imageError;
  function summary(id) {
    const row = stats.get(id);
    if (!row) return statsLoaded?t('noStats'):t('statsLoading');
    return Number(row.review_count) ? t('stats', {rating:Number(row.average_rating).toFixed(1),count:row.review_count}) : t('noStats');
  }
  function updateStatsUI() {
    document.querySelectorAll('[data-stats]').forEach(el => { el.textContent = summary(el.dataset.stats); });
    if (activeShop) { I.clear($('detailStats')); $('detailStats').textContent = summary(activeShop.shop_id); }
  }
  async function loadStats() {
    if (!client) return;
    const { data, error } = await client.rpc('shop_review_stats');
    if (error) throw error;
    statsLoaded=true; stats = new Map(data.map(row => [row.shop_id, row]));
    updateStatsUI();
  }
  function showCategory(category, focus = true) {
    selectedCategory = category;
    $('shopResults').hidden = false;
    $('categoryTitle').textContent = t('categoryTitle', {category:label(category),count:currentShops().filter(s=>s.category===category).length});
  document.querySelectorAll('.category').forEach(button => button.setAttribute('aria-expanded', String(button.dataset.category === category)));
    $('shopList').replaceChildren();
    currentShops().filter(shop => shop.category === category).forEach(shop => {
      const view = I.shopView(shop);
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'place-card'; button.dataset.shop = shop.shop_id;
      const img = document.createElement('img'); img.src = shop.image_url; img.alt = t('imageAlt', {name:I.shopView(shop).name}); img.loading = 'lazy'; img.dataset.fallback = shop.image_fallback || fallback; img.onerror = imageError;
      const content = document.createElement('div'); content.className = 'place-copy';
      const demo = document.createElement('span'); demo.className = 'demo-pill'; demo.textContent = t('demo');
      const name = document.createElement('strong'); name.textContent = view.name; name.lang = I.lang;
      const sub = document.createElement('small'); sub.textContent = view.products[0].name;
      const rating = document.createElement('span'); rating.className = 'place-stats'; rating.dataset.stats = shop.shop_id; rating.textContent = summary(shop.shop_id);
      const distance=document.createElement('small');distance.className='near-distance';distance.textContent=window.MUSUBU_NEARBY?.distance(shop)||'';
      const desc=document.createElement('small');desc.textContent=view.description;
      content.append(demo, name, sub, distance, desc, rating); if(shop.reference_photo){const note=document.createElement("small");note.className="reference-photo-note";note.textContent=t("referencePhoto");content.append(note);} button.append(img, content);
      button.addEventListener('click', () => openShop(shop));
      $('shopList').append(button);
    });
    if (focus) $('categoryTitle').focus({ preventScroll: true });
  }
  function renderReviews(rows) {
    cachedRows = rows; document.dispatchEvent(new CustomEvent('musubu:shop-reviews',{detail:{shopId:activeShop?.shop_id,rows}})); I.clear($('reviewList'));
    if (!rows.length) {
      const empty = document.createElement('p'); empty.className = 'review-empty'; empty.textContent = t('emptyReviews');
      $('reviewList').append(empty); return;
    }
    rows.forEach(row => {
      const article = document.createElement('article'); article.className = 'review-entry'; article.dataset.reviewId = row.id;
      const header = document.createElement('header');
      const rating = document.createElement('b'); rating.textContent = t('ratingValue',{stars:'★'.repeat(row.rating),rating:row.rating});
      const time = document.createElement('time'); time.dateTime = row.created_at;
      time.textContent = new Intl.DateTimeFormat(I.locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }).format(new Date(row.created_at));
      const body = document.createElement('p'); body.textContent = row.review_text;
      header.append(rating, time); article.append(header, body); $('reviewList').append(article);
    });
  }
  async function refreshReviews() {
    if (!client || !activeShop) return;
    const shopId = activeShop.shop_id, version = ++requestVersion;
    try {
      const [{ data, error }] = await Promise.all([
        client.from('reviews').select('id,shop_id,rating,review_text,created_at').eq('shop_id', shopId).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(20),
        loadStats()
      ]);
      if (error) throw error;
      if (activeShop?.shop_id !== shopId || version !== requestVersion) return;
      renderReviews(data); $('retryReviews').hidden = true;
    } catch {
      if (activeShop?.shop_id !== shopId || version !== requestVersion) return;
      cachedRows = null; document.dispatchEvent(new CustomEvent('musubu:shop-reviews',{detail:{shopId,rows:[]}})); msg('reviewList', 'reviewsError');
      msg('detailStats','statsError');
      $('retryReviews').hidden = false;
    }
  }
  function stopChannel() {
    if (channel && client) client.removeChannel(channel);
    channel = null;
  }
  function subscribeShop(shopId) {
    if (!client) {
      msg('liveStatus', 'noConnection'); msg('reviewList', 'serviceError'); return;
    }
    msg('liveStatus', 'connecting'); $('liveStatus').classList.remove('connected');
    channel = client.channel('reviews-' + shopId + '-' + crypto.randomUUID())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews', filter: 'shop_id=eq.' + shopId }, () => {
        if (activeShop?.shop_id === shopId) refreshReviews();
      })
      .subscribe(status => {
        if (activeShop?.shop_id !== shopId) return;
        const connected = status === 'SUBSCRIBED';
        $('liveStatus').classList.toggle('connected', connected);
        msg('liveStatus',connected ? 'connected' : 'reconnecting');
        $('retryReviews').hidden = connected;
        if (connected) refreshReviews();
      });
  }
  function renderShopInfo(shop) {
    const view = I.shopView(shop);
    const stay=shop.category==='stay';$('stayInfo').hidden=$('stayDemo').hidden=!stay;
    $('detailHours').hidden=$('detailHours').previousElementSibling.hidden=stay;
    $('detailProducts').previousElementSibling.hidden=$('detailProducts').hidden=stay;
    $('stayType').textContent=view.accommodation_type||'';$('stayHours').textContent=stay?shop.check_in+' / '+shop.check_out:'';$('stayAmenities').textContent=view.amenities||'';
    $('detailDistance').textContent=window.MUSUBU_NEARBY?.distance(shop)||'';
    document.dispatchEvent(new CustomEvent('musubu:shop-detail',{detail:{shop}}));
    $('detailImage').dataset.fallback=shop.image_fallback||fallback; $('detailImage').onerror=imageError;
    if ($('detailImage').getAttribute('src') !== shop.image_url) $('detailImage').src = shop.image_url; $('detailImage').alt = t('imageAlt',{name:I.shopView(shop).name});
    $('detailName').textContent = view.name; $('detailName').lang=I.lang; $('detailCategory').textContent = t('detailCategory',{category:label(shop.category)});
    $('detailDescription').textContent = view.description; let note=document.getElementById('detailPhotoNote');if(!note){note=document.createElement('p');note.id='detailPhotoNote';note.className='reference-photo-note';$('detailDescription').before(note);}note.hidden=!shop.reference_photo;note.textContent=t('referencePhoto');
    $('detailAddress').textContent = view.address; $('detailHours').textContent = view.business_hours; $('detailPhone').textContent = view.phone;
    $('officialLink').href = I.localizedUrl(shop.external_url); $('mapLink').href = shop.map_url;
    I.clear($('detailStats')); $('detailStats').textContent = summary(shop.shop_id);
    $('detailProducts').replaceChildren();
    view.products.forEach(product => {
      const li = document.createElement('li'), name = document.createElement('span'), price = document.createElement('b');
      name.textContent = product.name; price.textContent = product.price; li.append(name, price); $('detailProducts').append(li);
    });
  }
  function openShop(shop, reviewFocus = false) {
    stopChannel(); activeShop = shop; ++requestVersion;
    cachedRows = null; document.dispatchEvent(new CustomEvent('musubu:shop-reviews',{detail:{shopId:shop.shop_id,rows:[]}})); renderShopInfo(shop);
    $('reviewForm').reset(); I.clear($('submitStatus')); $('submitStatus').classList.remove('error'); $('goVoucher').hidden = true;
    msg('reviewList', 'reviewsLoading'); $('retryReviews').hidden = true;
    $('submitReview').disabled = pending || !client;
    $('reviewShop').value = shop.shop_id;
    document.body.classList.add('modal-open'); dialog.showModal();
    dialog.querySelector('.sheet-scroll').scrollTop = 0;
    subscribeShop(shop.shop_id); refreshReviews();
    if (reviewFocus) requestAnimationFrame(() => $('reviewsHeading').focus());
  }
  function activateVoucher(review, shop) {
    document.getElementById('nearbyContent').prepend($('voucherBox'));
    $('voucherBox').classList.remove('locked');$('voucherBox').hidden=false;
    $('voucherBox').dataset.reviewId = review.id;
    I.message($('voucherBox').firstElementChild,'voucherSaved',{name:I.shopView(shop).name});
    $('useVoucher').disabled = voucherUsed;
    msg('reviewMsg','savedMessage',{name:I.shopView(shop).name});
  }
  document.querySelectorAll('.category').forEach(button => button.addEventListener('click', () => showCategory(button.dataset.category)));
  function fillShopOptions(){const chosen=$('reviewShop').value;while($('reviewShop').options.length>1)$('reviewShop').remove(1);currentShops().forEach(shop => {
    const option = document.createElement('option'); option.value = shop.shop_id; option.textContent = shop.name + ' · ' + label(shop.category); $('reviewShop').append(option);
  });$('reviewShop').value=chosen;}fillShopOptions();
  document.addEventListener('musubu:regionchange',()=>{if(dialog.open)dialog.close();fillShopOptions();showCategory(selectedCategory||'meal',false);});
    window.MUSUBU_SHOP_APP={showCategory,refresh:()=>showCategory(selectedCategory||'meal',false),get activeShop(){return activeShop;}};
  $('openReview').addEventListener('click', () => {
    const shop = shops.find(item => item.shop_id === $('reviewShop').value);
    if (!shop) { msg('reviewMsg', 'selectFirst'); $('reviewShop').focus(); return; }
    openShop(shop, true);
  });
  $('closeDetail').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    activeShop = null; cachedRows = null; ++requestVersion; stopChannel(); document.body.classList.remove('modal-open');
    loadStats().catch(() => {});
  });
  $('showReviews').addEventListener('click', () => $('reviewsHeading').focus());
  $('retryReviews').addEventListener('click', refreshReviews);
  $('goVoucher').addEventListener('click', () => { dialog.close(); window.MUSUBU_SCREENS?.go('shops'); });
  $('useVoucher').addEventListener('click', () => {
    if (!$('voucherBox').dataset.reviewId || voucherUsed) return;
    voucherUsed = true; msg('useVoucher', 'voucherUsed'); $('useVoucher').disabled = true;
  });
  $('reviewForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !client || !activeShop) return;
    const shop = activeShop;
    const rating = Number(new FormData(event.currentTarget).get('rating')), reviewText = $('reviewText').value.trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || [...reviewText].length < 2 || [...reviewText].length > 500) {
      msg('submitStatus', 'validation'); return;
    }
    const signature = JSON.stringify([shop.shop_id, rating, reviewText]);
    if (lastSubmission?.signature !== signature) lastSubmission = { signature, requestId: crypto.randomUUID() };
    const payload = { shop_id: shop.shop_id, rating, review_text: reviewText, request_id: lastSubmission.requestId };
    pending = true; $('submitReview').disabled = true; msg('submitReview', 'saving');
    msg('submitStatus', 'savingMessage'); $('submitStatus').classList.remove('error');
    try {
      let { data, error } = await client.from('reviews').insert(payload).select('id,shop_id,rating,review_text,created_at').single();
      if (error?.code === '23505') {
        const previous = await client.from('reviews').select('id,shop_id,rating,review_text,created_at').eq('request_id', payload.request_id).single();
        data = previous.data; error = previous.error;
      }
      if (error || !data?.id) throw error || new Error('저장 확인 실패');
      activateVoucher(data, shop); lastSubmission = null;
      if (activeShop?.shop_id === shop.shop_id) {
        msg('submitStatus', 'saveSuccess');
        $('goVoucher').hidden = false; $('reviewForm').reset(); await refreshReviews();
      }
    } catch {
      if (activeShop?.shop_id === shop.shop_id) {
        msg('submitStatus', 'saveError');
        $('submitStatus').classList.add('error');
      }
    } finally {
      pending = false; $('submitReview').disabled = !client; msg('submitReview', 'submit');
    }
  });
  if (window.supabase) {
    client = window.supabase.createClient('https://fzynbjgkictmlmuxfldl.supabase.co', 'sb_publishable_x08dJFDQ_zuP0IKJ83jFYg_1so-HCCN', {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    loadStats().catch(() => { msg('reviewMsg', 'serverError'); });
  } else {
    msg('reviewMsg', 'serviceError');
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && activeShop) refreshReviews();
  });
  window.addEventListener('online', () => { if (activeShop) refreshReviews(); });
  document.addEventListener('musubu:languagechange', () => {
    if (selectedCategory) showCategory(selectedCategory, false);
    [...$('reviewShop').options].forEach(option => {
      const shop = shops.find(item => item.shop_id === option.value);
      if (shop) option.textContent = shop.name + ' · ' + label(shop.category);
    });
    if (activeShop) {
      const scroll = dialog.querySelector('.sheet-scroll').scrollTop;
      renderShopInfo(activeShop);
      if (cachedRows) renderReviews(cachedRows);
      dialog.querySelector('.sheet-scroll').scrollTop = scroll;
    }
    updateStatsUI();
  });
})();
