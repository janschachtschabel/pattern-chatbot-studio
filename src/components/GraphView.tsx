'use client';
import { useState, useRef, useCallback } from 'react';
import type { StudioConfig } from '@/lib/types';

/* ─── Layout constants ─────────────────────────────────────────────────────── */
const NW = 168;   // node width
const NH = 34;    // node height
const PAD_TOP = 72;
const PAD_BOT = 48;

const COL: Record<string, number> = {
  persona:  40,
  signal:  290,
  pattern: 610,
  state:   930,
  intent: 1200,
};
const CANVAS_W = 1430;

/* ─── Colors ────────────────────────────────────────────────────────────────── */
type NodeType = 'persona' | 'signal' | 'pattern' | 'state' | 'intent';

const C: Record<NodeType, { bg: string; border: string; text: string; label: string }> = {
  persona: { bg: '#160d2a', border: '#7c3aed', text: '#c4b5fd', label: 'Personas'  },
  signal:  { bg: '#1c1408', border: '#d97706', text: '#fbbf24', label: 'Signals'   },
  pattern: { bg: '#101828', border: '#4338ca', text: '#a5b4fc', label: 'Patterns'  },
  state:   { bg: '#081c22', border: '#0891b2', text: '#22d3ee', label: 'States'    },
  intent:  { bg: '#081a10', border: '#059669', text: '#34d399', label: 'Intents'   },
};

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface GNode { id: string; label: string; emoji: string; type: NodeType; x: number; y: number; }
interface GEdge { id: string; sx: number; sy: number; tx: number; ty: number; type: NodeType; patternId: string; sourceId: string; targetId: string; }

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function spreadY(count: number, canvasH: number): number[] {
  if (count <= 1) return [canvasH / 2 - NH / 2];
  const span = canvasH - PAD_TOP - PAD_BOT - NH;
  return Array.from({ length: count }, (_, i) => PAD_TOP + (i / (count - 1)) * span);
}

