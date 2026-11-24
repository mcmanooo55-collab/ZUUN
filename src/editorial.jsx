import { publicAsset } from './runtime';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Play, X } from 'lucide-react';
import { pages } from './content';
import { PageLink, pathFor, useStudio } from './ui';
import { SceneView, useWorld } from './world/world';

const formatted = n => String(n).padStart(2, '0');

function MotionChoices({ className = '' }) {
  const { text } = useStudio();
  const { playing, setMotion } = useWorld();
  const e = text.editorial;
  return <div className={`motion-choices ${className}`} role="group" aria-label={e.motion}>
    <span className="mast-control-label">{e.motion}</span>
    <button type="button" aria-label={text.scene.play} aria-pressed={playing} onClick={()=>setMotion(true)}>{e.auto}</button>
    <span aria-hidden="true" className="utility-slash">/</span>
    <button type="button" aria-label={text.scene.pause} aria-pressed={!playing} onClick={()=>setMotion(false)}>{e.pause}</button>
  </div>;
}

function LanguageChoice() {
  const { lang, page, text } = useStudio();
  const { search } = useLocation();
  const other = lang === 'ar' ? 'en' : 'ar';
  const label = lang === 'ar' ? 'EN' : 'عربي';
  return <div className="mast-language"><span className="mast-control-label">{text.editorial.language}</span><Link className="mast-lang-link" to={pathFor(other, page, search)} lang={other} hrefLang={other} aria-label={`${label} — ${text.language}`} preventScrollReset>{label}<ArrowUpRight size={12} aria-hidden="true"/></Link></div>;
}

function MenuPanel({ onClose }) {
  const { lang, page, text } = useStudio();
  const dialog = useRef(null);
  useLayoutEffect(() => {
    const el = dialog.current;
    const last = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el.showModal();
    return () => {
      el.close();
      document.body.style.overflow = overflow;
      if (last?.isConnected) last.focus({ preventScroll: true });
    };
  }, []);
  return <dialog className="mast-drawer" id="zuun-menu" ref={dialog} aria-labelledby="menu-title" onCancel={event => { event.preventDefault(); onClose(); }}><div className="drawer-shell">
    <div className="drawer-head"><Logo onClick={onClose} /><p id="menu-title" className="mono">{text.menu}</p><button type="button" className="circle-icon drawer-close" autoFocus onClick={onClose} aria-label={text.close}><X size={24} strokeWidth={1.5} aria-hidden="true"/></button></div>
    <nav aria-label={text.nav} className="drawer-nav">{pages.map((item,i)=><PageLink key={item.id} page={item.id} aria-current={page === item.id ? 'page' : undefined} onClick={onClose}><span className="mono index-type" dir="ltr">{formatted(i+1)}</span><span>{item.name[lang]}</span><ArrowUpRight className="directional" aria-hidden="true" size={27} strokeWidth={1.55}/></PageLink>)}</nav>
    <div className="drawer-utility"><MotionChoices/><LanguageChoice/></div>
  </div></dialog>;
}

function Logo(props = {}) {
  return <PageLink page="home" className="mast-brand" aria-label="ZUUN" {...props}><img src={publicAsset('/media/zuun.png')} alt="ZUUN" width="524" height="249"/></PageLink>;
}

export function Masthead() {
  const { page, lang, text } = useStudio();
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  useLayoutEffect(() => {
    let raf = 0;
    const paper = Array.from(document.querySelectorAll('.paper-zone'));
    let compactHeight = 65;
    const readHeight = () => { if (header.current) compactHeight = parseFloat(getComputedStyle(header.current).getPropertyValue('--mast-compact')) || 65; };
    function place() {
      raf = 0;
      const mast = header.current;
      if (!mast) return;
      const compact = window.scrollY >= 78;
      const surface = compact && paper.some(section => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= compactHeight && bounds.bottom > compactHeight;
      }) ? 'paper' : 'night';
      if (mast.dataset.compact !== String(compact)) mast.dataset.compact = String(compact);
      if (mast.dataset.surface !== surface) mast.dataset.surface = surface;
    }
    const scroll = () => { if (!raf) raf = requestAnimationFrame(place); };
    const resize = () => { readHeight(); scroll(); };
    readHeight(); place(); window.addEventListener('scroll',scroll,{passive:true});
    window.addEventListener('resize',resize,{passive:true});
    return () => { window.removeEventListener('scroll',scroll); window.removeEventListener('resize',resize); cancelAnimationFrame(raf); };
  }, [page]);
  return <>
    <a className="skip" href="#main-content">{text.skip}</a>
    <header className="masthead" ref={header} data-compact="false">
      <div className="mast-grid">
        <Logo />
        <nav className="mast-nav" aria-label={text.nav}>
          {pages.map((item,i)=><PageLink key={item.id} page={item.id} aria-current={page === item.id ? 'page' : undefined}><small className="mono" dir="ltr">{formatted(i+1)}</small>{item.name[lang]}</PageLink>)}
        </nav>
        <div className="mast-tools"><MotionChoices/><LanguageChoice/><button type="button" className="mast-menu" aria-label={text.menu} aria-expanded={open} aria-controls={open ? 'zuun-menu' : undefined} onClick={() => setOpen(true)}><span/><span/></button></div>
      </div>
    </header>
    {open && <MenuPanel onClose={() => setOpen(false)}/>}
  </>;
}

