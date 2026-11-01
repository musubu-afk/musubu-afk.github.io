// Keep Leaflet markers and selection. Load vector background only when the map is visible.
window.MUSUBU_LOCALIZE_MAP=(map,base)=>{
let started=false,layer,gl,failed=false;
const I=window.MUSUBU_I18N;
const note=document.createElement('p');note.className='notice';document.getElementById('mapTileStatus').after(note);
function label(){note.textContent=({ko:'지도 지명은 선택한 언어를 우선 표시합니다. 번역이 없는 지명은 현지어 또는 로마자로 표시됩니다.',ja:'地名は選択した言語を優先します。翻訳がない地名は現地語またはローマ字で表示されます。',en:'Map labels prefer your selected language. Names without a translation appear in the local language or Latin script.'})[I.lang]||'Map labels use available translations.';if(failed)note.textContent=({ko:'다국어 지도를 불러오지 못해 기본 지도를 표시합니다.',ja:'多言語地図を読み込めないため、標準地図を表示しています。',en:'Multilingual map unavailable. Showing the standard map.'})[I.lang]||'Standard map';}
function localize(){label();if(!gl?.getStyle()?.layers)return;const lang=I.lang.startsWith('zh')?'zh':I.lang;for(const l of gl.getStyle().layers){if(l.type==='symbol'&&JSON.stringify(l.layout?.['text-field']||'').includes('name'))gl.setLayoutProperty(l.id,'text-field',['coalesce',['get','name:'+lang],['get','name:latin'],['get','name']]);}}
function script(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.append(s);});}
function fallback(){if(failed)return;failed=true;if(layer&&map.hasLayer(layer))map.removeLayer(layer);if(!map.hasLayer(base))base.addTo(map);label();}
const observer=new IntersectionObserver(async entries=>{if(started||!entries.some(e=>e.isIntersecting))return;started=true;observer.disconnect();try{
 const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/maplibre-gl@5.5.0/dist/maplibre-gl.css';document.head.append(css);
 await script('https://unpkg.com/maplibre-gl@5.5.0/dist/maplibre-gl.js');await script('vendor/leaflet-maplibre-gl.js');
 layer=L.maplibreGL({style:'https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=6acea95f9bee41778d0e85fc7818102c',interactive:false,attribution:'<a href="https://www.geoapify.com/">Geoapify</a> | © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});layer.addTo(map);
 gl=layer.getMaplibreMap();gl.on('style.load',localize);gl.on('load',()=>{if(!failed){localize();map.removeLayer(base);}});gl.on('error',fallback);localize();
}catch(error){console.warn('Multilingual map initialization:',error.message);fallback();}}, {threshold:0.01});observer.observe(map.getContainer());document.addEventListener('musubu:languagechange',localize);label();
};
