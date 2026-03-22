'use client';
import { useState } from 'react';
import type { StudioConfig } from '@/lib/types';

const CLUSTER_LABEL: Record<string, string> = { A: 'Orientierung', B: 'Aktion', C: 'Abschluss' };
const CLUSTER_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: '#1c1408', border: '#d97706', text: '#fbbf24' },
  B: { bg: '#101828', border: '#4338ca', text: '#a5b4fc' },
  C: { bg: '#0a0d14', border: '#475569', text: '#94a3b8' },
};

const LENGTH_COLOR: Record<string, string> = {
  kurz: 'bg-emerald-900/40 text-emerald-400',
  mittel: 'bg-amber-900/40 text-amber-400',
  normal: 'bg-indigo-900/40 text-indigo-400',
  'bullet-liste': 'bg-violet-900/40 text-violet-400',
};

const DIM_LABEL: Record<number, string> = { 1: 'Zeit & Druck', 2: 'Sicherheit', 3: 'Haltung', 4: 'Kontext' };
const DIM_COLOR: Record<number, string> = { 1: 'text-red-400', 2: 'text-blue-400', 3: 'text-green-400', 4: 'text-violet-400' };

export default function PersonaView({ cfg }: { cfg: StudioConfig }) {
  const [personaId, setPersonaId] = useState(cfg.personas[0]?.id ?? '');

  const persona = cfg.personas.find(p => p.id === personaId);
  if (!persona) return null;

  const myPatterns  = cfg.patterns.filter(p => p.triggerPersonas.includes(personaId));
  const myStates    = cfg.states.filter(s => s.mainPersonas.includes(personaId));
  const myIntents   = cfg.intents.filter(i => i.mainPersonas.includes(personaId));
  const mySignalIds = [...new Set(myPatterns.flatMap(p => p.triggerSignals))];
  const mySignals   = cfg.signals.filter(s => mySignalIds.includes(s.id));

  /* group patterns by first trigger state */
  const byCluster: Record<string, typeof myPatterns> = { A: [], B: [], C: [] };
  myPatterns.forEach(p => {
    const firstState = cfg.states.find(s => p.triggerStates.includes(s.id));
    const cluster = firstState?.cluster ?? 'C';
    byCluster[cluster].push(p);
  });

  /* coverage bars */
  const patCoverage  = Math.round((myPatterns.length / Math.max(1, cfg.patterns.length)) * 100);
  const stateCoverage= Math.round((myStates.length  / Math.max(1, cfg.states.length))    * 100);
  const intentCoverage= Math.round((myIntents.length / Math.max(1, cfg.intents.length))   * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0f1117]">

      {/* ── Persona Tabs ── */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#2e3348] overflow-x-auto flex-shrink-0">
        <span className="text-xs text-slate-600 mr-2 flex-shrink-0">👁️ Profil:</span>
        {cfg.personas.map(p => (
          <button key={p.id} onClick={() => setPersonaId(p.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs flex-shrink-0 transition-colors border ${
              p.id === personaId
                ? 'bg-violet-700/30 border-violet-600/50 text-violet-200'
                : 'bg-[#1a1d2a] border-[#2e3348] text-slate-400 hover:text-slate-200'
            }`}>
            <span>{p.emoji}</span><span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-[300px_1fr_220px] gap-4 items-start">

        {/* ── Col 1: Profil-Karte ── */}
        <div className="space-y-3">
          <div className="bg-[#16102a] border border-violet-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{persona.emoji}</span>
              <div>
                <p className="font-bold text-slate-200">{persona.label}</p>
                <p className="font-mono text-xs text-violet-400">{persona.id}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-3 leading-relaxed">{persona.shortDesc}</p>
            <div className="text-xs text-slate-500 mb-3">
              <span className="text-slate-400 font-medium">Tonalität: </span>{persona.tonality}
            </div>

            {/* Coverage bars */}
            {[
              { label: 'Patterns', val: patCoverage, count: myPatterns.length, total: cfg.patterns.length, color: '#4338ca' },
              { label: 'States',   val: stateCoverage,  count: myStates.length,   total: cfg.states.length,   color: '#0891b2' },
              { label: 'Intents',  val: intentCoverage, count: myIntents.length,  total: cfg.intents.length,  color: '#059669' },
            ].map(bar => (
              <div key={bar.label} className="mb-2">
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>{bar.label}</span>
                  <span className="text-slate-400">{bar.count} / {bar.total}</span>
                </div>
                <div className="h-1.5 bg-[#1e2230] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${bar.val}%`, background: bar.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Detection Hints */}
          <div className="bg-[#1a1d2a] border border-[#2e3348] rounded-xl p-3">
            <p className="text-xs font-semibold text-slate-400 mb-2">🔍 Erkennungsmerkmale</p>
            <div className="flex flex-wrap gap-1">
              {persona.detectionHints.map((h, i) => (
                <span key={i} className="text-[10px] bg-[#0f1117] border border-[#2e3348] text-slate-400 rounded px-1.5 py-0.5">
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Typical Signals */}
          {mySignals.length > 0 && (
            <div className="bg-[#1a1d2a] border border-[#2e3348] rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 mb-2">⚡ Typische Signale</p>
              <div className="space-y-1">
                {mySignals.map(s => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span>{s.emoji}</span>
                    <span className="text-xs text-slate-300">{s.label}</span>
                    <span className={`text-[9px] ml-auto ${DIM_COLOR[s.dimension]}`}>{DIM_LABEL[s.dimension]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Col 2: Patterns by Cluster ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 px-1">
            {myPatterns.length} Pattern{myPatterns.length !== 1 ? 's' : ''} verfügbar
          </p>

          {(['A','B','C'] as const).map(cluster => {
            const pats = byCluster[cluster];
            if (pats.length === 0) return null;
            const cc = CLUSTER_COLOR[cluster];
            return (
              <div key={cluster}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-px flex-1" style={{ background: cc.border, opacity: 0.3 }} />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: cc.bg, border: `1px solid ${cc.border}`, color: cc.text }}>
                    Cluster {cluster} · {CLUSTER_LABEL[cluster]}
                  </span>
                  <div className="h-px flex-1" style={{ background: cc.border, opacity: 0.3 }} />
                </div>

                <div className="space-y-1.5">
                  {pats.map(pat => (
                    <div key={pat.id} className="bg-[#141929] border border-indigo-900/40 rounded-lg p-3 hover:border-indigo-700/50 transition-colors">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[10px] text-indigo-400 bg-indigo-900/30 rounded px-1.5 py-0.5">{pat.id}</span>
                        <span className="text-sm font-medium text-slate-200">{pat.label}</span>
                        <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded font-medium ${LENGTH_COLOR[pat.length]}`}>{pat.length}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">{pat.coreRule}</p>
                      <div className="flex flex-wrap gap-1">
                        {pat.triggerSignals.map(id => {
                          const s = cfg.signals.find(x => x.id === id);
                          return s ? (
                            <span key={id} className="text-[9px] bg-amber-900/20 border border-amber-900/30 text-amber-500 rounded px-1.5 py-0.5">
                              {s.emoji} {s.label}
                            </span>
                          ) : null;
                        })}
                        {pat.triggerStates.map(id => (
                          <span key={id} className="text-[9px] bg-cyan-900/20 border border-cyan-900/30 text-cyan-500 rounded px-1.5 py-0.5">{id}</span>
                        ))}
                        {pat.triggerIntents.map(id => (
                          <span key={id} className="text-[9px] bg-emerald-900/20 border border-emerald-900/30 text-emerald-500 rounded px-1.5 py-0.5">{id}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Col 3: States + Intents ── */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">🗺️ States ({myStates.length})</p>
            <div className="space-y-1">
              {cfg.states.map(state => {
                const active = state.mainPersonas.includes(personaId);
                return (
                  <div key={state.id} className={`flex items-start gap-2 p-2 rounded transition-colors ${
                    active ? 'bg-cyan-900/20 border border-cyan-900/30' : 'opacity-25'
                  }`}>
                    <span className="text-sm flex-shrink-0">{state.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-[8px] font-bold px-1 rounded ${CLUSTER_COLOR[state.cluster].text}`} style={{ background: CLUSTER_COLOR[state.cluster].bg }}>{state.cluster}</span>
                        <span className="font-mono text-[9px] text-cyan-500">{state.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{state.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">🎯 Intents ({myIntents.length})</p>
            <div className="space-y-1">
              {cfg.intents.map(intent => {
                const active = intent.mainPersonas.includes(personaId);
                return (
                  <div key={intent.id} className={`p-2 rounded transition-colors ${
                    active ? 'bg-emerald-900/20 border border-emerald-900/30' : 'opacity-25'
                  }`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-mono text-[9px] text-emerald-500">{intent.id}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{intent.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
