export interface StudioPattern {
  id: string;
  label: string;
  trigger: string;
  coreRule: string;
  length: 'kurz' | 'mittel' | 'normal' | 'bullet-liste';
  triggerSignals: string[];
  triggerStates: string[];
  triggerPersonas: string[];
  triggerIntents: string[];
}

export interface StudioPersona {
  id: string;
  label: string;
  emoji: string;
  shortDesc: string;
  tonality: string;
  color: string;
  detectionHints: string[];
}

export interface StudioState {
  id: string;
  label: string;
  description: string;
  cluster: 'A' | 'B' | 'C';
  clusterLabel: string;
  emoji: string;
  goal: string;
  botFocus: string;
  mainPersonas: string[];
  tools: string[];
  transitions: string[];
}

export interface StudioSignal {
  id: string;
  label: string;
  dimension: number;
  dimensionLabel: string;
  emoji: string;
  detectionHints: string[];
  botImplication: string;
  tone: string;
}

export interface StudioIntent {
  id: string;
  label: string;
  description: string;
  mainPersonas: string[];
  cluster: string;
  preconditions: string[];
  degradation: string;
  tools: string[];
}

export type EntityType = 'patterns' | 'personas' | 'states' | 'signals' | 'intents';

export interface StudioConfig {
  patterns: StudioPattern[];
  personas: StudioPersona[];
  states: StudioState[];
  signals: StudioSignal[];
  intents: StudioIntent[];
}
