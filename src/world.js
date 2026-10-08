import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const ink = 0x16191c;

function box(parent, w, h, d, x, y, z, material, cast = true, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  parent.add(mesh);
  return mesh;
}
function plane(parent, w, h, x, y, z, material, rotationY = 0) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotationY;
  parent.add(mesh);
  return mesh;
}
function cylinder(parent, top, bottom, height, x, y, z, material, sides = 20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, sides), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function canvasTexture(canvas, srgb = true) {
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
function photoTexture(path, repeatX=1, repeatY=1) {
  const texture=loader.load(path);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(repeatX,repeatY);
  texture.anisotropy=8;
  return texture;
}
function seeded(seed = 1) {
  let state = seed;
  return () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function concreteTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8a8b88'; ctx.fillRect(0, 0, 1024, 1024);
  const rng = seeded(7411);
  for (let i = 0; i < 17000; i++) {
    const a = rng() * .12;
    ctx.fillStyle = rng() > .5 ? `rgba(240,237,229,${a})` : `rgba(32,36,35,${a})`;
    const x = rng() * 1024, y = rng() * 1024, r = rng() * 6 + .4;
    ctx.fillRect(x, y, r * 3, r);
  }
  for (let i = 0; i < 90; i++) {
    ctx.strokeStyle = `rgba(24,28,28,${rng() * .07})`;
    ctx.lineWidth = .2 + rng() * 1.2;
    const x = rng() * 1024, y = rng() * 1024;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rng() * 160 - 80, y + rng() * 100 - 50); ctx.stroke();
  }
  const tx = canvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(3, 2.3); return tx;
}
function woodTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d'); const rng = seeded(615);
  ctx.fillStyle = '#b6976c'; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 200; i++) {
    const x = rng() * 512; const w = rng() * 1.7 + .2;
    ctx.fillStyle = rng() > .48 ? `rgba(76,45,22,${rng()*.13})` : `rgba(246,218,169,${rng()*.14})`;
    ctx.fillRect(x, 0, w, 512);
  }
  return canvasTexture(c);
}
function mossTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 768;
  const ctx = c.getContext('2d'); const rng = seeded(814);
  ctx.fillStyle = '#193b24'; ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 46000; i++) {
    const x = rng()*1024, y = rng()*768, r = .5+rng()*5;
    const green = 50 + Math.floor(rng()*72);
    ctx.fillStyle = `rgba(${Math.floor(green*.35)},${green},${Math.floor(green*.37)},${.18+rng()*.35})`;
    ctx.beginPath(); ctx.ellipse(x,y,r,r*(.5+rng()),rng()*6.28,0,6.28); ctx.fill();
  }
  const gradient = ctx.createRadialGradient(500, 370, 20, 500, 370, 600);
  gradient.addColorStop(0, 'rgba(199,222,128,.12)'); gradient.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = gradient; ctx.fillRect(0,0,1024,768);
  return canvasTexture(c);
}
function glowTexture() {
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(256,256,0,256,256,256);
  g.addColorStop(0,'rgba(255,255,255,.65)');g.addColorStop(.3,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,512,512);return canvasTexture(c);
}
function textTexture(text, options = {}) {
  const { width = 1024, height = 220, font = '700 110px Arial', color = '#ece9e5', align = 'center', glow = false } = options;
  const c = document.createElement('canvas'); c.width = width; c.height = height;
  const ctx = c.getContext('2d'); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.font = font;
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 14; }
  ctx.fillStyle = color; ctx.fillText(text, align === 'left' ? 15 : width/2, height/2);
  return canvasTexture(c);
}
function awsLogoTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 275;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#f4f6f4'; ctx.font = '700 184px Arial'; ctx.textAlign = 'center'; ctx.fillText('aws', 256, 164);
  ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.strokeStyle = '#f4f6f4'; ctx.beginPath(); ctx.moveTo(135,181); ctx.quadraticCurveTo(253,246,384,179); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(369,172); ctx.lineTo(389,177); ctx.lineTo(381,198); ctx.stroke();
  return canvasTexture(c);
}
function createScreenTexture(kind = 'dark') {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 600; const ctx = c.getContext('2d');
  const palettes = { dark: ['#060e1e','#192847','#7565fa'], blue: ['#121267','#173de9','#35b9ff'], purple: ['#9c83e6','#ead2f4','#5139ad'], orange: ['#441209','#fa4d1e','#ffc181'], clinical: ['#e6effb','#aebcf1','#8a58d3'] };
  const p = palettes[kind] || palettes.dark;
  const bg = ctx.createLinearGradient(0,0,1024,600); bg.addColorStop(0,p[0]); bg.addColorStop(.6,p[1]); bg.addColorStop(1,p[2]); ctx.fillStyle=bg; ctx.fillRect(0,0,1024,600);
  const rng = seeded(kind.length*817);
  for(let i=0;i<55;i++){ ctx.fillStyle=`rgba(255,255,255,${rng()*.12})`; ctx.fillRect(rng()*1024,rng()*600,rng()*140+10,rng()*2+1); }
  if (kind==='orange') {
    for(let i=0;i<8;i++){const x=125+i*112; const g=ctx.createLinearGradient(x,90,x+80,520);g.addColorStop(0,'#f0682f');g.addColorStop(.5,'#8d2818');g.addColorStop(1,'#fff0c3');ctx.fillStyle=g;ctx.fillRect(x,105,72,380);}
    ctx.fillStyle='#fff4df';ctx.font='700 34px Arial';ctx.fillText('BUILD THE NEXT',80,72);
  } else if (kind === 'clinical') {
    ctx.fillStyle='#fff';ctx.font='700 33px Arial';ctx.fillText('Meet the people we’re helping',66,76);
    for(let i=0;i<3;i++){ctx.fillStyle='rgba(255,255,255,.78)';ctx.fillRect(62+i*312,118,280,402);ctx.fillStyle=i===0?'#d45060':'#5053bb';ctx.beginPath();ctx.arc(124+i*312,184,34,0,6.3);ctx.fill();ctx.fillStyle='#697083';for(let j=0;j<7;j++)ctx.fillRect(84+i*312,245+j*34,178+rng()*50,6);}
  } else {
    ctx.fillStyle=kind==='purple'?'rgba(21,17,50,.6)':'rgba(3,9,24,.75)';ctx.fillRect(62,62,900,480);
    ctx.fillStyle='#f8faff';ctx.font='700 27px Arial';ctx.fillText(kind==='purple'?'Experience Builder':'Explore what’s possible',105,115);
    ctx.fillStyle='#c8d1e4';ctx.font='16px Arial';ctx.fillText('AI-powered experiences at AWS',105,150);
    ctx.fillStyle='#4162d9';ctx.fillRect(104,190,510,260);ctx.fillStyle='#151c3d';ctx.fillRect(635,190,274,260);
    for(let i=0;i<5;i++){ctx.fillStyle=['#f34f4e','#8e5dff','#20bbd7','#fca55d','#798dee'][i];ctx.fillRect(110+i*95,385,83,52);}
    for(let i=0;i<4;i++){ctx.fillStyle='rgba(211,225,249,.55)';ctx.fillRect(657,226+i*47,202-rng()*40,8);}
    ctx.fillStyle='#8564ff';ctx.fillRect(657,408,123,24);
  }
  return canvasTexture(c);
}
function lineLight(parent, x1, z1, x2, z2, y, color, intensity=2.4) {
  const len=Math.hypot(x2-x1,z2-z1);const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),toneMapped:false});
  const mesh=box(parent,.026,.026,len,(x1+x2)/2,y,(z1+z2)/2,mat,false,false);mesh.rotation.y=Math.atan2(x2-x1,z2-z1);return mesh;
}

