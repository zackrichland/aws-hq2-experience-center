import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createWorld } from './world.js';
import './style.css';

const $ = (selector) => document.querySelector(selector);
const app = $('#app');
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .96;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, .045, 90);
const pmrem = new THREE.PMREMGenerator(renderer);
const environment = pmrem.fromScene(new RoomEnvironment(), .04);
const { scene, blueLight, interactiveScreens } = createWorld(renderer);
scene.environment = environment.texture;
scene.environmentIntensity = .42;

const composer = new EffectComposer(renderer);
composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), .17, .15, 1.15));
composer.addPass(new OutputPass());

const stops = [
  {title:'The arrival', description:'A blue glow marks the entrance to the Experience Center.', position:[-6.22,1.69,7.44], look:[-2.70,1.85,8.15]},
  {title:'The gallery', description:'A warm wood lattice floats over the open exhibition floor.', position:[-4.50,1.70,5.72], look:[2.0,1.93,1.12]},
  {title:'Stories made tangible', description:'Backlit exhibit bays bring live AI experiences into focus.', position:[-2.72,1.70,2.38], look:[7.24,1.98,-.36]},
  {title:'Every detail matters', description:'Light, material, and motion give the room its own rhythm.', position:[0,1.74,4.70], look:[0,2.24,-5.43]},
  {title:'Beyond the glass', description:'A closer look at the adjacent spaces built for collaboration.', position:[4.10,1.74,3.65], look:[5.75,1.81,8.05]},
  {title:'The demo room', description:'A dedicated space for exploring how AI changes real work.', position:[.18,1.63,6.36], look:[-.55,1.75,8.72]},
];
const positions = stops.map(s => new THREE.Vector3(...s.position));
const looks = stops.map(s => new THREE.Vector3(...s.look));
const posCurve = new THREE.CatmullRomCurve3(positions, false, 'centripetal');
const lookCurve = new THREE.CatmullRomCurve3(looks, false, 'centripetal');
const tourDuration = 60;
const filmPairs = [
  ['4664','4662'],['4663','4659'],['4660','4661'],['4659','4660'],['4666','4663'],['4665','4666'],
];
const filmA=$('#filmShotA'),filmB=$('#filmShotB');
let shownA=-1,shownB=-1;
for(const number of new Set(filmPairs.flat())){const image=new Image();image.src=`/assets/reference/IMG_${number}.jpg`;}

let entered = false;
let mode = 'tour';
let playing = false;
let progress = 0;
let tourLookX = 0, tourLookY = 0;
let yaw = Math.PI, pitch = 0;
let pointer = null;
let audioContext = null, audioGain = null;
let soundOn = false;
const keys = new Set();
const tmp = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const screenPointer = new THREE.Vector2();
let activeDemo = null;
let resumePlaying = false;

const demoTemplates = {
  'care-journey': {kicker:'CARE EXPERIENCE · DEMO TEMPLATE',title:'Care Journey',description:'A placeholder for a patient or customer journey application.',accent:'#8e76ff',metric:'94%',metricLabel:'NEXT STEP CONFIDENCE',items:['Review a moment in the journey','Surface a tailored next action','Hand off with context intact']},
  'operations-pulse': {kicker:'OPERATIONS · DEMO TEMPLATE',title:'Operations Pulse',description:'A placeholder for a live operational signal and response workflow.',accent:'#5d7cff',metric:'12',metricLabel:'SIGNALS NEEDING REVIEW',items:['Monitor a selected operation','Prioritize the next signal','Open a detailed response flow']},
  'experience-builder': {kicker:'BUILD · DEMO TEMPLATE',title:'Experience Builder',description:'A placeholder for configuring a new AI experience with a visitor.',accent:'#ab78ff',metric:'03',metricLabel:'EXPERIENCE MODULES',items:['Choose an experience objective','Shape the conversation','Preview the visitor view']},
  'knowledge-studio': {kicker:'KNOWLEDGE · DEMO TEMPLATE',title:'Knowledge Studio',description:'A placeholder for guided exploration of trusted internal knowledge.',accent:'#597eff',metric:'48',metricLabel:'SOURCES CONNECTED',items:['Ask a focused question','Review cited evidence','Save a reusable answer']},
  'creative-lab': {kicker:'CREATIVE · DEMO TEMPLATE',title:'Creative Lab',description:'A placeholder for an image, concept, or campaign generation demo.',accent:'#ff7654',metric:'06',metricLabel:'CONCEPTS IN REVIEW',items:['Set a creative direction','Generate a first pass','Refine with the team']},
  'decision-console': {kicker:'DECISION · DEMO TEMPLATE',title:'Decision Console',description:'A placeholder for a decision-support web app and live scenario view.',accent:'#607dff',metric:'87%',metricLabel:'SCENARIO READINESS',items:['Frame a business choice','Compare scenarios','Share the recommendation']},
  'customer-journey': {kicker:'CUSTOMER · DEMO TEMPLATE',title:'Customer Journey',description:'A placeholder for a customer experience and service design workflow.',accent:'#75a7f5',metric:'08',metricLabel:'MOMENTS TO DESIGN',items:['Map a customer moment','Find the friction point','Prototype the improvement']},
};

