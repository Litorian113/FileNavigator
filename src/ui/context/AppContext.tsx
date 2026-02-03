import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  MainKnowledgeBase, 
  ScreenData, 
  ScreenCategory, 
  SearchResult 
} from '../../shared/types';
import { KnowledgeBase } from '../../plugin/data/knowledgeBase';

// ============================================
// STATE TYPES
// ============================================

export type ViewType = 'search' | 'browse' | 'editor' | 'detail' | 'onboarding';

interface AppState {
  // Navigation
  currentView: ViewType;
  previousView: ViewType;
  
  // Data
  mainKnowledgeBase: MainKnowledgeBase | null;
  knowledgeBase: KnowledgeBase | null;
  screens: ScreenData[];
  categories: ScreenCategory[];
  
  // Editor State
  selectedNode: {
    name: string;
    sid: string;
    altText: string;
    features: string;
    linkedKnowledge: string;
    category: string;
  } | null;
  
  // Search
  searchResults: SearchResult[];
  searchQuery: string;
  aiResponse: string | null;
  
  // Detail View
  detailItem: any | null;
  
  // API
  apiKey: string;
  
  // Loading states
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SET_MAIN_KB'; payload: MainKnowledgeBase | null }
  | { type: 'SET_KNOWLEDGE_BASE'; payload: KnowledgeBase }
  | { type: 'SET_SCREENS'; payload: ScreenData[] }
  | { type: 'SET_CATEGORIES'; payload: ScreenCategory[] }
  | { type: 'SET_SELECTED_NODE'; payload: AppState['selectedNode'] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SEARCH_RESULTS'; payload: { query: string; results: SearchResult[] } }
  | { type: 'SET_AI_RESPONSE'; payload: { query: string; response: string; results: SearchResult[] } }
  | { type: 'CLEAR_AI_RESPONSE' }
  | { type: 'SET_DETAIL_ITEM'; payload: any }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

// ============================================
// INITIAL STATE
// ============================================

const initialState: AppState = {
  currentView: 'onboarding',
  previousView: 'search',
  mainKnowledgeBase: null,
  knowledgeBase: null,
  screens: [],
  categories: [],
  selectedNode: null,
  searchResults: [],
  searchQuery: '',
  aiResponse: null,
  detailItem: null,
  apiKey: '',
  isLoading: true,
};

// ============================================
// REDUCER
// ============================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return {
        ...state,
        previousView: state.currentView,
        currentView: action.payload,
      };
    
    case 'SET_MAIN_KB':
      return {
        ...state,
        mainKnowledgeBase: action.payload,
        currentView: action.payload ? 'search' : 'onboarding',
        isLoading: false,
      };
    
    case 'SET_KNOWLEDGE_BASE':
      return { ...state, knowledgeBase: action.payload };
    
