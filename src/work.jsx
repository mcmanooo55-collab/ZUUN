import { publicAsset } from './runtime';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Orbit, X } from 'lucide-react';
import { projects, services } from './content';
import { Action, Arrow, Eyebrow, Headline, ServiceIcon, useStudio } from './ui';
import { SceneView, useWorld } from './world/world';
import { Chapter, NextChapter } from './editorial';

export function ProjectCard({ project, onOpen, current }) {
  const { lang, text } = useStudio();
  const service = services.find(item => item.id === project.service);
  const name = lang === 'ar' ? project.nameAr || project.name : project.name;
  const [orbitTouch, setOrbitTouch] = useState(false);
  return <article className="project-card project-card--spatial folio-card" aria-current={current ? 'true' : undefined} style={{ '--project-color': project.color }}>
    <div className={`project-art project-art--${project.id}`}>
      <div className="display-grid" aria-hidden="true"/>
      <SceneView kind={project.id} interactive className="project-viewport" touchDrag={orbitTouch} label={`${text.scene.project}: ${name}`} instruction={text.scene.help} fallback={<img src={publicAsset(project.cover || project.image)} width={project.cover ? 960 : 1200} height={project.cover ? 960 : 746} loading="lazy" alt="" />}/>
      <span className="project-sample"><i />{text.sample}</span>
      <span className="project-index mono"><bdi>P/{project.no}</bdi></span>
      <span className="project-orbit" aria-hidden="true"><Orbit size={14} strokeWidth={1.65}/>{text.editorial.stageNote}</span>
      <button type="button" className="touch-orbit" aria-pressed={orbitTouch} onClick={()=>setOrbitTouch(value=>!value)}><Orbit size={15} strokeWidth={1.7} aria-hidden="true"/>{text.editorial.touchOrbit}</button>
    </div>
    <div className="project-copy">
      <div><p className="project-discipline"><ServiceIcon type={service.icon} size={15} />{service.short[lang]}</p><h3><button type="button" className="project-hit" aria-haspopup="dialog" onClick={onOpen}><bdi lang={project.nameAr ? lang : 'en'}>{name}</bdi></button></h3><p className="project-summary">{project.summary[lang]}</p></div>
      <span className="icon-button"><Arrow size={20}/></span>
    </div>
  </article>;
}

