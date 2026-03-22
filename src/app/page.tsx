'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Download, Trash2, ChevronRight, Copy, Check, RotateCcw } from 'lucide-react';
import type { StudioConfig, EntityType, StudioPattern, StudioPersona, StudioState, StudioSignal, StudioIntent } from '@/lib/types';
import { DEFAULT_CONFIG } from '@/lib/defaultData';
import { buildExportFiles } from '@/lib/exportUtils';
import PatternForm from '@/components/forms/PatternForm';
import PersonaForm from '@/components/forms/PersonaForm';
import StateForm from '@/components/forms/StateForm';
import SignalForm from '@/components/forms/SignalForm';
import IntentForm from '@/components/forms/IntentForm';
import GraphView    from '@/components/GraphView';
import HeatmapView  from '@/components/HeatmapView';
import PersonaView  from '@/components/PersonaView';

type ViewMode = 'list' | 'graph' | 'heatmap' | 'persona';

const VIEWS: { id: ViewMode; label: string; emoji: string }[] = [
  { id: 'graph',   label: 'Graph',   emoji: '🕸️' },
  { id: 'heatmap', label: 'Heatmap', emoji: '🔥' },
  { id: 'persona', label: 'Profil',  emoji: '👁️' },
];

const TABS: { id: EntityType; label: string; emoji: string; color: string }[] = [
  { id: 'patterns',  label: 'Patterns',  emoji: '🧩', color: 'indigo' },
  { id: 'personas',  label: 'Personas',  emoji: '👤', color: 'violet' },
  { id: 'states',    label: 'States',    emoji: '🗺️', color: 'cyan' },
  { id: 'signals',   label: 'Signals',   emoji: '⚡', color: 'amber' },
  { id: 'intents',   label: 'Intents',   emoji: '🎯', color: 'emerald' },
];

const STORAGE_KEY = 'birdpattern-studio-v1';

function load(): StudioConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StudioConfig) : DEFAULT_CONFIG;
  } catch { return DEFAULT_CONFIG; }
}

