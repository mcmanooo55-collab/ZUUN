import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { wordmarkScene } from './wordmark';
import { identityPalettes } from '../identities';
import { paintIdentity } from '../identity-art';
import { floorTexture, glowTexture, notifyTextureReady, plateTexture, screenTexture } from './textures';

const TAU = Math.PI * 2;
const WHITE = '#e7f9ff';
const BLUE = '#48c5ff';
const basic = (color, opacity = 1) => new T.MeshBasicMaterial({ color, transparent: opacity !== 1, opacity, toneMapped: false, depthWrite: opacity === 1 });
const metal = (color, roughness = .31, metallic = .68) => new T.MeshStandardMaterial({ color, roughness, metalness: metallic, envMapIntensity: .86 });
const edge = (color, opacity = .56) => new T.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, toneMapped: false });
const lumin = (map, opacity = 1) => new T.MeshBasicMaterial({ map, transparent: opacity !== 1, opacity, depthWrite: opacity === 1, toneMapped: false });
const knob = (min, v, max) => Math.max(min, Math.min(max, v));

function box(w, h, d, radius, material) {
  return new T.Mesh(new RoundedBoxGeometry(w, h, d, 2, radius), material);
}
function shape(w,h,r) {
  const s=new T.Shape(), x=-w/2, y=-h/2;
  const corner=Math.min(r,w/2,h/2);
  s.moveTo(x+corner,y);s.lineTo(x+w-corner,y);s.quadraticCurveTo(x+w,y,x+w,y+corner);
  s.lineTo(x+w,y+h-corner);s.quadraticCurveTo(x+w,y+h,x+w-corner,y+h);
  s.lineTo(x+corner,y+h);s.quadraticCurveTo(x,y+h,x,y+h-corner);s.lineTo(x,y+corner);s.quadraticCurveTo(x,y,x+corner,y);
  return s;
}
function face(w,h,r, material) {
  const geo=new T.ShapeGeometry(shape(w,h,r),9);
  const uv=geo.getAttribute('uv'), p=geo.getAttribute('position');
  for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/w+.5,p.getY(i)/h+.5);
  return new T.Mesh(geo, material);
}
function enclosure(w,h,d,r,material) {
  const bevel=Math.min(.043,d*.23);
  const geo=new T.ExtrudeGeometry(shape(w-bevel*2,h-bevel*2,r-bevel*.66), {
    steps:1,depth:d-bevel*2,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:8,
  });
  geo.translate(0,0,-d*.5+bevel);
  return new T.Mesh(geo,material);
}
function outline(w,h,r,material) {
  return new T.LineLoop(new T.BufferGeometry().setFromPoints(shape(w,h,r).getPoints(8)), material);
}
function hardware(w,h,d,r, map, opts={}) {
  const m=new T.Group();
  m.add(enclosure(w,h,d,r,metal(opts.body || '#122c43', opts.roughness || .26, opts.metallic ?? .67)));
  const rim=outline(w-.027,h-.027,r,edge(opts.color || BLUE,.56)); rim.position.z=d/2+.002; m.add(rim);
  const inset=opts.inset || .082;
  const glass=face(w-inset,h-inset,Math.max(.02,r-inset*.48),lumin(map)); glass.position.z=d/2+.009; m.add(glass);
  if(opts.back) {
    const b=outline(w-.18,h-.18,r,edge(opts.color || BLUE,.40)); b.position.z=-d/2-.009;m.add(b);
    const puck=box(w*.33,h*.27,.028,.013,metal('#263b57',.27));puck.position.z=-d/2-.014;m.add(puck);
  }
  return m;
}
function addGlow(map,color,s,opacity=.7) {
  const mat=new T.SpriteMaterial({ map,color,transparent:true,opacity,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false });
  const sprite=new T.Sprite(mat);sprite.scale.set(s,s,1);return sprite;
}
function track(center,radius,from,span,color,opacity) {
  const e=new T.EllipseCurve(0,0,radius,radius,from,from+span,false,0);
  const obj=new T.Line(new T.BufferGeometry().setFromPoints(e.getPoints(72)),edge(color,opacity));
  obj.position.copy(center);return obj;
}
function stageGrid(scene,w, y, opacity=.7, color=BLUE) {
  const plane=new T.Mesh(new T.PlaneGeometry(w,w),new T.MeshBasicMaterial({ map:floorTexture(),transparent:true,depthWrite:false,opacity,toneMapped:false }));
  plane.rotation.x=-Math.PI/2;plane.position.y=y;scene.add(plane);
  const ring=new T.Group();ring.position.y=y+.012;ring.rotation.x=-Math.PI/2;
  const p=new T.Vector3();
  ring.add(track(p,w*.275,.1,TAU,color,.26),track(p,w*.316,.1,2.4,color,.52),track(p,w*.316,Math.PI+.1,2.4,color,.45));
  const g=glowTexture();
  const pool=new T.Mesh(new T.PlaneGeometry(w*.82,w*.82),new T.MeshBasicMaterial({ map:g,color,opacity:.13,transparent:true,blending:T.AdditiveBlending,toneMapped:false,depthWrite:false }));
  pool.rotation.x=-Math.PI/2;pool.position.y=y+.006;scene.add(ring,pool);
  return ring;
}
function particles(n, radius, spreadY, color) {
  const matrix=[];
  for(let i=0;i<n;i++){
    const a=i*2.39996323, r=radius*(.53+((i*43)%97)/180);
    matrix.push(Math.cos(a)*r,(((i*31)%83)/83-.5)*spreadY,Math.sin(a)*r);
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(matrix,3));
  return new T.Points(geometry,new T.PointsMaterial({ color,size:.022,transparent:true,opacity:.64,depthWrite:false,toneMapped:false,sizeAttenuation:true }));
}
function rig(environment, cameraSpec, accent=0x239cff) {
  const scene=new T.Scene();scene.environment=environment || null;scene.environmentIntensity=.84;
  const camera=new T.PerspectiveCamera(cameraSpec.fov || 34,1,.08,80);
  const target=new T.Vector3(0,cameraSpec.target || 0,0);
  function cam(aspect=1.3, zoom=0) {
    const fit=Math.max(1,cameraSpec.min / aspect);
    camera.position.set(0,cameraSpec.y*fit,cameraSpec.z*fit + zoom);
    camera.lookAt(target);
  }
  cam();
  const key=new T.DirectionalLight(0xe7f5ff,2.24);key.position.set(-3.5,7.5,6.7);
  const fill=new T.DirectionalLight(accent,2.26);fill.position.set(4,2,-3.5);
  scene.add(new T.HemisphereLight(0xb6dbff,0x10293e,1.53),key,fill);
  return { scene, camera, cam };
}