export function Chapter({ index, label, children, id, className = '', labelledBy }) {
  return <section className={`chapter ${className}`} id={id} aria-labelledby={labelledBy}>
    <div className="chapter-rail" aria-hidden="true"><span className="chapter-stamp"><span>(</span><bdi className="mono">{index}</bdi><span>{label}</span><span>)</span></span></div>
    <div className="chapter-main">{children}</div>
  </section>;
}

export function RoundLink({ page, query, href, children, scrollTo, className = '' }) {
  const { playing } = useWorld();
  const Icon = href ? ArrowDown : ArrowUpRight;
  const contents = <><span className="round-label">{children}</span><span className="round-icon"><Icon size={25} className={href ? undefined : 'directional'} strokeWidth={1.65} aria-hidden="true" /></span></>;
  const classes = `round-link ${className}`;
  const scroll = scrollTo ? event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const next = document.getElementById(scrollTo);
    if (!next) return;
    event.preventDefault();
    // Focus moves immediately; the page uses native scrolling instead of trapping the wheel.
    const heading = next.querySelector('h2');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    next.scrollIntoView({ behavior: playing ? 'smooth' : 'instant' });
  } : undefined;
  return href ? <a className={classes} href={href} onClick={scroll} aria-label={typeof children === 'string' ? children : undefined}>{contents}</a> : <PageLink page={page} query={query} className={classes}>{contents}</PageLink>;
}

export function NextChapter() {
  const { text } = useStudio();
  return <Chapter index="05" label={text.cta.label} className="contact-chapter" labelledBy="next-title"><div className="chapter-pad next-layout" data-depth><div><p className="editorial-tag"><span/> {text.cta.label}</p><h2 id="next-title">{text.editorial.ending}</h2><p className="editorial-copy">{text.cta.text}</p></div><RoundLink page="contact">{text.cta.button}</RoundLink></div></Chapter>;
}

// A few vector strands echo the live particle scene without requiring WebGL.
const posterThreads = Array.from({ length: 23 }, (_, i) => {
  const x=20+i*36, ripple=Math.sin(i*.71), endX=317+((i*53)%192), endY=63+((i*29)%158);
  return {
    d: `M ${x} ${166+ripple*68} C ${x+52+ripple*36} ${94+ripple*124}, ${endX+37-ripple*121} ${276-ripple*101}, ${endX} ${endY}`,
    opacity: .33+(i%7)*.094,
  };
});
function WordPoster() {
  return <div className="word-poster-wrap" aria-hidden="true">
    <span className="word-poster">ZUUN<span>.</span></span>
    <svg className="poster-threads" viewBox="0 0 840 320" fill="none" aria-hidden="true">
      {posterThreads.map(({ d, opacity }, i)=><path key={d} d={d} opacity={opacity} stroke="currentColor" strokeWidth={i%5===0?1.8:1} pathLength={1} style={{ '--strand-delay':i*.009 }}/>) }
    </svg>
    <img className="poster-bird" src={publicAsset('/media/bird.png')} alt="" width="416" height="367"/>
  </div>;
}

