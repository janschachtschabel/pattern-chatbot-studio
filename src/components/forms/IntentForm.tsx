'use client';
import TagInput from '../TagInput';
import type { StudioIntent } from '@/lib/types';

interface Props {
  value: StudioIntent;
  onChange: (v: StudioIntent) => void;
}

export default function IntentForm({ value: i, onChange }: Props) {
  const f = (k: keyof StudioIntent) => (v: unknown) => onChange({ ...i, [k]: v });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">ID</label>
          <input className="field-input" value={i.id} onChange={e => f('id')(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Label</label>
          <input className="field-input" value={i.label} onChange={e => f('label')(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Cluster</label>
          <select className="field-input" value={i.cluster} onChange={e => f('cluster')(e.target.value)}>
            {['info','klarung','discovery','search','feedback','routing','meta'].map(c =>
              <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Beschreibung</label>
          <input className="field-input" value={i.description} onChange={e => f('description')(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="field-label">Degradation</label>
        <input className="field-input" value={i.degradation} onChange={e => f('degradation')(e.target.value)} />
      </div>

      <TagInput label="Haupt-Personas" values={i.mainPersonas} onChange={f('mainPersonas') as (v: string[]) => void} />
      <TagInput label="Preconditions" values={i.preconditions} onChange={f('preconditions') as (v: string[]) => void} />
      <TagInput label="Tools" values={i.tools} onChange={f('tools') as (v: string[]) => void} />
    </div>
  );
}
