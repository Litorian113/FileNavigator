// Shared types between Plugin and UI

export interface MainKnowledgeBase {
  projectName: string;
  vision: string;
  audience: string;
  features: string;
  design: string;
  terminology: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenData {
  sid: string;
  name: string;
  description: string;
  features: string;
  category: string;
  nodeId: string;
}

export interface ScreenCategory {
  id: string;
  label: string;
  icon: string;
}

export interface SearchResult {
  type: 'project' | 'screen' | 'knowledge' | 'glossary';
  id: string;
  title: string;
  snippet: string;
  tags: string[];
  sid?: string;
  score?: number;
  category?: string;
  content?: string;  // Vollständiger Inhalt für DetailView
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: Record<string, unknown>;
  tags: string[];
}

export interface GlossaryItem {
  term: string;
  definition: string;
  specs: string;
}

// Message types from UI to Plugin
export type PluginMessage =
  | { type: 'get-main-knowledge-base' }
  | { type: 'save-main-knowledge-base'; data: MainKnowledgeBase }
  | { type: 'save-alt-text'; altText: string }
  | { type: 'save-screen-data'; description: string; features: string; linkedKnowledge: string; category: string }
  | { type: 'search-frames'; query: string }
  | { type: 'search-knowledge'; query: string }
  | { type: 'zoom-to-sid'; sid: string }
  | { type: 'get-knowledge-base' }
  | { type: 'get-knowledge-detail'; id: string }
  | { type: 'get-all-screens' }
  | { type: 'get-image-for-ai' }
  | { type: 'collect-all-frames'; query: string }
  | { type: 'cancel' };

// Message types from Plugin to UI
export type UIMessage =
  | { type: 'main-knowledge-base-loaded'; data: MainKnowledgeBase | null; apiKey: string }
  | { type: 'main-knowledge-base-saved'; data: MainKnowledgeBase; apiKey: string }
  | { type: 'selection-empty'; apiKey: string }
  | { type: 'wrong-type'; apiKey: string }
  | { type: 'update-data'; altText: string; sid: string; nodeName: string; features: string; linkedKnowledge: string; category: string; categories: ScreenCategory[]; apiKey: string }
  | { type: 'search-results'; query: string; results: SearchResult[] }
  | { type: 'knowledge-base-data'; data: unknown; screens: ScreenData[]; categories: ScreenCategory[] }
  | { type: 'knowledge-detail'; data: KnowledgeItem }
  | { type: 'screens-updated'; screens: ScreenData[]; categories: ScreenCategory[] }
  | { type: 'all-screens-data'; screens: ScreenData[] }
  | { type: 'search-data-response'; data: Array<{ sid: string; name: string; description: string }>; query: string }
  | { type: 'image-data'; bytes: Uint8Array }
  | { type: 'image-error' };
