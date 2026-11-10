(() => {
 const labels={
  ko:{uxNew:'신규 장소',uxNewBadge:'신규',uxShops:'동네 가게',uxRecommend:'추천 장소',uxRecommendShops:'추천 가게',uxRecommendEmpty:'현재 공개된 추천 정보가 없습니다.',uxSettings:'지역·언어 선택',uxRegion:'지역',uxLanguage:'언어'},
  ja:{uxNew:'新しい場所',uxNewBadge:'新着',uxShops:'まちのお店',uxRecommend:'おすすめスポット',uxRecommendShops:'おすすめのお店',uxRecommendEmpty:'公開中のおすすめ情報はありません。',uxSettings:'地域・言語の選択',uxRegion:'地域',uxLanguage:'言語'},
  en:{uxNew:'New places',uxNewBadge:'New',uxShops:'Local shops',uxRecommend:'Recommended places',uxRecommendShops:'Recommended shops',uxRecommendEmpty:'No public recommendations yet.',uxSettings:'Region and language',uxRegion:'Region',uxLanguage:'Language'}
 };
 for(const [lang,values] of Object.entries(labels))Object.assign(window.MUSUBU_LOCALES[lang],values);
})();
