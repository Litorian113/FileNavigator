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
        case 'main-knowledge-base-saved':
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

NEW COMPONENT DOCUMENTED:
- Name: "${screenName}"
- Category: ${screenData.category}
- Description: ${screenData.description}
- Features: ${screenData.features}

TASK: Check if the new component contains information that should be INTEGRATED into the main knowledge base sections.

Respond ONLY with a valid JSON object (no markdown code blocks, no explanation around it):
{
  "shouldUpdate": true/false,
  "reason": "Brief explanation why update is needed/not needed",
  "updatedFields": {
    "features": "Only if new features discovered - COMPLETE updated text, otherwise omit",
    "design": "Only if new design patterns discovered - COMPLETE updated text, otherwise omit",
    "terminology": "Only if new terms discovered - COMPLETE updated text, otherwise omit",
    "audience": "Only if new audience insights discovered - COMPLETE updated text, otherwise omit"
  }
}

CRITICAL FORMATTING RULES:
- Use \\n for line breaks in JSON string values
- Use markdown formatting: ### for main headers, #### for sub-headers
- Use numbered lists (1. 2. 3.) and bullet points (- item)
- Keep paragraphs separated with \\n\\n
- Example: "### Section Title\\n\\nParagraph text here.\\n\\n#### Subsection\\n\\n- Point 1\\n- Point 2"

CONTENT RULES:
- shouldUpdate = true ONLY if truly relevant new info was discovered
- Ignore trivial or redundant info
- INTEGRATE new information naturally - don't just append
- Keep existing structure and add new items in appropriate places
- Vision is NOT changed (only in onboarding)
- Change max 1-2 fields per update
- Returned field values must contain the FULL updated text with proper formatting`;

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
            max_tokens: 2000,
            temperature: 0.3,
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
                content: 'You are an assistant for design documentation. You help with searching in a Figma project.\n\nRespond in English. If you find relevant components, mention them by name.\nIf you find info from the Knowledge Base, explain it.\n\nUse markdown formatting:\n- Use **bold** for component names and key terms\n- Use bullet points for lists\n- Keep paragraphs short and readable\n\nBe precise and helpful. If nothing matches, say so honestly.'
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
          
          // Keywords for Knowledge Base areas - only match if QUERY contains these
          const kbKeywords: Record<string, string[]> = {
            'vision': ['vision', 'goal', 'mission', 'purpose', 'why'],
            'audience': ['audience', 'target', 'who', 'persona', 'user persona'],
            'features': ['feature', 'function', 'what can', 'capability'],
            'design': ['design', 'color', 'typography', 'font', 'visual', 'style', 'ui'],
            'terminology': ['terminology', 'term', 'glossary', 'definition', 'meaning', 'what is']
          };
          
          const kbNames: Record<string, string> = {
            'vision': 'Project & Vision',
            'audience': 'Target Audience',
            'features': 'Core Features',
            'design': 'Design Language',
            'terminology': 'Terminology'
          };
          
          // Find relevant KB areas - only if query directly asks about it
          if (state.mainKnowledgeBase) {
            const kb = state.mainKnowledgeBase;
            Object.keys(kbKeywords).forEach(function(kbId) {
              const keywords = kbKeywords[kbId];
              // Only match if the QUERY contains the keyword (not just the response)
              const queryMatch = keywords.some(function(kw) {
                return lowerQuery.includes(kw);
              });
              
              const kbContent = (kb as any)[kbId];
              if (queryMatch && kbContent) {
                relevantResults.push({
                  type: 'project',
                  id: kbId,
                  title: kbNames[kbId],
                  snippet: kbContent.substring(0, 150) + (kbContent.length > 150 ? '...' : ''),
                  tags: [kb.projectName || 'Project'],
                  content: kbContent
                } as SearchResult);
              }
            });
          }
          
          // Find relevant components - only if AI explicitly mentions them by full name
          state.screens.forEach(function(screen) {
            const screenNameLower = screen.name.toLowerCase();
            
            // Only match if the full component name appears in the AI response
            // This prevents matching partial words like "user" in "User-Persona"
            const matchesFullName = lowerResponse.includes(screenNameLower);
            
            // Also match if the query specifically asks about this component
            const queryMentions = lowerQuery.includes(screenNameLower);
            
            if (matchesFullName || queryMentions) {
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
          
          // Limit results to most relevant (max 3 KB entries, max 3 components)
          const kbResults = relevantResults.filter(r => r.type === 'project').slice(0, 2);
          const componentResults = relevantResults.filter(r => r.type === 'component').slice(0, 3);
          const limitedResults = [...kbResults, ...componentResults];
          
          dispatch({
            type: 'SET_AI_RESPONSE',
            payload: { query: query, response: aiResponse, results: limitedResults }
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
      
      const formatInstructions = `

FORMATTING RULES (IMPORTANT):
- Use ### for main section headers
- Use #### for sub-section headers  
- Use numbered lists (1. 2. 3.) for ordered items
- Use bullet points (- item) for unordered lists
- Separate paragraphs with empty lines
- Use **bold** for emphasis on key terms`;
      
      const prompts: Record<string, string> = {
        vision: `Improve and structure this product vision. Make it concise, clear and inspiring. Correct spelling errors.${formatInstructions}

Respond only with the improved text, without introduction:\n\n${text}`,
        audience: `Improve this target audience description. Make it more precise and well-structured.${formatInstructions}

Use this structure:
### Target Audience: [Name]
Brief description

#### Key Segments
1. Segment 1
2. Segment 2

#### Key Characteristics
- Characteristic 1
- Characteristic 2

Respond only with the improved text:\n\n${text}`,
        features: `Structure this feature list clearly.${formatInstructions}

Group related features under headers. Respond only with the structured text:\n\n${text}`,
        design: `Improve this design language description. Make it precise and professional.${formatInstructions}

Structure colors, typography, spacing etc. under clear headers. Respond only with the improved text:\n\n${text}`,
        terms: `Structure this glossary/terminology clearly.${formatInstructions}

Format each term as:
**Term Name**
Definition and explanation.

Respond only with the structured text:\n\n${text}`,
        description: `You are a UX Writer. Improve this component description for documentation purposes. Project: ${state.mainKnowledgeBase?.projectName || 'Unknown'}.${formatInstructions}

Make the description clear, precise and helpful for other designers. Respond only with the improved text:\n\n${text}`,
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
            { role: 'system', content: 'You are a helpful assistant for UX documentation. Always respond in English. Use proper markdown formatting with headers, lists, and paragraphs.' },
            { role: 'user', content: prompts[type] || prompts.description },
          ],
          max_tokens: 2000,
          temperature: 0.5,
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
