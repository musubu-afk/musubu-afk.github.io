// Replace the tile provider here when traffic grows; keep required attribution.
window.MUSUBU_MAP_CONFIG = {
 tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
 maxZoom: 19,
 regions: {
  nonsan: {id:'nonsan',name_ko:'논산',name_ja:'論山',latitude:36.190,longitude:127.170,zoom:12,bounds:[[36.04,126.98],[36.36,127.40]]},
  fukuoka: {id:'fukuoka',name_ko:'후쿠오카',name_ja:'福岡',latitude:33.588,longitude:130.380,zoom:14,bounds:[[33.1,130.0],[33.9,131.6]]}
 }
};
