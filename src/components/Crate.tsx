import { useRef, type KeyboardEvent } from 'react';
import type { Song } from '../types';
import { BeadLabel } from './BeadLabel';

/** A crate of records the user flips through. */
export function Crate({ songs, index, onIndex, loadedId, onLoad }: {
  songs: Song[]; index: number; onIndex: (i: number) => void; loadedId: string | null; onLoad: (s: Song) => void;
}) {
  const n = songs.length;
  const go = (d: number) => onIndex((index + d + n) % n);
  const touch = useRef<number | null>(null);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(-1); }
  };
  const cur = songs[index];
  return (
    <div className="crate" aria-roledescription="record crate">
      <div className="crate-box" tabIndex={0} onKeyDown={onKey} aria-label="Record crate: use arrow keys to flip"
        onPointerDown={(e) => { touch.current = e.clientY + e.clientX; }}
        onPointerUp={(e) => { if (touch.current === null) return; const d = e.clientY + e.clientX - touch.current; touch.current = null; if (Math.abs(d) > 40) go(d < 0 ? 1 : -1); }}
        onWheel={(e) => { if (Math.abs(e.deltaY) > 20) go(e.deltaY > 0 ? 1 : -1); }}>
        {songs.map((s, i) => {
          const off = (i - index + n) % n;
          return (
            <button key={s.id} type="button" className={`sleeve off-${Math.min(off, 5)}${s.id === loadedId ? ' loaded' : ''}`}
              style={{ ['--off' as string]: off }} tabIndex={off === 0 ? 0 : -1} aria-hidden={off !== 0}
              aria-pressed={s.id === loadedId} onClick={() => (off === 0 ? onLoad(s) : onIndex(i))}
              aria-label={off === 0 ? `Put ${s.title} on the turntable${s.id === loadedId ? ' (on the platter)' : ''}` : `Flip to ${s.title}`}>
              <span className="sleeve-art"><BeadLabel title={s.title} /></span>
              <span className="sleeve-spine">{s.title}</span>
            </button>
          );
        })}
      </div>
      <div className="crate-ctrl">
        <button type="button" className="btn-round" onClick={() => go(-1)} aria-label="Flip to previous record">‹</button>
        <p className="crate-now" aria-live="polite"><span className="small-caps">In hand</span> <strong>{cur?.title}</strong>
          <span className="muted small">{index + 1} / {n}</span></p>
        <button type="button" className="btn-round" onClick={() => go(1)} aria-label="Flip to next record">›</button>
      </div>
      <p className="muted small center">Flip with the arrows, swipe or scroll · tap the front sleeve to put it on the deck</p>
    </div>
  );
}
