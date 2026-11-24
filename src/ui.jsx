import { createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUp, ArrowUpRight, Braces, Focus, Globe2, Shapes, PencilRuler, ScanSearch, Smartphone, Timer, Waypoints, Clapperboard,
} from 'lucide-react';
import { pages, services } from './content';
import { SceneView, useWorld } from './world/world';

export const Studio = createContext(null);
export const useStudio = () => useContext(Studio);
const iconMap = { code: Braces, design: PencilRuler, automation: Waypoints, mobile: Smartphone, identity: Shapes, speed: Timer, precision: Focus, market: ScanSearch, media: Clapperboard };
export function ServiceIcon({ type, size = 21, ...props }) {
  const Icon = iconMap[type] || Focus;
  return <Icon size={size} strokeWidth={1.65} aria-hidden="true" {...props} />;
}

export function pathFor(lang, id, search = '') {
  const slug = pages.find((page) => page.id === id)?.path ?? '';
  return ([lang === 'en' ? '/en' : '', slug ? `/${slug}` : ''].join('') || '/') + search;
}

export function PageLink({ page, query = '', ...props }) {
  const { lang } = useStudio();
  return <Link to={pathFor(lang, page, query)} {...props} />;
}

export function Arrow({ size = 17, ...props }) {
  return <ArrowUpRight size={size} strokeWidth={1.9} aria-hidden="true" className="directional" {...props} />;
}

export function Action({ page, query, tone = 'primary', children, className = '', ...props }) {
  return <PageLink page={page} query={query} className={`action action--${tone} ${className}`} {...props}>{children}<Arrow /></PageLink>;
}

export function Eyebrow({ children, index, className = '' }) {
  return <p className={`eyebrow ${className}`}>
    {index ? <span className="eyebrow-index mono" dir="ltr">{index} /</span> : <span className="eyebrow-mark" aria-hidden="true" />}
    <span>{children}</span>
  </p>;
}

export function Headline({ lines, id, className = '' }) {
  return <h1 id={id} className={`headline ${className}`}><span>{lines[0]}</span><span className="headline-accent">{lines[1]}</span></h1>;
}

function LanguageLink({ className = '' }) {
  const { lang, text, page } = useStudio();
  const { search } = useLocation();
  const target = lang === 'ar' ? 'en' : 'ar';
  const label = target === 'en' ? 'EN' : 'عربي';
  return <Link to={pathFor(target, page, search)} className={`language ${className}`} aria-label={`${label} — ${text.language}`} hrefLang={target} lang={target} preventScrollReset>
    <Globe2 size={16} strokeWidth={1.65} aria-hidden="true"/><span>{label}</span>
  </Link>;
}

function Logo() {
  return <PageLink page="home" className="brand" aria-label="ZUUN"><img src="/media/zuun.png" alt="ZUUN" width="524" height="249" /></PageLink>;
}

export function Footer() {
  const { lang, text } = useStudio();
  const { playing } = useWorld();
  function toTop() { window.scrollTo({ top: 0, behavior: playing ? 'smooth' : 'instant' }); }
  return <footer className="site-footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand"><Logo /><p>{text.footer.intro}</p></div>
        <div className="footer-group"><h2>{text.footer.studio}</h2><div>{pages.filter(p => p.id !== 'home').map(p => <PageLink key={p.id} page={p.id}>{p.name[lang]}</PageLink>)}</div></div>
        <div className="footer-group"><h2>{text.footer.disciplines}</h2><div>{services.map(s => <PageLink key={s.id} page="work" query={`?field=${s.id}`}>{s.short[lang]}</PageLink>)}</div></div>
        <div className="footer-controls"><LanguageLink /><button type="button" className="icon-button" onClick={toTop} aria-label={text.footer.top}><ArrowUp size={17} aria-hidden="true" /></button></div>
      </div>
      <div className="footer-bottom"><small><bdi>© {new Date().getFullYear()}</bdi> {text.footer.rights}</small><span className="mono" aria-hidden="true" dir="ltr"><i /> DESIGN · CODE · AUTOMATION</span></div>
    </div>
  </footer>;
}

export function ProfileArt({ person, big = false, years }) {
  const { text } = useStudio();
  return <div className={`profile-art profile-art--${person.id}${big ? ' profile-art--big' : ''}`} style={{ '--profile-color': person.accent }} dir="ltr">
    <div className="profile-grid" aria-hidden="true"/>
    <div className="profile-rings" aria-hidden="true"><i/><i/><i/></div>
    <div className="profile-cross profile-cross--a" aria-hidden="true"/><div className="profile-cross profile-cross--b" aria-hidden="true"/>
    <span className="profile-index mono" aria-hidden="true">ZUUN / ID.{person.no}</span>
    <SceneView kind="profile" className="profile-viewport" interactive={big} label={text.scene.founder} instruction={text.scene.help}
      options={{ color: person.accent, initials: person.initials, icon: person.icon, number: person.no, big }}
      fallback={<div className="profile-plate"><span>{person.initials}</span><ServiceIcon type={person.icon} size={big ? 22 : 17}/></div>}/>
    <span className="profile-status mono" aria-hidden="true"><i/> {big ? 'FOUNDER PROFILE' : 'STUDIO TEAM / 3D'}</span>
    {big && <div className="experience" dir="auto"><strong><bdi>10+</bdi></strong><span>{years}</span></div>}
  </div>;
}
