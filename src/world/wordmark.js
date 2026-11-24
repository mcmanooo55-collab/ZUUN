import * as T from 'three';
import artwork from './wordmark-data.json';

const V = (x, y, z = 0) => new T.Vector3(x, y, z);
const scale = 4.77;
// Main GPU and economy tiers use the same sample positions, in a deterministic interleaved order.
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function generator(seed) { return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; }; }

function makeShapes(glyph) {
  const path = new T.ShapePath();
  for (const [op, ...numbers] of glyph.path) {
    const a = numbers.map(n => n * scale);
    if (op === 'm') path.moveTo(...a);
    else if (op === 'l') path.lineTo(...a);
    else if (op === 'q') path.quadraticCurveTo(...a);
    else if (op === 'b') path.bezierCurveTo(...a);
    else path.currentPath.closePath();
  }
  return path.toShapes();
}

function sampleFace(shapes, x, y, count, rng) {
  const g = new T.ShapeGeometry(shapes, 13);
  const position = g.getAttribute('position');
  const index = g.index?.array;
  const triangles = [];
  let areaSum = 0;
  for (let i = 0, n = index?.length ?? position.count; i < n; i += 3) {
    const a = V().fromBufferAttribute(position, index ? index[i] : i);
    const b = V().fromBufferAttribute(position, index ? index[i+1] : i+1);
    const c = V().fromBufferAttribute(position, index ? index[i+2] : i+2);
    const area = Math.abs((b.x-a.x)*(c.y-a.y) - (b.y-a.y)*(c.x-a.x)) * .5;
    if (area < .00002) continue;
    areaSum += area;
    triangles.push({ a, b, c, upper: areaSum });
  }
  const samples = [];
  for (let i = 0; i < count; i++) {
    const r = rng() * areaSum;
    const { a, b, c } = triangles.find(t => r < t.upper) ?? triangles[triangles.length - 1];
    const u = Math.sqrt(rng()), v = rng();
    samples.push([x + a.x * (1-u) + b.x * u * (1-v) + c.x * u * v,
      y + a.y * (1-u) + b.y * u * (1-v) + c.y * u * v, .51]);
  }
  g.dispose();
  return samples;
}

function makeType(scene, environment) {
  const letters = 'ZUUN'.split('');
  const total = letters.reduce((sum, letter) => sum + artwork.letters[letter].advance * scale - .165, 0);
  const ink = new T.Group();
  scene.add(ink);
  const front = new T.MeshStandardMaterial({ color: 0xf5f9ff, roughness: .28, metalness: .035, emissive: 0xd8eaff, emissiveIntensity: .33, transparent: true, envMapIntensity: .21 });
  const side = new T.MeshStandardMaterial({ color: 0x068beb, roughness: .32, metalness: .39, emissive: 0x0053b8, emissiveIntensity: .36, transparent: true, envMapIntensity: environment ? .83 : .36 });
  const dotSurface = new T.MeshStandardMaterial({ color: 0x00a8ff, emissive: 0x0069d4, emissiveIntensity: .55, roughness: .27, metalness: .32, transparent: true });
  const finish = [front, side, dotSurface];
  const rng = generator(211);
  const baseLine = -scale * .358;
  let advance = -total/2 - .31;
  let points = [];
  const glyphs = letters.map((ch, i) => {
    const glyph = artwork.letters[ch], shapes = makeShapes(glyph);
    points = points.concat(sampleFace(shapes, advance, baseLine, i === 3 ? 625 : 575, rng));
    const geo = new T.ExtrudeGeometry(shapes, { depth: .65, steps: 1, bevelEnabled: true, bevelThickness: .090, bevelSize: .051, bevelSegments: 3, curveSegments: 12 });
    const center = glyph.advance * scale/2;
    geo.translate(-center, 0, -.37);
    const mesh = new T.Mesh(geo, [front, side]);
    const x = advance + center;
    ink.add(mesh);
    advance += glyph.advance * scale - .165;
    return { mesh, x, y: baseLine };
  });
  const dot = new T.Mesh(new T.CylinderGeometry(.285,.285,.54,32,1).rotateX(Math.PI/2),dotSurface);
  dot.position.set(advance + .29, baseLine + .22, .03);
  ink.add(dot);
  points.sort((a,b)=>a[0]-b[0]);
  return { ink, glyphs, materials: finish, points, dot };
}