export function createWorld(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x090b0e); scene.fog = new THREE.FogExp2(0x090b0e, .012);
  const woodMap=photoTexture('/assets/materials/wood.png');
  const color = {
    charcoal: new THREE.MeshStandardMaterial({color:0x24262a, roughness:.89}),
    nearBlack: new THREE.MeshStandardMaterial({color:0x0f1217,roughness:.86}),
    panel: new THREE.MeshStandardMaterial({color:0x303236,roughness:.82}),
    white: new THREE.MeshPhysicalMaterial({color:0xe8e8e3,roughness:.32,metalness:.06,clearcoat:.35}),
    silver: new THREE.MeshStandardMaterial({color:0x626b72,metalness:.75,roughness:.34}),
    blackMetal: new THREE.MeshStandardMaterial({color:0x101319,metalness:.72,roughness:.29}),
    blue: new THREE.MeshBasicMaterial({color:new THREE.Color('#104cff').multiplyScalar(2.0),toneMapped:false}),
    led: new THREE.MeshBasicMaterial({color:new THREE.Color('#eaf4ff').multiplyScalar(1.42),toneMapped:false}),
    wood: new THREE.MeshStandardMaterial({map:woodMap,color:0xf2dfc7,emissive:0x67462c,emissiveMap:woodMap,emissiveIntensity:.32,roughness:.7}),
    moss: new THREE.MeshStandardMaterial({map:mossTexture(),roughness:1}),
    screen: new THREE.MeshBasicMaterial({map:createScreenTexture('dark'),toneMapped:false}),
  };
  const concrete = new THREE.MeshPhysicalMaterial({map:photoTexture('/assets/materials/concrete.png',3,2),color:0xdadbd9,roughness:.32,metalness:.04,clearcoat:.14,clearcoatRoughness:.3});
  const carpetA = new THREE.MeshStandardMaterial({color:0x46484b,roughness:.97});
  const carpetB = new THREE.MeshStandardMaterial({color:0x858587,roughness:.97});
  const goldLight = new THREE.MeshBasicMaterial({color:new THREE.Color('#ffe2b5').multiplyScalar(1.3),toneMapped:false});
  const darkGlass = new THREE.MeshPhysicalMaterial({color:0xe0e9ee,metalness:.09,roughness:.08,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false});
  const warmGlass = new THREE.MeshPhysicalMaterial({color:0xe8f4fc,metalness:.12,roughness:.08,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false});

  // Polished concrete floor and subtle saw-cut joints.
  box(scene,15.1,.18,11.1,0,-.1,0,concrete,false,true);
  box(scene,5.25,.18,4.75,-4.2,-.1,7.87,concrete,false,true);
  const seamMat=new THREE.MeshBasicMaterial({color:0x353735,transparent:true,opacity:.22});
  for(const x of [-4.8,-2.1,.65,3.4,6.2]) box(scene,.012,.002,10.94,x,.002,0,seamMat,false,false);
  for(const z of [-3.5,-.65,2.1,4.9]) box(scene,14.98,.002,.012,0,.002,z,seamMat,false,false);
  const floorGlow=new THREE.MeshBasicMaterial({map:glowTexture(),transparent:true,opacity:.19,depthWrite:false,blending:THREE.AdditiveBlending});
  for(const x of [-5.67,5.67])for(const z of [-2.24,2.24]){const reflection=plane(scene,4.3,2.08,x,.006,z,floorGlow);reflection.rotation.x=-Math.PI/2;}
  for(const x of [-4.35,0,4.35]){const reflection=plane(scene,3.4,1.75,x,.006,-4.42,floorGlow);reflection.rotation.x=-Math.PI/2;}
  // Dark architectural shell. The gallery opens from the PROTO entry.
  box(scene,.17,4.2,11.1,7.55,2.1,0,color.charcoal);
  box(scene,15.1,4.2,.17,0,2.1,-5.56,color.charcoal);
  box(scene,.73,4.2,.17,-7.16,2.1,5.56,color.charcoal);
  box(scene,.17,4.2,4.55,-6.84,2.1,7.85,color.nearBlack);
  box(scene,.17,4.2,4.55,-1.56,2.1,7.85,color.nearBlack);
  box(scene,5.37,4.2,.18,-4.2,2.1,10.18,color.nearBlack);
  // The left side of the gallery is a continuous exhibit wall, not a suite.
  box(scene,.17,4.2,11.1,-7.58,2.1,0,color.charcoal);
  // Main dark ceiling behind timber grid.
  box(scene,15.1,.16,11.1,0,4.24,0,color.nearBlack,false,false);
  box(scene,5.35,.12,4.74,-4.2,4.24,7.87,color.nearBlack,false,false);
  // Recessed wood coffer grid: main visual signature from the photos.
  for(let x=-7.36;x<=7.36;x+=.92) box(scene,.072,.34,10.63,x,4.02,0,color.wood,false,false);
  for(let z=-5.3;z<=5.3;z+=.92) box(scene,14.74,.34,.072,0,4.02,z,color.wood,false,false);
  // Above-wall ribbon lighting and fine vertical panel joins.
  lineLight(scene,-7.45,-5.45,7.45,-5.45,3.25,'#dbe9ee',1.25);
  lineLight(scene,7.44,-5.4,7.44,5.4,3.25,'#dbe9ee',1.25);
  lineLight(scene,-7.45,-5.4,-7.45,5.4,3.25,'#dbe9ee',1.1);
  lineLight(scene,-7.45,5.4,-1.52,5.4,3.25,'#dbe9ee',1.1);
  for(let z=-5.15;z<5.4;z+=1.45) box(scene,.012,3.09,.018,7.449,1.66,z,new THREE.MeshBasicMaterial({color:0x17191b}),false,false);
  for(let z=-5.15;z<5.4;z+=1.45) box(scene,.012,3.09,.018,-7.449,1.66,z,new THREE.MeshBasicMaterial({color:0x17191b}),false,false);
  for(let x=-7.1;x<7.5;x+=1.52) box(scene,.018,3.09,.012,x,1.66,-5.459,new THREE.MeshBasicMaterial({color:0x17191b}),false,false);
  // The title belongs on the wall ahead of PROTO, opposite the glazed rooms.
  const signMat=new THREE.MeshBasicMaterial({map:textTexture('AI Experience Center',{width:2048,height:270,font:'600 175px Arial',color:'#e6e3de'}),transparent:true,side:THREE.DoubleSide,depthWrite:false});
  plane(scene,6.75,.89,0,3.61,-5.43,signMat);

  const animatedScreens=[];
  const interactiveScreens=[];
  function kiosk(parent, {x,z,rotation=0,type='dark',width=2.38,photo=null,demoId}) {
    const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotation;parent.add(g);
    const outer=box(g,width,2.75,.24,0,1.38,.13,color.white);outer.castShadow=true;
    box(g,width-.16,2.52,.025,0,1.39,.27,new THREE.MeshStandardMaterial({color:0xd4d6d3,roughness:.35}));
    box(g,width-.18,1.03,.033,0,.63,.30,color.nearBlack);
    box(g,width-.34,.018,.025,0,1.22,.325,color.silver);
    const screenW=width-.35;
    box(g,screenW,1.14,.045,0,2.02,.33,color.blackMetal);
    let screenMap=createScreenTexture(type);
    const screenMat=new THREE.MeshBasicMaterial({map:screenMap,toneMapped:false});
    const screen=plane(g,screenW-.11,1.04,0,2.02,.358,screenMat);
    screen.userData.demoId=demoId;
    screen.userData.interactive=Boolean(demoId);
    if(photo){const img=loader.load(`/assets/screens/${photo}`, t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;screenMat.map=t;screenMat.needsUpdate=true;});img.colorSpace=THREE.SRGBColorSpace;}
    animatedScreens.push(screen);
    if(demoId) interactiveScreens.push(screen);
    // Camera bar, touch console, logo, and sharp inset edge lighting.
    box(g,.18,.045,.05,0,2.63,.38,color.blackMetal);
    cylinder(g,.038,.038,.028,0,2.66,.38,color.silver);
    box(g,.38,.13,.18,0,1.30,.38,color.white);
    box(g,.32,.085,.13,0,1.26,.47,color.blackMetal);
    const smallLogo=new THREE.MeshBasicMaterial({map:awsLogoTexture(),transparent:true,depthWrite:false});
    plane(g,.48,.26,0,.78,.337,smallLogo);
    box(g,.43,.10,.018,0,.24,.338,color.silver);
    const led=new THREE.MeshBasicMaterial({color:new THREE.Color('#d9f4ff').multiplyScalar(1.35),toneMapped:false});
    box(g,.026,2.68,.023,-width/2+.04,1.37,.269,led,false,false);
    box(g,.026,2.68,.023,width/2-.04,1.37,.269,led,false,false);
    box(g,width,.027,.023,0,.032,.29,led,false,false);
    return g;
  }
  // Matching pairs of evenly spaced screens line the side walls, with three
  // more below the main title.
  kiosk(scene,{x:7.405,z:2.24,rotation:-Math.PI/2,type:'clinical',photo:'gallery-people.jpg',demoId:'care-journey'});
  kiosk(scene,{x:7.405,z:-2.24,rotation:-Math.PI/2,type:'dark',photo:'gallery-dark.jpg',demoId:'operations-pulse'});
  kiosk(scene,{x:-7.405,z:2.24,rotation:Math.PI/2,type:'purple',photo:'gallery-purple.jpg',demoId:'experience-builder'});
  kiosk(scene,{x:-7.405,z:-2.24,rotation:Math.PI/2,type:'dark',photo:'gallery-dark.jpg',demoId:'knowledge-studio'});
  kiosk(scene,{x:-4.35,z:-5.42,type:'orange',width:2.65,photo:'gallery-orange.jpg',demoId:'creative-lab'});
  kiosk(scene,{x:0,z:-5.42,type:'dark',width:2.65,photo:'gallery-dark.jpg',demoId:'decision-console'});
  kiosk(scene,{x:4.35,z:-5.42,type:'clinical',width:2.65,photo:'gallery-people.jpg',demoId:'customer-journey'});

  // Pendants, glass bulbs and black ceiling services.
  const pendants=[[-5.7,1.5],[-2.4,-1.3],[1.15,2.85],[4.28,-.95],[6.08,-3.72],[-1.25,-4.0]];
  const bulbGeom=new THREE.SphereGeometry(.13,14,12);
  pendants.forEach(([x,z],i)=>{
    const y=2.9-(i%3)*.12;
    cylinder(scene,.012,.012,4.04-y,x,(4.04+y)/2,z,color.blackMetal,8);
    const shade=new THREE.Mesh(new THREE.CylinderGeometry(.11,.31,.47,24,1,true),color.blackMetal);shade.position.set(x,y+.27,z);shade.castShadow=true;scene.add(shade);
    cylinder(scene,.28,.28,.025,x,y+.02,z,color.blackMetal);
    const orb=new THREE.Mesh(bulbGeom,warmGlass);orb.position.set(x,y-.09,z);scene.add(orb);
    const core=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),goldLight);core.position.set(x,y-.1,z);scene.add(core);
    if(i<3){const l=new THREE.PointLight(0xffdda9,.85,5.5,2);l.position.set(x,y-.14,z);scene.add(l);}
  });
  for(let i=0;i<12;i++){
    const x=-3.3+(i%6)*.82,z=-2.3+Math.floor(i/6)*1.18,y=3.12-(i%4)*.21;
    cylinder(scene,.006,.006,4.03-y,x,(4.03+y)/2,z,color.blackMetal,6);
    const globe=new THREE.Mesh(new THREE.SphereGeometry(.07+(i%3)*.019,12,10),warmGlass);globe.position.set(x,y,z);scene.add(globe);
    const core=new THREE.Mesh(new THREE.SphereGeometry(.023,8,6),goldLight);core.position.set(x,y,z);scene.add(core);
  }
  // A yellow overhead reel glimpsed in the photos.
  const reelMat=new THREE.MeshStandardMaterial({color:0xcaa624,metalness:.58,roughness:.35});
  const reel=cylinder(scene,.37,.37,.1,3.6,4.0,-2.6,reelMat,28);reel.rotation.x=Math.PI/2;
  cylinder(scene,.07,.07,.18,3.6,3.89,-2.6,color.blackMetal);
  // The foliage stays on the rear wall beside PROTO. The entry door faces
  // PROTO across the vestibule, where the camera begins its walk through.
  const mossMat=color.moss;
  plane(scene,2.50,3.48,-3.95,1.89,10.065,mossMat,Math.PI);
  const logoMat=new THREE.MeshBasicMaterial({map:awsLogoTexture(),transparent:true,side:THREE.DoubleSide,depthWrite:false});
  plane(scene,1.21,.65,-3.95,2.16,10.014,logoMat,Math.PI);
  const doorMat=new THREE.MeshStandardMaterial({color:0x8b9193,metalness:.27,roughness:.55});
  box(scene,.08,3.25,1.10,-6.70,1.67,7.44,doorMat,false,false);
  box(scene,.12,3.45,.075,-6.70,1.76,6.84,color.blackMetal,false,false);
  box(scene,.12,3.45,.075,-6.70,1.76,8.04,color.blackMetal,false,false);
  box(scene,.12,.075,1.30,-6.70,3.48,7.44,color.blackMetal,false,false);
  box(scene,.05,.54,.085,-6.63,1.65,7.88,color.blackMetal,false,false);
  box(scene,.04,.13,.055,-6.64,1.62,6.57,color.white,false,false);
  const entrySpots=[[-5.8,6.3],[-5.6,8.4],[-2.45,9.2]];
  entrySpots.forEach(([x,z])=>{const l=new THREE.SpotLight(0xffd9aa,12,7,Math.PI/5,.75,1);l.position.set(x,4.0,z);l.target.position.set(x,.2,z);scene.add(l,l.target);});
  for(const x of [-6.4,-3.9,-1.9]) box(scene,.12,.11,4.2,x,4.13,7.84,color.nearBlack,false,false);
  const holo=new THREE.Group();holo.position.set(-1.82,0,7.44);holo.rotation.y=-Math.PI/2;scene.add(holo);
  box(holo,2.26,3.22,.28,0,1.82,0,color.white);
  box(holo,1.96,2.78,.025,0,1.85,.157,color.blue,false,false);
  const protoMap=loader.load('/assets/screens/proto-blue.jpg',t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;});protoMap.colorSpace=THREE.SRGBColorSpace;
  const holoScreen=new THREE.MeshBasicMaterial({map:protoMap,transparent:true,opacity:.94,toneMapped:false});
  plane(holo,1.78,2.6,0,1.86,.178,holoScreen);
  box(holo,1.95,.035,.035,0,3.26,.18,color.led,false,false);
  box(holo,1.95,.035,.035,0,.46,.18,color.led,false,false);
  box(holo,.035,2.82,.035,-.99,1.85,.18,color.led,false,false);
  box(holo,.035,2.82,.035,.99,1.85,.18,color.led,false,false);
  plane(holo,.79,.16,0,.34,.16,new THREE.MeshBasicMaterial({map:textTexture('PROTO',{width:600,height:120,font:'400 82px Arial',color:'#30363c'}),transparent:true,depthWrite:false}));
  const sensor=cylinder(holo,.08,.08,.08,0,3.54,.05,color.blackMetal);sensor.rotation.x=Math.PI/2;
  const blueLight=new THREE.PointLight(0x134bff,5.8,5.0,2);blueLight.position.set(-2.4,2.1,7.35);scene.add(blueLight);
  const floorBlue=new THREE.MeshBasicMaterial({color:0x143fff,transparent:true,opacity:.10,depthWrite:false});
  const halo=plane(scene,3.7,2.8,-3.4,.005,7.46,floorBlue);halo.rotation.x=-Math.PI/2;
  // Rotate the two adjacent rooms to the right-hand turn behind PROTO. Keeping
  // their furniture in one local group preserves the room interiors and their
  // black-framed fronts while changing only their position in the floor plan.
  const officeWing=new THREE.Group();
  officeWing.position.set(4,0,-2.09);
  officeWing.rotation.y=Math.PI/2;
  scene.add(officeWing);
  box(officeWing,.17,4.2,1.16,-7.58,2.1,-4.98,color.charcoal);
  box(officeWing,.17,4.2,.87,-7.58,2.1,-1.46,color.charcoal);
  box(officeWing,.17,.9,2.51,-7.58,3.75,-3.15,color.charcoal);
  box(officeWing,.22,3.32,.07,-7.53,1.66,-4.43,color.blackMetal);
  box(officeWing,.22,3.32,.07,-7.53,1.66,-1.89,color.blackMetal);
  box(officeWing,.17,4.2,1.4,-7.58,2.1,4.82,color.charcoal);
  box(officeWing,.17,4.2,.6,-7.58,2.1,-.8,color.charcoal);
  box(officeWing,.22,.35,6.8,-7.52,4.03,1.9,color.charcoal);
  box(officeWing,.22,.2,6.8,-7.52,.1,1.9,color.nearBlack);
  // The checker carpet and desks sit behind the actual glazing.
  box(officeWing,4.85,.16,7.05,-9.98,-.08,1.66,color.nearBlack,false,true);
  for(let ix=0;ix<5;ix++)for(let iz=0;iz<8;iz++)box(officeWing,.95,.012,.88,-12.28+ix*.97,.018,-1.43+iz*.88,(ix+iz)%2?carpetA:carpetB,false,true);
  box(officeWing,.17,4.06,7.05,-12.39,2.03,1.66,color.charcoal);
  box(officeWing,4.85,4.06,.16,-9.98,2.03,-1.87,color.charcoal);
  box(officeWing,4.85,4.06,.16,-9.98,2.03,5.18,color.charcoal);
  box(officeWing,4.85,.12,7.05,-9.98,4.2,1.66,new THREE.MeshStandardMaterial({color:0xb9b9b7,roughness:.94}),false,false);
  const tileSeam=new THREE.MeshBasicMaterial({color:0x777c7e});
  for(let x=-12.24;x<-7.8;x+=.96)box(officeWing,.012,.004,6.9,x,4.135,1.66,tileSeam,false,false);
  for(let z=-1.78;z<5.1;z+=.88)box(officeWing,4.68,.004,.012,-9.98,4.135,z,tileSeam,false,false);
  // Whiteboards on inner office walls.
  box(officeWing,.045,1.65,3.65,-12.28,2.08,1.7,color.white,false,false);
  box(officeWing,2.65,1.46,.04,-10.1,2.1,-1.77,color.white,false,false);
  const notes=document.createElement('canvas');notes.width=1000;notes.height=450;
  const noteCtx=notes.getContext('2d');noteCtx.fillStyle='rgba(67,78,84,.38)';noteCtx.font='24px cursive';
  ['What can we solve together?','01  Discovery','02  Design','03  Build'].forEach((line,i)=>noteCtx.fillText(line,65,88+i*76));
  noteCtx.strokeStyle='rgba(70,80,85,.25)';noteCtx.lineWidth=3;noteCtx.beginPath();noteCtx.moveTo(62,118);noteCtx.lineTo(485,118);noteCtx.stroke();
  plane(officeWing,3.38,1.48,-12.24,2.1,1.7,new THREE.MeshBasicMaterial({map:canvasTexture(notes),transparent:true,side:THREE.DoubleSide,depthWrite:false}),Math.PI/2);
  // Black framed glazed facade with a clear glass door.
  plane(officeWing,6.95,3.77,-7.49,2.03,1.66,darkGlass,Math.PI/2);
  for(let z=-1.82;z<=5.22;z+=1.17) box(officeWing,.055,4.04,.055,-7.49,2.03,z,color.blackMetal,false,false);
  box(officeWing,.07,.08,7.03,-7.49,3.95,1.66,color.blackMetal,false,false);
  box(officeWing,.07,.08,7.03,-7.49,.12,1.66,color.blackMetal,false,false);
  box(officeWing,.075,.045,7.03,-7.49,2.82,1.66,color.blackMetal,false,false);
  // Door handle on the glass facade.
  box(officeWing,.13,.48,.026,-7.35,1.55,3.69,color.silver);
  const officeSign=new THREE.MeshBasicMaterial({map:textTexture('03.205B',{width:600,height:140,font:'500 88px Arial',color:'#26323a'}),transparent:true,depthWrite:false,side:THREE.DoubleSide});
  plane(officeWing,.94,.22,-7.35,2.08,4.52,officeSign,Math.PI/2);
  // The black drum pendant is visible in both adjoining room photos.
  cylinder(officeWing,.42,.42,.54,-9.92,3.1,1.55,color.blackMetal,32);
  cylinder(officeWing,.4,.4,.015,-9.92,2.82,1.55,new THREE.MeshBasicMaterial({color:0xf8f1e5}),32);
  cylinder(officeWing,.012,.012,.74,-9.92,3.73,1.55,color.blackMetal,8);
  // Office desks, monitors and chair silhouettes.
  function desk(x,z){
    box(officeWing,2.05,.09,.72,x,1.08,z,color.wood);
    for(const dx of [-.91,.91])for(const dz of [-.26,.26])box(officeWing,.055,1.02,.055,x+dx,.52,z+dz,color.blackMetal);
    box(officeWing,.035,.44,.66,x,1.54,z-.26,color.blackMetal);
    plane(officeWing,.59,.37,x+.024,1.54,z-.26,new THREE.MeshBasicMaterial({map:createScreenTexture('dark'),toneMapped:false,side:THREE.DoubleSide}),Math.PI/2);
    box(officeWing,.04,.3,.04,x,1.2,z-.26,color.blackMetal);
    box(officeWing,.54,.015,.2,x,1.13,z+.12,color.blackMetal);
    cylinder(officeWing,.3,.3,.07,x,.57,z+.78,color.blackMetal);
    box(officeWing,.5,.62,.1,x,.98,z+.98,color.blackMetal);
    cylinder(officeWing,.045,.045,.50,x,.29,z+.78,color.blackMetal);
  }
  desk(-11.05,1.30); desk(-8.86,1.30); desk(-10.8,3.55);
  const officeLamp=new THREE.PointLight(0xfff2df,14,8,2);officeLamp.position.set(-9.92,3.14,1.55);officeWing.add(officeLamp);
  // Compact carpeted demo pod from the reference photos.
  box(officeWing,4.8,.14,3.2,-9.97,-.08,-3.95,color.nearBlack,false,true);
  for(let ix=0;ix<5;ix++)for(let iz=0;iz<4;iz++)box(officeWing,.94,.015,.77,-12.25+ix*.96,.018,-5.13+iz*.79,(ix+iz)%2?carpetA:carpetB,false,true);
  box(officeWing,.14,4.05,3.2,-12.36,2.03,-3.96,color.charcoal);
  box(officeWing,4.8,4.05,.13,-9.96,2.03,-5.56,color.charcoal);
  box(officeWing,4.8,.11,3.2,-9.97,4.14,-3.95,new THREE.MeshStandardMaterial({color:0xbec0bf,roughness:.94}),false,false);
  for(let x=-12.27;x<-7.6;x+=.82)box(officeWing,.012,.003,3.05,x,4.083,-3.95,tileSeam,false,false);
  for(let z=-5.47;z<-2.4;z+=.8)box(officeWing,4.65,.003,.012,-9.97,4.083,z,tileSeam,false,false);
  box(officeWing,3.38,1.75,.055,-9.82,2.30,-5.47,color.white,false,false);
  const boardMap=photoTexture('/assets/screens/demo-whiteboard.jpg');
  plane(officeWing,3.32,.85,-9.82,2.67,-5.429,new THREE.MeshBasicMaterial({map:boardMap,toneMapped:false}));
  const boardSketch=document.createElement('canvas');boardSketch.width=1100;boardSketch.height=340;
  const bctx=boardSketch.getContext('2d');bctx.strokeStyle='rgba(58,65,70,.38)';bctx.lineWidth=3;
  for(let i=0;i<8;i++){const x=32+i*146;bctx.beginPath();bctx.arc(x+66,145,69,Math.PI,0);bctx.stroke();}
  for(let i=0;i<9;i++){const x=120+i*108;bctx.beginPath();bctx.moveTo(x,258);bctx.quadraticCurveTo(x+20,242,x+39,257);bctx.stroke();}
  plane(officeWing,3.21,.69,-9.82,1.82,-5.425,new THREE.MeshBasicMaterial({map:canvasTexture(boardSketch),transparent:true,depthWrite:false}));
  // Partly seen healthcare video on the left wall.
  box(officeWing,.10,1.45,1.50,-12.23,2.20,-4.15,color.blackMetal);
  plane(officeWing,1.4,1.35,-12.165,2.20,-4.15,new THREE.MeshBasicMaterial({map:photoTexture('/assets/screens/demo-healthcare.jpg'),toneMapped:false}),Math.PI/2);
  // Vertical touch terminal and its low black cabinet.
  box(officeWing,.50,.89,.45,-11.50,.45,-4.82,color.nearBlack);
  box(officeWing,.48,1.02,.14,-11.50,1.57,-4.82,color.blackMetal);
  plane(officeWing,.40,.93,-11.50,1.57,-4.742,new THREE.MeshBasicMaterial({map:createScreenTexture('clinical'),toneMapped:false}));
  // Tall illuminated information stand to the right.
  box(officeWing,.78,1.66,.22,-8.10,1.57,-4.96,color.blackMetal);
  const infoCanvas=document.createElement('canvas');infoCanvas.width=520;infoCanvas.height=920;
  const ictx=infoCanvas.getContext('2d');ictx.fillStyle='#fbfaf7';ictx.fillRect(0,0,520,920);ictx.fillStyle='#2d3138';ictx.font='700 33px Arial';ictx.fillText('The experience',37,75);ictx.font='20px Arial';
  for(let i=0;i<16;i++)ictx.fillRect(38,130+i*40,280+(i%3)*48,5);
  plane(officeWing,.68,1.54,-8.10,1.57,-4.838,new THREE.MeshBasicMaterial({map:canvasTexture(infoCanvas),toneMapped:false}));
  // Wall prompt and the oversized fabric drum pendant.
  const promptMap=textTexture('Explore with us!',{width:720,height:190,font:'italic 80px cursive',color:'#41454a'});
  plane(officeWing,1.62,.46,-7.71,2.26,-4.02,new THREE.MeshBasicMaterial({map:promptMap,transparent:true,side:THREE.DoubleSide,depthWrite:false}),-Math.PI/2);
  cylinder(officeWing,.47,.47,.58,-9.95,3.10,-3.85,color.blackMetal,32);
  cylinder(officeWing,.44,.44,.02,-9.95,2.80,-3.85,new THREE.MeshBasicMaterial({color:0xf4eadb}),32);
  cylinder(officeWing,.012,.012,.79,-9.95,3.78,-3.85,color.blackMetal,8);
  const podLamp=new THREE.PointLight(0xffe8c9,7,5,2);podLamp.position.set(-9.95,2.91,-3.85);officeWing.add(podLamp);
  // General lighting: cool exhibit light against warm pendant glow.
  const hemi=new THREE.HemisphereLight(0xd6e4f4,0x202327,.78);scene.add(hemi);
  const ambient=new THREE.AmbientLight(0xcbd4e1,.16);scene.add(ambient);
  const key=new THREE.DirectionalLight(0xf4f6fa,1.1);key.position.set(-3.5,6.6,2);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-15;key.shadow.camera.right=15;key.shadow.camera.top=15;key.shadow.camera.bottom=-15;key.shadow.normalBias=.035;key.shadow.bias=-.00018;scene.add(key);
  for(const z of [-3.0,0,3.0]){const l=new THREE.PointLight(0xddefff,1.45,4.8,2);l.position.set(5.85,2.65,z);scene.add(l);}
  const farFill=new THREE.PointLight(0xe7efff,1.35,6,2);farFill.position.set(-1.5,2.7,-4.4);scene.add(farFill);
  return {scene, animatedScreens, interactiveScreens, blueLight};
}
