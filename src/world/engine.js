import * as T from 'three';
import { buildScene } from './models';
import { onTextureReady, readTextureRevision } from './textures';

function disposeScene(scene) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  scene.traverse(node => {
    if (node.geometry) geometries.add(node.geometry);
    if (!node.material) return;
    for (const material of [].concat(node.material)) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  for (const texture of textures) texture.dispose();
}

async function loadStudioLight(signal) {
  // Linear RGBA16F, CubeUV atlas baked once from the original Three.js RoomEnvironment.
  const w = 336, h = 128;
  try {
    const response = await fetch('/media/studio-light.bin', { signal });
    if (!response.ok) return null;
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== w * h * 8) return null;
    const data = new Uint16Array(bytes);
    if (new Uint8Array(new Uint16Array([1]).buffer)[0] !== 1) {
      const littleEndian = new DataView(bytes);
      for (let i = 0; i < data.length; i++) data[i] = littleEndian.getUint16(i * 2, true);
    }
    const map = new T.DataTexture(data, w, h, T.RGBAFormat, T.HalfFloatType);
    map.mapping = T.CubeUVReflectionMapping;
    map.colorSpace = T.LinearSRGBColorSpace;
    map.minFilter = map.magFilter = T.LinearFilter;
    map.needsUpdate = true;
    return map;
  } catch { return null; } // Direct key and fill lights are still available offline.
}

