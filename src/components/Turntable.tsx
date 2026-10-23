import { useRef, useState, type PointerEvent as RPE } from 'react';
import type { Song } from '../types';
import type { usePreviewPlayer } from '../hooks/usePreviewPlayer';
import { BeadLabel } from './BeadLabel';
import { StreamingLinks } from './StreamingLinks';
import { ARM_END, ARM_ON, ARM_REST, isOnRecord, scrubTime } from '../lib/beadwork';

type Player = ReturnType<typeof usePreviewPlayer>;
const fmt = (t: number) => `0:${String(Math.floor(t)).padStart(2, '0')}`;
export const STATUS_LABEL: Record<Player['status'], string> = {
  idle: 'Platter empty', loading: 'Cueing…', playing: 'Playing', paused: 'Needle up',
  ended: 'Preview ended', error: 'Preview could not be loaded', unavailable: 'Preview unavailable',
};

export function Turntable({ song, player, reduced }: { song: Song | null; player: Player; reduced: boolean }) {
  const { status, time, duration, cap, play, pause, replay, seek } = player;
  const playing = status === 'playing' || status === 'loading';
  const canPlay = !!song?.previewUrl && status !== 'error';
  const pct = Math.min(1, time / Math.max(1, duration));
  const [dragArm, setDragArm] = useState<number | null>(null);
  const [spin, setSpin] = useState(0);
  const deck = useRef<HTMLDivElement>(null);
  const scratch = useRef<{ a: number; t: number; was: boolean } | null>(null);

  const armAngle = dragArm ?? (playing ? ARM_ON + (ARM_END - ARM_ON) * pct : ARM_REST);
  const pivot = () => { const r = deck.current!.getBoundingClientRect(); return { x: r.left + r.width * 0.86, y: r.top + r.height * 0.14 }; };
  const angleAt = (e: RPE) => { const p = pivot(); return (Math.atan2(e.clientY - p.y, e.clientX - p.x) * 180) / Math.PI - 108; };

  const armDown = (e: RPE<HTMLDivElement>) => { if (!canPlay) return; try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* synthetic pointer */ } setDragArm(armAngle); };
  const armMove = (e: RPE) => { if (dragArm === null) return; setDragArm(Math.max(ARM_REST - 4, Math.min(ARM_END, angleAt(e)))); };
  const armUp = () => { if (dragArm === null) return; const on = isOnRecord(dragArm); setDragArm(null); if (on && !playing) play(); if (!on && playing) pause(); };

  const recAngle = (e: RPE) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI; };
  const recDown = (e: RPE<HTMLDivElement>) => { if (!canPlay) return; try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* synthetic pointer */ } scratch.current = { a: recAngle(e), t: time, was: playing }; };
  const recMove = (e: RPE) => {
    const s = scratch.current; if (!s) return;
    let d = recAngle(e) - s.a; if (d > 180) d -= 360; if (d < -180) d += 360;
    s.a += d; setSpin((x) => x + d); s.t = scrubTime(s.t, d, cap); seek(s.t);
  };
  const recUp = () => { scratch.current = null; };

  return (
    <div className={`deck status-${status}${reduced ? ' reduced' : ''}`} data-status={status}>
      <div className="plinth" ref={deck}>
        <div className="platter" onPointerDown={recDown} onPointerMove={recMove} onPointerUp={recUp} onPointerCancel={recUp}
          data-testid="platter" aria-label={song ? `Record: ${song.title}. Drag in a circle to scratch.` : 'Empty platter'} role="img">
          <div className="vinyl-turn" style={{ transform: `rotate(${spin}deg)` }}>
            <div className={`vinyl${playing && !reduced ? ' spinning' : ''}${song ? '' : ' empty'}`}>
              {song && <BeadLabel title={song.title} className="vinyl-label" />}
            </div>
          </div>
        </div>
        <div className="tonearm" style={{ transform: `rotate(${armAngle + 18}deg)` }} data-angle={Math.round(armAngle)}
          onPointerDown={armDown} onPointerMove={armMove} onPointerUp={armUp} onPointerCancel={armUp}
          aria-hidden="true" data-testid="tonearm">
          <span className="arm-rod" /><span className="arm-head" />
        </div>
        <span className="pivot" aria-hidden="true" />
        <span className={`deck-led${status === 'playing' ? ' on' : ''}`} aria-hidden="true" />
        <span className="deck-badge">33⅓ · {cap}s PREVIEW</span>
      </div>

      <div className="deck-info">
        <p className="small-caps">On the platter</p>
        <h3 className="deck-title">{song ? song.title : 'Pull a record from the crate'}</h3>
        {song?.subtitle && <p className="muted small">{song.subtitle}</p>}
        <div className="deck-status" role="status" aria-live="polite">
          <span data-testid="status">{STATUS_LABEL[status]}</span>
          {song && canPlay && <span className="muted"> {fmt(time)} / {fmt(duration)}</span>}
        </div>
        <div className="groove-bar" role="progressbar" aria-label="Preview progress" aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(time)}>
          <span style={{ width: `${pct * 100}%` }} />
        </div>
        <div className="deck-buttons">
          <button type="button" className="btn btn-primary" onClick={() => (playing ? pause() : play())} disabled={!canPlay}
            aria-label={playing ? 'Lift the needle' : 'Drop the needle'}>{playing ? 'Lift needle' : 'Drop needle'}</button>
          <button type="button" className="btn btn-ghost" onClick={replay} disabled={!canPlay} aria-label="Replay preview from start">Back to the edge</button>
        </div>
        <p className="muted small">Drag the tonearm onto the record to play, or use the buttons. Drag the record in a circle to scratch.</p>
        {status === 'unavailable' && <p className="notice" role="note">No preview is available for this song yet. Listen to the full track below where available.</p>}
        {status === 'error' && <p className="notice" role="alert">The preview failed to load. Check your connection, or listen to the full track below.</p>}
        {song && <div className="deck-links"><p className="small-caps">Full track</p><StreamingLinks song={song} /></div>}
      </div>
    </div>
  );
}
