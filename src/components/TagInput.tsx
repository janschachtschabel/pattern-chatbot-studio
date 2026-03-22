'use client';
import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface Props {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ label, values, onChange, placeholder = 'Eingabe + Enter' }: Props) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !input && values.length) onChange(values.slice(0, -1));
  };

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex flex-wrap gap-1 p-2 bg-[#1e2230] border border-[#2e3348] rounded min-h-[38px]">
        {values.map(v => (
          <span key={v} className="tag">
            {v}
            <button type="button" className="tag-remove" onClick={() => onChange(values.filter(x => x !== v))}>
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          className="bg-transparent outline-none text-sm text-slate-200 flex-1 min-w-[120px]"
          value={input}
          placeholder={values.length ? '' : placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
        />
      </div>
    </div>
  );
}
