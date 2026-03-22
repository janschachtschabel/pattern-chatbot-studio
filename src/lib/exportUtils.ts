import type { StudioConfig } from './types';

function arr(a: string[]): string {
  return `[${a.map(s => `'${s.replace(/'/g, "\\'")}'`).join(', ')}]`;
}

function str(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

export function exportPatterns(cfg: StudioConfig): string {
  const lines = cfg.patterns.map(p =>
    `  {\n` +
    `    id: ${str(p.id)}, label: ${str(p.label)},\n` +
    `    trigger: ${str(p.trigger)},\n` +
    `    coreRule: ${str(p.coreRule)},\n` +
    `    length: ${str(p.length)},\n` +
    `    triggerSignals:  ${arr(p.triggerSignals)},\n` +
    `    triggerStates:   ${arr(p.triggerStates)},\n` +
    `    triggerPersonas: ${arr(p.triggerPersonas)},\n` +
    `    triggerIntents:  ${arr(p.triggerIntents)},\n` +
    `  }`
  ).join(',\n');

  return `import type { Pattern } from './types';\n\nexport const PATTERNS: Pattern[] = [\n${lines}\n];\n\nexport const PATTERN_IDS = PATTERNS.map(p => p.id);\n\nexport function getPattern(id: string): Pattern | undefined {\n  return PATTERNS.find(p => p.id === id);\n}\n\nexport function scorePatternsForContext(\n  personaId: string,\n  signals: string[],\n  stateId: string,\n  intentId?: string,\n  dominantSignal?: string\n): Pattern[] {\n  return PATTERNS\n    .map(p => {\n      let score = 0;\n      if (intentId && p.triggerIntents.includes(intentId)) score += 4;\n      if (p.triggerPersonas.includes(personaId)) score += 3;\n      if (p.triggerStates.includes(stateId)) score += 3;\n      signals.forEach(s => {\n        if (p.triggerSignals.includes(s)) {\n          score += s === dominantSignal ? 3 : 2;\n        }\n      });\n      return { pattern: p, score };\n    })\n    .sort((a, b) => b.score - a.score)\n    .slice(0, 5)\n    .map(x => x.pattern);\n}\n`;
}

export function exportPersonas(cfg: StudioConfig): string {
  const lines = cfg.personas.map(p =>
    `  {\n` +
    `    id: ${str(p.id)}, label: ${str(p.label)}, emoji: ${str(p.emoji)},\n` +
    `    shortDesc: ${str(p.shortDesc)},\n` +
    `    tonality: ${str(p.tonality)},\n` +
    `    color: ${str(p.color)},\n` +
    `    detectionHints: ${arr(p.detectionHints)},\n` +
    `  }`
  ).join(',\n');

  const ids = arr(cfg.personas.map(p => p.id));
  return `import type { Persona } from './types';\n\nexport const PERSONA_IDS = ${ids} as const;\nexport type PersonaId = typeof PERSONA_IDS[number];\n\nexport const PERSONA_MD_FILES: Record<string, string> = {\n${cfg.personas.filter(p => p.id !== 'P-AND').map(p => `  '${p.id}': 'personas/${p.id.toLowerCase().replace('p-', '')}.md'`).join(',\n')}\n};\n\nexport const PERSONAS: Persona[] = [\n${lines}\n];\n`;
}

export function exportIntents(cfg: StudioConfig): string {
  const lines = cfg.intents.map(i =>
    `  {\n` +
    `    id: ${str(i.id)}, label: ${str(i.label)},\n` +
    `    description: ${str(i.description)},\n` +
    `    mainPersonas: ${arr(i.mainPersonas)},\n` +
    `    cluster: ${str(i.cluster)},\n` +
    `    preconditions: ${arr(i.preconditions)},\n` +
    `    degradation: ${str(i.degradation)},\n` +
    `    tools: ${arr(i.tools)},\n` +
    `  }`
  ).join(',\n');

  return `import type { Intent } from './types';\n\nexport const INTENTS: Intent[] = [\n${lines}\n];\n\nexport const INTENT_IDS = INTENTS.map(i => i.id);\n\nexport function getIntent(id: string): Intent | undefined {\n  return INTENTS.find(i => i.id === id);\n}\n\nexport function getIntentsForPersona(personaId: string): Intent[] {\n  return INTENTS.filter(i => i.mainPersonas.includes(personaId));\n}\n`;
}

export function exportStates(cfg: StudioConfig): string {
  const lines = cfg.states.map(s =>
    `  {\n` +
    `    id: ${str(s.id)}, label: ${str(s.label)},\n` +
    `    description: ${str(s.description)},\n` +
    `    cluster: ${str(s.cluster)}, clusterLabel: ${str(s.clusterLabel)}, emoji: ${str(s.emoji)},\n` +
    `    goal: ${str(s.goal)},\n` +
    `    botFocus: ${str(s.botFocus)},\n` +
    `    mainPersonas: ${arr(s.mainPersonas)},\n` +
    `    tools: ${arr(s.tools)},\n` +
    `    transitions: ${arr(s.transitions)},\n` +
    `  }`
  ).join(',\n');

  return `import type { ConvState } from './types';\n\nexport const CONV_STATES: ConvState[] = [\n${lines}\n];\n\nexport const STATE_IDS = CONV_STATES.map(s => s.id);\nexport const CLUSTER_A = CONV_STATES.filter(s => s.cluster === 'A');\nexport const CLUSTER_B = CONV_STATES.filter(s => s.cluster === 'B');\nexport const CLUSTER_C = CONV_STATES.filter(s => s.cluster === 'C');\n\nexport function getState(id: string): ConvState | undefined {\n  return CONV_STATES.find(s => s.id === id);\n}\n`;
}

export function exportSignals(cfg: StudioConfig): string {
  const lines = cfg.signals.map(s =>
    `  {\n` +
    `    id: ${str(s.id)}, label: ${str(s.label)}, dimension: ${s.dimension},\n` +
    `    dimensionLabel: ${str(s.dimensionLabel)}, emoji: ${str(s.emoji)},\n` +
    `    detectionHints: ${arr(s.detectionHints)},\n` +
    `    botImplication: ${str(s.botImplication)},\n` +
    `    tone: ${str(s.tone)},\n` +
    `  }`
  ).join(',\n');

  return `import type { Signal } from './types';\n\nexport const SIGNALS: Signal[] = [\n${lines}\n];\n\nexport const SIGNAL_IDS = SIGNALS.map(s => s.id);\n\nexport const SIGNALS_BY_DIMENSION: Record<number, Signal[]> = {\n  1: SIGNALS.filter(s => s.dimension === 1),\n  2: SIGNALS.filter(s => s.dimension === 2),\n  3: SIGNALS.filter(s => s.dimension === 3),\n  4: SIGNALS.filter(s => s.dimension === 4),\n};\n\nexport const DIM_LABELS: Record<number, string> = {\n  1: 'Zeit & Druck',\n  2: 'Sicherheit & Kompetenz',\n  3: 'Haltung & Motivation',\n  4: 'Kontext & Nutzung',\n};\n\nexport function getSignal(id: string): Signal | undefined {\n  return SIGNALS.find(s => s.id === id);\n}\n`;
}

export interface ExportFile {
  name: string;
  content: string;
}

export function buildExportFiles(cfg: StudioConfig): ExportFile[] {
  return [
    { name: 'patterns.ts',  content: exportPatterns(cfg) },
    { name: 'personas.ts',  content: exportPersonas(cfg) },
    { name: 'intents.ts',   content: exportIntents(cfg) },
    { name: 'states.ts',    content: exportStates(cfg) },
    { name: 'signals.ts',   content: exportSignals(cfg) },
  ];
}