function buildGraph(cfg: StudioConfig) {
  const maxN = Math.max(cfg.personas.length, cfg.signals.length, cfg.patterns.length, cfg.states.length, cfg.intents.length);
  const canvasH = Math.max(900, PAD_TOP + (maxN - 1) * 64 + PAD_BOT + NH);

  const nodes: GNode[] = [];
  const add = (items: { id: string; label: string; emoji?: string }[], type: NodeType) => {
    spreadY(items.length, canvasH).forEach((y, i) => {
      nodes.push({ id: items[i].id, label: items[i].label, emoji: items[i].emoji ?? '', type, x: COL[type], y });
    });
  };
  add(cfg.personas, 'persona');
  add(cfg.signals,  'signal');
  add(cfg.patterns, 'pattern');
  add(cfg.states,   'state');
  add(cfg.intents,  'intent');

  const map = new Map(nodes.map(n => [n.id, n]));
  const edges: GEdge[] = [];

  const link = (a: GNode, b: GNode, type: NodeType, pid: string) => {
    const leftToRight = a.x < b.x;
    edges.push({
      id: `${a.id}→${b.id}`,
      sx: leftToRight ? a.x + NW : a.x,
      sy: a.y + NH / 2,
      tx: leftToRight ? b.x     : b.x + NW,
      ty: b.y + NH / 2,
      type, patternId: pid,
      sourceId: a.id, targetId: b.id,
    });
  };

  cfg.patterns.forEach(p => {
    const pat = map.get(p.id);
    if (!pat) return;
    p.triggerPersonas.forEach(id => { const n = map.get(id); if (n) link(n, pat, 'persona', p.id); });
    p.triggerSignals.forEach (id => { const n = map.get(id); if (n) link(n, pat, 'signal',  p.id); });
    p.triggerStates.forEach  (id => { const n = map.get(id); if (n) link(pat, n, 'state',   p.id); });
    p.triggerIntents.forEach (id => { const n = map.get(id); if (n) link(pat, n, 'intent',  p.id); });
  });

  return { nodes, edges, canvasH, nodeMap: map };
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function GraphView({ cfg }: { cfg: StudioConfig }) {
  const [pan, setPan]   = useState({ x: 30, y: 20 });
  const [zoom, setZoom] = useState(0.72);
  const [sel, setSel]   = useState<string | null>(null);

  const dragging = useRef(false);
  const last     = useRef({ x: 0, y: 0 });

  const { nodes, edges, canvasH, nodeMap } = buildGraph(cfg);

  /* ─ Pan / zoom ── */
  const onDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as Element).closest('[data-node]')) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPan(p => ({ x: p.x + e.clientX - last.current.x, y: p.y + e.clientY - last.current.y }));
    last.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onUp   = useCallback(() => { dragging.current = false; }, []);
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.18, Math.min(2.8, z * (e.deltaY > 0 ? 0.92 : 1.09))));
  }, []);

  /* ─ Highlight ── */
  const connected = new Set<string>();
  const isPatternSel = sel ? cfg.patterns.some(p => p.id === sel) : false;

  if (sel) {
    connected.add(sel);
    if (isPatternSel) {
      // Pattern selected: highlight all nodes it connects to
      const pat = cfg.patterns.find(p => p.id === sel)!;
      [...pat.triggerPersonas, ...pat.triggerSignals, ...pat.triggerStates, ...pat.triggerIntents]
        .forEach(id => connected.add(id));
    } else {
      // Non-pattern (persona/signal/state/intent): only the patterns directly referencing it
      cfg.patterns.forEach(p => {
        const refs = [...p.triggerPersonas, ...p.triggerSignals, ...p.triggerStates, ...p.triggerIntents];
        if (refs.includes(sel)) connected.add(p.id);
      });
    }
  }

  const hiNode = (id: string) => !sel || connected.has(id);
  // Edge highlight: if pattern selected → all edges of that pattern;
  //                 if non-pattern selected → only edges directly touching the selected node
  const hiEdge = (e: GEdge) => {
    if (!sel) return true;
    if (isPatternSel) return e.patternId === sel;
    return e.sourceId === sel || e.targetId === sel;
  };

  const selNode = sel ? nodeMap.get(sel) : null;

  return (
    <div className="flex-1 relative overflow-hidden bg-[#07090f] select-none"
      style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onWheel={onWheel}
    >
      {/* ── dot-grid bg ─────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="#1e2436" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* ── Zoom controls ───── */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-20 pointer-events-auto">
        {[['−', -0.15], ['+', 0.15]].map(([sym, d]) => (
          <button key={String(sym)}
            onMouseDown={e => e.stopPropagation()}
            onClick={() => setZoom(z => Math.max(0.18, Math.min(2.8, z + (d as number))))}
            className="w-7 h-7 flex items-center justify-center bg-[#1e2230] border border-[#2e3348] rounded text-slate-400 hover:text-slate-200 text-sm">
            {sym}
          </button>
        ))}
        <span className="px-2 h-7 flex items-center text-xs bg-[#1e2230] border border-[#2e3348] rounded text-slate-500">
          {Math.round(zoom * 100)}%
        </span>
        <button onMouseDown={e => e.stopPropagation()}
          onClick={() => { setZoom(0.72); setPan({ x: 30, y: 20 }); setSel(null); }}
          className="px-2 h-7 bg-[#1e2230] border border-[#2e3348] rounded text-xs text-slate-400 hover:text-slate-200">
          Reset
        </button>
      </div>

      {/* ── Selection info bar ── */}
      {selNode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-3 px-3 py-1.5 bg-[#1a1d2e]/90 border border-[#3e4560] rounded-full backdrop-blur-sm">
          <span className="text-xs font-mono" style={{ color: C[selNode.type].text }}>{selNode.id}</span>
          <span className="text-sm text-slate-200">{selNode.emoji} {selNode.label}</span>
          <span className="text-xs text-slate-500">{connected.size - 1} Verbindungen</span>
          <button onClick={() => setSel(null)} className="text-slate-500 hover:text-slate-300 text-sm ml-1">✕</button>
        </div>
      )}

      {/* ── Legend ──────────── */}
      <div className="absolute bottom-3 left-3 z-20 flex gap-3 flex-wrap pointer-events-none">
        {(Object.entries(C) as [NodeType, typeof C[NodeType]][]).map(([type, c]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border" style={{ background: c.bg, borderColor: c.border }} />
            <span className="text-xs text-slate-500">{c.label} ({cfg[`${type}s` as keyof StudioConfig].length})</span>
          </div>
        ))}
        <span className="text-xs text-slate-600 ml-2">Scroll = Zoom · Drag = Pan · Klick = Highlight</span>
      </div>

      {/* ── Canvas ──────────── */}
      <div className="absolute" style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
        <svg width={CANVAS_W} height={canvasH} style={{ overflow: 'visible' }}>

          {/* Column header bands */}
          {(Object.entries(COL) as [NodeType, number][]).map(([type, cx]) => (
            <g key={type}>
              <rect x={cx} y={8} width={NW} height={26} rx={5}
                fill={C[type].bg} stroke={C[type].border} strokeWidth={1.5} opacity={0.9} />
              <text x={cx + NW / 2} y={26} textAnchor="middle"
                fontSize={12} fontWeight={700} fill={C[type].text} fontFamily="system-ui">
                {C[type].label}
              </text>
              {/* vertical guide line */}
              <line x1={cx + NW / 2} y1={38} x2={cx + NW / 2} y2={canvasH - 10}
                stroke={C[type].border} strokeWidth={1} strokeDasharray="2,8" opacity={0.15} />
            </g>
          ))}

          {/* ── Edges ── */}
          {edges.map(e => {
            const hi = hiEdge(e);
            const mx = (e.sx + e.tx) / 2;
            return (
              <path key={e.id}
                d={`M${e.sx},${e.sy} C${mx},${e.sy} ${mx},${e.ty} ${e.tx},${e.ty}`}
                fill="none"
                stroke={C[e.type].border}
                strokeWidth={hi ? 1.5 : 0.6}
                opacity={sel ? (hi ? 0.65 : 0.04) : 0.13}
                style={{ transition: 'opacity 0.12s, stroke-width 0.12s' }}
              />
            );
          })}

          {/* ── Nodes ── */}
          {nodes.map(n => {
            const hi = hiNode(n.id);
            const isSel = n.id === sel;
            const c = C[n.type];
            const lbl = (n.emoji ? n.emoji + ' ' : '') + (n.label.length > 16 ? n.label.slice(0, 15) + '…' : n.label);
            return (
              <g key={n.id} data-node="1"
                transform={`translate(${n.x},${n.y})`}
                onClick={e => { e.stopPropagation(); setSel(isSel ? null : n.id); }}
                style={{ cursor: 'pointer', opacity: sel ? (hi ? 1 : 0.22) : 1, transition: 'opacity 0.12s' }}
              >
                <rect width={NW} height={NH} rx={5}
                  fill={c.bg}
                  stroke={isSel ? '#ffffff' : c.border}
                  strokeWidth={isSel ? 2.5 : (hi ? 1.5 : 1)} />
                {/* label */}
                <text x={9} y={NH / 2 + 5} fontSize={12} fill={hi ? '#e2e8f0' : '#475569'} fontFamily="system-ui">
                  {lbl}
                </text>
                {/* ID badge top-right */}
                <text x={NW - 5} y={11} fontSize={8} textAnchor="end"
                  fill={c.text} fontFamily="monospace" opacity={hi ? 0.75 : 0.3}>
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
