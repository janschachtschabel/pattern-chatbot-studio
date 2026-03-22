'use client';
import { useState } from 'react';
import type { StudioConfig } from '@/lib/types';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function matchPatterns(
  cfg: StudioConfig,
  personaId: string,
  stateId: string,
  intentId: string,
): string[] {
  return cfg.patterns
    .filter(p =>
      (personaId === 'all' || p.triggerPersonas.includes(personaId)) &&
      p.triggerStates.includes(stateId) &&
      p.triggerIntents.includes(intentId),
    )
    .map(p => p.id);
}

function matchSignalPersona(
  cfg: StudioConfig,
  signalId: string,
  personaId: string,
): string[] {
  return cfg.patterns
    .filter(p =>
      p.triggerSignals.includes(signalId) &&
      p.triggerPersonas.includes(personaId),
    )
    .map(p => p.id);
}

const CLUSTER_COLORS: Record<string, string> = {
  A: 'text-amber-400',
  B: 'text-indigo-400',
  C: 'text-slate-400',
};

/* ── Component ───────────────────────────────────────────────────────────── */
export default function HeatmapView({ cfg }: { cfg: StudioConfig }) {
  const [personaId, setPersonaId] = useState('all');
  const [mode, setMode]           = useState<'state-intent' | 'signal-persona'>('state-intent');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  /* ─ State × Intent ─ */
  const siCells = cfg.states.flatMap(s =>
    cfg.intents.map(i => ({
      stateId: s.id, intentId: i.id,
      patterns: matchPatterns(cfg, personaId, s.id, i.id),
    })),
  );
  const siMax = Math.max(1, ...siCells.map(c => c.patterns.length));

  /* ─ Signal × Persona ─ */
  const spCells = cfg.signals.flatMap(sig =>
    cfg.personas.map(per => ({
      signalId: sig.id, personaId: per.id,
      patterns: matchSignalPersona(cfg, sig.id, per.id),
    })),
  );
  const spMax = Math.max(1, ...spCells.map(c => c.patterns.length));

  const cellBg = (count: number, max: number) =>
    count > 0
      ? `rgba(79,70,229,${0.12 + (count / max) * 0.72})`
      : '#0a0d16';

  const cellBorder = (count: number, max: number) =>
    count > 0
      ? `rgba(99,102,241,${0.25 + (count / max) * 0.6})`
      : '#1a1d2a';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0f1117]">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-[#2e3348] flex-shrink-0 flex-wrap gap-y-2">
        <h2 className="font-bold text-slate-200 text-sm">🔥 Coverage Heatmap</h2>

        <div className="flex rounded overflow-hidden border border-[#2e3348]">
          {(['state-intent', 'signal-persona'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1 text-xs transition-colors ${mode === m ? 'bg-indigo-700 text-white' : 'bg-[#1e2230] text-slate-400 hover:text-slate-200'}`}>
              {m === 'state-intent' ? 'State × Intent' : 'Signal × Persona'}
            </button>
          ))}
        </div>

        {mode === 'state-intent' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Persona:</span>
            <select className="bg-[#1e2230] border border-[#2e3348] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              value={personaId} onChange={e => setPersonaId(e.target.value)}>
              <option value="all">Alle</option>
              {cfg.personas.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
            </select>
          </div>
        )}

        <span className="ml-auto text-xs text-slate-600">Hover = Pattern-Details</span>
      </div>

      {/* ── Matrix ── */}
      <div className="flex-1 overflow-auto p-4">

        {/* ── State × Intent ── */}
        {mode === 'state-intent' && (
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[#0f1117] pr-3 pb-2 text-left text-slate-600 font-normal w-36">
                  State ↓ · Intent →
                </th>
                {cfg.intents.map(intent => (
                  <th key={intent.id} className="pb-2 px-0.5 min-w-[72px]">
                    <div className="bg-[#081a10] border border-emerald-900/50 rounded p-1.5 text-center">
                      <div className="font-mono text-[9px] text-emerald-500">{intent.id}</div>
                      <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                        {intent.label.length > 11 ? intent.label.slice(0, 10) + '…' : intent.label}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cfg.states.map(state => (
                <tr key={state.id}>
                  <td className="sticky left-0 z-10 bg-[#0f1117] pr-3 py-0.5">
                    <div className="bg-[#081c22] border border-cyan-900/50 rounded p-1.5 min-w-[130px]">
                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] font-bold ${CLUSTER_COLORS[state.cluster]}`}>{state.cluster}</span>
                        <span className="font-mono text-[9px] text-cyan-500">{state.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{state.emoji} {state.label.slice(0, 18)}</div>
                    </div>
                  </td>
                  {cfg.intents.map(intent => {
                    const patterns = matchPatterns(cfg, personaId, state.id, intent.id);
                    const cellId = `${state.id}|${intent.id}`;
                    const isHovered = hoveredCell === cellId;
                    return (
                      <td key={intent.id} className="p-0.5 align-middle relative">
                        <div
                          className="rounded min-h-[44px] flex items-center justify-center cursor-default"
                          style={{
                            background: cellBg(patterns.length, siMax),
                            border: `1px solid ${cellBorder(patterns.length, siMax)}`,
                          }}
                          onMouseEnter={() => setHoveredCell(cellId)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {patterns.length > 0 ? (
                            <div className="text-center px-1">
                              {patterns.map(pid => (
                                <div key={pid} className="text-indigo-300 font-mono text-[9px] leading-tight">{pid}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#1e2436]">·</span>
                          )}

                          {/* Tooltip */}
                          {isHovered && patterns.length > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 w-56 bg-[#1e2230] border border-[#3e4560] rounded-lg p-2.5 shadow-2xl pointer-events-none">
                              <div className="text-[10px] text-slate-500 mb-1.5">{state.id} + {intent.id}</div>
                              {patterns.map(pid => {
                                const pat = cfg.patterns.find(p => p.id === pid);
                                return pat ? (
                                  <div key={pid} className="mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-[10px] text-indigo-400 font-bold">{pid}</span>
                                      <span className="text-[10px] text-slate-300">{pat.label}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{pat.coreRule.slice(0, 80)}</p>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ── Signal × Persona ── */}
        {mode === 'signal-persona' && (
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[#0f1117] pr-3 pb-2 text-left text-slate-600 font-normal w-40">
                  Signal ↓ · Persona →
                </th>
                {cfg.personas.map(persona => (
                  <th key={persona.id} className="pb-2 px-0.5 min-w-[72px]">
                    <div className="bg-[#160d2a] border border-violet-900/50 rounded p-1.5 text-center">
                      <div className="text-base leading-none">{persona.emoji}</div>
                      <div className="font-mono text-[9px] text-violet-400 mt-0.5">{persona.id}</div>
                      <div className="text-[9px] text-slate-500 truncate">{persona.label.slice(0, 10)}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cfg.signals.map(signal => (
                <tr key={signal.id}>
                  <td className="sticky left-0 z-10 bg-[#0f1117] pr-3 py-0.5">
                    <div className="bg-[#1c1408] border border-amber-900/40 rounded p-1.5 min-w-[148px]">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{signal.emoji}</span>
                        <span className="font-mono text-[9px] text-amber-400">{signal.id}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Dim {signal.dimension}</div>
                    </div>
                  </td>
                  {cfg.personas.map(persona => {
                    const patterns = matchSignalPersona(cfg, signal.id, persona.id);
                    const cellId = `${signal.id}|${persona.id}`;
                    const isHovered = hoveredCell === cellId;
                    return (
                      <td key={persona.id} className="p-0.5 align-middle relative">
                        <div
                          className="rounded min-h-[44px] flex items-center justify-center cursor-default"
                          style={{
                            background: cellBg(patterns.length, spMax),
                            border: `1px solid ${cellBorder(patterns.length, spMax)}`,
                          }}
                          onMouseEnter={() => setHoveredCell(cellId)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {patterns.length > 0 ? (
                            <div className="text-center px-1">
                              {patterns.map(pid => (
                                <div key={pid} className="text-indigo-300 font-mono text-[9px] leading-tight">{pid}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#1e2436]">·</span>
                          )}
                          {isHovered && patterns.length > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 w-52 bg-[#1e2230] border border-[#3e4560] rounded-lg p-2 shadow-2xl pointer-events-none">
                              <div className="text-[10px] text-slate-500 mb-1">{signal.id} + {persona.id}</div>
                              {patterns.map(pid => {
                                const pat = cfg.patterns.find(p => p.id === pid);
                                return pat ? (
                                  <div key={pid} className="mb-1">
                                    <span className="font-mono text-[10px] text-indigo-400">{pid}</span>
                                    <span className="text-[10px] text-slate-300 ml-1">{pat.label}</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-6 px-5 py-2 border-t border-[#2e3348] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-20 h-3 rounded" style={{ background: 'linear-gradient(to right, #0a0d16, rgba(79,70,229,0.84))' }} />
          <span className="text-xs text-slate-500">0 → mehr Patterns</span>
        </div>
        {mode === 'state-intent' && (
          <div className="flex gap-3">
            {(['A','B','C'] as const).map(c => (
              <span key={c} className={`text-xs ${CLUSTER_COLORS[c]}`}>
                {c}: {cfg.states.filter(s => s.cluster === c).map(s => s.clusterLabel)[0]}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
