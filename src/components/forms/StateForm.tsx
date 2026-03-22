'use client';
import TagInput from '../TagInput';
import type { StudioState } from '@/lib/types';

interface Props {
  value: StudioState;
  onChange: (v: StudioState) => void;
}

export default function StateForm({ value: s, onChange }: Props) {
  const f = (k: keyof StudioState) => (v: unknown) => onChange({ ...s, [k]: v });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="field-label">ID</label>
          <input className="field-input" value={s.id} onChange={e => f('id')(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Cluster</label>
          <select className="field-input" value={s.cluster} onChange={e => f('cluster')(e.target.value)}>
            <option value="A">A — Orientierung</option>
            <option value="B">B — Aktion</option>
            <option value="C">C — Abschluss & Sonder</option>
          </select>
        </div>
        <div>
          <label className="field-label">Emoji</label>
          <input className="field-input" value={s.emoji} onChange={e => f('emoji')(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="field-label">Label</label>
        <input className="field-input" value={s.label} onChange={e => f('label')(e.target.value)} />
      </div>

      <div>
        <label className="field-label">Beschreibung</label>
        <input className="field-input" value={s.description} onChange={e => f('description')(e.target.value)} />
      </div>

      <div>
        <label className="field-label">Ziel</label>
        <input className="field-input" value={s.goal} onChange={e => f('goal')(e.target.value)} />
      </div>

      <div>
        <label className="field-label">Bot-Fokus</label>
        <textarea className="field-textarea" rows={2} value={s.botFocus} onChange={e => f('botFocus')(e.target.value)} />
      </div>

      <TagInput label="Haupt-Personas" values={s.mainPersonas} onChange={f('mainPersonas') as (v: string[]) => void} />
      <TagInput label="Tools" values={s.tools} onChange={f('tools') as (v: string[]) => void} />
      <TagInput label="Transitions" values={s.transitions} onChange={f('transitions') as (v: string[]) => void} />
    </div>
  );
}
