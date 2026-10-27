# 참여형 지도 1차 검증 · 2026-10-27 KST

대상: https://musubu-afk.github.io/
기능 배포: 360783621307717a7c19832eff7df28b8c868ab3. GitHub Actions 두 배포 모두 success.
후속 문구/반응형 검증 도구: fa68c8bfb066bab64ef5b2df3632442aa22105bd.

## 실제 공개 페이지에서 확인

- 논산/후쿠오카 전환: 지도 중심, 마커, 목록, 기존 지역별 상점 영역 전환.
- Leaflet/OSM 지도 실제 타일 표시, 한국은 한국어 지명·일본은 일본어 지명.
- 돈암서원 마커 → 짧은 미리보기 → 상세 패널. 긴 이야기 기본 펼침 제거.
- 공식 4곳 사진 로딩, 한국어/일본어 음성 총 8개 play 버튼과 paused=false 확인.
- 사진 4개·MP3 8개: 기존 Git 원본과 byte-identical. 사진은 원본 비율 유지.
- 상세 패널 내부 한국어/日本語 전환, 일본어 테마 적용.
- 돈암서원 좋아요 0→1: DB 저장, 버튼 중복 비활성화. 테스트 좋아요 정리.
- 일본어 지도 클릭: 33.584678,130.377331 자동 입력. UI 제출 후 places의 language=ja, region=fukuoka, status=pending 확인.
- 한국어 다른 탭에서 pending 행 미노출. 관리자 SQL 승인 후 '새 장소 확인'으로 일본어 이름/내용 표시. 자동번역 없음.
- 빈 후기 등록 차단, 쿠폰 잠금 유지.
- 한국어 A 탭에서 별점5 후기 실제 등록 → 일본어 B 탭 새로고침 없이 원문 표시. 4개/4.3 → 5개/4.4로 갱신.
- A 쿠폰 활성화, B 쿠폰 비활성 유지. A 사용 완료 버튼 처리 확인.
- 브라우저 콘솔에서 앱 JavaScript 오류 미관찰. 테스트 환경 브라우저 확장 프로그램 metadata 오류는 앱 오류와 구분.

## API/RLS 실측

publishable key + 익명 브라우저 UUID로 실제 HTTP 요청:
- 승인 장소 SELECT 200; pending 장소 조회 결과 빈 배열.
- author_id/visitor_id SELECT 거부.
- status=approved 직접 INSERT, 승인 PATCH, DELETE 거부.
- 지역 허용 범위 밖 좌표 INSERT 거부.
- pending 장소 좋아요 INSERT 거부.
- 동일 visitor/place 첫 좋아요201, 중복409.
- 좋아요 집계와 기존 shop_review_stats RPC 정상.
- Supabase Security Advisor lints=[] 확인.

## 테스트 데이터 정리

- API 추천: 81d5b6c1-b3ac-4719-b56e-e944203010ee
- 일본어 UI 추천: 26d00268-9263-451d-b3d5-c9df3f3d6e24
- 후기: 828f5de1-0032-44e7-8a7b-4ee06bccd352
위 검증용 행과 해당 테스트 좋아요만 삭제. 다른 이용자의 제출·후기는 유지.

## 모바일 검증 범위

tests/responsive.html에서 실제 공개 index.html을 360/390/412px iframe viewport로 표시.
- 360px 일본어 상세: scrollWidth=clientWidth=360.
- 390px 상세: 바닥 정렬(bottom=780), width=390, 가로 넘침 없음, 탑정호 사진 자연 크기1500 확인.
- 412px 일본어 위치 추천 폼 입력: dialogWidth=412, 가로 넘침 없음.
- 하단 미리보기/상세 Bottom Sheet 및 언어 전환·오디오 확인.

실제 Galaxy Samsung Internet / Android Chrome / iPhone Safari에서의 검증은 수행하지 않음.
실시간 리뷰는 두 개의 탭(각각 별도 Supabase 클라이언트)으로 확인했으며 서로 다른 브라우저 세션이라고 주장하지 않음.

## 유지/범위

기존 상점6개, shops/reviews 구조, 후기 Realtime, QR4개, audio.js/app.js 유지.
후쿠오카 상점·후기·쿠폰은 기존과 같이 준비 중.
사진 업로드, 전용 관리자 UI, 신고, 인기 TOP, 산책길 직접 그리기는 이번 범위에 포함하지 않음.
승인은 Supabase 관리자 Table Editor에서 진행. 새 장소는 페이지 진입/탭 복귀/'새 장소 확인'으로 반영.
OSM 타일은 무료 소규모 데모용 best-effort이며 SLA 없음. 지도 전체 라벨을 UI언어로 강제 번역하지 않음.
브라우저 UUID 기반 중복 방지는 본인 인증/악의적 도배 방지와 다름.
