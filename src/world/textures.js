import * as T from 'three';

let textureRevision = 0;
const textureReady = new Set();
export function readTextureRevision() { return textureRevision; }
export function onTextureReady(listener) {
  textureReady.add(listener);
  return () => textureReady.delete(listener);
}
export function notifyTextureReady() {
  textureRevision++;
  for (const listener of textureReady) listener();
}

function surface(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 4;
  return { ctx, texture };
}

function rr(c, x, y, w, h, r, color, stroke) {
  c.beginPath(); c.roundRect(x, y, w, h, r);
  if (color) { c.fillStyle = color; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.stroke(); }
}
function text(c, copy, x, y, color = '#bed9ed', size = 20, weight = 500, font = 'system-ui') {
  c.font = `${weight} ${size}px ${font}`; c.fillStyle = color; c.fillText(copy, x, y);
}
function line(c, points, color, thickness = 1) {
  c.beginPath(); c.strokeStyle = color; c.lineWidth = thickness; c.lineJoin = 'round'; c.lineCap = 'round';
  c.moveTo(...points[0]); for (const point of points.slice(1)) c.lineTo(...point); c.stroke();
}
function dot(c, x, y, r, color) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = color; c.fill(); }
const path = (c, coordinates, color, w) => line(c, coordinates, color, w);

export function screenTexture(kind) {
  if (kind === 'forma') return formaTexture();
  if (kind.startsWith('phone-')) return phoneTexture(kind);
  const { ctx: c, texture } = surface(960, 570);
  c.fillStyle = '#0a1427'; c.fillRect(0, 0, 960, 570);
  c.fillStyle = '#091325'; c.fillRect(0, 0, 178, 570);
  line(c, [[178,0],[178,570]], '#284260');
  dot(c, 32, 45, 12, '#0ba6fa'); dot(c, 32, 45, 6, '#091325');
  text(c, 'ORBIT', 55, 51, '#eff9ff', 24, 800);
  text(c, 'WORKSPACE', 23, 97, '#6987a6', 12, 600, 'monospace');
  for (const [row, label] of ['Overview', 'Reports', 'Activity', 'Settings'].entries()) {
    const y = 117 + row * 46;
    if (row === 0) rr(c, 13, y, 151, 37, 7, '#103155', '#165180');
    rr(c, 24, y+12, 13, 13, 2, row === 0 ? '#45bfff' : '#324f6b');
    text(c, label, 49, y+24, row === 0 ? '#d1eeff' : '#9db1c8', 16, 550);
  }
  text(c, 'Dashboard overview', 204, 73, '#f3f7ff', 33, 700);
  text(c, 'Performance across your workspace', 205, 101, '#93abc6', 16);
  const rows = [['Revenue','$38,450'],['Sessions','12,804'],['Conversion','5.84%']];
  rows.forEach(([label, value], idx) => {
    const x=204+idx*249;
    rr(c,x,126,231,87,10,'#101f37','#273d5a'); text(c,label,x+16,151,'#a2b8d0',17);
    text(c,value,x+16,188,'#effbff',27,740);
    line(c,[[x+157,181],[x+171,173],[x+181,176],[x+193,166],[x+207,157]],'#46c7fc',2);
  });
  rr(c,204,233,729,304,10,'#0d192e','#2b405c');
  text(c,'Revenue trend',223,265,'#e8f5ff',19,700); text(c,'Last 30 days',821,263,'#88a5c2',14);
  for(let y=294;y<=482;y+=47) line(c,[[236,y],[902,y]], '#293c56');
  for(let x=236;x<=902;x+=111) line(c,[[x,294],[x,482]], '#1c304a');
  const points = [[236,465],[284,453],[326,458],[374,424],[410,429],[462,391],[509,398],[558,368],[601,377],[654,339],[704,348],[754,311],[796,322],[848,296],[902,303]];
  c.beginPath(); c.moveTo(...points[0]); for (let i=1;i<points.length;i++) c.lineTo(...points[i]);
  c.lineTo(902,482); c.lineTo(236,482); c.closePath();
  const fade=c.createLinearGradient(0,295,0,487); fade.addColorStop(0,'#00afff85');fade.addColorStop(1,'#00afff00');
  c.fillStyle=fade;c.fill();line(c,points,'#5bdcff',4);
  for(let i=0;i<6;i++) text(c,`0${i+1}`,239+i*127,512,'#6e91b5',14,500,'monospace');
  texture.needsUpdate = true;
  return texture;
}