const birdSize = [6.45, 5.70];
function birdSeal() {
  function outline(path, ring) {
    ring.forEach(([x,y],i)=>path[i ? 'lineTo' : 'moveTo'](x * birdSize[0], y * birdSize[1] + .15));
    path.closePath();
    return path;
  }
  const shapes = artwork.birdOutline.map(([edge,...holes])=>{
    const shape=outline(new T.Shape(),edge);
    shape.holes.push(...holes.map(ring=>outline(new T.Path(),ring)));
    return shape;
  });
  const face=new T.MeshStandardMaterial({color:0x176ec3, emissive:0x145db6, emissiveIntensity:.58, roughness:.37, metalness:.21, transparent:true, opacity:0, depthWrite:false, envMapIntensity:.54});
  const rim=new T.MeshStandardMaterial({color:0x19b4ff, emissive:0x0095e7, emissiveIntensity:.6, roughness:.38, metalness:.37, transparent:true, opacity:0, depthWrite:false});
  const geo=new T.ExtrudeGeometry(shapes,{depth:.14,steps:1,bevelEnabled:false,curveSegments:1});
  geo.translate(0,0,-.24);
  const mesh=new T.Mesh(geo,[face,rim]);
  mesh.renderOrder=1;
  return { mesh, face, rim };
}

const symbols = [
  [[[-.15,.22],[-.37,0],[-.15,-.22]], [[.15,.22],[.37,0],[.15,-.22]], [[.1,.29],[-.1,-.29]]],
  [[[-.29,-.22],[-.20,.08],[.11,.37],[.32,.18],[.02,-.13],[-.29,-.22]], [[-.20,.08],[.02,-.13]], [[.055,.31],[.25,.12]]],
  [[[-.20,.20],[.16,.17],[.21,-.21],[-.20,.20]], [[-.35,.20],[-.20,.35],[-.05,.20],[-.20,.05],[-.35,.20]], [[.08,.17],[.16,.25],[.24,.17],[.16,.09],[.08,.17]], [[.09,-.21],[.21,-.09],[.33,-.21],[.21,-.33],[.09,-.21]]],
  [[[-.11,.34],[.11,.34],[.18,.27],[.18,-.27],[.11,-.34],[-.11,-.34],[-.18,-.27],[-.18,.27],[-.11,.34]], [[-.065,-.24],[.065,-.24]]],
];
function makeStations(scene, glyphs) {
  return symbols.map((parts,i)=>{
    const geometry=new T.BufferGeometry();
    const points=[];
    for (const path of parts) for(let j=1;j<path.length;j++) points.push(...path[j-1],0,...path[j],0);
    geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));
    const mat=new T.LineBasicMaterial({color:0x74cdff,transparent:true,opacity:.48,depthWrite:false,toneMapped:false});
    const station=new T.LineSegments(geometry,mat);
    station.scale.setScalar(.64);
    scene.add(station);
    return { station, mat, x:glyphs[i].x };
  });
}