const revealDuration = 2290;
export function WordmarkHero() {
  const timeline = useRef(null);
  const reveal = useRef(null);
  const settled = useRef(0);
  const refresh = useRef(null);
  const { text } = useStudio();
  const { playing, setMotion, invalidate } = useWorld();
  const e = text.editorial;
  function playReveal() {
    reveal.current = { progress: 0, elapsed: 0, stamp: null, anchor: window.scrollY };
    if (!playing) setMotion(true);
    refresh.current?.();
    invalidate();
  }
  useLayoutEffect(() => {
    const node = timeline.current;
    if (!node) return;
    const pin = node.firstElementChild;
    let raf = 0, range = 0, start = 0, last = -1;
    const request = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(place); };
    const place = now => {
      raf = 0;
      const demo = reveal.current;
      let p = settled.current;
      if (playing && demo) {
        const dt = demo.stamp === null ? 0 : Math.min(64, Math.max(0, now-demo.stamp));
        demo.elapsed = Math.min(revealDuration, demo.elapsed + dt);
        demo.stamp = now;
        demo.progress = demo.elapsed / revealDuration;
        p = demo.progress;
        if (p < 1) request();
      } else if (playing && range > 2) {
        p = Math.min(1, Math.max(0, (window.scrollY - start) / range));
      } else if (demo) {
        demo.stamp = null;
      }
      settled.current = p;
      if (p !== last) {
        last = p;
        node.style.setProperty('--reveal-progress', p.toFixed(4));
      }
    };
    const scroll = () => {
      if (playing && range > 2 && reveal.current && Math.abs(window.scrollY - reveal.current.anchor) > 8) reveal.current = null;
      request();
    };
    const measure = () => {
      range = node.offsetHeight - pin.offsetHeight;
      start = node.getBoundingClientRect().top + window.scrollY;
      request();
    };
    const visibility = () => {
      if (reveal.current) reveal.current.stamp = null;
      if (!document.hidden) request();
    };
    refresh.current = request;
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    resize?.observe(node); resize?.observe(pin);
    measure();
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',measure,{passive:true});
    document.addEventListener('visibilitychange',visibility);
    return () => {
      refresh.current = null;
      cancelAnimationFrame(raf); resize?.disconnect();
      if (reveal.current) reveal.current.stamp = null;
      window.removeEventListener('scroll',scroll); window.removeEventListener('resize',measure);
      document.removeEventListener('visibilitychange',visibility);
    };
  }, [playing]);
  return <section ref={timeline} className="wordmark-timeline" data-loop aria-labelledby="hero-title">
    <div className="wordmark-pin">
      <div className="word-rail" aria-hidden="true"><span className="chapter-stamp"><span>(</span><bdi className="mono">00</bdi><span>{e.heroRail}</span><span>)</span></span><span className="rail-mark"/></div>
      <div className="word-content">
        <div className="hero-register"><p><span className="register-dot" aria-hidden="true"/>{text.hero.label}</p><span className="mono word-catalog" dir="ltr">ZUUN STUDIO &nbsp; / &nbsp; DESIGN IN MOTION</span></div>
        <div className="word-stage">
          <div className="word-cross word-cross--top" aria-hidden="true"/><div className="word-cross word-cross--bottom" aria-hidden="true"/>
          <SceneView kind="wordmark" className="word-view" interactive label={e.heroArt} instruction={text.scene.help} options={{ timeline, reveal }} fallback={<WordPoster />}/>
          <div className="word-utilities">
            <span className="word-indicator" data-playing={playing} aria-hidden="true"><i/><span>{playing ? e.revealScroll : e.revealPaused}</span></span>
            <button className="word-reveal" type="button" onClick={playReveal}><Play size={15} strokeWidth={1.8} aria-hidden="true"/>{e.playReveal}</button>
          </div>
        </div>
        <div className="hero-caption"><div className="hero-caption-content"><h1 id="hero-title">{e.heroTitle}</h1><p>{e.heroDescription}</p></div><RoundLink href="#about" scrollTo="about" className="round-link--hero">{e.startScroll}</RoundLink></div>
      </div>
    </div>
  </section>;
}

const fibers = Array.from({ length: 37 }, (_, i) => {
  const x = i * 38 - 65, shift = Math.sin(i*.86) * 77;
  return { d: `M ${x} -85 C ${x+125+shift} 22 ${x-84+shift} 78 ${x+173+shift} 182`, opacity: (.23+(i%7)*.075).toFixed(2) };
});
export function FlowSeam() {
  return <div className="flow-seam" data-loop aria-hidden="true"><svg viewBox="0 0 1440 165" preserveAspectRatio="none"><g fill="none" stroke="currentColor" strokeWidth="1">{fibers.map(({d,opacity},i)=><path key={i} d={d} opacity={opacity} style={{ '--thread-offset': `${-(i*19)%243}` }}/>)}</g></svg></div>;
}
