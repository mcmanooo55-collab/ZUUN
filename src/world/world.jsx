import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

const WorldContext = createContext(null);
export const useWorld = () => useContext(WorldContext);

function reducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
function readPlayback() {
  if (reducedMotion()) return false;
  try { return localStorage.getItem('zuun-motion') !== 'paused'; } catch { return true; }
}

export function World({ page, lang, children }) {
  const [playing, setPlaying] = useState(readPlayback);
  const canvas = useRef(null);
  const driver = useRef(null);
  const invalidate = useCallback(() => driver.current?.invalidate(), []);
  const registry = useRef(new Map());
  const playback = useRef({ playing });
  const register = useCallback((id, entry) => {
    registry.current.set(id, entry);
    invalidate();
    return () => {
      if (registry.current.get(id) === entry) registry.current.delete(id);
      invalidate();
    };
  }, [invalidate]);
  const setMotion = useCallback(value => {
    try { localStorage.setItem('zuun-motion', value ? 'playing' : 'paused'); } catch { /* optional preference */ }
    setPlaying(value);
  }, []);
  useLayoutEffect(() => {
    playback.current.playing = playing;
    document.documentElement.dataset.motion = playing ? 'playing' : 'paused';
    invalidate();
  }, [playing, page, lang, invalidate]);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setPlaying(readPlayback());
    if (query.addEventListener) {
      query.addEventListener('change', change);
      return () => query.removeEventListener('change', change);
    }
    query.addListener?.(change);
    return () => query.removeListener?.(change);
  }, []);
  useEffect(() => {
    let canceled = false;
    import('./engine').then(({ makeWorld }) => {
      if (!canceled && canvas.current) driver.current = makeWorld(canvas.current, registry.current, playback);
    }).catch(() => { if (!canceled && canvas.current) canvas.current.hidden = true; });
    return () => { canceled = true; driver.current?.dispose(); driver.current = null; };
  }, []);
  useEffect(() => {
    if (!playing || !('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll('[data-depth]:not(.depth-entered)');
    const watcher = new IntersectionObserver((entries) => {
      for (const item of entries) if (item.isIntersecting) {
        item.target.classList.add('depth-entered');
        watcher.unobserve(item.target);
      }
    }, { threshold: .035 });
    for (const target of targets) watcher.observe(target);
    return () => watcher.disconnect();
  }, [page, playing]);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) target.dataset.loopPaused = String(!isIntersecting);
    }, { rootMargin: '70px 0px' });
    for (const target of document.querySelectorAll('[data-loop]')) observer.observe(target);
    return () => observer.disconnect();
  }, [page]);
  const value = useMemo(() => ({ register, playing, setMotion, invalidate }), [register, playing, setMotion, invalidate]);
  return <WorldContext.Provider value={value}>
    <canvas className="world-canvas" aria-hidden="true" ref={canvas} />
    {children}
  </WorldContext.Provider>;
}

const neutral = revision => ({ yaw: 0, pitch: 0, x: 0, y: 0, dragging: false, point: null, revision });
const limit = (value, min, max) => Math.min(max, Math.max(min, value));

export function SceneView({ kind, options = {}, interactive = false, touchDrag = true, label, instruction, className = '', fallback }) {
  const { register, playing, invalidate } = useWorld();
  const [dragging, setDragging] = useState(false);
  const el = useRef(null);
  const id = useId();
  const helpId = useId();
  const params = useRef(options);
  const input = useRef(neutral(0));
  params.current = options;

  useLayoutEffect(() => {
    if (!register || !el.current) return;
    delete el.current.dataset.state;
    return register(id, { el: el.current, clip: el.current.closest('[data-scene-clip]'), kind, options: params, input });
  }, [id, kind, register]);
  useLayoutEffect(() => { invalidate(); }, [options, invalidate]);
  function onDragVisual() {
    if (!el.current) return;
    el.current.style.setProperty('--drag-yaw', `${(input.current.yaw * 57.3).toFixed(2)}deg`);
    el.current.style.setProperty('--drag-pitch', `${(input.current.pitch * -57.3).toFixed(2)}deg`);
  }

  const down = event => {
    if (!interactive || (!touchDrag && event.pointerType === 'touch') || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const state = input.current;
    state.dragging = true;
    state.point = { x: event.clientX, y: event.clientY, p: event.pointerId };
    state.revision++;
    if (event.pointerType === 'mouse') event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    invalidate();
  };
  const move = event => {
    const state = input.current;
    if ((!touchDrag && event.pointerType === 'touch') || (!state.dragging && !playing)) return;
    const box = event.currentTarget.getBoundingClientRect();
    state.x = limit((event.clientX - box.left) / box.width * 2 - 1, -1, 1);
    state.y = limit((event.clientY - box.top) / box.height * 2 - 1, -1, 1);
    if (state.point?.p === event.pointerId) {
      state.yaw += (event.clientX - state.point.x) * .013;
      state.pitch = limit(state.pitch + (event.clientY - state.point.y) * .008, -.55, .55);
      state.point.x = event.clientX; state.point.y = event.clientY;
      onDragVisual();
    }
    state.revision++;
    invalidate();
  };
  const stop = event => {
    const state = input.current;
    if (state.point && state.point.p !== event.pointerId) return;
    state.dragging = false;
    state.point = null;
    state.revision++;
    setDragging(false);
    invalidate();
  };
  const leave = () => {
    input.current.x = 0; input.current.y = 0;
    if (playing) { input.current.revision++; invalidate(); }
  };
  const key = event => {
    const commands = { ArrowLeft: [-.19, 0], ArrowRight: [.19, 0], ArrowUp: [0, -.12], ArrowDown: [0, .12] };
    if (!Object.hasOwn(commands, event.key) && event.key !== 'Home') return;
    event.preventDefault();
    const state = input.current;
    if (event.key === 'Home') { state.yaw = 0; state.pitch = 0; }
    else { state.yaw += commands[event.key][0]; state.pitch = limit(state.pitch + commands[event.key][1], -.55, .55); }
    state.revision++;
    onDragVisual();
    invalidate();
  };
  return <div
    className={`scene-view ${interactive ? 'scene-view--interactive ' : ''}${className}`}
    data-scene={kind} data-dragging={dragging ? 'true' : undefined} data-touch-drag={interactive ? String(touchDrag) : undefined}
    ref={el} tabIndex={interactive ? 0 : undefined}
    role={interactive ? 'group' : undefined} aria-label={interactive ? label : undefined}
    aria-describedby={interactive ? helpId : undefined} aria-hidden={interactive ? undefined : true}
    onPointerDown={interactive ? down : undefined} onPointerMove={move} onPointerLeave={leave}
    onPointerUp={interactive ? stop : undefined} onPointerCancel={interactive ? stop : undefined} onLostPointerCapture={interactive ? stop : undefined}
    onKeyDown={interactive ? key : undefined}
  >
    {interactive && <span className="visually-hidden" id={helpId}>{instruction}</span>}
    <div className="scene-backup" aria-hidden="true">{fallback}</div>
  </div>;
}