function uiProject(kind,environment) {
  const isOrbit=kind==='orbit';
  const {scene,camera,cam}=rig(environment,{y:isOrbit?1.46:1.34,z:7.42,min:1.31,fov:34},isOrbit?0x239dff:0x6d96be);
  const root=new T.Group();scene.add(root);
  const grid=stageGrid(scene,8.5,-1.84,.50,isOrbit?BLUE:'#99afc8');
  const w=isOrbit?5.25:5.12,h=isOrbit?3.10:3.18;
  const main=hardware(w,h,.15,.137,screenTexture(kind),{inset:.109,body:isOrbit?'#132a42':'#497080',color:isOrbit?BLUE:'#b6d8f8',back:true});
  main.position.set(isOrbit?-.14:-.23,.08,.1);root.add(main);
  const secondary=hardware(isOrbit?1.40:1.67,isOrbit?.93:1.14,.10,.11,isOrbit?plateTexture('code','#98e9ff','FRONT-END  ·  ORBIT'):screenTexture('forma'),{body:'#274763',color:isOrbit?'#a2edff':'#d8e5ed',inset:.085,back:true});
  secondary.position.set(isOrbit?2.29:2.14,isOrbit?-.62:-.55,isOrbit?.54:-.52);secondary.rotation.set(.12,-.15,-.04);root.add(secondary);
  const dust=particles(30,3.54,2.8,isOrbit?'#3baeff':'#acb7dc');scene.add(dust);
  let ry=0,rx=0;
  function update({time,dt,input,playing,aspect}) {
    const ease=playing && !input.dragging ? 1-Math.exp(-dt*27) : 1;
    ry+=(input.yaw+(playing?input.x*.11:0)-ry)*ease;rx+=(input.pitch+(playing?input.y*.08:0)-rx)*ease;
    root.rotation.set(rx-.045+Math.sin(time*.71)*.07,(isOrbit?-.28:.21)+Math.sin(time*.85)*.24+ry,isOrbit?-.043:.054);
    root.position.y=.11+Math.sin(time*1.25+.71)*.115;
    secondary.position.y=(isOrbit?-.62:-.55)+Math.sin(time*1.55+1.3)*.15;
    secondary.rotation.y=-.15+Math.sin(time*.90)*.21;
    grid.rotation.z=time*-.074;dust.rotation.y=time*.12;
    cam(aspect);
  }
  return {scene,camera,update};
}

