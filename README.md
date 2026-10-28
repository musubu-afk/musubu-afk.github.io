# MUSUBU — 논산 QR 관광 데모

공개 주소: https://musubu-afk.github.io/

QR → 일본어 이야기 감상 → 카테고리 → 업체 상세 → 익명 후기 저장 → 데모 바우처.

## 구성
- `index.html`: 기존 녹색 화면·내장 일본어 MP3·QR 링크·바우처, 접근성 있는 상세 dialog.
- `app.js`, `shops.css`: 모바일 Bottom Sheet / PC 중앙 패널, 리뷰·실시간 처리.
- `shops.js`: 카테고리별 2곳, 총 6개 가상 업체. 실제 API가 아닌 발표용 데이터.
- `demo-shop.html`: 공식 사이트 버튼으로 새 탭에 열리는 가상 소개 페이지. 실제 업체가 아님을 표시.
- `vendor/supabase.js`: Supabase JS 2.117.2 고정 버전, 외부 CDN 없이 제공.
- `database/schema.sql`, `database/seed.sql`: 적용한 DB 구조 및 가상 업체 데이터 기록.
- `qr.html`: 기존 QR 유지. GitHub Pages 배포 workflow 유지.

## Supabase
서울 리전 Free 프로젝트: `fzynbjgkictmlmuxfldl`.
프런트엔드는 publishable key만 사용. 관리자 키를 사용하지 않음.

- `shops`: shop_id, name, category, image_url, address, business_hours, phone, products, external_url, map_url, description, is_demo.
- `reviews`: id(UUID), shop_id(FK), rating(1–5), review_text(공백 제외 최소 2자·최대 500자), created_at(DB 시각), request_id(중복 요청 방지 UUID).
- 두 테이블 RLS 활성화. anon은 SELECT, reviews의 shop_id/rating/review_text/request_id만 INSERT 가능. UPDATE/DELETE 불가. 업체 INSERT 불가. id/created_at 임의 지정 불가.
- `shop_review_stats()`는 SECURITY INVOKER로 전체 후기 개수·평균 계산. anon에만 실행 권한 부여.
- reviews를 supabase_realtime publication에 추가. 선택한 업체의 INSERT만 구독, 닫으면 연결 해제. 구독 완료·재연결 시 DB를 다시 조회해 누락 보정.
- 화면에는 최신 후기 20개만 전송. 후기 본문은 textContent로 표시해 HTML 실행을 막음.
- DB 저장 결과의 실제 id가 확인된 뒤에만 바우처 활성화. 전송 실패·유효성 오류는 발급하지 않음.
- 바우처는 현재 페이지 세션의 발표용 UI 상태이며 실제 금전 가치, 본인 인증, 영구 사용 이력은 없음.

## 운영 범위
소규모 발표·테스트를 위한 Free 구성. 요금제 업그레이드/유료 서비스는 사용하지 않음. 무료 한도 초과 시 무제한 운영을 보장하지 않으며 프로젝트가 비활성 상태가 되면 발표 전 대시보드에서 확인이 필요함.
공개 익명 등록 특성상 악의적 대량 등록 방어는 별도 서비스 운영 단계에서 추가해야 함. 개인정보를 후기에 적지 않도록 안내함.
가상 주소·전화번호·가격이며 지도는 논산 지역 검색. 사진은 Unsplash 참고 이미지, 로드 실패 시 로컬 대체 이미지 표시.

## 재현
`npm ci --ignore-scripts` 다음 `npm run build:vendor`. 사이트는 별도 서버 없이 정적 파일로 동작.
DB SQL은 이미 적용되어 있으므로 기존 프로젝트에 중복 실행하지 않음. DB 설정을 바꾸면 SQL 기록과 클라이언트 데이터도 함께 관리.

## 한국어 / 日本語 (2026-09-30)

