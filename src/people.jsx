import { ArrowUpRight } from 'lucide-react';
import { people, services } from './content';
import { Arrow, Headline, PageLink, ProfileArt, ServiceIcon, useStudio } from './ui';
import { Chapter, NextChapter, RoundLink } from './editorial';

export function Team() {
  const { lang, text } = useStudio();
  return <>
    <Chapter index="03" label={text.team.label} className="inner-lead team-lead" labelledBy="team-title">
      <div className="chapter-pad inner-heading">
        <div><p className="editorial-tag"><span/> {text.team.label}</p><Headline lines={text.team.title} id="team-title"/></div>
        <p className="editorial-copy">{text.team.text}</p>
      </div>
    </Chapter>
    <Chapter index="01—03" label={text.team.people} className="paper-zone people-chapter" labelledBy="people-title">
      <div className="chapter-pad people-room" data-depth>
        <div className="people-room-heading"><h2 id="people-title">{text.team.people}</h2><span className="mono" dir="ltr">ZUUN / PEOPLE &nbsp; 03</span></div>
        <div className="people-grid">{people.map(person=><article key={person.id} className="person-card" style={{ '--profile-color': person.accent }}>
          <ProfileArt person={person}/>
          <div className="person-copy"><p className="mono person-index" dir="ltr">ID / {person.no}</p><h3>{person.name[lang]}</h3><p className="team-role">{person.role[lang]}</p><p className="person-text">{person.text[lang]}</p>
            <ul className="tags" aria-label={text.footer.disciplines}>{person.tags[lang].map(tag=><li key={tag}><bdi>{tag}</bdi></li>)}</ul>
            {person.id==='omran' && <PageLink className="inline-link" page="founder">{text.team.founderLink}<Arrow size={16}/></PageLink>}
          </div>
        </article>)}</div>
      </div>
    </Chapter>
    <Chapter index="04" label={text.why.label} className="team-collaboration" labelledBy="collaboration-title"><div className="chapter-pad collaboration-copy" data-depth><p className="editorial-tag"><span/> {text.why.label}</p><h2 id="collaboration-title">{text.team.how}</h2><p className="editorial-copy">{text.team.details}</p></div></Chapter>
    <NextChapter />
  </>;
}

export function Founder() {
  const { lang, text } = useStudio();
  const person = people[0];
  const areas = ['design','frontend','automation'].map(id=>services.find(service=>service.id===id));
  return <>
    <Chapter index="04" label={text.founder.label} className="inner-lead founder-lead" labelledBy="founder-title">
      <div className="chapter-pad founder-feature">
        <div><p className="editorial-tag"><span/> {text.founder.label}</p><h1 className="headline" id="founder-title">{text.founder.title}</h1><p className="founder-role">{text.founder.role}</p><p className="editorial-copy">{text.founder.text}</p><RoundLink page="team">{text.founder.meet}</RoundLink></div>
        <ProfileArt person={person} big years={text.founder.years}/>
      </div>
    </Chapter>
    <Chapter index="01—03" label={text.footer.disciplines} className="paper-zone founder-practice" labelledBy="focus-title">
      <div className="chapter-pad practice-inner" data-depth><p className="editorial-tag"><span/> {text.footer.disciplines}</p><h2 id="focus-title">{text.founder.focus}</h2><p className="editorial-copy">{text.founder.focusIntro}</p><div className="practice-grid">{areas.map((service,i)=><PageLink key={service.id} page="work" query={`?field=${service.id}`} className="practice-row"><span className="mono" dir="ltr">0{i+1}</span><ServiceIcon type={service.icon} size={25}/><span><strong>{service.title[lang]}</strong><small>{service.text[lang]}</small></span><ArrowUpRight className="directional" size={23} strokeWidth={1.5} aria-hidden="true"/></PageLink>)}</div></div>
    </Chapter>
    <Chapter index="04" label={text.why.label} className="founder-journal" labelledBy="principle-title"><div className="chapter-pad collaboration-copy" data-depth><p className="editorial-tag"><span/> {text.why.label}</p><h2 id="principle-title">{text.founder.idea}</h2><p className="editorial-copy">{text.founder.ideaText}</p><p className="signature mono" dir="ltr">MOHAMED OMRAN <span> / ZUUN</span></p></div></Chapter>
    <NextChapter />
  </>;
}
