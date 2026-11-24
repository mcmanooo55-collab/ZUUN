import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter, MemoryRouter, useLocation } from 'react-router-dom';
import { copy, pages } from './content';
import { readRoute } from './routes';
import { standalone } from './runtime';
import { Studio, Action, Eyebrow, Footer, useStudio } from './ui';
import { Home } from './home';
import { Work } from './work';
import { Team, Founder } from './people';
import { Contact } from './form';
import './fonts.css';
import './styles.css';
import './spatial.css';
import './editorial.css';
import { Masthead } from './editorial';
import { World } from './world/world';

const screens = { home: Home, work: Work, team: Team, founder: Founder, contact: Contact, missing: Missing };
function Missing() {
  const { lang, text } = useStudio();
  return <section className="container page-intro missing"><Eyebrow><bdi>404</bdi></Eyebrow><h1 className="headline">{text.missing.title}</h1><p className="support-text">{text.missing.text}</p><div className="page-actions"><Action page="home">{pages[0].name[lang]}</Action><Action page="work" tone="outline">{text.gallery}</Action></div></section>;
}

function App() {
  const { pathname } = useLocation();
  const { lang, page: route } = readRoute(pathname);
  const page = route?.id || 'missing';
  const text = copy[lang];
  const ctx = useMemo(() => ({ lang, page, text }), [lang, page, text]);
  const Screen = screens[page];
  const main = useRef(null);
  const previousPage = useRef(page);
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const name = page === 'home' ? text.hero.label : pages.find(p => p.id === page)?.name[lang] || text.missing.title;
    document.title = `ZUUN — ${name}`;
    const description = { home: text.hero.description, work: text.work.text, team: text.team.text, founder: text.founder.text, contact: text.contact.text, missing: text.missing.text }[page];
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [lang, page, text]);
  useLayoutEffect(() => {
    if (previousPage.current !== page) main.current?.focus({ preventScroll: true });
    previousPage.current = page;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);
  return <Studio.Provider value={ctx}><World page={page} lang={lang}>
    <Masthead />
    <main id="main-content" className={`page-layout page-layout--${page}`} ref={main} tabIndex={-1}><div key={page} className="route-plane"><Screen /></div></main>
    <Footer />
  </World></Studio.Provider>;
}

// Hash navigation works from a downloaded file or a static site subdirectory.
// In the sandboxed file viewer the document has an opaque origin; stay in memory.
const Router = standalone
  ? (window.origin === 'null' && location.protocol !== 'file:' ? MemoryRouter : HashRouter)
  : BrowserRouter;
createRoot(document.getElementById('root')).render(<Router><App /></Router>);