- 기본 한국어. 언어 우선순위는 유효한 `?lang=ko|ja` → `localStorage['musubu.language']` → `ko`입니다.
- `i18n.js`의 `translations.ko`, `translations.ja`에서 UI/오류/안내 문구를 관리합니다. `shopTranslations`는 기존 shop_id에 대응하는 일본어 설명과 메뉴명입니다. 상호명과 사용자 리뷰 원문은 변경하지 않습니다.
- 언어 변경은 페이지를 다시 불러오지 않습니다. `<html lang>` 및 `lang-ko/theme-ko`, `lang-ja/theme-ja` 클래스를 바꾸고 `musubu:languagechange` 이벤트로 동적 화면을 갱신합니다. 작성 중인 후기, 선택 별점, 활성 Realtime 채널과 발급 바우처는 유지됩니다.
- `themes.css`는 기존 한국어 녹색 테마를 유지하고 일본어에서 코랄/핑크/남색 테마를 적용합니다. 모바일 Bottom Sheet, 일본어 줄바꿈, 터치 버튼, reduced-motion 설정을 지원합니다.
- 동일한 기존 Supabase 프로젝트, reviews 테이블, shop_id 및 RLS를 사용합니다. 별도 DB나 유료 번역 API, 추가 서버는 없습니다.
- 일본어 발표 URL: https://musubu-afk.github.io/?lang=ja
- 한국어 발표 URL: https://musubu-afk.github.io/?lang=ko
- `qr.html`에서 두 언어 QR을 표시하고 SVG로 저장할 수 있습니다. QR 이미지는 로컬 자산이며 외부 QR API에 의존하지 않습니다.
- `audio.js`는 기존 페이지에 포함된 일본어 MP3를 그대로 재생하고 상태 문구를 번역합니다. 브라우저 기본 오디오 컨트롤의 언어는 브라우저/운영체제 설정을 따릅니다.

## 참여형 지도 · 2026-10-27

- `explore.js`, `explore.css`: Leaflet 지도, 미리보기, 기존 이야기 dialog, 좋아요, 지도 위치 선택과 추천 폼.
- `map-config.js`: 지도 타일 제공자와 지역 기본 설정. 지역 중심·범위는 `tour_regions`에서 갱신. 신규 지역은 지역 버튼/콘텐츠 준비도 함께 필요.
- Leaflet 1.9.4는 로컬 vendor 파일로 고정. OSM 표준 타일은 현지 지명을 사용하므로 일본은 일본어 지명, 한국은 한국어 지명을 표시. UI는 기존 i18n.js ko/ja 사전을 이용.
- Google Maps는 현재 사용하지 않으며 지도 API 키·결제 설정 불필요. OSM 서버 정책을 준수하고, 오프라인 저장/대량 선로딩 없이 브라우저 캐시를 사용. 소규모 데모용이며 SLA/무제한 트래픽을 보장하지 않음. 트래픽이 늘면 map-config.js의 타일 제공자와 저작권 표시를 교체.
- `tour_regions`: 지역명, 지도 중심, 확대 수준, 제출 허용 범위.
- `places`: 위치, 지역, 이름/유형/이유/팁/언어, 상태, 원래 이야기 연결, 번역, 향후 사진/음성/산책길 확장 필드. 기존 공식 이야기4곳 + 가상 추천4곳. 유후인은 오이타 근교 여행으로 명시.
- `place_likes`: 장소 + 익명 브라우저 UUID 복합 PK, DB 저장 시각. public에는 장소별 합계만 사용하며 visitor_id/author_id는 조회 권한을 주지 않음.
- 위 세 테이블 RLS 활성화. anon은 승인된 장소만 조회하고 허용된 필드만 INSERT. 2026-10-28부터 신규 등록 status는 기본 approved이며 브라우저에서 지정/수정/삭제 불가. 좋아요는 승인된 장소에만 INSERT 가능. 집계 함수는 security invoker.
- 익명 UUID는 localStorage에 보관, 같은 브라우저에서 장소당 1회. 인증된 본인 확인이 아니므로 저장소 초기화/다른 기기/의도적인 헤더 변경까지 막는 장치는 아님. 공개 운영에서는 인증·요청 제한을 추가할 것.
- 주민 추천 본문은 작성 원문을 그대로 textContent로 표시. 사용자 사진 업로드·관리자 웹 UI·신고·산책 경로 그리기는 2/3차 범위. 현재 사용자의 GPS를 수집하지 않음.
- 신규 장소는 즉시 공개합니다. 삭제 승인 방법은 아래 2026-10-28 운영 안내를 따릅니다. 변경 전 pending 데이터는 임의 승인하지 않고 보존했습니다.
- 기존 reviews/shops, 실시간 후기, 사진4개, MP3 8개는 변경하지 않음. 쿠폰은 기존 후기 저장 성공 조건을 사용하며 상점 위로 이동. 후쿠오카 상점·쿠폰은 기존대로 준비 중.
- 테이블 SQL은 이미 원격에 적용됨. `database/places.sql`과 `places-seed.sql`은 재현 기록이며 운영 DB에 중복 실행하지 않음.

