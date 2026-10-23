import { useMemo } from 'react';
import { designFor, shapesFor } from '../lib/beadwork';

/** Generative beadwork record label. Decorative design art, not official cover art. */
export function BeadLabel({ title, className = '' }: { title: string; className?: string }) {
  const design = useMemo(() => designFor(title), [title]);
  const shapes = useMemo(() => shapesFor(design), [design]);
  return (
    <svg viewBox="0 0 100 100" className={`bead-label ${className}`} aria-hidden="true" data-seed={design.seed} focusable="false">
      <circle cx="50" cy="50" r="49" fill={design.bg} />
      {shapes.map((s, i) => s.tag === 'circle'
        ? <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />
        : <path key={i} d={s.d} fill={s.fill} />)}
      <circle cx="50" cy="50" r="9" fill="#0b0a0c" stroke="#c9ccd3" strokeWidth="1" />
      <circle cx="50" cy="50" r="2.2" fill="#c9ccd3" />
    </svg>
  );
}