function formaTexture() {
  const { ctx: c, texture } = surface(960, 610);
  function draw(image) {
    c.fillStyle = '#f5eee2'; c.fillRect(0,0,960,610);
    line(c,[[40,69],[920,69]],'#dccdb8');
    text(c,'FORMA',42,47,'#2b221d',34,570,'Georgia');
    text(c,'COLLECTIONS     JOURNAL     BAG',646,44,'#5f5549',14,570);
    if (image) {
      const h = Math.min(image.height, Math.round(image.width * .77));
      c.drawImage(image,0,Math.max(0,(image.height-h)/2),image.width,h,462,103,457,380);
    } else {
      const fill=c.createLinearGradient(462,103,919,486);fill.addColorStop(0,'#ddbf9e');fill.addColorStop(1,'#b98662');c.fillStyle=fill;c.fillRect(462,103,457,380);
    }
    text(c,'OBJECTS FOR LIVING   /   01',41,157,'#7d6959',14,650,'monospace');
    text(c,'Room to',35,246,'#2f221c',80,460,'Georgia'); text(c,'slow down.',35,324,'#2f221c',76,460,'Georgia');
    text(c,'Furniture shaped for everyday rituals.',41,374,'#645646',20,460);
    rr(c,41,407,163,45,2,'#33271f'); text(c,'Explore collection',55,436,'#f6eee0',15,650);
    line(c,[[40,515],[920,515]],'#d9cbb8');text(c,'THE LOUNGE COLLECTION',41,563,'#5f5145',15,700,'monospace');
    text(c,'No. 01 — The lounge chair',690,563,'#765f4f',15,450);
    texture.needsUpdate = true;
  }
  draw(null);
  const image=new Image(); image.onload=()=>{ draw(image); notifyTextureReady(); }; image.src='/media/forma-chair.webp';
  return texture;
}

function phoneTexture(kind) {
  const { ctx: c, texture }=surface(384,800);
  c.fillStyle='#071d22'; c.fillRect(0,0,384,800);
  c.save(); c.beginPath(); c.rect(0,99,384,580); c.clip();
  if (kind === 'phone-map') {
    for (let i=-3; i<=9; i++) {
      const x=i*61;
      line(c,[[x,65],[x+82,270],[x+43,426],[x+92,739]], i%3===0?'#254f50':'#143739',i%3===0?8:5);
      if(i%3===0) line(c,[[x,65],[x+82,270],[x+43,426],[x+92,739]],'#346463',1);
    }
    for(let i=0;i<=11;i++) {
      const y=104+i*54;
      line(c,[[-45,y],[118,y-23],[249,y+10],[430,y-29]],i%3===0?'#2d5556':'#1c4143',i%3===0?7:4);
    }
    c.fillStyle='#173f3b'; c.beginPath();c.moveTo(268,220);c.lineTo(336,190);c.lineTo(366,289);c.lineTo(296,319);c.closePath();c.fill();
    const route=[[80,554],[103,466],[145,452],[167,376],[253,400],[278,313],[227,292],[238,229]];
    line(c,route,'#31d6ab39',23);line(c,route,'#75f6ca',8);
    dot(c,80,554,15,'#12594c');dot(c,80,554,7,'#bdfff0');dot(c,238,229,18,'#3edca8');dot(c,238,229,8,'#e5fff5');
  } else {
    rr(c,21,123,342,171,18,'#133437','#2a645c');
    const skyline=[[39,270],[95,196],[121,213],[174,149],[230,221],[278,182],[346,243]];
    line(c,skyline,'#43817a',5); line(c,[[64,260],[329,260]],'#2e5e57',3); dot(c,275,160,10,'#8ee8c7');
    text(c,'Saturday route',23,345,'#edfff9',28,730);
    ['Central plaza','Riverside gardens','Art district'].forEach((label,i)=>{
      const y=374+i*86; rr(c,20,y,344,67,10,'#102e34','#295454');
      dot(c,46,y+33,9,'#7ef2cf'); text(c,label,67,y+40,'#c6f1e5',18,600);
    });
  }
  c.restore();
  c.fillStyle='#0a2227';c.fillRect(0,0,384,101);
  text(c,'09:41',23,34,'#b0d9d4',15,700);
  rr(c,140,14,104,17,7,'#050c11');
  text(c,'MASAR',23,77,'#dcfff5',26,800); text(c,kind==='phone-list'?'ITINERARY':'CITY MAP',252,74,'#82b6ac',14,700,'monospace');
  rr(c,18,637,348,133,18,'#0c2c32','#285b5c');text(c,kind==='phone-list'?'3 places saved':'Riverside loop',35,675,'#f0fff9',25,720);
  text(c,'12 MIN    ·    3.2 KM',35,709,'#85d7c6',16,650,'monospace');rr(c,135,747,113,5,3,'#75a5a4');
  texture.needsUpdate=true;
  return texture;
}

