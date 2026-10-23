import { useEffect, useState } from 'react';
import { artist, PREVIEW_CAP_SECONDS } from './config/artist';
import { songs } from './data/songs';
import { MusicSection } from './components/MusicSection';
import { isUsableUrl } from './lib/links';
import { mixtape, payments, tourEvents, vault } from './config/features';
import { decodeMixtape } from './lib/mixtape';
import { MixtapeMaker } from './components/MixtapeMaker';
import { SharedMixtape } from './components/SharedMixtape';
import { TourSection } from './components/TourSection';
import { VaultPanel } from './components/VaultPanel';
import { BeadLabel } from './components/BeadLabel';

const readMix = () =>
  decodeMixtape(window.location.search, songs, { maxSongs: mixtape.maxSongs, colorIds: mixtape.tapeColors.map((c) => c.id) });

/** Track list shown in the needle bar: each section is a "track" on side A or B. */
export const TRACKS = [
  { id: 'a1', side: 'A', label: 'A1 · The deck' },
  ...(mixtape.enabled ? [{ id: 'a2', side: 'A', label: 'A2 · Build your crate' }] : []),
  { id: 'b1', side: 'B', label: 'B1 · Liner notes' },
  ...(vault.enabled ? [{ id: 'b2', side: 'B', label: 'B2 · The vault' }] : []),
  ...(tourEvents.length ? [{ id: 'b3', side: 'B', label: 'B3 · Live' }] : []),
  { id: 'b4', side: 'B', label: 'B4 · Contact' },
] as const;

function useScrollProgress() {
  const [p, setP] = useState(0);
  const [side, setSide] = useState<'A' | 'B'>('A');
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setP(max > 0 ? Math.min(1, scrollY / max) : 0);
      const b = document.getElementById('side-b');
      if (b) setSide(b.getBoundingClientRect().top < innerHeight * 0.5 ? 'B' : 'A');
    };
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); };
  }, []);
  return { p, side };
}