function makeThreads(points) {
  const rng = generator(51933);
  const positions = [], destinations = [], drift = [], prop = [];
  const count = artwork.bird.length;
  for (let i = 0; i < count; i++) {
    const index = (i * 1517) % count;
    const point = points[Math.min(points.length - 1, Math.floor(index * points.length / count))];
    const [x, y] = artwork.bird[index];
    const end = [x * birdSize[0], y * birdSize[1] + .15, (rng()-.5) * .23];
    const swing = [(rng()-.44) * 2.46, (rng()-.49) * 4.1, (rng()-.50) * 5.24];
    const s = rng(), strand = .20 + rng() * 1.04;
    for (let tail = 0; tail <= 1; tail++) {
      positions.push(point[0],point[1],point[2]);
      destinations.push(...end); drift.push(...swing); prop.push(s, strand, tail);
    }
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aTarget', new T.Float32BufferAttribute(destinations, 3));
  geo.setAttribute('aDrift', new T.Float32BufferAttribute(drift, 3));
  geo.setAttribute('aProp', new T.Float32BufferAttribute(prop, 3));
  const material = new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uTravel: { value: 0 }, uWeight: { value: 1 }, uBlue: { value: new T.Color('#008ff2') }, uPearl: { value: new T.Color('#ccecff') } },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false,
    vertexShader: `
      attribute vec3 aTarget; attribute vec3 aDrift; attribute vec3 aProp;
      uniform float uTime; uniform float uTravel; uniform float uWeight;
      varying float vAlpha; varying float vTone;
      void main(){
        float p=uTravel; float salt=aProp.x;
        float arrive=smoothstep(.28+salt*.15,.89,p);
        float spray=smoothstep(.04,.48,p)*(1.0-smoothstep(.44,.92,p));
        float vibrate=smoothstep(.04,.21,p)*(1.0-smoothstep(.75,.98,p));
        vec3 pt=mix(position,aTarget,arrive);
        pt.z-=.42*(1.0-arrive);
        pt+=aDrift*spray*(.66+salt*.44);
        pt.y+=spray*(.65+salt*.39);
        float tide=sin(pt.x*.8+uTime*.74+salt*6.283);
        pt.y+=tide*(.024+.19*vibrate);
        pt.z+=cos(uTime*.51+salt*16.0)*(.047+.15*spray);
        float length=.024+3.38*spray*aProp.y+.105*vibrate;
        float lean=.27+.18*salt;
        vec3 tangent=normalize(vec3(lean+(.72-lean)*(1.0-spray),.30+sin(salt*5.0)*.18+spray*1.86,aDrift.z*.125));
        pt-=tangent*aProp.z*length;
        vTone=clamp(.17+salt*.54+smoothstep(.69,.99,p)*.38,0.0,1.0);
        vAlpha=uWeight*(.026+.43*smoothstep(.08,.46,p)+.10*arrive)*(.25+salt*.72)*mix(1.0,.23,aProp.z*spray);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(pt,1.0);
      }`,
    fragmentShader: `
      uniform vec3 uBlue; uniform vec3 uPearl; varying float vAlpha; varying float vTone;
      void main(){
        gl_FragColor=vec4(mix(uBlue,uPearl,vTone),vAlpha);
        #include <colorspace_fragment>
      }`,
  });
  const lines = new T.LineSegments(geo, material);
  lines.frustumCulled = false; lines.renderOrder = 3;
  return lines;
}

function makeRibbons() {
  const geometry = new T.BufferGeometry();
  const slots = [];
  for (let line = 0; line < 38; line++) {
    for (let i = 0; i < 82; i++) {
      slots.push(i/82, line/37, 0, (i+1)/82, line/37, 0);
    }
  }
  geometry.setAttribute('position', new T.Float32BufferAttribute(slots,3));
  const material = new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uTravel: { value: 0 }, uBlue: { value: new T.Color('#1a9bff') }, uWidth: { value: 1 } },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false,
    vertexShader: `
      uniform float uTime; uniform float uTravel; uniform float uWidth;
      varying float vInk;
      void main(){
        float x=(position.x*2.-1.)*10.0;
        float line=position.y;
        float ribbon=sin(x*.40+uTime*.54+line*1.71);
        float y = ribbon*(.27+line*.26)+.125*x+(line-.54)*2.17;
        float z = cos(x*.29+line*2.18-uTime*.25)*1.64-1.31;
        y+=sin(x*.31-uTime*.71+line*9.1)*.30 + (line-.55)*uTravel*1.9;
        x*=uWidth;
        float edge=sin(position.x*3.14159);
        float layers=1.0-smoothstep(.27,.54,abs(line-.49));
        vInk=(.075+.12*pow(ribbon*.5+.5,6.0))*edge*layers*(1.0-uTravel*.45);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(x,y-.15,z,1.0);
      }`,
    fragmentShader: `
      uniform vec3 uBlue; varying float vInk;
      void main(){ gl_FragColor=vec4(uBlue, vInk);
      #include <colorspace_fragment>
      }`,
  });
  const wave = new T.LineSegments(geometry, material); wave.frustumCulled = false;
  return wave;
}