## 화면 전환·즉시 공개·삭제 검토 (2026-10-28)

- `screens.js`: story / shops / review 중 선택한 화면만 표시. 뒤로/앞으로, 직접 링크, 지역 전환과 기존 voucher 링크 지원. 상단 메뉴는 스크롤 대신 화면 전환.
- 지도 클릭 → 임시 빨간 핀 표시 → 위치 확인 → ‘이 위치로 작성하기’ → 주소와 내용 작성 → 즉시 공개. 아직 제출하지 않은 핀은 DB에 저장하지 않습니다.
- `places.address`: 작성자가 입력한 주소를 저장하고 상세정보에 표시. 좌표는 지도 배치용으로만 사용. 주소 조회는 Geoapify로 연결되어 있습니다. 입력 주소의 정확성을 보증하거나 사용자 원문을 자동 번역하지 않습니다. 기존 주소 없는 장소에는 ‘주소 미등록’을 표시합니다.
- `place_deletion_requests`: place_id, reason, requester_id, status(pending/approved/rejected), created_at, reviewed_at. 익명은 요청 INSERT만 가능. 요청 목록/요청자 ID 조회와 승인 UPDATE 불가.
- `database/place-publishing.sql`은 적용된 변경 기록입니다. 기존 운영 DB에 다시 실행하지 마세요.

### 팀원 삭제 승인 방법

1. Supabase의 `fzynbjgkictmlmuxfldl` 프로젝트를 엽니다.
2. **Table Editor → public → place_deletion_requests**를 선택합니다.
3. `status = pending`으로 필터합니다. `place_id`로 places 테이블의 장소명·주소·내용을 대조하고 reason을 확인합니다.
4. 삭제에 동의하면 요청 행의 `status`를 **approved**로 변경하고 저장합니다.
5. DB 트리거가 해당 places.status를 rejected로 바꾸고 reviewed_at을 기록합니다. 다음 장소 조회부터 공개 지도에 표시되지 않습니다.
6. 삭제하지 않을 경우 요청의 status를 **rejected**로 변경합니다. 원래 장소는 그대로 공개됩니다.

영구 삭제가 아닌 공개 중단 방식이므로 원본/요청 이력이 남습니다. 실수 승인 시 팀 관리자가 places.status를 approved로 복구할 수 있습니다. 승인 요청 status만 되돌리는 것은 장소를 자동 복구하지 않습니다. 팀원에게 이 Supabase 프로젝트의 DB 수정 권한이 있어야 합니다. GitHub 협업 권한과 Supabase 권한은 별개입니다. 관리자 비밀키를 팀 메신저나 사이트 코드에 공유하지 마세요.

주소 자동 조회를 위한 공개 Edge Function은 자동 승인 검토에서 거절되어 배포하지 않았습니다. 관련 임시 DB 캐시/제한 테이블도 제거했습니다. 관리자 키는 프런트엔드에 포함되지 않습니다.


## 주소 자동 조회 (2026-10-28 후속 적용)
- `geocoding.js`: Geoapify 브라우저용 키로 직접 역지오코딩. Allowed origins를 MUSUBU 도메인으로 제한. 관리자 DB 권한은 사용하지 않음.
- 지도 이동/핀 변경만으로는 API 호출하지 않고, ‘이 위치로 작성하기’에서 호출. 같은 좌표·언어는 현재 페이지 메모리 캐시 재사용.
- 한국어/일본어 lang 적용. 10초 제한, 오류 시 수동 입력. 새 위치 선택/창 닫기/지역 변경 시 이전 요청 취소. 직접 입력한 값은 비동기 응답이 덮어쓰지 않음.
- 실제 API 검증: MUSUBU Origin HTTP200, 다른 Origin HTTP401. 공개 페이지에서 논산 한국어 및 후쿠오카 일본어 주소 자동 입력 확인. 주소는 가까운 도로/건물 기준일 수 있으므로 제출 전 확인·수정 필요.
- 기존 Supabase 스키마/리뷰/사진/음성 변경 없음. 기존 address 필드로 저장.