function relayScene(_,environment) {
  const {scene,camera,cam}=rig(environment,{y:1.97,z:7.54,min:1.28,fov:34},0x7360ff);
  const root=new T.Group();scene.add(root);
  const grid=stageGrid(scene,8.5,-1.54,.55,'#a489fb');
  const nodes=[];
  const info=[['inbox','01 / INTAKE'],['automation','02 / CLASSIFY'],['route','03 / ROUTE'],['review','04 / REVIEW']];
  const points=[[-2.45,.39,-.36],[-.82,-.24,.10],[.82,.34,-.17],[2.41,-.28,.34]].map(p=>new T.Vector3(...p));
  info.forEach(([kind,caption],i)=>{
    const s=i===1?1.34:1.21,c=i===1?'#b0c8ff':'#c7afff';
    const node=hardware(s,s,.20,.13,plateTexture(kind,c,caption),{body:'#26284b',color:c,inset:.08,back:true});
    node.position.copy(points[i]);root.add(node);nodes.push(node);
  });
  const pathColor='#a28bff';
  const lines=[];
  for(let i=0;i<points.length-1;i++) {
    const a=points[i].clone();a.x+=.39;a.z-=.01;
    const d=points[i+1].clone();d.x-=.39;d.z-=.01;
    const b=a.clone();b.x+=.52; b.y-=.28;
    const c=d.clone();c.x-=.49; c.y+=.22;
    const track=new T.CubicBezierCurve3(a,b,c,d);
    root.add(new T.Mesh(new T.TubeGeometry(track,26,.024,6,false),basic(pathColor,.83)));
    const signal=new T.Mesh(new T.SphereGeometry(.072,12,8),basic('#f0ddff'));root.add(signal);
    lines.push({track,signal});
  }
  const dust=particles(34,3.48,2.83,'#a382ff');scene.add(dust);
  let ry=0,rx=0;
  function update({time,dt,input,playing,aspect}) {
    const ease=playing && !input.dragging ? 1-Math.exp(-dt*27) : 1;
    ry+=(input.yaw+(playing?input.x*.12:0)-ry)*ease;rx+=(input.pitch+(playing?input.y*.09:0)-rx)*ease;
    root.rotation.set(rx+.16*Math.sin(time*.71),-.31+Math.sin(time*.93)*.29+ry,-.15);
    root.position.y=.14+Math.cos(time*1.1)*.12;
    nodes.forEach((node,i)=>{node.rotation.set(-.21+Math.sin(time*1.04+i*.75)*.15,.28-i*.15+Math.cos(time*.81+i)*.15,-.11);});
    lines.forEach(({signal,track},i)=>{ track.getPoint((.6+time*.62+i*.18)%1,signal.position);signal.scale.setScalar(.72+.42*Math.sin(time*3+i*.8)**2); });
    grid.rotation.z=time*-.09;dust.rotation.y=time*.13;cam(aspect);
  }
  return {scene,camera,update};
}

function mobileScene(_,environment) {
  const {scene,camera,cam}=rig(environment,{y:1.05,z:7.0,min:1.04,fov:35},0x36c3b4);
  const root=new T.Group();scene.add(root);
  const grid=stageGrid(scene,7.6,-1.83,.55,'#4ddac2');
  const map=hardware(1.58,3.20,.149,.24,screenTexture('phone-map'),{body:'#284c56',color:'#78f3db',inset:.111,back:true});
  const list=hardware(1.58,3.20,.149,.24,screenTexture('phone-list'),{body:'#1c3947',color:'#6bdcca',inset:.111,back:true});
  map.position.set(-.92,.08,.45);list.position.set(.92,-.14,-.27);
  root.add(map,list);
  const dust=particles(30,3.0,3.2,'#63dfc0');scene.add(dust);
  let ry=0,rx=0;
  function update({time,dt,input,playing,aspect}) {
    const ease=playing && !input.dragging ? 1-Math.exp(-dt*27) : 1;
    ry+=(input.yaw+(playing?input.x*.14:0)-ry)*ease;rx+=(input.pitch+(playing?input.y*.10:0)-rx)*ease;
    root.rotation.set(rx+.065*Math.sin(time*.76),-.05+Math.sin(time*.89)*.32+ry,-.035);
    map.position.y=.12+Math.sin(time*1.25+.71)*.14;
    list.position.y=-.09+Math.sin(time*1.25+2.38)*.18;
    map.rotation.set(.08,-.22+Math.sin(time*.79)*.15,.16);
    list.rotation.set(-.055,.18+Math.sin(time*.77+.4)*.19,-.14);
    grid.rotation.z=time*-.10;dust.rotation.y=time*.11;cam(aspect);
  }
  return {scene,camera,update};
}