export function wordmarkScene(_, environment) {
  const scene = new T.Scene();
  if (environment) scene.environment = environment;
  scene.environmentIntensity = .54;
  const key = new T.DirectionalLight(0xe8f6ff, 2.85); key.position.set(-3.7,6.5,9);
  const accent = new T.DirectionalLight(0x068bff, 3.15); accent.position.set(5,-3,1.6);
  scene.add(new T.HemisphereLight(0x9bcfff,0x263b7a,1.45), key, accent);
  const camera = new T.PerspectiveCamera(25, 1.95, .1, 95);
  const { ink, glyphs, materials, points, dot } = makeType(scene, environment);
  const wave = makeRibbons(); scene.add(wave);
  const threads = makeThreads(points); scene.add(threads);
  const seal = birdSeal(); scene.add(seal.mesh);
  const stations = makeStations(scene,glyphs);
  let progress = 0, tiltX = 0, tiltY = 0;
  function update({ time, dt, input, playing, aspect, scroll, quality = 1 }) {
    const k = !playing || input.dragging ? 1 : 1 - Math.exp(-dt * 28);
    // Native scrolling already provides easing. A second lerp made the letters trail the page.
    if (playing) progress = scroll;
    const total = artwork.bird.length;
    const count = Math.round(total * quality);
    threads.geometry.setDrawRange(0,count * 2);
    threads.material.uniforms.uWeight.value = 1 + (1 - quality) * .46;
    tiltX += ((playing ? input.y * .070 : 0) + input.pitch*.58 - tiltX) * k;
    tiltY += ((playing ? input.x * .087 : 0) + Math.sin(input.yaw)*.46 - tiltY) * k;
    const disperse = smooth(.04,.49,progress);
    const alpha = 1 - smooth(.16,.59,progress);
    ink.rotation.set(-.104 + tiltX + .078 * Math.cos(time * .71), -.107 + tiltY + .163 * Math.sin(time * .87), -.014 + Math.sin(time*.76)*.028 - disperse*.075);
    ink.position.y = Math.sin(time * 1.04) * .115 - disperse * .27;
    ink.position.x = .19*Math.sin(time*.66) - disperse*.27;
    glyphs.forEach(({ mesh,x,y }, i) => {
      const freq = time*1.12+i*.70;
      mesh.position.set(x + (i-1.3)*1.4*disperse, y + .155*Math.sin(freq) + (i%2 === 0 ? .49 : -.41)*disperse, -1.3*disperse + .30*Math.cos(freq));
      mesh.rotation.set(.041*Math.cos(freq) - disperse*.59, .064*Math.sin(freq) + (i-1.4)*.18*disperse, .023*Math.sin(freq));
    });
    const symbolsFade = (1-smooth(.20,.56,progress))*(.40+smooth(.08,.22,progress)*.36);
    stations.forEach(({station,mat,x},i)=>{
      station.position.set(x + (i-1.4)*.29*disperse, -2.29 + .075*Math.sin(time*1.42+i*.77) - disperse*.36, .12*Math.cos(time*.87+i));
      station.rotation.set(tiltX*.45, tiltY*.45+.39*Math.sin(time*.81+i*.62),0);
      mat.opacity=symbolsFade;
      station.visible=symbolsFade>.012;
    });
    dot.position.z = .38+.31*Math.sin(time*1.23) + disperse * 1.0;
    dot.scale.setScalar(1 + .053*Math.sin(time*1.67));
    for (const mat of materials) { mat.opacity = alpha; mat.depthWrite = alpha > .97; }
    ink.visible = alpha > .004;
    wave.material.uniforms.uTime.value = time;
    wave.material.uniforms.uTravel.value = progress;
    threads.material.uniforms.uTime.value = time;
    threads.material.uniforms.uTravel.value = progress;
    threads.rotation.set(-.08 + tiltX*.53, tiltY*.55 - .05*Math.sin(time*.46) * (1-progress), -.077 + .075*progress);
    const size = aspect < 1.12 ? 15.45 : 16.15;
    const distance = Math.max(13.15, size / (2*Math.tan(T.MathUtils.degToRad(12.5)) * aspect));
    const birdBoost = aspect < 1.12 ? .64 : .31;
    threads.scale.setScalar(1+smooth(.50,.97,progress)*birdBoost);
    const engraving = smooth(.69,.99,progress);
    seal.mesh.visible = engraving > .002;
    seal.mesh.scale.copy(threads.scale);
    seal.mesh.rotation.copy(threads.rotation);
    seal.face.opacity = engraving * .52;
    seal.rim.opacity = engraving * .78;
    const flight = Math.max(distance, 8.23 / (2*Math.tan(T.MathUtils.degToRad(12.5))));
    const zoom = smooth(.33,.93,progress);
    camera.position.set(0,.065,(1-zoom)*distance+zoom*flight);
    camera.lookAt(0, .02, 0);
  }
  return { scene, camera, update };
}