function smoothstep(t){ return t*t*(3-2*t); }
function renderDemo(demo) {
  $('#demoKicker').textContent=demo.kicker;
  $('#demoTitle').textContent=demo.title;
  $('#demoDescription').textContent=demo.description;
  $('#demoWorkspace').style.setProperty('--demo-accent',demo.accent);
  $('#demoWorkspace').innerHTML=`
    <div class="demo-appbar"><span class="demo-appmark">AI</span><span>${demo.title}</span><span class="demo-status"><i></i> READY FOR YOUR APP</span></div>
    <div class="demo-body">
      <aside class="demo-nav"><button class="active" data-demo-tab="overview">OVERVIEW</button><button data-demo-tab="workflow">WORKFLOW</button><button data-demo-tab="activity">ACTIVITY</button><button data-demo-tab="settings">SETUP</button></aside>
      <main class="demo-main">
        <div class="demo-main-head"><div><span class="demo-overline">OVERVIEW</span><h3>Ready for a live demo</h3><p>Use this shell until the full web app is ready to connect.</p></div><div class="demo-metric"><strong>${demo.metric}</strong><span>${demo.metricLabel}</span></div></div>
        <div class="demo-flow">${demo.items.map((item,index)=>`<button class="demo-flow-item" data-demo-action="${index}"><span>0${index+1}</span><strong>${item}</strong><b>→</b></button>`).join('')}</div>
        <div class="demo-placeholder"><span class="demo-placeholder-icon">+</span><div><strong>Your web app mounts here</strong><p>Replace this template with an embedded route or your production demo URL.</p></div><button data-demo-action="launch">OPEN SAMPLE FLOW</button></div>
        <div class="demo-toast" aria-live="polite"></div>
      </main>
    </div>`;
}
function openDemo(demoId) {
  const demo=demoTemplates[demoId];
  if(!demo || activeDemo) return;
  activeDemo=demoId;
  resumePlaying=playing;
  playing=false;
  keys.clear();
  renderDemo(demo);
  app.classList.add('demo-open');
  $('#demoOverlay').setAttribute('aria-hidden','false');
  updatePlayButton();
  requestAnimationFrame(()=>$('#closeDemo').focus());
}
function closeDemo() {
  if(!activeDemo) return;
  activeDemo=null;
  $('#demoOverlay').setAttribute('aria-hidden','true');
  app.classList.remove('demo-open');
  if(entered && mode!=='explore') playing=resumePlaying;
  updatePlayButton();
}
function findDemoAt(event) {
  const rect=canvas.getBoundingClientRect();
  screenPointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
  raycaster.setFromCamera(screenPointer,camera);
  const hit=raycaster.intersectObjects(interactiveScreens,false)[0];
  return hit?.object?.userData?.demoId || null;
}
function updateFilm() {
  const at=Math.min(filmPairs.length-1,Math.floor(progress*(filmPairs.length-1)));
  const next=Math.min(filmPairs.length-1,at+1);
  const local=at===next?1:progress*(filmPairs.length-1)-at;
  if(shownA!==at){filmA.children[0].src=`/assets/reference/IMG_${filmPairs[at][0]}.jpg`;filmA.children[1].src=`/assets/reference/IMG_${filmPairs[at][1]}.jpg`;shownA=at;}
  if(shownB!==next){filmB.children[0].src=`/assets/reference/IMG_${filmPairs[next][0]}.jpg`;filmB.children[1].src=`/assets/reference/IMG_${filmPairs[next][1]}.jpg`;shownB=next;}
  const blend=smoothstep(Math.max(0,Math.min(1,(local-.72)/.28)));
  filmA.style.opacity=String(1-blend);filmB.style.opacity=String(blend);
  for(const [layer,t] of [[filmA,local],[filmB,Math.max(0,local-.72)]]){
    layer.children[0].style.transform=`translate3d(${(-1.6+t*3.2).toFixed(2)}%,${(.6-t*1.2).toFixed(2)}%,0) scale(${(1.05+t*.055).toFixed(3)})`;
    layer.children[1].style.transform=`translate3d(${(1.3-t*2.6).toFixed(2)}%,${(-.6+t*1.2).toFixed(2)}%,0) scale(${(1.06+t*.045).toFixed(3)})`;
  }
}
function setTourPose() {
  const t = Math.max(0, Math.min(1, progress));
  const entryReveal=1-smoothstep(Math.min(1,t/.18));
  const entranceFov=camera.aspect<1?100:88;
  const titleWallFov=camera.aspect<.7?100:70;
  const titleWallWeight=Math.max(0,1-Math.abs(t-.6)/.12);
  camera.fov=65+(entranceFov-65)*entryReveal+(titleWallFov-65)*titleWallWeight+8*smoothstep(Math.max(0,Math.min(1,(t-.8)/.2)));
  camera.updateProjectionMatrix();
  const p = posCurve.getPoint(t);
  const target = lookCurve.getPoint(t);
  camera.position.copy(p);
  const direction = target.sub(p).normalize();
  const baseYaw = Math.atan2(direction.x, direction.z);
  const basePitch = Math.asin(Math.max(-1, Math.min(1, direction.y)));
  const lookYaw = baseYaw + tourLookX;
  const lookPitch = Math.max(-1.2,Math.min(1.2,basePitch+tourLookY));
  camera.lookAt(p.clone().add(new THREE.Vector3(Math.sin(lookYaw)*Math.cos(lookPitch),Math.sin(lookPitch),Math.cos(lookYaw)*Math.cos(lookPitch))));
}
function setFreePose() {
  const direction = new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
  camera.lookAt(camera.position.clone().add(direction));
}
function setProgress(value, updatePose = true) {
  progress = Math.max(0, Math.min(1, value));
  if (updatePose && mode === 'tour') setTourPose();
  if (mode === 'film') updateFilm();
  $('#scrubber').value = Math.round(progress*1000);
  $('#scrubber').style.setProperty('--progress', `${progress*100}%`);
  const secs = Math.floor(progress*tourDuration);
  $('#elapsed').textContent = `${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;
  const chapter = Math.min(stops.length-1,Math.floor(progress*(stops.length-1)+(mode==='film'?0:.46)));
  const s = stops[chapter];
  if ($('#chapterTitle').textContent !== s.title) {
    $('#chapterTitle').textContent = s.title;
    $('#chapterDescription').textContent = s.description;
  }
  $('#chapterIndex').textContent = `${String(chapter+1).padStart(2,'0')} / 06`;
  document.querySelectorAll('.rail-item').forEach((element,index)=>element.classList.toggle('active',index===chapter));
  if(progress>=1 && playing){ playing=false; updatePlayButton(); }
}
function updatePlayButton(){ $('#playGlyph').textContent = playing ? 'Ⅱ' : '▶'; $('#playButton').setAttribute('aria-label', `${playing?'Pause':'Play'} ${mode==='film'?'photo film':'tour'}`); $('#playButton').title=`Pause or play ${mode==='film'?'photo film':'tour'}`; }
function setMode(next) {
  if(mode === next) return;
  const previous=mode;
  mode = next;
  app.classList.toggle('exploring', mode === 'explore');
  app.classList.toggle('filming', mode === 'film');
  $('#photoFilm').setAttribute('aria-hidden',mode==='film'?'false':'true');
  $('#experienceLabel').textContent=mode==='film'?'THE PHOTOGRAPHS':'THE WALKTHROUGH';
  $('#tourMode').classList.toggle('active', mode === 'tour');
  $('#exploreMode').classList.toggle('active', mode === 'explore');
  $('#filmMode').classList.toggle('active', mode === 'film');
  if(mode === 'explore') {
    if(previous==='film')setTourPose();
    playing = false; updatePlayButton();
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    yaw = Math.atan2(dir.x,dir.z); pitch = Math.asin(Math.max(-1,Math.min(1,dir.y)));
    setFreePose();
  } else if(mode==='film') {
    tourLookX=0;tourLookY=0;if(progress>=.999)progress=0;
    updateFilm();playing=true;updatePlayButton();setProgress(progress);
  } else {
    tourLookX = 0; tourLookY = 0; setTourPose();
  }
  updatePlayButton();
}
function moveFree(distance, sideways = 0) {
  forward.set(Math.sin(yaw),0,Math.cos(yaw)).normalize();
  right.copy(forward).cross(THREE.Object3D.DEFAULT_UP).normalize();
  camera.position.addScaledVector(forward,distance);
  camera.position.addScaledVector(right,sideways);
  const p = camera.position;
  if(p.z>5.12 && p.x< -1.52){p.x=THREE.MathUtils.clamp(p.x,-6.40,-1.92);p.z=THREE.MathUtils.clamp(p.z,5.12,9.32);}
  else if(p.z>5.12){p.x=THREE.MathUtils.clamp(p.x,-1.43,8.76);p.z=THREE.MathUtils.clamp(p.z,5.12,9.80);}
  else {p.x=THREE.MathUtils.clamp(p.x,-6.92,6.72);p.z=THREE.MathUtils.clamp(p.z,-4.66,5.12);}
  p.y=THREE.MathUtils.clamp(p.y,1.35,2.15);
  setFreePose();
}
function enter() {
  if(entered) return;
  entered = true; app.classList.add('entered'); playing = true; updatePlayButton();
  setProgress(0);
}
function openDrawer() { $('#photoDrawer').classList.add('open'); $('#drawerScrim').classList.add('open'); $('#photoDrawer').setAttribute('aria-hidden','false'); playing=false;updatePlayButton(); }
function closeDrawer() { $('#photoDrawer').classList.remove('open'); $('#drawerScrim').classList.remove('open'); $('#photoDrawer').setAttribute('aria-hidden','true'); }

$('#enterButton').addEventListener('click',enter);
$('#tourMode').addEventListener('click',()=>setMode('tour'));
$('#exploreMode').addEventListener('click',()=>setMode('explore'));
$('#filmMode').addEventListener('click',()=>setMode('film'));
$('#playButton').addEventListener('click',()=>{ if(mode==='explore')setMode('tour');if(progress>=.999)setProgress(0);playing=!playing;updatePlayButton(); });
$('#scrubber').addEventListener('input',e=>{ if(mode==='explore')setMode('tour'); playing=false;updatePlayButton();setProgress(Number(e.target.value)/1000); });
document.querySelectorAll('.rail-item').forEach((button,index)=>button.addEventListener('click',()=>{if(mode==='explore')setMode('tour');playing=false;updatePlayButton();setProgress(index/(stops.length-1));}));
$('#photoButton').addEventListener('click',openDrawer);$('#closeDrawer').addEventListener('click',closeDrawer);$('#drawerScrim').addEventListener('click',closeDrawer);
$('#fullscreenButton').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else app.requestFullscreen?.();});
$('#closeDemo').addEventListener('click',closeDemo);
$('#resumeDemo').addEventListener('click',closeDemo);
$('#demoWorkspace').addEventListener('click',event=>{
  const tab=event.target.closest('[data-demo-tab]');
  if(tab){document.querySelectorAll('[data-demo-tab]').forEach(button=>button.classList.toggle('active',button===tab));return;}
  const action=event.target.closest('[data-demo-action]');
  if(action){
    const toast=$('#demoWorkspace .demo-toast');
    toast.textContent=action.dataset.demoAction==='launch'?'Sample flow opened — replace it with your demo when ready.':'Template step selected — wire this control to your app.';
    toast.classList.add('visible');
    window.setTimeout(()=>toast.classList.remove('visible'),2600);
  }
});

const photos = [
  ['4659','Full gallery'],['4660','Exhibit wall'],['4661','Interactive bays'],['4662','Entry and moss wall'],
  ['4663','Gallery threshold'],['4664','PROTO display'],['4665','Demo room'],['4666','Glass office'],
];
$('#photoGrid').innerHTML=photos.map(([number,label])=>`<figure class="photo-card"><img src="/assets/reference/IMG_${number}.jpg" alt="${label}" loading="lazy"/><figcaption>IMG_${number} · ${label.toUpperCase()}</figcaption></figure>`).join('');

canvas.addEventListener('pointerdown',e=>{if(!entered||mode==='film'||activeDemo)return;pointer={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{
  if(!pointer){if(entered&&!activeDemo&&mode!=='film')canvas.style.cursor=findDemoAt(e)?'pointer':'grab';return;}
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer.x=e.clientX;pointer.y=e.clientY;
  if(Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>7)pointer.moved=true;
  if(mode==='tour') {tourLookX=THREE.MathUtils.clamp(tourLookX-dx*.0035,-.62,.62);tourLookY=THREE.MathUtils.clamp(tourLookY+dy*.0035,-.38,.38);setTourPose();}
  else {yaw-=dx*.0033;pitch=THREE.MathUtils.clamp(pitch+dy*.0033,-1.25,1.25);setFreePose();}
});
canvas.addEventListener('pointerup',e=>{
  const clicked=pointer&&!pointer.moved?findDemoAt(e):null;
  pointer=null;
  if(clicked)openDemo(clicked);
});
canvas.addEventListener('pointercancel',()=>pointer=null);
canvas.addEventListener('wheel',e=>{
  if(!entered||activeDemo)return;e.preventDefault();
  if(mode==='tour'||mode==='film'){playing=false;updatePlayButton();setProgress(progress+THREE.MathUtils.clamp(e.deltaY*.00016,-.06,.06));}
  else moveFree(Math.sign(e.deltaY)*Math.min(.45,Math.abs(e.deltaY)*.0012));
},{passive:false});
window.addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
  if(e.key==='Escape'){if(activeDemo)closeDemo();else closeDrawer();return;}
  if(activeDemo)return;
  if(e.key===' '&&entered){ if(mode==='tour'||mode==='film'){playing=!playing;updatePlayButton();}else setMode('tour'); }
  if(['w','a','s','d','W','A','S','D','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift'].includes(e.key)){
    if(entered && mode!=='explore')setMode('explore');keys.add(e.key.toLowerCase());
  }
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());

$('#soundButton').addEventListener('click',()=>{
  if(!audioContext){
    audioContext = new (window.AudioContext||window.webkitAudioContext)();
    audioGain = audioContext.createGain();audioGain.gain.value=0;audioGain.connect(audioContext.destination);
    for(const [frequency,amplitude] of [[55,.5],[82.4,.22],[110,.16],[164.8,.07]]){
      const osc=audioContext.createOscillator();osc.type='sine';osc.frequency.value=frequency;
      const gain=audioContext.createGain();gain.gain.value=amplitude*.08;osc.connect(gain).connect(audioGain);osc.start();
    }
  }
  soundOn=!soundOn;audioContext.resume();audioGain.gain.setTargetAtTime(soundOn?.45:0,audioContext.currentTime,.4);
  $('#soundButton').querySelector('span').textContent=soundOn?'◖))':'◖×';
});

window.addEventListener('resize',()=>{
  const w=window.innerWidth,h=window.innerHeight;
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h);
});

setProgress(0);
const clock = new THREE.Clock();
let firstFrame = true;
function frame() {
  const delta=Math.min(clock.getDelta(),.08);
  if(entered && (mode==='tour'||mode==='film')){
    if(playing)setProgress(progress+delta/tourDuration);
    if(mode==='tour'&&!pointer){tourLookX*=Math.max(0,1-delta*.5);tourLookY*=Math.max(0,1-delta*.5);setTourPose();}
  }
  if(entered && mode==='explore'){
    const speed=(keys.has('shift')?6.0:2.8)*delta;
    const ahead=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
    const across=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
    if(ahead||across)moveFree(ahead*speed,across*speed);
  }
  blueLight.intensity=5.8+Math.sin(performance.now()*.0008)*.7;
  composer.render();
  if(firstFrame){firstFrame=false;requestAnimationFrame(()=>$('#loading').classList.add('done'));}
  requestAnimationFrame(frame);
}
frame();
