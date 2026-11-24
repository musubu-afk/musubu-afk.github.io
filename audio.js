(() => {
'use strict';
const I = window.MUSUBU_I18N;
const players = ['Donam','Tapjeong','Ohori','Yufuin'].map(id => ({
audio: document.getElementById('storyAudio'+id),
button: document.getElementById('playBtn'+id),
status: document.getElementById('audioStatus'+id),
place: id.toLowerCase()
})).filter(p => p.audio && p.button && p.status);
const message = (p,key) => I.message(p.status,key);
const sync = p => I.message(p.button,p.audio.paused ? 'play':'playing');
function timeLabel(seconds) {
 const whole=Math.floor(Number.isFinite(seconds)?seconds:0);
 return Math.floor(whole/60)+':'+String(whole%60).padStart(2,'0');
}
function buildControls(p) {
 const {audio,button}=p;
 const row=document.createElement('div');
 row.className='story-controls';
 row.innerHTML=`<input class="story-seek" type="range" min="0" step="0.1" value="0">
  <div class="story-volume"><button type="button" aria-expanded="false">
   <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z"/><path class="sound-waves" d="M15 8q4 4 0 8m3-11q7 7 0 14"/></svg></button>
   <div class="volume-panel" hidden><button type="button"></button><input type="range" min="0" max="1" step=".05"></div></div>
  <div class="story-times"><span></span><span></span></div>`;
 audio.before(row);
 row.prepend(button);
 const seek=row.querySelector('.story-seek'), speaker=row.querySelector('.story-volume>button');
 const panel=row.querySelector('.volume-panel'),mute=panel.querySelector('button'),volume=panel.querySelector('input');
 const times=row.querySelector('.story-times');
 const label=(ko,ja)=>I.lang==='ja'?ja:ko;
 function updateTime(){
  const duration=Number.isFinite(audio.duration)?audio.duration:0;
  seek.disabled=!duration;
  seek.max=duration;
  seek.value=audio.currentTime;
  seek.style.setProperty('--played',(duration?100*audio.currentTime/duration:0)+'%');
  times.firstElementChild.textContent=timeLabel(audio.currentTime);
  times.lastElementChild.textContent=timeLabel(duration);
  seek.setAttribute('aria-valuetext',timeLabel(audio.currentTime)+' / '+timeLabel(duration));
 }
 function updateVolume(){
  const silent=audio.muted||audio.volume===0;
  volume.value=audio.muted?0:audio.volume;
  mute.textContent=silent?label('음소거 해제','消音解除'):label('음소거','消音');
  speaker.querySelector('.sound-waves').setAttribute('d',silent?'M16 9l6 6m0-6-6 6':'M15 8q4 4 0 8m3-11q7 7 0 14');
 }
 function showVolume(show){
  panel.hidden=!show;
  speaker.setAttribute('aria-expanded',String(show));
 }
 speaker.onclick=()=>showVolume(panel.hidden);
 row.addEventListener('focusout',e=>{if(!row.contains(e.relatedTarget))showVolume(false);});
 row.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();showVolume(false);speaker.focus();}});
 mute.onclick=()=>{if(!audio.volume){audio.volume=1;audio.muted=false;}else audio.muted=!audio.muted;updateVolume();};
 volume.oninput=()=>{audio.volume=Number(volume.value);audio.muted=audio.volume===0;};
 seek.oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value);updateTime();};
 for(const type of ['loadedmetadata','durationchange','timeupdate','seeked','emptied'])audio.addEventListener(type,updateTime);
 audio.addEventListener('volumechange',updateVolume);
 audio.controls=false;
 return ()=>{
  seek.setAttribute('aria-label',label('재생 위치','再生位置'));
  volume.setAttribute('aria-label',label('음량','音量'));
  speaker.setAttribute('aria-label',label('음량 설정','音量設定'));
  I.apply(audio.closest('.audioBox'));
  showVolume(false);updateTime();updateVolume();
 };
}
function source(p) {
p.audio.pause();
p.audio.src = 'assets/audio/'+p.place+'-'+(I.lang==='ja'?'ja':'ko')+'.mp3';
p.audio.load();
p.refresh();
message(p,'audioLoading');
sync(p);
}
players.forEach(p => {
p.refresh=buildControls(p);
p.audio.addEventListener('loadedmetadata',()=>message(p,'audioLoaded'));
p.audio.addEventListener('error',()=>message(p,'audioError'));
p.audio.addEventListener('play',()=>{players.forEach(other=>{if(other!==p)other.audio.pause();});sync(p);});
p.audio.addEventListener('pause',()=>sync(p));
p.audio.addEventListener('ended',()=>sync(p));
p.button.addEventListener('click',()=>{
if(!p.audio.paused){p.audio.pause();return;}
p.audio.play().catch(()=>message(p,'audioBlocked'));
});
source(p);
});
document.addEventListener('musubu:languagechange',()=>players.forEach(source));
})();
