// Display-only translations. IDs and original community submissions stay unchanged.
(() => {
const rows=[
['dessert-01','いちごを詰めた午後','Strawberry Afternoon','A small dessert café celebrating Nonsan strawberries.','Nonsan strawberry parfait|Strawberry cream latte'],
['dessert-02','ぬくもりいちご工房','Warm Strawberry Workshop','A cosy workshop-style café with strawberry cakes and gift cookies.','Strawberry cream cake|Strawberry cookie box'],
['meal-01','錬武・野の食卓','Yeonmu Field Table','Seasonal set meals inspired by the fields around Yeonmu.','Seasonal set meal|Vegetable bibimbap'],
['meal-02','江景のひと膳','Ganggyeong One Meal','A neighbourhood meal concept inspired by Ganggyeong.','Village set meal|Seasonal vegetable rice bowl'],
['gift-01','論山おもいで商店','Nonsan Memory Shop','Small keepsakes inspired by Nonsan landscapes and strawberries.','Nonsan landscape postcards|Strawberry keyring'],
['gift-02','まちのひとかけら','A Piece of the Village','Story notebooks and small gifts to remember your trip.','Village story notebook|Travel gift bundle'],
['nonsan-stay-01',null,'MUSUBU Mulbit Pause Stay','A fictional lakeside pension for quiet evenings and walks by Tapjeong Lake.','Lake-view pension'],
['nonsan-stay-02',null,'MUSUBU Deulnyeok Moon Hanok','A rural hanok stay concept with a courtyard and a relaxed village atmosphere.','Hanok stay'],
['nonsan-stay-03',null,'MUSUBU Journey Pocket Nonsan','A practical city hotel concept for families exploring Nonsan.','City hotel'],
['fukuoka-meal-01',null,'MUSUBU Roji Dashi Lab','Hakata ramen and small mentaiko rice bowls inspired by Fukuoka alleyway dining.','Hakata ramen and mentaiko rice'],
['fukuoka-meal-02',null,'MUSUBU Yokaze Yatai Table','An evening dining concept inspired by the warm atmosphere of Fukuoka yatai stalls.','Motsunabe and grilled mentaiko'],
['fukuoka-dessert-01',null,'MUSUBU Minamo Strawberry Tea Room','An Ohori-inspired tea room pairing Amaou strawberry parfaits with matcha.','Amaou parfait and matcha latte'],
['fukuoka-dessert-02',null,'MUSUBU Hakata Afternoon Studio','A contemporary Hakata café concept for slow coffee breaks and custard pudding.','Drip coffee and custard pudding'],
['fukuoka-gift-01',null,'MUSUBU Hakata Pattern Post','Patterned postcards and textile bookmarks inspired by Hakata craft culture.','Pattern postcards and fabric bookmarks'],
['fukuoka-gift-02',null,'MUSUBU Sea Breeze Gift Box','A travel gift concept featuring mentaiko-flavoured crackers and strawberry sweets.','Mentaiko-flavoured crackers and strawberry sweets'],
['fukuoka-stay-01',null,'MUSUBU Ohori Walk Bookmark','A quiet guesthouse concept for walks around Ohori Park and Fukuoka Castle.','Guesthouse'],
['fukuoka-stay-02',null,'MUSUBU Hakata Trip Drawer','A city hotel concept for convenient transport, shopping and sightseeing in Hakata.','City hotel'],
['fukuoka-stay-03',null,'MUSUBU Momochi Blue Night','A coastal resort-hotel concept inspired by Momochi beach and city night views.','Resort hotel']
];
window.MUSUBU_SHOP_NAMES_JA=Object.fromEntries(rows.filter(r=>r[1]).map(r=>[r[0],r[1]]));
for(const [id,ja,name,description,products] of rows){const s=window.MUSUBU_SHOPS.find(s=>s.shop_id===id);if(!s)continue;s.translations??={};if(s.translations.ja&&ja)s.translations.ja.name=ja;const names=products.split('|');s.translations.en={name,description,address:(s.region==='nonsan'?'Nonsan, Chungcheongnam-do, South Korea':'Fukuoka, Japan')+' · fictional location',phone:'No contact number · fictional business',business_hours:s.category==='stay'?s.business_hours:(s.business_hours.match(/\d{2}:\d{2}[–-]\d{2}:\d{2}/)?.[0]||'Hours not set')+' · demo hours',products:s.products.map((v,i)=>({name:names[i]||names[0],price:/^\d/.test(v.price)?v.price.replace('원',' KRW'):'Price not set · demo'})),accommodation_type:s.category==='stay'?names[0]:null,amenities:s.category==='stay'?({'nonsan-stay-01':'Lake terrace · Parking · Wi-Fi','nonsan-stay-02':'Courtyard · Shared kitchen · Breakfast area','nonsan-stay-03':'Family rooms · Parking · Laundry','fukuoka-stay-01':'Reading lounge · Shared kitchen · Wi-Fi','fukuoka-stay-02':'Luggage storage · Laundry · Wi-Fi','fukuoka-stay-03':'Sea-view terrace · Family rooms · Wi-Fi'}[id]):''};}
window.MUSUBU_CONTENT_LOCALES={
'주민 추천 노을 포인트':{en:{name:'Local Sunset Lookout',reason:'A fictional recommended spot for enjoying sunset over the lake.'}},
'호숫가 쉬어가는 자리':{en:{name:'Lakeside Rest Stop',reason:'A fictional place to pause and enjoy the water.'}},
'오호리공원의 조용한 벤치':{en:{name:'A Quiet Bench in Ohori Park',reason:'A fictional recommended spot for a quiet moment by the lake.'}},
'학생 추천 산책 쉼터':{en:{name:'Student-recommended Walking Rest Stop',reason:'A fictional rest stop inspired by walks around the park.'}}
};
})();
