import { useState } from 'react';
import type { Song } from '../types';
import { Crate } from './Crate';
import { Turntable } from './Turntable';
import { usePreviewPlayer } from '../hooks/usePreviewPlayer';
import { useReducedMotion } from '../hooks/useReducedMotion';

/** Side A: crate + turntable. Never autoplays: loading a record only cues it. */
export function MusicSection({ songs, capSeconds }: { songs: Song[]; capSeconds: number }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Song | null>(null);
  const player = usePreviewPlayer(loaded, capSeconds);
  const reduced = useReducedMotion();
  return (
    <div className="side-a-grid">
      <Crate songs={songs} index={index} onIndex={setIndex} loadedId={loaded?.id ?? null} onLoad={(s) => { if (s.id !== loaded?.id) setLoaded(s); }} />
      <Turntable song={loaded} player={player} reduced={reduced} />
    </div>
  );
}
