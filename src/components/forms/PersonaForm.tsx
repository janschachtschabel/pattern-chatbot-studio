'use client';
import TagInput from '../TagInput';
import type { StudioPersona } from '@/lib/types';

interface Props {
  value: StudioPersona;
  onChange: (v: StudioPersona) => void;
}

export default function PersonaForm({ value: p, onChange }: Props) {
  const f = (k: keyof StudioPersona) => (v: unknown) => onChange({ ...p, [k]: v });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="field-label">ID</label>
          <input className="field-input" value={p.id} onChange={e => f('id')(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Label</label>
          <input className="field-input" value={p.label} onChange={e => f('label')(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Emoji</label>
          <input className="field-input" value={p.emoji} onChange={e => f('emoji')(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="field-label">Kurzbeschreibung</label>
        <input className="field-input" value={p.shortDesc} onChange={e => f('shortDesc')(e.target.value)} />
      </div>

      <div>
        <label className="field-label">Tonalität</label>
        <input className="field-input" value={p.tonality} onChange={e => f('tonality')(e.target.value)} />
      </div>

      <div>
        <label className="field-label">Tailwind Color Classes</label>
        <input className="field-input font-mono text-xs" value={p.color} onChange={e => f('color')(e.target.value)} />
      </div>

      <TagInput label="Detection Hints (Erkennungsmerkmale)" values={p.detectionHints}
        onChange={f('detectionHints') as (v: string[]) => void}
        placeholder="Hinweis eingeben + Enter" />
    </div>
  );
}
