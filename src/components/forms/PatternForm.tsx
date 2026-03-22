'use client';
import TagInput from '../TagInput';
import type { StudioPattern } from '@/lib/types';

interface Props {
  value: StudioPattern;
  onChange: (v: StudioPattern) => void;
}

const set = (p: StudioPattern, k: keyof StudioPattern, v: unknown) => ({ ...p, [k]: v });

export default function PatternForm({ value: p, onChange }: Props) {
  const f = (k: keyof StudioPattern) => (v: unknown) => onChange(set(p, k, v));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">ID</label>
          <input className="field-input" value={p.id} onChange={e => f('id')(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Label</label>
          <input className="field-input" value={p.label} onChange={e => f('label')(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="field-label">Length</label>
        <select className="field-input" value={p.length} onChange={e => f('length')(e.target.value)}>
          {['kurz','mittel','normal','bullet-liste'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div>
        <label className="field-label">Trigger</label>
        <textarea className="field-textarea" rows={2} value={p.trigger} onChange={e => f('trigger')(e.target.value)} />
      </div>

      <div>
        <label className="field-label">Core Rule</label>
        <textarea className="field-textarea" rows={3} value={p.coreRule} onChange={e => f('coreRule')(e.target.value)} />
      </div>

      <TagInput label="Trigger Signals" values={p.triggerSignals} onChange={f('triggerSignals') as (v: string[]) => void} />
      <TagInput label="Trigger States" values={p.triggerStates} onChange={f('triggerStates') as (v: string[]) => void} />
      <TagInput label="Trigger Personas" values={p.triggerPersonas} onChange={f('triggerPersonas') as (v: string[]) => void} />
      <TagInput label="Trigger Intents" values={p.triggerIntents} onChange={f('triggerIntents') as (v: string[]) => void} />
    </div>
  );
}
