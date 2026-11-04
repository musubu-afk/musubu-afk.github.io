// Operator-maintained data; banner text is rendered as HTML, not baked into images.
// Existing name/translations, image_url/url fields are retained for compatibility.
window.MUSUBU_FESTIVALS = [
 {
  id:'nonsan-yesalbi-night-market-2026',region:'nonsan',enabled:true,
  name:'2026 화지중앙시장 옛살비 야시장',start_date:'2026-10-23',end_date:'2026-11-07',
  location:'화지중앙시장 제9구역 일원',schedule:'매주 금·토 18:00 ~ 21:00',
  description:'먹거리와 체험, 버스킹 공연을 함께 즐기는 논산의 가을 야시장',
  button_text:'자세히 보기',image_url:'assets/festivals/yesalbi-reference.jpg',url:null,
  image_reference:true,source:'operator-supplied',
  translations:{
   ja:{name:'2026 花枝中央市場「イェッサルビ」ナイトマーケット',location:'花枝中央市場 第9区画周辺',schedule:'毎週金・土曜日 18:00～21:00',description:'グルメや体験、ストリートライブを楽しむ論山の秋のナイトマーケット',button_text:'詳しく見る'},
   en:{name:'2026 Hwaji Jungang Market Yesalbi Night Market',location:'Hwaji Jungang Market, Zone 9',schedule:'Fridays and Saturdays, 18:00–21:00',description:'An autumn night market in Nonsan with food, activities and busking.',button_text:'View details'}
  }
 },
 {
  id:'fukuoka-sakura-event-demo',region:'fukuoka',enabled:true,demo:true,show_on_home:true,
  name:'후쿠오카 벚꽃 축제',start_date:null,end_date:null,
  location:'오호리공원 / 마이즈루공원 일대 (예시)',
  description:'후쿠오카의 봄 풍경과 벚꽃을 즐길 수 있는 지역 이벤트',
  button_text:'자세히 보기',image_url:'assets/festivals/fukuoka-sakura-reference.jpg',url:null,image_reference:true,
  translations:{ja:{name:'福岡さくら祭り',location:'大濠公園・舞鶴公園周辺（例）',description:'福岡の春景色と桜を楽しめる地域イベント',button_text:'詳しく見る'},en:{name:'Fukuoka Sakura Festival',location:'Ohori Park / Maizuru Park area (example)',description:'A local event celebrating spring scenery and cherry blossoms in Fukuoka.',button_text:'View details'}}
 }
];
window.MUSUBU_ROUTES = {};
