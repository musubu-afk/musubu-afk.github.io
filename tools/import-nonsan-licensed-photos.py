"""Import only photos whose bytes match the reviewed attachment SHA-256."""
import hashlib, io, json, pathlib, re, tempfile, urllib.request, concurrent.futures, time
from PIL import Image, ImageOps
P=pathlib.Path
ROWS=json.loads("[[\"assets/donam-seowon.jpg\",\"Donam Seowon\",\"Ryuch\",\"CC BY-SA 3.0\",\"https://commons.wikimedia.org/wiki/File:Donam_Seowon.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/0/05/Donam_Seowon.jpg\",\"02ecfdd4c265582d4fffcbee73202a1862594020773c66dfdf0981f6d8cbb928\"],[\"assets/tapjeongho.jpg\",\"탑정호 출렁다리 (1)\",\"논산시청\",\"공공누리 제1유형\",\"https://www.nonsan.go.kr/kor/html/sub03/030106.html?mode=V&no=7f45afe4be1f1c0567a369ebaa079146\",\"https://www.nonsan.go.kr/kor/html/sub03/030106.html?mode=D&no=7f45afe4be1f1c0567a369ebaa079146&file_id=187983&dlgt=N\",\"e9ff40b5a6f4acd43fdd7a44788508dd1d05564f04098ef934020bfe2446d14e\"],[\"assets/nonsan-photos/gaetaesa-1.jpg\",\"철확\",\"Trainholic\",\"CC BY-SA 4.0\",\"https://commons.wikimedia.org/wiki/File:Iron_Pot_of_Gaetaesa_Temple.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/c/c6/Iron_Pot_of_Gaetaesa_Temple.jpg\",\"c5904bf78adf1e7905152a65a4b7549aaf31e9f88a9bdac7e2cca3810904fd4e\"],[\"assets/nonsan-photos/gwanchoksa-1.jpg\",\"미륵보살입상과 석등\",\"G41rn8\",\"CC BY-SA 4.0\",\"https://commons.wikimedia.org/wiki/File:Gwanchoksa_-_Maitreya_IMG_20160928_034411.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/e/ec/Gwanchoksa_-_Maitreya_IMG_20160928_034411.jpg\",\"a4c5826513829a5ec38829a6b67c870090b3f8b79758a04af4a60641838345ac\"],[\"assets/nonsan-photos/gwanchoksa-2.jpg\",\"대웅전\",\"G41rn8\",\"CC BY-SA 4.0\",\"https://commons.wikimedia.org/wiki/File:Gwanchoksa_-_Main_Hall_IMG_20160928_033251.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/d/d5/Gwanchoksa_-_Main_Hall_IMG_20160928_033251.jpg\",\"2256a0b0fdb81d9f5cfe89fafb6dd34fe02b4493bcd02f2bc9fca2b9be0e1406\"],[\"assets/nonsan-photos/gwanchoksa-3.jpg\",\"사찰 마당\",\"G41rn8\",\"CC BY-SA 4.0\",\"https://commons.wikimedia.org/wiki/File:Gwanchoksa_-_Courtyard_IMG_20160928_035626.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/4/48/Gwanchoksa_-_Courtyard_IMG_20160928_035626.jpg\",\"ce38ac0861f33937184e95ec47d340b35624aba1cd059f6ea1e9fe2e46c68d47\"],[\"assets/nonsan-photos/onbit-forest-1.jpg\",\"온빛 자연 휴양림 전경 1\",\"논산시청\",\"공공누리 제1유형\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&group_at=media_sub0301\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&file_id=127275&dlgt=N\",\"b75a042a24b046c775bef9bcfd676b1029e78b77af9a7b1b1d5e1b6ffa4535de\"],[\"assets/nonsan-photos/onbit-forest-2.jpg\",\"온빛 자연 휴양림 전경 2\",\"논산시청\",\"공공누리 제1유형\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&group_at=media_sub0301\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&file_id=127276&dlgt=N\",\"5ba0a2f74607959940f2e5fae49acf5889eb113b3f93e5a541c3f7eaa328fb99\"],[\"assets/nonsan-photos/onbit-forest-3.jpg\",\"온빛 자연 휴양림 전경 3\",\"논산시청\",\"공공누리 제1유형\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&group_at=media_sub0301\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0304&no=c09d80a052deca4db0da1fe999efc362&file_id=127277&dlgt=N\",\"c9f4ff132a49828d906cc361398ed8f0b6f6a7cb834b7b90ad9b47c48fe16c7c\"],[\"assets/nonsan-photos/ssanggyesa-1.jpg\",\"대웅전 측면\",\"문화재청\",\"공공누리 제1유형 / CC BY-SA 4.0\",\"https://commons.wikimedia.org/wiki/File:%EB%85%BC%EC%82%B0_%EC%8C%8D%EA%B3%84%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_01.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/2/22/%EB%85%BC%EC%82%B0_%EC%8C%8D%EA%B3%84%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_01.jpg\",\"c8bd72297a459deca2dc9a89629fd9b16e9e0c33b97f5ae9702edb84c1e479df\"],[\"assets/nonsan-photos/ssanggyesa-2.jpg\",\"대웅전 내부 목조 장식\",\"문화재청\",\"공공누리 제1유형 / CC BY-SA 4.0\",\"https://commons.wikimedia.org/wiki/File:%EB%85%BC%EC%82%B0_%EC%8C%8D%EA%B3%84%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_02.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/d/d5/%EB%85%BC%EC%82%B0_%EC%8C%8D%EA%B3%84%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_02.jpg\",\"c5cc97c94f5f61c0a2c9279236b48792ece3cf90de63de9e6e7bd3bae3917639\"],[\"assets/nonsan-photos/ssanggyesa-3.jpg\",\"대웅전 꽃무늬 문살\",\"국가유산청 국가유산포털\",\"공공누리 제1유형\",\"https://www.heritage.go.kr/heri/cul/imgHeritage.do?ccimId=1617755&ccbaKdcd=12&ccbaAsno=0004080000000&ccbaCtcd=34\",\"https://www.heritage.go.kr/unisearch/images/treasure/1617755.jpg\",\"46a9ec5ab6d4e921757ee7eabdd8dd3645fff340a4a0d21ffeb4a113cd688b26\"],[\"assets/nonsan-photos/sunshine-land-1.jpg\",\"선샤인 랜드 풍경 2\",\"논산시청\",\"공공누리 제1유형\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&group_at=media_sub0301\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&file_id=132996&dlgt=N\",\"f58deffe2a35fa072201b72c253d13721ffd57ad6b824336b3f66a9039a013c4\"],[\"assets/nonsan-photos/sunshine-land-2.jpg\",\"선샤인 랜드 풍경 1\",\"논산시청\",\"공공누리 제1유형\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&group_at=media_sub0301\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&file_id=132995&dlgt=N\",\"73686e132ca77e19949bd828d6fe8136b70a4c36e4c0b3234a48f15d5889a1d4\"],[\"assets/nonsan-photos/sunshine-land-3.jpg\",\"선샤인 랜드 풍경 3\",\"논산시청\",\"공공누리 제1유형\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=V&site_dvs_cd=media&menu_dvs_cd=0301&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&group_at=media_sub0301\",\"https://www.nonsan.go.kr/media/html/sub03/0301.html?mode=IMG&site_dvs_cd=media&code=media_sub0303&no=9a4de0a0bae501f0ef735d128308c510&file_id=132997&dlgt=N\",\"b8a575882892c6396b315804a2c63deae10454e169517d11f21284d209f7ad20\"],[\"assets/nonsan-photos/gyeonhwon-tomb-1.jpg\",\"전 견훤묘\",\"한국학중앙연구원·김연삼\",\"공공누리 제1유형\",\"https://commons.wikimedia.org/wiki/File:%EC%A0%84_%EA%B2%AC%ED%9B%A4%EB%AC%98.jpg\",\"https://upload.wikimedia.org/wikipedia/commons/0/0c/%EC%A0%84_%EA%B2%AC%ED%9B%A4%EB%AC%98.jpg\",\"a979ee510024c1ef59b92802078ee317a8a1cfc195f2464411ddaae5d152a3e2\"]]")
ROOT=P("assets/nonsan-photos")
def acquire(row):
    path,title,author,lic,source,url,expected=row
    for attempt in range(3):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":"MUSUBU-university-tourism/1.0 (https://musubu-afk.github.io/)","Referer":source,"Accept":"image/*,*/*;q=0.5"})
            with urllib.request.urlopen(req,timeout=45) as res:
                data=res.read(32*1024*1024)
            if hashlib.sha256(data).hexdigest()!=expected: raise ValueError("SHA-256 mismatch")
            with Image.open(io.BytesIO(data)) as image:
                image.verify()
            return path,data
        except Exception as exc:
            print(path, type(exc).__name__, str(exc), flush=True)
            if attempt==2: raise
            time.sleep(3*(attempt+1))
# Do not modify the checkout unless every reviewed original has been retrieved.
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    verified=dict(pool.map(acquire,ROWS))
credits={}
for path,title,author,lic,source,url,expected in ROWS:
    data=verified[path]
    with Image.open(io.BytesIO(data)) as src:
        image=ImageOps.exif_transpose(src).convert("RGB")
        image.thumbnail((1920,1920),Image.Resampling.LANCZOS)
        P(path).parent.mkdir(parents=True,exist_ok=True)
        image.save(path,format="JPEG",quality=88,optimize=True,progressive=True)
        if path in ("assets/donam-seowon.jpg","assets/tapjeongho.jpg"):
            image.thumbnail((480,480),Image.Resampling.LANCZOS)
            image.save("assets/map-thumbs/"+P(path).stem+".webp",format="WEBP",quality=84)
    urls=[]
    if "공공누리" in lic: urls.append(["공공누리 제1유형","https://www.kogl.or.kr/info/licenseType1.do"])
    if "CC BY-SA" in lic:
        version="3.0" if "3.0" in lic else "4.0"
        urls.append(["CC BY-SA "+version,"https://creativecommons.org/licenses/by-sa/"+version+"/"])
    credits[path]={"title":title,"author":author,"license":lic,"source":source,"licenseLinks":urls,"original":url,"original_sha256":expected,"published_sha256":hashlib.sha256(P(path).read_bytes()).hexdigest(),"changes":"Resized if needed, JPEG re-encoded; responsive display may crop. Map thumbnail resized/WebP encoded where applicable."}
    if path in ("assets/donam-seowon.jpg","assets/tapjeongho.jpg"):
        thumb="assets/map-thumbs/"+P(path).stem+".webp"
        credits[thumb]={**credits[path],"published_sha256":hashlib.sha256(P(thumb).read_bytes()).hexdigest()}
for old in ROOT.glob("*.jpg"):
    if str(old) not in verified: old.unlink()
manifest=json.loads((ROOT/"manifest.json").read_text())
for key,entry in manifest.items():
    prefix=entry["photos"][0].rsplit("-",1)[0]
    entry["photos"]=[p for p in verified if p.startswith(prefix+"-")]
    entry["source"]="See photo-credits.json for individual source, creator, license and changes."
(ROOT/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
(ROOT/"photo-credits.json").write_text(json.dumps(credits,ensure_ascii=False,indent=2)+"\n")
(ROOT/"README.md").write_text("# Nonsan photo licenses\n\nIndividual photo credits and license links: [photo-credits.json](photo-credits.json). Third-party photos retain their individual licenses, not the site's software license. Six no-derivatives photos from the supplied review were excluded to preserve the existing cover UI without license conflicts. Published files are resized/re-encoded; CSS may crop.\n")
def replace_once(s,old,new):
    if s.count(old)!=1: raise ValueError("Unexpected source: "+old[:90])
    return s.replace(old,new,1)
# Only replace image selection; no CSS or existing layout changes.
p=P("explore.js");s=p.read_text()
start=s.index("async function attachNonsanPhotos(rows){")
end=s.index("async function load(){",start)
s=s[:start]+"""const licensedNonsanPhotoManifest = """+json.dumps(manifest,ensure_ascii=False)+""";
async function attachNonsanPhotos(rows){
 for(const p of rows){
  if(p.region!=='nonsan'||p.kind!=='official')continue;
  const entry=licensedNonsanPhotoManifest[p.id];
  if(entry){p.image_url=entry.photos[0];p.photos=entry.photos.slice();p.photo_url=null;}
  else if(p.story_key==='donam'||p.story_key==='tapjeong'){
   const path=p.story_key==='donam'?'assets/donam-seowon.jpg':'assets/tapjeongho.jpg';
   p.image_url=path;p.photos=[path];p.photo_url=null;
  }
 }
}
"""+s[end:];p.write_text(s)
p=P("phase-two.js");s=p.read_text()
s=replace_once(s,"function photos(p){const story=", "function photos(p){if(p.region==='nonsan'&&p.kind==='official'&&Array.isArray(p.photos)&&p.photos.length&&p.photos.every(x=>Object.hasOwn(licensedPhotoCredits,x)))return [...new Set(p.photos)];const story=")
pos=s.index("function setPlacePhotoCredit(")
s=s[:pos]+"const licensedPhotoCredits="+json.dumps(credits,ensure_ascii=False,separators=(",",":"))+";\n"+s[pos:]
start=s.index("function setPlacePhotoCredit(");end=s.index("// The newly added Nonsan photo package",start)
s=s[:start]+"""function creditLink(url,label){const a=make('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label;a.style.color='inherit';return a;}
function creditLine(src){const c=licensedPhotoCredits[src];if(!c)return null;const line=make('div');line.append(document.createTextNode(c.title+' — '+c.author+' · '),creditLink(c.source,I.lang==='ja'?'原典':'원본 출처'));for(const [label,url] of c.licenseLinks){line.append(document.createTextNode(' · '),creditLink(url,label));}line.append(document.createTextNode(I.lang==='ja'?' · サイズ・形式調整／表示時のトリミング':' · 크기·형식 최적화 / 화면 표시 시 크롭'));return line;}
function setPlacePhotoCredit(node,pics){node.replaceChildren();const list=Array.isArray(pics)?pics:[pics];const lines=list.map(creditLine).filter(Boolean);if(lines.length){node.hidden=false;const d=make('details');const summary=make('summary');summary.textContent=I.lang==='ja'?'写真の出典・ライセンス':'사진 출처 및 이용조건';summary.style.cursor='pointer';d.append(summary,...lines);node.append(d);return;}const c=placePhotoCredits.get(list[0]);node.hidden=!c;if(c)node.append(creditLink(c.source,'['+c.title+'] 한국민족문화대백과사전 (한국학중앙연구원 · 공공누리 제1유형)'));}
"""+s[end:]
s=replace_once(s,"if(this.photoCredit)setPlacePhotoCredit(this.photoCredit,pics[0]);","if(this.photoCredit)setPlacePhotoCredit(this.photoCredit,pics);")
s=replace_once(s,"viewer.querySelectorAll('img').forEach(n=>n.remove());","viewer.querySelectorAll('img,.licensed-photo-viewer-credit').forEach(n=>n.remove());")
s=replace_once(s,"viewer.append(im);}viewer.showModal();","viewer.append(im);const line=creditLine(src);if(line){line.className='licensed-photo-viewer-credit';line.style.cssText='font-size:11px;color:inherit;text-align:center;margin:4px 0 12px;overflow-wrap:anywhere';viewer.append(line);}}viewer.showModal();")
p.write_text(s)
p=P("index.html");s=p.read_text();s=replace_once(s,"눈 덮인 돈암서원의 전경","돈암서원 경내 전경");s=replace_once(s,"explore.js?v=20261124-nonsan-photo-package","explore.js?v=20261127-licensed-photos");s=replace_once(s,"phase-two.js?v=20261124-shop-management","phase-two.js?v=20261127-licensed-photos");p.write_text(s)
p=P("i18n.js");s=p.read_text();s=replace_once(s,"눈 덮인 돈암서원의 전경","돈암서원 경내 전경");s=replace_once(s,"雪に包まれた遯巌書院の全景","遯巌書院の境内");p.write_text(s)
print("Verified and prepared",len(ROWS),"licensed photos; no CSS edits.")
