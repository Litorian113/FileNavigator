import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  MainKnowledgeBase, 
  ScreenData, 
  ScreenCategory, 
  SearchResult,
  KBSynthesisResult 
} from '../../shared/types';
import { KnowledgeBase } from '../../plugin/data/knowledgeBase';

// ============================================
// STATE TYPES
// ============================================

export type ViewType = 'search' | 'browse' | 'editor' | 'detail' | 'onboarding' | 'project';

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
  
  // Knowledge Synthesis
  isSynthesizing: boolean;
  lastSynthesisResult: KBSynthesisResult | null;
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
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNTHESIZING'; payload: boolean }
  | { type: 'SET_SYNTHESIS_RESULT'; payload: KBSynthesisResult | null };

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
  isSynthesizing: false,
  lastSynthesisResult: null,
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
        aiResponse: null  // Clear AI response on normal search
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
    
    case 'SET_SYNTHESIZING':
      return { ...state, isSynthesizing: action.payload };
    
    case 'SET_SYNTHESIS_RESULT':
      return { ...state, lastSynthesisResult: action.payload };
    
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
    deleteScreen: (sid: string) => void;
    saveMainKB: (kb: MainKnowledgeBase) => void;
    synthesizeKnowledge: (screenName: string, screenData: { description: string; features: string; category: string }) => Promise<void>;
    dismissSynthesisResult: () => void;
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
      
      // Trigger Knowledge Synthesis in background
      if (state.mainKnowledgeBase && state.apiKey && state.selectedNode) {
        actions.synthesizeKnowledge(state.selectedNode.name, data);
      }
    },
    
    deleteScreen: (sid: string) => {
      postToPlugin({
        type: 'delete-screen-data',
        sid: sid,
      });
    },
    
    saveMainKB: (kb: MainKnowledgeBase) => {
      postToPlugin({ type: 'save-main-knowledge-base', data: kb });
      dispatch({ type: 'SET_MAIN_KB', payload: kb });
    },
    
    synthesizeKnowledge: async (screenName: string, screenData: { description: string; features: string; category: string }) => {
      const kb = state.mainKnowledgeBase;
      if (!kb || !state.apiKey) return;
      
      dispatch({ type: 'SET_SYNTHESIZING', payload: true });
      dispatch({ type: 'SET_SYNTHESIS_RESULT', payload: null });
      
      try {
        const prompt = `You are a Knowledge Base Manager for a design project.

CURRENT PROJECT KNOWLEDGE BASE:
- Project: ${kb.projectName}
- Vision: ${kb.vision || 'Not defined'}
- Target Audience: ${kb.audience || 'Not defined'}
- Features: ${kb.features || 'Not defined'}
- Design Language: ${kb.design || 'Not defined'}
- Terminology: ${kb.terminology || 'Not defined'}
${kb.learnedInsights?.length ? '- Previous Insights: ' + kb.learnedInsights.join('; ') : ''}

NEW COMPONENT DOCUMENTED:
- Name: "${screenName}"
- Category: ${screenData.category}
- Description: ${screenData.description}
- Features: ${screenData.features}

TASK: Check if the new component contains information that should be added to the main knowledge base.

Respond ONLY with a valid JSON object (no markdown, no explanation around it):
{
  "shouldUpdate": true/false,
  "reason": "Brief explanation why update is needed/not needed",
  "newInsight": "A brief insight that was learned (or null)",
  "updatedFields": {
    "features": "Only if new features discovered - then the COMPLETE updated feature list, otherwise omit",
    "design": "Only if new design patterns discovered - then the COMPLETE updated design description, otherwise omit",
    "terminology": "Only if new terms discovered - then the COMPLETE updated terminology, otherwise omit"
  }
}

RULES:
- shouldUpdate = true ONLY if truly relevant new info was discovered
- Ignore trivial or redundant info
- For updates: Keep existing info and ADD new ones
- Vision and Target Audience are NOT changed (only in onboarding)
- Change max 1-2 fields per update`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a precise Knowledge Base Manager. Respond ONLY with valid JSON.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 1000,
            temperature: 0.2,
          }),
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
          let content = data.choices[0].message.content.trim();
          // Remove potential Markdown code blocks
          content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
          
          const result: KBSynthesisResult = JSON.parse(content);
          
          if (result.shouldUpdate && Object.keys(result.updatedFields).length > 0) {
            // Update the Main KB
            const updatedKB: MainKnowledgeBase = {
              ...kb,
              ...result.updatedFields,
              updatedAt: new Date().toISOString(),
              learnedInsights: [
                ...(kb.learnedInsights || []),
                ...(result.newInsight ? [result.newInsight] : []),
              ].slice(-20), // Keep max 20 insights
              contributingScreens: (kb.contributingScreens || 0) + 1,
            };
            
            // Save KB
            postToPlugin({ type: 'save-main-knowledge-base', data: updatedKB });
            dispatch({ type: 'SET_MAIN_KB', payload: updatedKB });
            dispatch({ type: 'SET_SYNTHESIS_RESULT', payload: result });
          } else {
            dispatch({ type: 'SET_SYNTHESIS_RESULT', payload: { shouldUpdate: false, updatedFields: {}, reason: result.reason || 'No relevant new information.' } });
          }
        }
      } catch (error) {
        console.error('Knowledge synthesis failed:', error);
      } finally {
        dispatch({ type: 'SET_SYNTHESIZING', payload: false });
      }
    },
    
    dismissSynthesisResult: () => {
      dispatch({ type: 'SET_SYNTHESIS_RESULT', payload: null });
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
      
      // Build context from Main KB + all components
      let context = '# Project Knowledge Base\n';
      if (state.mainKnowledgeBase) {
        const kb = state.mainKnowledgeBase;
        context += 'Project name: ' + (kb.projectName || 'Unknown') + '\n';
        context += 'Vision: ' + (kb.vision || 'No vision') + '\n';
        context += 'Target audience: ' + (kb.audience || 'No target audience') + '\n';
        context += 'Features: ' + (kb.features || 'No features') + '\n';
        context += 'Design language: ' + (kb.design || 'No design language') + '\n';
        context += 'Terminology: ' + (kb.terminology || 'No terminology') + '\n\n';
      }
      
      context += '# Documented Components (' + state.screens.length + '):\n';
      state.screens.forEach(function(screen) {
        context += '- "' + screen.name + '" (Category: ' + (screen.category || 'None') + '): ' + (screen.description || 'No description') + '\n';
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
                content: 'You are an assistant for design documentation. You help with searching in a Figma project.\n\nRespond in English. If you find relevant components, mention them by name.\nIf you find info from the Knowledge Base, explain it.\n\nBe precise and helpful. If nothing matches, say so honestly.'
              },
              { 
                role: 'user', 
                content: 'Context about the project:\n' + context + '\n\nQuestion: ' + query 
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
          
          // Keywords for Knowledge Base areas
          const kbKeywords: Record<string, string[]> = {
            'vision': ['vision', 'project goal', 'mission', 'purpose', 'what for'],
            'audience': ['target audience', 'users', 'user', 'audience', 'who uses', 'for whom'],
            'features': ['feature', 'function', 'what can', 'functionality', 'modules'],
            'design': ['design', 'color', 'colors', 'typography', 'font', 'visual', 'style', 'spacing', 'ui'],
            'terminology': ['terminology', 'terms', 'glossary', 'definition', 'what means', 'wording']
          };
          
          const kbNames: Record<string, string> = {
            'vision': 'Project & Vision',
            'audience': 'Target Audience',
            'features': 'Core Features',
            'design': 'Design Language',
            'terminology': 'Terminology'
          };
          
          // Find relevant KB areas
          if (state.mainKnowledgeBase) {
            const kb = state.mainKnowledgeBase;
            Object.keys(kbKeywords).forEach(function(kbId) {
              const keywords = kbKeywords[kbId];
              const hasMatch = keywords.some(function(kw) {
                return lowerResponse.includes(kw) || lowerQuery.includes(kw);
              });
              
              // Check if this area has content
              const kbContent = (kb as any)[kbId];
              if (hasMatch && kbContent) {
                relevantResults.push({
                  type: 'project',
                  id: kbId,
                  title: kbNames[kbId],
                  snippet: kbContent.substring(0, 150) + (kbContent.length > 150 ? '...' : ''),
                  tags: [kb.projectName || 'Project'],
                  // Store full content for DetailView
                  content: kbContent
                } as SearchResult);
              }
            });
          }
          
          // Find relevant components
          state.screens.forEach(function(screen) {
            const screenNameLower = screen.name.toLowerCase();
            const screenWords = screenNameLower.split(/[-_\s]+/);
            
            // Check if component name or important words appear in the response
            const matchesName = lowerResponse.includes(screenNameLower);
            const matchesWords = screenWords.some(function(word) {
              return word.length > 3 && lowerResponse.includes(word);
            });
            const matchesCategory = screen.category && lowerResponse.includes(screen.category.toLowerCase());
            
            if (matchesName || matchesWords || matchesCategory) {
              relevantResults.push({
                type: 'component',
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
        throw new Error('No API key available');
      }
      
      const prompts: Record<string, string> = {
        vision: `Improve and structure this product vision. Make it concise, clear and inspiring. Correct spelling errors. Respond only with the improved text, without introduction:\n\n${text}`,
        audience: `Improve this target audience description. Make it more precise and structured. Correct spelling errors. Respond only with the improved text:\n\n${text}`,
        features: `Structure this feature list as a clean list with • at the beginning of each line. Group similar features. Correct spelling errors. Respond only with the structured list:\n\n${text}`,
        design: `Improve this design description. Make it more precise and professional. Correct spelling errors. Respond only with the improved text:\n\n${text}`,
        terms: `Structure this glossary as a clean list in the format "• Term = Definition". Correct spelling errors. Respond only with the structured list:\n\n${text}`,
        description: `You are a UX Writer. Improve this component description for documentation purposes. Project: ${state.mainKnowledgeBase?.projectName || 'Unknown'}. Make the description clear, precise and helpful for other designers. Respond only with the improved text:\n\n${text}`,
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
            { role: 'system', content: 'You are a helpful assistant for UX documentation. Always respond in English.' },
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
