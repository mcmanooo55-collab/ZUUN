import { identityPalettes } from './identities.js';

const latin = 'Manrope, system-ui, sans-serif';
const editorial = '"Cormorant Garamond", Georgia, serif';
const arabic = '"IBM Plex Sans Arabic", Tahoma, sans-serif';
const mono = 'ui-monospace, monospace';

function type(ctx, label, x,y, size, color, {font=latin, weight=700, align='left', dir='ltr'}={}) {
  ctx.save();
  ctx.direction=dir;ctx.textAlign=align;ctx.textBaseline='alphabetic';
  ctx.font=`${weight} ${size}px ${font}`;ctx.fillStyle=color;ctx.fillText(label,x,y);
  ctx.restore();
}
function rule(ctx,x1,y1,x2,y2,color,w=1) {
  ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
function grain(ctx,w,h,base,alpha=.09) {
  let seed=1953;
  const next=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  ctx.save();ctx.globalAlpha=alpha; ctx.fillStyle=base;
  for(let i=0;i<2150;i++) {const x=next()*w,y=next()*h,r=.4+next()*1.65;ctx.fillRect(x,y,r,r);}
  ctx.restore();
}

// The Riwaq mark is drawn as three arches opening onto the same threshold.
export function riwaqMark(ctx,x,y,size,color,weight=5.0) {
  ctx.save();ctx.translate(x,y);ctx.scale(size/100,size/100);
  ctx.strokeStyle=color;ctx.lineWidth=weight;ctx.lineCap='round';ctx.lineJoin='round';
  const arch=(offset)=>{
    const a=10+offset,b=90-offset, top=12+offset*1.09;
    ctx.beginPath();ctx.moveTo(a,84);ctx.lineTo(a,53+offset*.12);
    ctx.bezierCurveTo(a,32+offset*.68,30+offset*.6,22+offset*.94,50,top);
    ctx.bezierCurveTo(70-offset*.6,22+offset*.94,b,32+offset*.68,b,53+offset*.12);
    ctx.lineTo(b,84);ctx.stroke();
  };
  [0,13,26].forEach(arch);rule(ctx,10,84,90,84,color,weight);
  ctx.restore();
}

// Five ribbon lobes carry the spectrum shape from the poster to small printed pieces.
export function tayfMark(ctx,x,y,size,color,angle=0) {
  ctx.save();ctx.translate(x+size*.5,y+size*.5);ctx.scale(size/100,size/100);ctx.rotate(angle);
  ctx.fillStyle=color;
  for(let i=0;i<5;i++) {
    ctx.rotate(Math.PI*2/5);
    ctx.beginPath();ctx.moveTo(1,-5);ctx.bezierCurveTo(5,-24,14,-45,30,-48);
    ctx.bezierCurveTo(44,-52,49,-34,39,-22);ctx.bezierCurveTo(30,-12,14,-12,1,-5);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}

function riwaqPiece(c,piece,w,h) {
  const [clay,oat,roast] = identityPalettes.riwaq.map(color=>color.hex);
  const ink=piece==='front'?oat:roast;
  c.fillStyle=piece==='front'?clay:oat;c.fillRect(0,0,w,h);
  c.save();c.scale(w/640,h/(piece==='cup'?360:piece==='card'?420:800));
  if(piece==='front') {
    const gradient=c.createLinearGradient(0,0,655,770);
    gradient.addColorStop(0,'#C05B37');gradient.addColorStop(.57,clay);gradient.addColorStop(1,'#8D3624');
    c.fillStyle=gradient;c.fillRect(0,0,640,800);
    grain(c,640,800,roast,.14);
    c.fillStyle='#76331E66';c.fillRect(0,0,640,30);c.fillRect(0,775,640,25);
    for(let y=13;y<35;y+=7)rule(c,0,y,640,y,'#F5E6C742',1.2);
    rule(c,47,111,595,111,'#F5E6C777',1.5);
    type(c,'SMALL BATCH',47,94,19,ink,{font:mono,weight:600});
    type(c,'ROAST No. 01',596,94,19,ink,{font:mono,weight:600,align:'right'});
    riwaqMark(c,217,151,206,ink,4.5);
    type(c,'RIWAQ',321,446,115,ink,{font:editorial,align:'center',weight:700});
    type(c,'رِواق للقهوة',321,512,48,ink,{font:arabic,weight:600,align:'center',dir:'rtl'});
    rule(c,47,585,595,585,'#F5E6C788',1.5);
    type(c,'HOUSE BLEND',48,628,29,ink,{weight:800});
    type(c,'Cocoa  /  Date  /  Toast',48,669,24,ink,{weight:500});
    type(c,'250 g',595,670,30,ink,{align:'right'});
    rule(c,47,708,595,708,'#F5E6C788',1.5);
    type(c,'GOOD COFFEE TAKES ITS TIME.',48,743,17,ink,{font:mono,weight:600});
  } else if(piece==='back') {
    grain(c,640,800,clay,.13);
    for(let x=-35;x<650;x+=134)riwaqMark(c,x,122,133,'#AD482B30',3);
    riwaqMark(c,259,295,122,clay,5);type(c,'RIWAQ',320,479,86,roast,{font:editorial,align:'center'});
    type(c,'Small batch. Slow roast.',320,552,31,roast,{align:'center',weight:600});
    rule(c,66,615,579,615,'#AD482B66',2);
    type(c,'01  /  HOUSE BLEND',66,655,22,clay,{font:mono});
  } else if(piece==='cup') {
    grain(c,640,360,clay,.10);c.fillStyle=clay;c.fillRect(0,314,640,46);
    for(const center of [106,320,534]) {
      riwaqMark(c,center-51,43,102,clay,5.65);
      type(c,'RIWAQ',center,199,47,roast,{font:editorial,align:'center'});
      type(c,'رِواق',center,243,35,roast,{font:arabic,align:'center',dir:'rtl'});
      type(c,'ROASTERY',center,283,17,clay,{font:mono,align:'center'});
    }
  } else {
    grain(c,640,420,clay,.11);
    riwaqMark(c,55,63,206,clay,4.2);
    type(c,'RIWAQ',280,178,84,roast,{font:editorial});
    type(c,'COFFEE ROASTERY',284,219,24,clay,{font:mono});
    rule(c,58,295,575,295,'#AD482B88',1.5);
    type(c,'POUR SLOW.',60,352,24,roast,{font:mono,weight:550});
  }
  c.restore();
}

function tayfPiece(c,piece,w,h) {
  const [night,lilac,lime]=identityPalettes.tayf.map(color=>color.hex);
  const height=piece==='ticket'?240:800;
  c.save();c.scale(w/640,h/height);
  c.fillStyle=piece==='ticket'?lilac:piece==='pass'?lime:night;c.fillRect(0,0,640,height);
  if(piece==='front' || piece==='back') {
    c.save();c.globalAlpha=.35;
    for(let i=1;i<=8;i++) { const rad=i*41;c.beginPath();c.ellipse(512,441,rad,rad,0,0,Math.PI*2);c.strokeStyle=lilac;c.lineWidth=i%3===0?2.4:1;c.stroke(); }
    c.restore();
    tayfMark(c,245,166,419,lilac,-.34);
    tayfMark(c,313,230,190,lime,-.35);
    rule(c,34,96,604,96,'#AF9CF67D',2);
    type(c,'ART IN THE CITY',36,72,22,lime,{font:mono});
    type(c,'ED. 01',605,72,22,lilac,{font:mono,align:'right'});
    type(c,piece==='front'?'TAYF':'TAYF.',35,623,153,lime,{weight:800});
    type(c,'طَيْف',590,692,80,lilac,{font:arabic,align:'right',dir:'rtl',weight:700});
    type(c,'INDEPENDENT ARTS FESTIVAL',39,705,18,lilac,{font:mono,weight:550});
    rule(c,34,744,604,744,'#AF9CF67D',2);
    type(c,'INSTALLATION  /  SOUND  /  PERFORMANCE',36,775,17,lilac,{font:mono,weight:550});
  } else if(piece==='pass') {
    tayfMark(c,145,100,350,night,-.23);
    type(c,'TAYF',321,622,148,night,{align:'center',weight:800});
    rule(c,49,668,590,668,'#25185199',2);
    type(c,'FESTIVAL PASS',51,733,31,night,{font:mono,weight:600});
    type(c,'01',586,733,31,night,{font:mono,align:'right'});
  } else {
    c.fillStyle=night;c.fillRect(0,0,154,240);tayfMark(c,20,65,116,lime,-.25);
    rule(c,470,18,470,222,'#25185188',2);
    type(c,'TAYF',175,132,96,night,{weight:800});
    type(c,'DAY TICKET',178,181,25,night,{font:mono,weight:600});
    for(let i=0;i<12;i++)c.fillRect(499+i*8.6,62,i%3?3:6,118);
  }
  c.restore();
}

export function paintIdentity(canvas,kind,piece) {
  const ctx=canvas.getContext('2d');
  if(kind==='riwaq')riwaqPiece(ctx,piece,canvas.width,canvas.height);
  else tayfPiece(ctx,piece,canvas.width,canvas.height);
  return canvas;
}
