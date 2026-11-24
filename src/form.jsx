import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, CircleCheck, FileText, LockKeyhole, Radio, Send } from 'lucide-react';
import { services } from './content';
import { standalone } from './runtime';
import { Headline, useStudio } from './ui';
import { SceneView } from './world/world';
import { Chapter } from './editorial';

export function Contact() {
  const { lang, text } = useStudio();
  const c = text.contact;
  const [params] = useSearchParams();
  const initialService = services.some(s => s.id === params.get('service')) ? params.get('service') : '';
  const [service, setService] = useState(initialService);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const success = useRef(null);
  useEffect(() => { setService(initialService); }, [initialService]);
  useEffect(() => { if (reference) success.current?.focus(); }, [reference]);

  async function submit(event) {
    event.preventDefault();
    if (pending || standalone) return;
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    if (payload.message.trim().length < 15 || !payload.name.trim()) { setError('invalid'); return; }
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, language: lang }),
      });
      const result = await response.json();
      if (!response.ok || !result.reference) { setError(['invalid', 'limited'].includes(result.error) ? result.error : 'failed'); return; }
      setReference(result.reference);
    } catch {
      setError('failed');
    } finally {
      setPending(false);
    }
  }
  function reset() { setReference(''); setMessage(''); setService(initialService); setError(''); }

  return <Chapter index="05" label={c.label} className="inner-lead contact-lead" labelledBy="contact-title">
    <div className="chapter-pad contact-layout">
      <div className="contact-copy">
        <p className="editorial-tag"><span/> {c.label}</p><Headline lines={c.title} id="contact-title"/><p className="support-text page-description">{c.text}</p>
        <aside className="contact-note"><div className="service-icon"><FileText size={22} strokeWidth={1.65} aria-hidden="true" /></div><div><h2>{c.noteTitle}</h2><p>{c.noteText}</p></div></aside>
        <div className="signal-frame" data-received={Boolean(reference)} aria-hidden="true"><div className="signal-coordinates mono" dir="ltr">ZUUN / SIGNAL.05</div><SceneView kind="signal" className="signal-viewport" options={{ success: Boolean(reference) }} fallback={<span className="signal-backup"><i/><i/><i/></span>}/><p className="signal-caption"><Radio size={15} strokeWidth={1.6} aria-hidden="true"/>{reference ? text.scene.received : text.scene.signal}</p></div>
      </div>
      <div className="form-panel">
        {reference ? <div className="form-success" ref={success} tabIndex={-1}><div className="success-icon"><CircleCheck size={32} strokeWidth={1.6} aria-hidden="true" /></div><h2>{c.success}</h2><p className="support-text">{c.successText}</p><p className="inquiry-reference">{c.reference}: <bdi className="mono">{reference}</bdi></p><button type="button" className="action action--outline" onClick={reset}>{c.another}</button></div> : <>
          <div className="form-head"><h2>{c.formTitle}</h2><p className="support-text" id="inquiry-intro">{standalone ? c.previewText : c.formText}</p></div>
          <form className="inquiry-form" onSubmit={submit} aria-busy={pending} aria-describedby="inquiry-intro">
            <div className="field-row"><label className="field"><span>{c.name}</span><input type="text" name="name" autoComplete="name" placeholder={c.namePlaceholder} maxLength={100} disabled={standalone} required /></label>
            <label className="field"><span>{c.email}</span><input type="email" name="email" autoComplete="email" placeholder="name@example.com" maxLength={200} dir="ltr" disabled={standalone} required /></label></div>
            <label className="field"><span>{c.service}</span><span className="select-wrap"><select name="service" value={service} onChange={event => setService(event.target.value)} required><option value="" disabled>{c.choose}</option>{services.map(s => <option key={s.id} value={s.id}>{s.title[lang]}</option>)}<option value="unsure">{c.unsure}</option></select><ChevronDown size={17} strokeWidth={1.8} aria-hidden="true" /></span></label>
            <label className="field"><span>{c.message}</span><textarea name="message" placeholder={c.messagePlaceholder} rows={5} minLength={15} maxLength={2400} disabled={standalone} value={message} onChange={(event) => setMessage(event.target.value)} required /></label>
            <div className="form-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            <div className="field-meta"><span><LockKeyhole size={14} strokeWidth={1.7} aria-hidden="true" />{c.privacy}</span><span className="mono" dir="ltr">{message.length}/2400</span></div>
            {error && <p className="form-error" role="alert">{c[error]}</p>}
            <button className="action action--primary submit" type="submit" disabled={pending || standalone}>{standalone ? c.previewSend : (pending ? c.sending : c.send)}<Send size={17} strokeWidth={1.8} aria-hidden="true" className="directional" /></button>
          </form>
        </>}
      </div>
    </div>
  </Chapter>;
}