export function glowTexture() {
  const { ctx:c, texture }=surface(128,128);
  const grad=c.createRadialGradient(64,64,0,64,64,64);
  grad.addColorStop(0,'#ffffffd9');grad.addColorStop(.12,'#ffffffab');grad.addColorStop(.35,'#ffffff59');grad.addColorStop(.7,'#ffffff13');grad.addColorStop(1,'#ffffff00');
  c.fillStyle=grad;c.fillRect(0,0,128,128);texture.needsUpdate=true;
  return texture;
}

export function floorTexture() {
  const {ctx:c,texture}=surface(512,512);
  for(let v=0;v<=512;v+=24){line(c,[[v,0],[v,512]],'#54baff31');line(c,[[0,v],[512,v]],'#54baff31');}
  for(let x=16;x<512;x+=48)for(let y=16;y<512;y+=48)dot(c,x,y,1.7,'#90d8ff6e');
  c.globalCompositeOperation='destination-in';
  const grad=c.createRadialGradient(256,256,65,256,256,255);grad.addColorStop(0,'#ffffffff');grad.addColorStop(.7,'#ffffffbb');grad.addColorStop(1,'#ffffff00');c.fillStyle=grad;c.fillRect(0,0,512,512);
  c.globalCompositeOperation='source-over';texture.needsUpdate=true;return texture;
}

function drawGlyph(c, key, color, cx, cy, scale=1) {
  c.save();c.translate(cx,cy);c.scale(scale,scale);
  const l=(p,w=8)=>path(c,p,color,w);
  const d=(x,y,r=7)=>dot(c,x,y,r,color);
  if(key==='code'){ l([[-11,-39],[-53,0],[-11,39]]);l([[13,-39],[55,0],[13,39]]);l([[10,-47],[-10,47]],6); }
  else if(key==='design'){l([[-46,44],[31,-46],[49,-31],[-29,52],[-46,44]]);l([[-47,-30],[-31,-46],[47,35],[34,50]]);l([[-21,14],[11,43]],6);}
  else if(key==='mobile'){c.lineWidth=8;rr(c,-34,-61,68,122,13,null,color);l([[-13,40],[13,40]],6);}
  else if(key==='media'){c.lineWidth=7;rr(c,-53,-28,106,73,9,null,color);l([[-51,-25],[43,-55],[50,-38]]);l([[-26,-34],[-20,-45]],6);l([[13,-47],[20,-57]],6);l([[-10,0],[20,10],[-10,24],[-10,0]],5);}
  else if(key==='inbox'){c.lineWidth=7;rr(c,-52,-39,104,78,10,null,color);l([[-49,-33],[0,8],[49,-33]]);}
  else if(key==='route'){l([[-45,33],[-16,33],[-16,-29],[47,-29]]);l([[27,-48],[47,-29],[28,-10]]);l([[-16,20],[47,20]]);l([[27,2],[47,20],[28,38]]);}
  else if(key==='review'){c.lineWidth=7;rr(c,-39,-49,78,98,10,null,color);l([[-22,3],[-4,21],[22,-10]]);}
  else {l([[-43,-29],[0,1],[44,-26]],7);l([[0,1],[0,48]],7);d(-43,-29,11);d(0,1,13);d(44,-26,11);d(0,48,11);d(34,32,5);}
  c.restore();
}

export function plateTexture(key, color, caption, initials = '') {
  const {ctx:c,texture}=surface(480,480);
  const bg=c.createLinearGradient(0,0,480,480);bg.addColorStop(0,'#1b3853');bg.addColorStop(1,'#09152a');c.fillStyle=bg;c.fillRect(0,0,480,480);
  for(let x=25;x<480;x+=25)for(let y=25;y<480;y+=25)dot(c,x,y,1.1,'#70a6c636');
  c.lineWidth=2;rr(c,14,14,452,452,24,null,'#a7ddff25');
  dot(c,35,39,5,color); text(c,'ZUUN  /  LIVE',51,46,'#a8c7e0',17,650,'monospace');
  if(initials){c.textAlign='center';text(c,initials,235,293,color,166,780);c.textAlign='start';drawGlyph(c,key,color,409,370,.38);}
  else {drawGlyph(c,key,color,240,234,1.5);}
  line(c,[[32,411],[448,411]],'#94b7dd30'); text(c,caption,36,444,'#a8c8e1',17,640,'monospace');
  texture.needsUpdate=true;
  return texture;
}