export function makeWorld(canvas, registry, playback) {
  const compact = matchMedia('(pointer: coarse) and (max-width: 850px)').matches;
  const powerPreference = compact ? 'low-power' : 'high-performance';
  // The canvas is already sampled at a device-aware scale. A full-screen MSAA buffer adds avoidable resolve work.
  const attributes = { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference };
  const context = canvas.getContext('webgl2', attributes);
  if (!context) throw new Error('WebGL2 is unavailable');
  const debug = context.getExtension('WEBGL_debug_renderer_info');
  const software = !!debug && /swiftshader|llvmpipe|software renderer/i.test(context.getParameter(debug.UNMASKED_RENDERER_WEBGL));
  const pixelBudget = software ? 1_170_000 : compact ? 1_450_000 : 2_600_000;
  const renderer = new T.WebGLRenderer({ canvas, context, ...attributes });
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0);
  canvas.style.visibility = 'hidden';

  const active = new Map();
  let frame = 0, previous = 0, width = 0, height = 0, ratio = 0, lost = false, stopped = false;
  let drew = false, lastSignature = '', lighting = null, lightReady = false;
  let slow = 0, smooth = 0, resolution = 1, changedAt = 0;
  let dialogOpen = Boolean(document.querySelector('dialog[open]'));
  const hasIdle = typeof window.requestIdleCallback === 'function';
  let warmId = null, queued = null;

  function wake() {
    if (!frame && lightReady && !stopped && !lost && !document.hidden) frame = requestAnimationFrame(tick);
  }

  const lightRequest = new AbortController();
  const deadline = setTimeout(() => lightRequest.abort(), 1500);
  loadStudioLight(lightRequest.signal).then(map => {
    clearTimeout(deadline);
    if (stopped) { map?.dispose(); return; }
    lighting = map;
    lightReady = true;
    wake();
  });

  const unlistenTexture = onTextureReady(wake);
  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(wake) : null;
  const main = document.getElementById('main-content');
  resize?.observe(canvas);
  if (main) resize?.observe(main);
  document.fonts?.ready.then(wake);
  const dialogs = new MutationObserver(records => {
    if (!records.some(record => record.target.nodeName === 'DIALOG' ||
      [...record.addedNodes, ...record.removedNodes].some(node => node.nodeName === 'DIALOG'))) return;
    dialogOpen = Boolean(document.querySelector('dialog[open]'));
    wake();
  });
  dialogs.observe(document.body, { attributes: true, attributeFilter: ['open'], childList: true, subtree: true });
  const onVisibility = () => { previous = 0; if (!document.hidden) wake(); };
  window.addEventListener('scroll', wake, { passive: true, capture: true });
  window.addEventListener('resize', wake, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  function cancelWarm() {
    if (warmId !== null) (hasIdle ? window.cancelIdleCallback(warmId) : clearTimeout(warmId));
    warmId = null;
    queued = null;
  }
  const handleLost = event => {
    event.preventDefault();
    lost = true;
    drew = false;
    previous = 0;
    canvas.style.visibility = 'hidden';
    cancelWarm();
    for (const view of registry.values()) view.el.dataset.state = 'fallback';
  };
  const handleRestore = () => {
    for (const { scene } of active.values()) disposeScene(scene);
    active.clear();
    if (lighting) lighting.needsUpdate = true;
    lastSignature = '';
    lost = false;
    wake();
  };
  canvas.addEventListener('webglcontextlost', handleLost);
  canvas.addEventListener('webglcontextrestored', handleRestore);

  function prepare({ id, view }) {
    if (active.has(id)) return active.get(id);
    let built;
    try {
      built = buildScene(view.kind, view.options.current, lighting);
      const item = { ...built, time: 0, ready: false };
      active.set(id, item);
      return item;
    } catch (error) {
      if (built?.scene) disposeScene(built.scene);
      view.el.dataset.state = 'error';
      console.warn('ZUUN scene unavailable:', view.kind, error?.message);
      return null;
    }
  }

  function warm(candidate) {
    if (!candidate) { cancelWarm(); return; }
    // Let the next one load a little ahead of the viewport, rather than compiling a row on scroll.
    queued = candidate;
    if (warmId !== null) return;
    const task = () => {
      const next = queued;
      warmId = null;
      queued = null;
      if (!next || lost || stopped || dialogOpen || document.hidden ||
          active.has(next.id) || registry.get(next.id) !== next.view) return;
      const item = prepare(next);
      if (item) {
        renderer.compile(item.scene, item.camera);
        wake();
      }
    };
    warmId = hasIdle ? window.requestIdleCallback(task, { timeout: 300 }) : setTimeout(task, 40);
  }

  function tick(now) {
    frame = 0;
    if (stopped || lost || document.hidden || dialogOpen) {
      previous = 0;
      cancelWarm();
      return;
    }
    const runs = playback.current.playing;
    const host = canvas.getBoundingClientRect();
    const w = Math.round(host.width), h = Math.round(host.height);
    if (!w || !h) return;
    const elapsed = previous ? now - previous : 16.7;
    const dt = Math.min(elapsed / 1000, .13);

    const visible = [], clipBoxes = new Map();
    let near = null, next = null;
    let serial = `${w}x${h}@${readTextureRevision()}`;
    for (const [id, view] of registry) {
      if (view.el.dataset.state === 'error') continue;
      const rect = view.el.getBoundingClientRect();
      const x = Math.round(rect.left - host.left), y = Math.round(rect.top - host.top);
      const sw = Math.round(rect.width), sh = Math.round(rect.height);
      if (sw < 4 || sh < 4) continue;
      let minX = 0, minY = 0, maxX = w, maxY = h;
      if (view.clip) {
        if (!clipBoxes.has(view.clip)) clipBoxes.set(view.clip, view.clip.getBoundingClientRect());
        const c = clipBoxes.get(view.clip);
        minX = Math.max(0, Math.ceil(c.left - host.left)); minY = Math.max(0, Math.ceil(c.top - host.top));
        maxX = Math.min(w, Math.floor(c.right - host.left)); maxY = Math.min(h, Math.floor(c.bottom - host.top));
      }
      const bx = Math.max(minX, x), by = Math.max(minY, y);
      const ex = Math.min(maxX, x + sw), ey = Math.min(maxY, y + sh);
      if (ex <= bx || ey <= by) {
        if (runs && !active.has(id) && maxX > minX && x < maxX + 210 && x + sw > minX - 210 &&
            y < maxY + 280 && y + sh > minY - 240) near ??= { id, view };
        continue;
      }
      let scroll = 0;
      const timeline = view.options.current.timeline?.current;
      if (runs && timeline) {
        const range = timeline.offsetHeight - (timeline.firstElementChild?.offsetHeight || h);
        if (range > 2) scroll = Math.max(0, Math.min(1, -timeline.getBoundingClientRect().top / range));
      }
      const entry = { id, view, x, y, sw, sh, bx, by, ex, ey, scroll };
      visible.push(entry);
      const area = (ex - bx) * (ey - by);
      if (!active.has(id) && (!next || area > next.area)) next = { ...entry, area };
      if (!runs) serial += `:${id},${x},${y},${sw},${sh},${bx},${by},${ex},${ey},${view.input.current.revision},${view.options.current.success || false},${active.has(id)}`;
    }
    for (const [id, item] of active) {
      if (!registry.has(id)) { disposeScene(item.scene); active.delete(id); }
    }
    if (!visible.length) {
      if (drew) canvas.style.visibility = 'hidden';
      drew = false;
      previous = 0;
      lastSignature = '';
      warm(near);
      return;
    }

    // Adapt to sustained missed frames, not a single scroll or shader setup. Recover slowly.
    if (runs && previous && !next) {
      if (elapsed > 25) { slow++; smooth = 0; }
      else { slow = Math.max(0, slow - 1); smooth = elapsed < 20 ? smooth + 1 : 0; }
      if (now - changedAt > 580 && slow >= 7 && resolution > .76) {
        resolution = Math.max(.76, resolution - .12);
        changedAt = now; slow = 0;
      } else if (now - changedAt > 2300 && smooth >= 120 && resolution < 1) {
        resolution = Math.min(1, resolution + .12);
        changedAt = now; smooth = 0;
      }
    }
    previous = runs ? now : 0;
    const native = Math.max(window.devicePixelRatio || 1, software || compact ? 1 : 1.18);
    const base = Math.min(native, software ? 1.12 : compact ? 1.45 : 1.65,
      Math.sqrt(pixelBudget / (w * h)));
    const useRatio = Math.round(base * resolution * 100) / 100;
    const resized = w !== width || h !== height || useRatio !== ratio;
    if (!runs && !resized && !next && serial === lastSignature) return;
    lastSignature = serial;
    if (resized) {
      width = w; height = h; ratio = useRatio;
      renderer.setDrawingBufferSize(width, height, ratio);
    }
    if (next) prepare(next);

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, width, height);
    renderer.clear(true, true, false);
    renderer.setScissorTest(true);
    let drawn = 0, pending = false;
    const strands = (software ? .70 : compact ? .83 : 1) * (resolution < .90 ? .88 : 1);
    for (const { id, view, x, y, sw, sh, bx, by, ex, ey, scroll } of visible) {
      const item = active.get(id);
      if (!item) { pending ||= view.el.dataset.state !== 'error'; continue; }
      if (runs) item.time += dt;
      const aspect = sw / sh;
      item.update({ time: item.time, dt, input: view.input.current, opts: view.options.current,
        playing: runs, aspect, scroll, quality: strands });
      if (item.camera.aspect !== aspect) { item.camera.aspect = aspect; item.camera.updateProjectionMatrix(); }
      renderer.setViewport(x, height - y - sh, sw, sh);
      renderer.setScissor(bx, height - ey, ex - bx, ey - by);
      renderer.render(item.scene, item.camera);
      drawn++;
      if (!item.ready) { item.ready = true; view.el.dataset.state = 'live'; }
    }
    if (drew !== Boolean(drawn)) canvas.style.visibility = drawn ? 'visible' : 'hidden';
    drew = !!drawn;
    warm(runs && !pending ? near : null);
    if ((runs && drew) || pending) wake();
  }

  return {
    invalidate: wake,
    dispose() {
      stopped = true;
      cancelAnimationFrame(frame);
      cancelWarm();
      clearTimeout(deadline);
      lightRequest.abort();
      resize?.disconnect();
      dialogs.disconnect();
      unlistenTexture();
      window.removeEventListener('scroll', wake, true);
      window.removeEventListener('resize', wake);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', handleLost);
      canvas.removeEventListener('webglcontextrestored', handleRestore);
      for (const { scene } of active.values()) disposeScene(scene);
      active.clear();
      lighting?.dispose();
      renderer.dispose();
    },
  };
}