    case 'SET_SCREENS':
      return { ...state, screens: action.payload };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'SET_SELECTED_NODE':
      return { ...state, selectedNode: action.payload };
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedNode: null };
    
    case 'SET_SEARCH_RESULTS':
      return { 
        ...state, 
        searchQuery: action.payload.query,
        searchResults: action.payload.results,
        aiResponse: null  // Lösche AI-Antwort bei normaler Suche
      };
    
    case 'SET_AI_RESPONSE':
      return {
        ...state,
        searchQuery: action.payload.query,
        aiResponse: action.payload.response,
        searchResults: action.payload.results
      };
    
    case 'CLEAR_AI_RESPONSE':
      return { ...state, aiResponse: null };
    
    case 'SET_DETAIL_ITEM':
      return { ...state, detailItem: action.payload };
    
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    navigateTo: (view: ViewType) => void;
    goBack: () => void;
    saveScreenData: (data: { description: string; features: string; category: string }) => void;
    saveMainKB: (kb: MainKnowledgeBase) => void;
    search: (query: string) => void;
    aiSearch: (query: string) => Promise<void>;
    zoomToSid: (sid: string) => void;
    showDetail: (item: any) => void;
    improveWithAI: (text: string, type: string) => Promise<string>;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Listen for messages from Figma plugin
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;
      
      // Store API key
      if (msg.apiKey) {
        dispatch({ type: 'SET_API_KEY', payload: msg.apiKey });
      }
      
      switch (msg.type) {
        case 'main-knowledge-base-loaded':
          dispatch({ type: 'SET_MAIN_KB', payload: msg.data });
          break;
        
        case 'knowledge-base-data':
          dispatch({ type: 'SET_KNOWLEDGE_BASE', payload: msg.data });
          if (msg.screens) dispatch({ type: 'SET_SCREENS', payload: msg.screens });
          if (msg.categories) dispatch({ type: 'SET_CATEGORIES', payload: msg.categories });
          break;
        
        case 'screens-updated':
          dispatch({ type: 'SET_SCREENS', payload: msg.screens });
          if (msg.categories) dispatch({ type: 'SET_CATEGORIES', payload: msg.categories });
          break;
        
        case 'update-data':
          dispatch({
            type: 'SET_SELECTED_NODE',
            payload: {
              name: msg.nodeName,
              sid: msg.sid,
              altText: msg.altText,
              features: msg.features,
              linkedKnowledge: msg.linkedKnowledge,
              category: msg.category,
            },
          });
          if (msg.categories) dispatch({ type: 'SET_CATEGORIES', payload: msg.categories });
          break;
        
        case 'selection-empty':
        case 'wrong-type':
          dispatch({ type: 'CLEAR_SELECTION' });
          break;
        
        case 'search-results':
          dispatch({
            type: 'SET_SEARCH_RESULTS',
            payload: { query: msg.query, results: msg.results },
          });
          break;
        
        case 'knowledge-detail':
          dispatch({ type: 'SET_DETAIL_ITEM', payload: msg.data });
          dispatch({ type: 'SET_VIEW', payload: 'detail' });
          break;
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Request initial data
    postToPlugin({ type: 'get-main-knowledge-base' });
    postToPlugin({ type: 'get-knowledge-base' });
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Actions
  const actions = {
    navigateTo: (view: ViewType) => {
      dispatch({ type: 'SET_VIEW', payload: view });
    },
    
    goBack: () => {
      dispatch({ type: 'SET_VIEW', payload: state.previousView });
    },
    
    saveScreenData: (data: { description: string; features: string; category: string }) => {
      postToPlugin({
        type: 'save-screen-data',
        description: data.description,
        features: data.features,
        category: data.category,
        linkedKnowledge: state.selectedNode?.linkedKnowledge || '',
      });
    },
    
    saveMainKB: (kb: MainKnowledgeBase) => {
      postToPlugin({ type: 'save-main-knowledge-base', data: kb });
      dispatch({ type: 'SET_MAIN_KB', payload: kb });
    },
    
    search: (query: string) => {
      dispatch({ type: 'CLEAR_AI_RESPONSE' });
      postToPlugin({ type: 'search-knowledge', query });
    },
    
    aiSearch: async (query: string) => {
      if (!state.apiKey) {
        // Fallback auf normale Suche
        postToPlugin({ type: 'search-knowledge', query });
        return;
      }
      
      // Baue Kontext aus Main KB + allen Screens
      let context = '# Projekt-Knowledge Base\n';
      if (state.mainKnowledgeBase) {
        const kb = state.mainKnowledgeBase;
        context += 'Projektname: ' + (kb.projectName || 'Unbekannt') + '\n';
        context += 'Vision: ' + (kb.vision || 'Keine Vision') + '\n';
        context += 'Zielgruppe: ' + (kb.audience || 'Keine Zielgruppe') + '\n';
        context += 'Features: ' + (kb.features || 'Keine Features') + '\n';
        context += 'Designsprache: ' + (kb.design || 'Keine Designsprache') + '\n';
        context += 'Terminologie: ' + (kb.terminology || 'Keine Terminologie') + '\n\n';
      }
      
      context += '# Dokumentierte Screens (' + state.screens.length + '):\n';
      state.screens.forEach(function(screen) {
        context += '- "' + screen.name + '" (Kategorie: ' + (screen.category || 'Keine') + '): ' + (screen.description || 'Keine Beschreibung') + '\n';
      });
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + state.apiKey
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'Du bist ein Assistent für Design-Dokumentation. Du hilfst bei der Suche in einem Figma-Projekt.\n\nAntworte auf Deutsch. Wenn du relevante Screens findest, erwähne sie mit Namen.\nWenn du Infos aus der Knowledge Base findest, erkläre sie.\n\nSei präzise und hilfreich. Wenn nichts passt, sag das ehrlich.'
              },
              { 
                role: 'user', 
                content: 'Kontext über das Projekt:\n' + context + '\n\nFrage: ' + query 
              }
            ],
            max_tokens: 500,
            temperature: 0.3
          })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
          const aiResponse = data.choices[0].message.content;
          
          // Finde relevante Ergebnisse basierend auf der AI-Antwort
          const relevantResults: SearchResult[] = [];
          const lowerResponse = aiResponse.toLowerCase();
          const lowerQuery = query.toLowerCase();
          
          // Keywords für Knowledge-Base-Bereiche
          const kbKeywords: Record<string, string[]> = {
            'vision': ['vision', 'ziel des projekts', 'mission', 'zweck', 'wofür'],
            'audience': ['zielgruppe', 'nutzer', 'user', 'publikum', 'wer nutzt', 'für wen'],
            'features': ['feature', 'funktion', 'was kann', 'funktionalität', 'module'],
            'design': ['design', 'farbe', 'farben', 'typografie', 'schrift', 'visual', 'stil', 'color', 'spacing', 'ui'],
            'terminology': ['terminologie', 'begriffe', 'glossar', 'definition', 'was bedeutet', 'wording']
          };
          
          const kbNames: Record<string, string> = {
            'vision': 'Projekt & Vision',
            'audience': 'Zielgruppe',
            'features': 'Kernfeatures',
            'design': 'Designsprache',
            'terminology': 'Terminologie'
          };
          
          // Finde relevante KB-Bereiche
          if (state.mainKnowledgeBase) {
            const kb = state.mainKnowledgeBase;
            Object.keys(kbKeywords).forEach(function(kbId) {
              const keywords = kbKeywords[kbId];
              const hasMatch = keywords.some(function(kw) {
                return lowerResponse.includes(kw) || lowerQuery.includes(kw);
              });
              
              // Prüfe ob dieser Bereich Inhalt hat
              const kbContent = (kb as any)[kbId];
              if (hasMatch && kbContent) {
                relevantResults.push({
                  type: 'project',
                  id: kbId,
                  title: kbNames[kbId],
                  snippet: kbContent.substring(0, 150) + (kbContent.length > 150 ? '...' : ''),
                  tags: [kb.projectName || 'Projekt'],
                  // Speichere den vollständigen Inhalt für die DetailView
                  content: kbContent
                } as SearchResult);
              }
            });
          }
          
          // Finde relevante Screens
          state.screens.forEach(function(screen) {
            const screenNameLower = screen.name.toLowerCase();
            const screenWords = screenNameLower.split(/[-_\s]+/);
            
            // Prüfe ob Screen-Name oder wichtige Wörter in der Antwort vorkommen
            const matchesName = lowerResponse.includes(screenNameLower);
            const matchesWords = screenWords.some(function(word) {
              return word.length > 3 && lowerResponse.includes(word);
            });
            const matchesCategory = screen.category && lowerResponse.includes(screen.category.toLowerCase());
            
            if (matchesName || matchesWords || matchesCategory) {
              relevantResults.push({
                type: 'screen',
                id: screen.sid,
                sid: screen.sid,
                title: screen.name,
                snippet: screen.description || '',
                tags: screen.features ? screen.features.split(',').map(function(f) { return f.trim(); }) : [],
                category: screen.category
              });
            }
          });
          
          dispatch({
            type: 'SET_AI_RESPONSE',
            payload: { query: query, response: aiResponse, results: relevantResults }
          });
        } else {
          // Fallback auf normale Suche
          postToPlugin({ type: 'search-knowledge', query });
        }
      } catch (error) {
        console.error('AI search failed:', error);
        // Fallback auf normale Suche
        postToPlugin({ type: 'search-knowledge', query });
      }
    },
    
    zoomToSid: (sid: string) => {
      postToPlugin({ type: 'zoom-to-sid', sid });
    },
    
    showDetail: (item: any) => {
      dispatch({ type: 'SET_DETAIL_ITEM', payload: item });
      dispatch({ type: 'SET_VIEW', payload: 'detail' });
    },
    
    improveWithAI: async (text: string, type: string): Promise<string> => {
      if (!state.apiKey) {
        throw new Error('Kein API Key verfügbar');
      }
      
      const prompts: Record<string, string> = {
        vision: `Verbessere und strukturiere diese Produkt-Vision. Mache sie prägnant, klar und inspirierend. Korrigiere Rechtschreibfehler. Antworte nur mit dem verbesserten Text, ohne Einleitung:\n\n${text}`,
        audience: `Verbessere diese Zielgruppen-Beschreibung. Mache sie präziser und strukturierter. Korrigiere Rechtschreibfehler. Antworte nur mit dem verbesserten Text:\n\n${text}`,
        features: `Strukturiere diese Feature-Liste als saubere Aufzählung mit • am Anfang jeder Zeile. Gruppiere ähnliche Features. Korrigiere Rechtschreibfehler. Antworte nur mit der strukturierten Liste:\n\n${text}`,
        design: `Verbessere diese Design-Beschreibung. Mache sie präziser und professioneller. Korrigiere Rechtschreibfehler. Antworte nur mit dem verbesserten Text:\n\n${text}`,
        terms: `Strukturiere dieses Glossar als saubere Liste im Format "• Begriff = Definition". Korrigiere Rechtschreibfehler. Antworte nur mit der strukturierten Liste:\n\n${text}`,
        description: `Du bist ein UX Writer. Verbessere diese Screen-Beschreibung für Dokumentationszwecke. Projekt: ${state.mainKnowledgeBase?.projectName || 'Unbekannt'}. Mache die Beschreibung klar, präzise und hilfreich für andere Designer. Antworte nur mit dem verbesserten Text:\n\n${text}`,
      };
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Du bist ein hilfreicher Assistent für UX-Dokumentation. Antworte immer auf Deutsch.' },
            { role: 'user', content: prompts[type] || prompts.description },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });
      
      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        return data.choices[0].message.content.trim();
      }
      
      throw new Error('AI request failed');
    },
  };
  
  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// ============================================
// HELPERS
// ============================================

function postToPlugin(message: any) {
  parent.postMessage({ pluginMessage: message }, '*');
}