export function ProjectDialog({ project, onClose }) {
  const { lang, text } = useStudio();
  const dialog = useRef(null);
  const navigating = useRef(false);
  const service = services.find(item => item.id === project.service);
  const name = lang === 'ar' ? project.nameAr || project.name : project.name;
  useLayoutEffect(() => {
    const previous = document.activeElement;
    const el = dialog.current;
    const priorStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el.showModal();
    return () => {
      el.close();
      document.body.style.overflow = priorStyle;
      if (!navigating.current && previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  const isIdentity = project.service === 'identity';
  const label = <Eyebrow index={project.no}>{text.sample} · {service.short[lang]}</Eyebrow>;
  const close = <button type="button" className={`icon-button${isIdentity ? '' : ' dialog-close'}`} onClick={onClose} autoFocus aria-label={text.close}><X size={22} strokeWidth={1.7} aria-hidden="true"/></button>;
  return <dialog className={`project-dialog${isIdentity ? ' project-dialog--identity' : ''}`} ref={dialog} aria-labelledby="project-detail-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    {isIdentity && <div className="dialog-toolbar">{label}{close}</div>}
    <div className="dialog-media"><img src={publicAsset(project.image)} alt={project.alt[lang]} width="1200" height="746"/>{!isIdentity && close}</div>
    <div className="dialog-content">
      {!isIdentity && label}
      <h2 id="project-detail-title"><bdi lang={project.nameAr ? lang : 'en'}>{name}</bdi></h2>
      <h3>{text.work.brief}</h3><p>{project.brief[lang]}</p>
      <h3>{text.work.scope}</h3><ul>{project.scope[lang].map(item => <li key={item}><Check size={17} aria-hidden="true" />{item}</li>)}</ul>
      {project.palette && <>
        <h3>{text.work.palette}</h3>
        <ul className="identity-swatches">{project.palette.map(color=><li key={color.hex}>
          <i style={{background:color.hex}} aria-hidden="true"/>
          <span>{color.name[lang]}<code dir="ltr">{color.hex}</code></span>
        </li>)}</ul>
      </>}
      {project.typefaces && <div className="identity-type">
        <h3>{text.work.typefaces}</h3>
        <ul>{project.typefaces.map(font=><li key={font}><bdi lang="en" dir="ltr">{font}</bdi></li>)}</ul>
      </div>}
      <Action page="contact" query={`?service=${service.id}`} onClick={() => { navigating.current = true; }}>{isIdentity ? text.work.identityAsk : text.work.ask}</Action>
    </div>
  </dialog>;
}

export function CaseCarousel({ projects: items, onOpen }) {
  const { lang, text } = useStudio();
  const { playing } = useWorld();
  const [index, setIndex] = useState(0);
  const [scrollable,setScrollable] = useState(items.length > 1);
  const track = useRef(null);
  const manualSnap = useRef(0);
  const id = useId();
  const groupKey = items.map(item => item.id).join('/');
  useLayoutEffect(()=>{
    manualSnap.current = 0;
    if (track.current) track.current.scrollTo({ left: 0, behavior: 'instant' });
    setIndex(0);
  },[groupKey,lang]);
  useLayoutEffect(()=>{
    const row=track.current;
    if (!row) return;
    const check=()=>setScrollable(row.scrollWidth > row.clientWidth + 2);
    check();
    if(typeof ResizeObserver !== 'function') {
      window.addEventListener('resize',check);return ()=>window.removeEventListener('resize',check);
    }
    const resize=new ResizeObserver(check);
    resize.observe(row);
    for(const card of row.children) resize.observe(card);
    return ()=>resize.disconnect();
  },[groupKey,lang]);
  function stops() {
    const row = track.current;
    if (!row) return [];
    const max = Math.max(0, row.scrollWidth - row.clientWidth);
    const sign = lang === 'ar' ? -1 : 1;
    const native = getComputedStyle(row).scrollSnapType !== 'none';
    const last = items.length - 1;
    return Array.from(row.children, (card, i) => {
      if (i === 0) return 0;
      if (i === last) return sign * max;
      return native ? sign * Math.min(max, Math.abs(card.offsetLeft - row.children[0].offsetLeft)) : sign * max * i / last;
    });
  }
  function snap(target) {
    if (target < 0 || target >= items.length) return;
    const row = track.current;
    if (!row) return;
    manualSnap.current = playing ? window.performance.now() + 700 : 0;
    row.scrollTo({ left: stops()[target], behavior: playing ? 'smooth' : 'instant' });
    setIndex(target);
  }
  function progress() {
    const row = track.current;
    if (!row || performance.now() < manualSnap.current) return;
    const points = stops();
    if (points.length < 2 || points[0] === points[points.length - 1]) return;
    setIndex(points.reduce((closest, x, i) => Math.abs(x-row.scrollLeft) < Math.abs(points[closest]-row.scrollLeft) ? i : closest,0));
  }
  const release = () => { manualSnap.current = 0; };
  const Back = lang === 'ar' ? ArrowRight : ArrowLeft;
  const Forward = lang === 'ar' ? ArrowLeft : ArrowRight;
  return <div className="case-carousel" role="region" aria-label={text.editorial.projectLabel}>
    <div className="chapter-pad carousel-toolbar">
      <div className="carousel-selector">
        <p className="carousel-count mono" dir="ltr" aria-live="polite"><span className="visually-hidden">{text.work.count}: </span>{scrollable && <><strong>{String(index + 1).padStart(2,'0')}</strong><span>/</span></>}<span className={scrollable ? undefined : 'carousel-total'}>{String(items.length).padStart(2,'0')}</span></p>
        {scrollable && <div className="carousel-buttons"><button type="button" className="circle-icon" aria-label={text.editorial.previous} aria-controls={id} onClick={()=>snap(index-1)} disabled={index===0}><Back size={19} strokeWidth={1.6} aria-hidden="true"/></button><button type="button" className="circle-icon" aria-label={text.editorial.next} aria-controls={id} onClick={()=>snap(index+1)} disabled={index>=items.length-1}><Forward size={19} strokeWidth={1.6} aria-hidden="true"/></button></div>}
      </div>
      <span className="carousel-note mono" dir="ltr" aria-hidden="true"><span/> ZUUN / CONCEPT INDEX</span>
      {scrollable && <span className="carousel-swipe" aria-hidden="true">{text.editorial.carouselSwipe}</span>}
    </div>
    <div data-scene-clip className={`case-track${items.length < 2 ? ' case-track--single' : items.length === 2 ? ' case-track--pair' : ''}`} id={id} ref={track} onPointerDown={release} onWheel={release} onScroll={progress}>
      {items.map((project,i)=><ProjectCard key={project.id} project={project} current={scrollable && index===i} onOpen={()=>onOpen(project)}/>)}
    </div>
  </div>;
}

export function Work() {
  const { lang, text } = useStudio();
  const [params, setParams] = useSearchParams();
  const [active, setActive] = useState(null);
  const field = services.some(s => s.id === params.get('field')) ? params.get('field') : 'all';
  const visible = field === 'all' ? projects : projects.filter(project => project.service === field);
  const cardRange = visible.length > 1 ? `${visible[0].no}—${visible.at(-1).no}` : (visible[0]?.no || '00');
  const filters = [{ id: 'all', short: { [lang]: text.allWork } }, ...services];
  function select(id) {
    const next = new URLSearchParams(params);
    if (id === 'all') next.delete('field'); else next.set('field', id);
    setParams(next, { replace: true, preventScrollReset: true });
  }
  return <>
    <Chapter index="02" label={text.work.label} className="inner-lead work-lead" labelledBy="work-title">
      <div className="chapter-pad inner-heading">
        <div><p className="editorial-tag"><span/> {text.work.label}</p><Headline lines={text.work.title} id="work-title"/></div>
        <p className="editorial-copy">{text.work.text}</p>
      </div>
    </Chapter>
    <Chapter index={cardRange} label={text.editorial.projectLabel} className="paper-zone work-chapter full-portfolio" labelledBy="case-filter-title">
      <div className="chapter-pad portfolio-controls"><h2 id="case-filter-title" className="visually-hidden">{text.work.filter}</h2><div className="filters" role="group" aria-label={text.work.filter}>
        {filters.map(s=><button className="filter" type="button" key={s.id} aria-pressed={field === s.id} onClick={()=>select(s.id)}>{s.icon && <ServiceIcon type={s.icon} size={17}/>}<span>{s.short[lang]}</span></button>)}
      </div></div>
      <CaseCarousel projects={visible} onOpen={setActive}/>
    </Chapter>
    <NextChapter/>
    {active && <ProjectDialog project={active} onClose={()=>setActive(null)}/>}
  </>;
}