function save(cfg: StudioConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

type AnyEntity = StudioPattern | StudioPersona | StudioState | StudioSignal | StudioIntent;

function getList(cfg: StudioConfig, tab: EntityType): AnyEntity[] {
  switch (tab) {
    case 'patterns': return cfg.patterns;
    case 'personas': return cfg.personas;
    case 'states':   return cfg.states;
    case 'signals':  return cfg.signals;
    case 'intents':  return cfg.intents;
  }
}

function entityLabel(e: AnyEntity): string {
  const cast = e as { id: string; label: string; emoji?: string };
  return cast.emoji ? `${cast.emoji} ${cast.label}` : cast.label;
}

function entitySubtitle(e: AnyEntity, tab: EntityType): string {
  if (tab === 'patterns') return (e as StudioPattern).coreRule.slice(0, 70) + '…';
  if (tab === 'personas') return (e as StudioPersona).shortDesc;
  if (tab === 'states')   return (e as StudioState).description;
  if (tab === 'signals')  return `Dim ${(e as StudioSignal).dimension} · ${(e as StudioSignal).botImplication}`;
  if (tab === 'intents')  return (e as StudioIntent).description;
  return '';
}

function newEntity(tab: EntityType): AnyEntity {
  const id = `NEW-${uid()}`;
  if (tab === 'patterns') return { id, label: 'Neues Pattern', trigger: '', coreRule: '', length: 'normal', triggerSignals: [], triggerStates: [], triggerPersonas: [], triggerIntents: [] } as StudioPattern;
  if (tab === 'personas') return { id, label: 'Neue Persona', emoji: '🧑', shortDesc: '', tonality: '', color: '', detectionHints: [] } as StudioPersona;
  if (tab === 'states')   return { id, label: 'Neuer State', description: '', cluster: 'A', clusterLabel: 'Orientierung', emoji: '📍', goal: '', botFocus: '', mainPersonas: [], tools: [], transitions: [] } as StudioState;
  if (tab === 'signals')  return { id, label: 'Neues Signal', dimension: 1, dimensionLabel: 'Zeit & Druck', emoji: '⚡', detectionHints: [], botImplication: '', tone: '' } as StudioSignal;
  return { id, label: 'Neuer Intent', description: '', mainPersonas: [], cluster: 'info', preconditions: [], degradation: '', tools: [] } as StudioIntent;
}

export default function StudioPage() {
  const [cfg, setCfg] = useState<StudioConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<EntityType>('patterns');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [viewMode, setViewMode]     = useState<ViewMode>('list');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { setCfg(load()); }, []);

  const updateCfg = useCallback((next: StudioConfig) => {
    setCfg(next);
    save(next);
  }, []);

  const entities = getList(cfg, activeTab);
  const filtered = search
    ? entities.filter(e =>
        e.id.toLowerCase().includes(search.toLowerCase()) ||
        ('label' in e && (e as { label: string }).label.toLowerCase().includes(search.toLowerCase()))
      )
    : entities;

  const selected = selectedId ? entities.find(e => e.id === selectedId) ?? null : null;

  const updateSelected = (updated: AnyEntity) => {
    const list = entities.map(e => e.id === selectedId ? updated : e);
    updateCfg({ ...cfg, [activeTab]: list });
    setSelectedId(updated.id);
  };

  const addEntity = () => {
    const e = newEntity(activeTab);
    updateCfg({ ...cfg, [activeTab]: [...entities, e] });
    setSelectedId(e.id);
  };

  const deleteEntity = (id: string) => {
    updateCfg({ ...cfg, [activeTab]: entities.filter(e => e.id !== id) });
    if (selectedId === id) setSelectedId(null);
  };

  const resetToDefaults = () => {
    if (confirm('Alle Änderungen verwerfen und Standard-Config laden?')) {
      updateCfg(DEFAULT_CONFIG);
      setSelectedId(null);
    }
  };

  const copyToClipboard = async (content: string, name: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const exportFiles = buildExportFiles(cfg);

  const downloadFile = (name: string, content: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = name;
    a.click();
  };

  const downloadAll = () => {
    exportFiles.forEach(f => downloadFile(f.name, f.content));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-52 bg-[#13161f] border-r border-[#2e3348] flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-[#2e3348]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐦</span>
            <div>
              <p className="text-sm font-bold text-slate-200">Birdpattern</p>
              <p className="text-[10px] text-slate-500">Studio</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSelectedId(null); setSearch(''); setViewMode('list'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                viewMode === 'list' && activeTab === t.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>{t.emoji}</span>
              <span className="font-medium">{t.label}</span>
              <span className="ml-auto text-xs text-slate-500">{cfg[t.id].length}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-[#2e3348] mt-2 space-y-1">
            {VIEWS.map(v => (
              <button key={v.id}
                onClick={() => { setViewMode(v.id); setSelectedId(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                  viewMode === v.id
                    ? 'bg-pink-600/20 text-pink-300 border border-pink-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{v.emoji}</span>
                <span className="font-medium">{v.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="px-2 pb-3 space-y-1 border-t border-[#2e3348] pt-3">
          <button onClick={() => setShowExport(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-emerald-300 hover:bg-emerald-900/20 transition-colors">
            <Download size={14} /> <span>Exportieren</span>
          </button>
          <button onClick={resetToDefaults}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-slate-400 hover:bg-slate-800/50 transition-colors">
            <RotateCcw size={14} /> <span>Zurücksetzen</span>
          </button>
        </div>
      </aside>

      {/* ── Visualisation Views ──────────────────────────────────────── */}
      {viewMode === 'graph'   && <GraphView   cfg={cfg} />}
      {viewMode === 'heatmap' && <HeatmapView cfg={cfg} />}
      {viewMode === 'persona' && <PersonaView cfg={cfg} />}

      {/* ── Entity List ─────────────────────────────────────────────── */}
      <main className={`flex flex-col flex-1 overflow-hidden min-w-0 ${viewMode !== 'list' ? 'hidden' : ''}`}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2e3348] bg-[#0f1117]">
          <span className="text-lg">{TABS.find(t => t.id === activeTab)?.emoji}</span>
          <span className="font-semibold text-slate-200">{TABS.find(t => t.id === activeTab)?.label}</span>
          <input
            className="ml-2 flex-1 bg-[#1e2230] border border-[#2e3348] rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            placeholder="Suchen…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={addEntity} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Neu
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filtered.map(e => (
            <div
              key={e.id}
              onClick={() => setSelectedId(selectedId === e.id ? null : e.id)}
              className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                selectedId === e.id
                  ? 'bg-indigo-600/15 border-indigo-600/40'
                  : 'bg-[#1a1d2a] border-[#2e3348] hover:border-[#3e4560]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-slate-500">{e.id}</span>
                  <span className="text-sm font-medium text-slate-200 truncate">
                    {'emoji' in e ? `${(e as { emoji: string }).emoji} ` : ''}
                    {'label' in e ? (e as { label: string }).label : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{entitySubtitle(e, activeTab)}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={ev => { ev.stopPropagation(); deleteEntity(e.id); }}
                  className="p-1 rounded hover:bg-red-900/40 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
                <ChevronRight size={14} className={`text-slate-500 transition-transform ${selectedId === e.id ? 'rotate-90' : ''}`} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-slate-500 py-12 text-sm">Keine Einträge gefunden</div>
          )}
        </div>
      </main>

      {/* ── Edit Panel ──────────────────────────────────────────────── */}
      {selected && viewMode === 'list' && (
        <aside className="w-[480px] flex-shrink-0 bg-[#13161f] border-l border-[#2e3348] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e3348]">
            <div>
              <p className="text-xs text-slate-500 font-mono">{selected.id}</p>
              <p className="text-sm font-semibold text-slate-200">
                {(selected as { label: string; id: string }).label ?? (selected as { id: string }).id}
              </p>
            </div>
            <button onClick={() => setSelectedId(null)} className="btn-ghost text-xs">✕ Schließen</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'patterns' && (
              <PatternForm value={selected as StudioPattern} onChange={updateSelected} />
            )}
            {activeTab === 'personas' && (
              <PersonaForm value={selected as StudioPersona} onChange={updateSelected} />
            )}
            {activeTab === 'states' && (
              <StateForm value={selected as StudioState} onChange={updateSelected} />
            )}
            {activeTab === 'signals' && (
              <SignalForm value={selected as StudioSignal} onChange={updateSelected} />
            )}
            {activeTab === 'intents' && (
              <IntentForm value={selected as StudioIntent} onChange={updateSelected} />
            )}
          </div>

          <div className="px-4 py-3 border-t border-[#2e3348]">
            <button
              onClick={() => deleteEntity(selected.id)}
              className="btn-danger flex items-center gap-2 w-full justify-center"
            >
              <Trash2 size={13} /> Löschen
            </button>
          </div>
        </aside>
      )}

      {/* ── Export Modal ────────────────────────────────────────────── */}
      {showExport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-[#13161f] border border-[#2e3348] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e3348]">
              <h2 className="font-bold text-slate-200">📦 Export — TypeScript Dateien</h2>
              <button onClick={() => setShowExport(false)} className="btn-ghost text-xs">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-sm text-slate-400 mb-4">
                Dateien herunterladen und in <code className="text-indigo-400 text-xs">birdpattern/src/lib/</code> ablegen.
              </p>
              {exportFiles.map(f => (
                <div key={f.name} className="bg-[#1e2230] border border-[#2e3348] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-indigo-300">{f.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(f.content, f.name)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                      >
                        {copiedFile === f.name ? <><Check size={12} className="text-green-400" /> Kopiert</> : <><Copy size={12} /> Kopieren</>}
                      </button>
                      <button
                        onClick={() => downloadFile(f.name, f.content)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                      >
                        <Download size={12} /> Download
                      </button>
                    </div>
                  </div>
                  <pre className="text-xs text-slate-500 overflow-x-auto max-h-28 font-mono leading-relaxed">
                    {f.content.slice(0, 300)}…
                  </pre>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-[#2e3348] flex justify-between">
              <button onClick={() => setShowExport(false)} className="btn-ghost">Schließen</button>
              <button onClick={downloadAll} className="btn-primary flex items-center gap-2">
                <Download size={14} /> Alle herunterladen (5 Dateien)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
