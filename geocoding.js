// Browser-only Geoapify key: restrict Allowed origins to https://musubu-afk.github.io.
// This key has no Supabase database privileges.
(() => {
 const key='6acea95f9bee41778d0e85fc7818102c',cache=new Map();
 window.MUSUBU_GEOCODE=async(point,lang,signal)=>{
  const id=[point.lat,point.lng,lang].join(':');if(cache.has(id))return cache.get(id);
  const url=new URL('https://api.geoapify.com/v1/geocode/reverse');
  Object.entries({lat:point.lat,lon:point.lng,lang,format:'json',limit:1,apiKey:key}).forEach(([k,v])=>url.searchParams.set(k,v));
  const r=await fetch(url,{signal,credentials:'omit'});if(!r.ok)throw Error('address_lookup_failed');
  const data=await r.json(),p=data.results?.[0];if(!p)throw Error('address_not_found');
  // Preserve local administrative names and avoid postal-code/country clutter.
  const parts=[p.state,p.county,p.city,p.district,p.suburb,p.quarter,p.street,p.housenumber];
  const address=[...new Set(parts.filter(Boolean))].join(' ')||p.formatted;
  if(!address)throw Error('address_not_found');
  cache.set(id,address.slice(0,300));return cache.get(id);
 };
})();
