import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { people, projects, services, strengths } from './content';
import { PageLink, ServiceIcon, useStudio } from './ui';
import { Chapter, FlowSeam, NextChapter, RoundLink, WordmarkHero } from './editorial';
import { CaseCarousel, ProjectDialog } from './work';

export function Home() {
  const { lang, text } = useStudio();
  const [project, setProject] = useState(null);
  const e = text.editorial;
  const counts = [projects.length, people.length, null, null];
  return <>
    <WordmarkHero />
    <Chapter index="01" label={text.about.label} id="about" className="about-chapter" labelledBy="about-title">
      <div className="chapter-pad about-statement" data-depth>
        <p className="editorial-tag"><span/> {text.about.label}</p>
        <h2 className="statement-title" id="about-title">{e.statement.map((line,i)=><span key={line} className={`statement-line statement-line--${i+1}`}><span>{line}</span></span>)}</h2>
        <p className="editorial-copy">{text.about.intro}</p>
      </div>
      <div className="chapter-pad discipline-list" data-depth>
        <h3>{e.disciplines}</h3>
        <div className="discipline-grid">{services.map(service=><PageLink key={service.id} page="work" query={`?field=${service.id}`} className="discipline-row">
          <span className="mono index-type" dir="ltr">/{service.no}</span>
          <ServiceIcon type={service.icon} size={24}/><span><strong>{service.title[lang]}</strong><small>{service.text[lang]}</small></span>
          <ArrowUpRight className="directional" size={23} strokeWidth={1.5} aria-hidden="true"/>
        </PageLink>)}</div>
      </div>
    </Chapter>
    <FlowSeam />
    <Chapter index="02" label={e.projectLabel} className="work-chapter paper-zone" labelledBy="showcase-title">
      <div className="chapter-pad work-chapter-head" data-depth><p className="editorial-tag"><span/> {e.projectLabel}</p><h2 id="showcase-title">{e.projectTitle}</h2><p className="editorial-copy">{e.projectIntro}</p></div>
      <CaseCarousel projects={projects} onOpen={setProject}/>
      <div className="chapter-pad chapter-tail"><RoundLink page="work">{text.browse}</RoundLink></div>
    </Chapter>
    <Chapter index="03" label={e.index} className="index-chapter" labelledBy="numbers-title">
      <div className="chapter-pad index-head" data-depth><p className="editorial-tag"><span/> {e.index}</p><h2 id="numbers-title">{text.numbers.title}</h2><p className="editorial-copy">{text.numbers.text}</p></div>
      <dl className="chapter-pad index-metrics" data-depth>{counts.map((value,i)=><div key={i} className="index-metric">
        <dt>{text.numbers.units[i]}</dt><dd className="index-value"><bdi>{value === null ? '—' : String(value).padStart(2,'0')}</bdi></dd><dd className="index-note">{text.numbers.notes[i]}</dd>
      </div>)}</dl>
    </Chapter>
    <Chapter index="04" label={e.process} className="process-chapter" labelledBy="why-title">
      <div className="chapter-pad process-layout" data-depth>
        <div><p className="editorial-tag"><span/> {e.process}</p><h2 id="why-title">{text.why.title}</h2><p className="editorial-copy">{text.why.text}</p></div>
        <div className="process-rows">{strengths.map((item,i)=><article key={item.icon} className="process-row"><span className="mono index-type" dir="ltr">0{i+1}</span><ServiceIcon type={item.icon} size={25}/><div><h3>{item.title[lang]}</h3><p>{item.text[lang]}</p></div></article>)}</div>
      </div>
    </Chapter>
    <div className="discipline-ticker" data-loop aria-hidden="true" dir="ltr"><div>{[0,1].map(n=><span key={n}>DESIGN <i /> CODE <i /> AUTOMATE <i /> BUILD <i /></span>)}</div></div>
    <NextChapter/>
    {project && <ProjectDialog project={project} onClose={()=>setProject(null)}/>}
  </>;
}