export default function App() {
  const [sharedMix, setSharedMix] = useState(() => (mixtape.enabled ? readMix() : null));
  useEffect(() => {
    const r = document.documentElement.style;
    const c = artist.colors;
    r.setProperty('--bg', c.background); r.setProperty('--surface', c.surface); r.setProperty('--text', c.text);
    r.setProperty('--muted', c.muted); r.setProperty('--accent', c.accent); r.setProperty('--accent-2', c.accent2);
    r.setProperty('--font-display', artist.fonts.display); r.setProperty('--font-body', artist.fonts.body);
    if (artist.fonts.googleFontsHref) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = artist.fonts.googleFontsHref; document.head.appendChild(l);
    }
  }, []);
  const { p, side } = useScrollProgress();
  const socials = artist.socials.filter((s) => isUsableUrl(s.url));
  const flip = (s: 'A' | 'B') => document.getElementById(s === 'A' ? 'side-a' : 'side-b')?.scrollIntoView({ behavior: matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="needle-bar">
        <a href="#top" className="brand"><img src={artist.logo} alt="" width={28} height={28} /><span>{artist.name}</span></a>
        <nav aria-label="Tracks" className="groove-nav">
          <div className="groove-line" aria-hidden="true"><span className="needle" style={{ left: `${p * 100}%` }} data-testid="needle" /></div>
          <ol>{TRACKS.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>)}</ol>
        </nav>
        <div className="side-flip" role="group" aria-label="Flip the record">
          {(['A', 'B'] as const).map((s) => (
            <button key={s} type="button" aria-pressed={side === s} onClick={() => flip(s)}>Side {s}</button>
          ))}
        </div>
      </header>

      <main id="main">
        {sharedMix && (
          <SharedMixtape mix={sharedMix} songs={songs} config={mixtape} capSeconds={PREVIEW_CAP_SECONDS}
            onClose={() => { window.history.replaceState(null, '', window.location.pathname + '#a2'); setSharedMix(null); setTimeout(() => document.getElementById('a2')?.scrollIntoView(), 0); }} />
        )}

        <section id="top" className="sleeve-intro" aria-labelledby="title">
          <div className="sleeve-jacket">
            <p className="small-caps">{artist.tagline} · Side A / Side B</p>
            <h1 id="title">{artist.name}</h1>
            <p className="lead">{artist.shortIntro}</p>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary" onClick={() => flip('A')}>Play side A</button>
              {socials.length > 0 && (
                <ul className="socials" aria-label="Listen elsewhere">
                  {socials.map((s) => <li key={s.label}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
                </ul>
              )}
            </div>
          </div>
          <div className="intro-disc" aria-hidden="true">
            <div className="intro-vinyl"><BeadLabel title={artist.name} className="vinyl-label" /></div>
          </div>
          <p className="art-note small">Record labels on this site are generative beadwork-pattern design art, seeded by each song title. They are not official cover art.</p>
        </section>

        <div id="side-a" className="side side-a">
          <p className="side-mark" aria-hidden="true">A</p>
          <section id="a1" className="section" aria-labelledby="a1-h">
            <div className="section-head"><p className="track-no">A1</p><h2 id="a1-h">The deck</h2>
              <p className="muted">Dig through the crate, put a record on the platter and drop the needle for a {PREVIEW_CAP_SECONDS}-second preview.</p></div>
            <MusicSection songs={songs} capSeconds={PREVIEW_CAP_SECONDS} />
          </section>
          {mixtape.enabled && (
            <section id="a2" className="section" aria-labelledby="a2-h">
              <div className="section-head"><p className="track-no">A2</p><h2 id="a2-h">Build your crate</h2>
                <p className="muted">Pick up to {mixtape.maxSongs} songs, name your crate, choose a sleeve colour and share the link.</p></div>
              <MixtapeMaker songs={songs} config={mixtape} />
            </section>
          )}
        </div>

        <div id="side-b" className="side side-b">
          <p className="side-mark" aria-hidden="true">B</p>
          <section id="b1" className="section liner" aria-labelledby="b1-h">
            <div className="section-head"><p className="track-no">B1</p><h2 id="b1-h">Liner notes</h2></div>
            <div className="liner-grid">
              <div className="liner-text">{artist.biography.map((t, i) => <p key={i}>{t}</p>)}
                <dl className="credits"><dt>Tracks on this site</dt><dd>{songs.map((s) => s.title).join(' · ')}</dd>
                  <dt>Label art</dt><dd>Generative design art, not official covers</dd><dt>Previews</dt><dd>Placeholder tones until authorised clips are supplied</dd></dl>
              </div>
              <ul className="liner-photos" aria-label="Photo slots">
                {[{ src: artist.profileImage, alt: 'Photo placeholder: press photo to be added' }, ...artist.gallery].map((g) => (
                  <li key={g.src}><img src={g.src} alt={g.alt} loading="lazy" width={400} height={460} /></li>
                ))}
              </ul>
            </div>
          </section>
          {vault.enabled && (
            <section id="b2" className="section" aria-labelledby="b2-h">
              <div className="section-head"><p className="track-no">B2</p><h2 id="b2-h">The vault</h2>
                <p className="muted">A sealed record. It unlocks on release day.</p></div>
              <VaultPanel vault={vault} />
            </section>
          )}
          {tourEvents.length > 0 && (
            <section id="b3" className="section" aria-labelledby="b3-h">
              <div className="section-head"><p className="track-no">B3</p><h2 id="b3-h">Live</h2>
                <p className="muted">Dates and tickets{payments.paystackPublicKey ? ' (secure checkout by Paystack, prices in ZAR)' : ''}.</p></div>
              <TourSection events={tourEvents} payments={payments} />
            </section>
          )}
          <section id="b4" className="section contact" aria-labelledby="b4-h">
            <div className="section-head"><p className="track-no">B4</p><h2 id="b4-h">Contact</h2></div>
            {artist.contact.email
              ? <p>General: <a href={`mailto:${artist.contact.email}`}>{artist.contact.email}</a></p>
              : <p className="muted">Contact details coming soon.</p>}
            {socials.length > 0 && <ul className="socials">{socials.map((s) => <li key={s.label}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul>}
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <p className="muted small">© {new Date().getFullYear()} {artist.name}. Preview clips are placeholder tones, not the real songs. Label art is generative design art.</p>
      </footer>
    </>
  );
}
