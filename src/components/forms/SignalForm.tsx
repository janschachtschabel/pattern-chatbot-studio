'use client';
import TagInput from '../TagInput';
import type { StudioSignal } from '@/lib/types';

interface Props {
  value: StudioSignal;
  onChange: (v: StudioSignal) => void;
}

export default function SignalForm({ value: s, onChange }: Props) {
  const f = (k: keyof StudioSignal) => (v: unknown) => onChange({ ...s, [k]: v });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="field-label">ID</label>
          <input className="field-input" value={s.id} onChange={e => f('id')(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Label</label>
          <input className="field-input" value={s.label} onChange={e => f('label')(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Emoji</label>
          <input className="field-input" value={s.emoji} onChange={e => f('emoji')(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Dimension (1–4)</label>
          <input className="field-input" type="number" min={1} max={4} value={s.dimension}
            onChange={e => f('dimension')(Number(e.target.value))} />
        </div>
        <div>
          <label className="field-label">Dimension-Label</label>
          <input className="field-input" value={s.dimensionLabel} onChange={e => f('dimensionLabel')(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="field-label">Bot-Implikation</label>
        <input className="field-input" value={s.botImplication} onChange={e => f('botImplication')(e.target.value)} />
      </div>

      <div>
        <label className="field-label">Ton</label>
        <input className="field-input" value={s.tone} onChange={e => f('tone')(e.target.value)} />
      </div>

      <TagInput label="Detection Hints" values={s.detectionHints}
        onChange={f('detectionHints') as (v: string[]) => void} />
    </div>
  );
}