const printedSizes = { front:[640,800], back:[512,640], cup:[768,428], card:[512,336], pass:[384,480], ticket:[512,192] };
const printFonts = new Map();
function printedTexture(kind,piece) {
  const canvas=document.createElement('canvas');
  [canvas.width,canvas.height]=printedSizes[piece];
  const texture=new T.CanvasTexture(paintIdentity(canvas,kind,piece));
  texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  const fonts = kind === 'riwaq'
    ? [['700 24px "Cormorant Garamond"','RIWAQ'],['800 24px Manrope','HOUSE BLEND'],['600 24px "IBM Plex Sans Arabic"','رِواق للقهوة'],['700 24px "IBM Plex Sans Arabic"','رِواق']]
    : [['800 24px Manrope','TAYF'],['700 24px "IBM Plex Sans Arabic"','طَيْف']];
  if (document.fonts && fonts.some(([font,text])=>!document.fonts.check(font,text))) {
    if (!printFonts.has(kind)) printFonts.set(kind,Promise.all(fonts.map(([font,text])=>document.fonts.load(font,text))));
    let disposed=false;
    texture.addEventListener('dispose',()=>{disposed=true;});
    printFonts.get(kind).then(()=>{
      if (!disposed) { paintIdentity(canvas,kind,piece);texture.needsUpdate=true;notifyTextureReady(); }
    }).catch(()=>printFonts.delete(kind));
  }
  return texture;
}
function paperSurface(color,roughness=.77) {
  return new T.MeshStandardMaterial({color,roughness,metalness:.04,envMapIntensity:.60});
}
function printedObject(kind,piece,w,h,d,color,reverse=piece) {
  const group = new T.Group();
  group.add(enclosure(w,h,d,.056,paperSurface(color)));
  const map=printedTexture(kind,piece), backMap=reverse===piece?map:printedTexture(kind,reverse);
  const front=face(w-.021,h-.021,.036,lumin(map));front.position.z=d*.5+.002;
  const back=face(w-.021,h-.021,.036,lumin(backMap));back.rotation.y=Math.PI;back.position.z=-d*.5-.002;
  group.add(front,back);
  return group;
}
function coffeePouch(clay) {
  const w=2.12,h=2.91,d=.64;
  const geo=new T.BoxGeometry(w,h,d,12,16,3);
  const pos=geo.getAttribute('position');
  for(let i=0;i<pos.count;i++) {
    const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
    const fx=x/(w*.5),fy=y/(h*.5);
    const swell=Math.max(0,Math.cos(fy*Math.PI*.5));
    pos.setXYZ(i,x*(.89+swell*.11),y+Math.sign(fy)*Math.pow(Math.abs(fx),2.7)*.045,
      z*(.14+.86*Math.pow(swell,.52))*(1-.40*Math.pow(Math.abs(fx),3.8)));
  }
  pos.needsUpdate=true;geo.computeVertexNormals();
  const wall=paperSurface(clay), folds=paperSurface('#82361f');
  return new T.Mesh(geo,[wall,wall,folds,folds,lumin(printedTexture('riwaq','front')),lumin(printedTexture('riwaq','back'))]);
}
function coffeeCup(roast) {
  const group=new T.Group();
  group.add(new T.Mesh(new T.CylinderGeometry(.482,.358,1.24,42),lumin(printedTexture('riwaq','cup'))));
  const lid=new T.Mesh(new T.CylinderGeometry(.486,.507,.141,42),paperSurface(roast,.45));lid.position.y=.654;group.add(lid);
  const lip=new T.Mesh(new T.CylinderGeometry(.502,.502,.035,42),paperSurface('#684139',.43));lip.position.y=.611;group.add(lip);
  return group;
}
function identityFloor(scene,color) {
  const shadow=new T.Mesh(new T.PlaneGeometry(5.35,2.64),new T.MeshBasicMaterial({map:glowTexture(),color,opacity:.31,transparent:true,depthWrite:false,toneMapped:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.set(.05,-1.49,.14);scene.add(shadow);
  const wheel=track(new T.Vector3(0,-1.486,0),2.00,.28,Math.PI*1.46,color,.24);
  wheel.rotation.x=-Math.PI/2;wheel.scale.y=.625;
  scene.add(wheel);
  return wheel;
}

function identityScene(kind,environment) {
  const coffee=kind==='riwaq', [primary,neutral,accent]=identityPalettes[kind].map(color=>color.hex);
  const {scene,camera,cam}=rig(environment,{y:.84,z:6.43,min:1.11,fov:34,target:.06},coffee?0xffbd8d:0x9994ff);
  scene.environmentIntensity=.58;
  const pivot=new T.Group();scene.add(pivot);
  const floor=identityFloor(scene,coffee?'#945b46':'#66539f');
  let main,second,small;
  if(coffee) {
    main=coffeePouch(primary);
    main.position.set(-.54,.08,.03);main.rotation.set(.04,-.09,.104);
    second=printedObject(kind,'card',1.54,.99,.053,neutral);
    second.position.set(1.03,.67,-.15);second.rotation.set(-.09,-.22,-.17);
    small=coffeeCup(accent);small.position.set(1.12,-.48,.63);small.rotation.set(.032,1.23,-.103);
  } else {
    main=printedObject(kind,'front',2.22,3.05,.090,primary,'back');
    main.position.set(-.50,.10,-.10);main.rotation.set(.038,-.10,.09);
    second=printedObject(kind,'pass',1.06,1.40,.091,accent);
    second.position.set(1.13,.29,.47);second.rotation.set(.10,-.12,-.18);
    const curve=new T.CubicBezierCurve3(new T.Vector3(.01,.61,.064),new T.Vector3(.03,1.14,.07),new T.Vector3(.50,1.29,-.16),new T.Vector3(.48,.63,-.24));
    second.add(new T.Mesh(new T.TubeGeometry(curve,18,.038,7,false),paperSurface(primary,.61)));
    const clasp=new T.Mesh(new T.TorusGeometry(.079,.019,8,20),metal('#b2a7ce',.36,.61));clasp.position.set(.00,.626,.064);second.add(clasp);
    small=printedObject(kind,'ticket',1.62,.62,.067,neutral);
    small.position.set(1.01,-.98,.66);small.rotation.set(-.09,-.16,.15);
  }
  pivot.add(main,second,small);
  let yaw=0,pitch=0;
  function update({time,dt,input,playing,aspect}) {
    const ease=playing&&!input.dragging?1-Math.exp(-dt*27):1;
    yaw+=(input.yaw+(playing?input.x*.12:0)-yaw)*ease;
    pitch+=(input.pitch+(playing?input.y*.09:0)-pitch)*ease;
    pivot.rotation.set(-.062+Math.sin(time*.93)*.054+pitch,-.21+Math.sin(time*.85)*.26+yaw,-.027);
    pivot.position.y = Math.sin(time*1.28)*.080;
    second.position.y=(coffee?.67:.29)+Math.sin(time*1.25+.92)*.074;
    second.rotation.y=-.13+Math.sin(time*1.05+1.13)*.18;
    small.position.y=(coffee?-.48:-.98)+Math.sin(time*1.52+1.7)*.062;
    floor.rotation.z=time*.081;
    cam(aspect);
  }
  return {scene,camera,update};
}

function profileScene(opts,environment) {
  const {scene,camera,cam}=rig(environment,{y:opts.big?1.15:.95,z:opts.big?6.63:6.35,min:opts.big?1.23:1.38,fov:34});
  const accent=opts.color || BLUE;
  const root=new T.Group();scene.add(root);
  const label=hardware(2.16,2.16,.22,.18,plateTexture(opts.icon || 'design',accent,`STUDIO ID  /  ${opts.number || '01'}`,opts.initials || 'MO'),{body:'#27415f',color:accent,inset:.16,back:true});
  const bezel1=hardware(1.92,1.92,.105,.185,plateTexture(opts.icon || 'design',accent,'ZUUN  /  STUDIO'),{body:'#192b48',color:accent,inset:.19,back:true});
  const bezel2=enclosure(1.79,1.79,.10,.157,metal('#213a57',.29));
  label.position.z=.14;bezel1.position.z=-.22;bezel2.position.z=-.48;
  root.add(label,bezel1,bezel2);
  const orbit=new T.Group();scene.add(orbit);
  orbit.add(track(new T.Vector3(),1.65,0,TAU,accent,.47),track(new T.Vector3(),1.91,.05,2.24,accent,.59),track(new T.Vector3(),1.91,3.15,2.24,accent,.49));
  const little=new T.Mesh(new T.SphereGeometry(.044,9,7),basic(WHITE));orbit.add(little);
  const dust=particles(27,2.63,2.66,accent);scene.add(dust);
  let ry=0,rx=0;
  function update({time,dt,input,playing,aspect}) {
    const ease=playing && !input.dragging ? 1-Math.exp(-dt*27) : 1;
    ry+=(input.yaw+(playing?input.x*.12:0)-ry)*ease;rx+=(input.pitch+(playing?input.y*.10:0)-rx)*ease;
    root.rotation.set(.19+Math.sin(time*.95)*.14+rx, -.27+Math.sin(time*.9)*.47+ry,.18);
    root.position.y=Math.sin(time*1.27)*.15;
    bezel1.rotation.z=Math.sin(time*1.12)*.15;bezel2.rotation.z=Math.sin(time*.96+1)*.18;
    orbit.rotation.set(-.40,.32+Math.sin(time*.72)*.39,time*.19);
    little.position.set(Math.cos(time*1.25)*1.65,Math.sin(time*1.25)*1.65,0);
    dust.rotation.y=time*.12; cam(aspect);
  }
  return {scene,camera,update};
}

function signalScene(_,environment) {
  const {scene,camera,cam}=rig(environment,{y:1.21,z:6.9,min:1.1,fov:34});
  const orb=new T.Group();scene.add(orb);
  const stone=new T.Mesh(new T.IcosahedronGeometry(.77,0),new T.MeshStandardMaterial({color:'#2678b5',emissive:'#0086fd',emissiveIntensity:.46,roughness:.22,metalness:.45,flatShading:true}));
  const edges=new T.LineSegments(new T.EdgesGeometry(stone.geometry),edge('#9ae4ff',.88));stone.add(edges);orb.add(stone);
  const glow=addGlow(glowTexture(),'#0f9fff',3.38,.64);orb.add(glow);
  const bands=[];
  for(let i=0;i<3;i++) {
    const band=new T.Group();
    band.add(track(new T.Vector3(),1.29+i*.28,0,TAU,i===1?'#74aef9':'#68c2ff',.50));
    band.add(track(new T.Vector3(),1.29+i*.28,.15,1.55,WHITE,.66));
    const pulse=new T.Mesh(new T.SphereGeometry(.069,10,7),basic(i===1?WHITE:BLUE));band.add(pulse);
    bands.push({band,pulse,r:1.29+i*.28});scene.add(band);
  }
  const dust=particles(43,2.6,3.15,'#429fff');scene.add(dust);
  const turquoise=new T.Color('#5affe0'), blue=new T.Color('#009aff');
  let receipt=0;
  function update({time,dt,input,opts,playing,aspect}) {
    receipt+=(Number(Boolean(opts.success))-receipt)*(playing?1-Math.exp(-dt*12):1);
    orb.position.y=Math.sin(time*1.3)*.11;orb.rotation.set(time*.50,time*.67,0);
    glow.material.opacity=.62+Math.sin(time*2.0)*.12;
    glow.material.color.copy(blue).lerp(turquoise,receipt);
    stone.material.emissive.copy(blue).lerp(turquoise,receipt);
    bands.forEach(({band,pulse,r},i)=>{
      band.rotation.set(i*1.04+time*.20,.50+i*.74+time*.16,i*.75+time*.2);
      const a=time*(1.25+i*.29)+i*2;
      pulse.position.set(Math.cos(a)*r,Math.sin(a)*r,0);
      band.scale.setScalar(1+receipt*.07+Math.sin(time*2.25+i)*.026);
    });
    dust.rotation.y=time*.12;cam(aspect,-knob(-.4,(playing?input.y*.12:0),.4));
  }
  return {scene,camera,update};
}

export function buildScene(kind, options, environment) {
  if (kind === 'wordmark') return wordmarkScene(options, environment);
  if(kind==='orbit' || kind==='forma') return uiProject(kind,environment);
  if(kind==='relay') return relayScene(options,environment);
  if(kind==='masar') return mobileScene(options,environment);
  if(kind==='riwaq' || kind==='tayf') return identityScene(kind,environment);
  if(kind==='profile') return profileScene(options,environment);
  return signalScene(options,environment);
}
