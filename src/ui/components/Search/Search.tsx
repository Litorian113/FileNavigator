import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SearchIcon, SparklesIcon } from '../shared/Icons';

// Formatiert inline Markdown (bold) und entfernt ** für die Vorschau
function formatSnippet(text: string | any): React.ReactNode {
  if (!text) return '';
  const textStr = typeof text === 'string' ? text : String(text);
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  const regex = /\*\*([^*]+)\*\*/g;
  let match;
  
  while ((match = regex.exec(textStr)) !== null) {
    if (match.index > lastIndex) {
      parts.push(textStr.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < textStr.length) {
    parts.push(textStr.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : textStr;
}

// Detects if the query is a question/contextual search
function isContextualQuery(query: string): boolean {
  const questionWords = ['where ', 'how ', 'what ', 'which ', 'why ', 'when ', 'who ', 'show me', 'find me', 'is there', 'do i have', 'do we have', '?'];
  const lowerQuery = query.toLowerCase();
  // Only use AI for actual questions (with question words) or longer queries that look like sentences
  const hasQuestionWord = questionWords.some(word => lowerQuery.includes(word));
  const looksLikeSentence = query.length > 40 && query.includes(' ');
  return hasQuestionWord || looksLikeSentence;
}

export default function Search() {
  const { state, actions } = useApp();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      if (isContextualQuery(query) && state.apiKey) {
        // KI-Suche für kontextuelle Fragen
        await actions.aiSearch(query.trim());
        setIsLoading(false);
      } else {
        // Normale Keyword-Suche - Loading wird erst bei Ergebnissen beendet
        actions.search(query.trim());
        // Loading bleibt an, bis Ergebnisse kommen (siehe useEffect unten)
      }
    } catch (e) {
      setIsLoading(false);
    }
  };
  
  // Beende Loading wenn Suchergebnisse ankommen
  React.useEffect(() => {
    if (state.searchResults.length > 0 || state.searchQuery) {
      setIsLoading(false);
    }
  }, [state.searchResults, state.searchQuery]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'knowledge': return 'Knowledge';
      case 'component': return 'Component';
      case 'glossary': return 'Glossary';
      case 'project': return 'Project';
      default: return type;
    }
  };

  return (
    <div className="container visible">
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search knowledge base and components..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className="results-list">
        {isLoading ? (
          <div className="empty-state">
            <SparklesIcon size={24} />
            <p>Searching...</p>
          </div>
        ) : state.aiResponse ? (
          <div className="ai-response-card">
            <div className="ai-response-header">
              <span className="result-type project">
                <SparklesIcon size={14} /> KI-Antwort
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                für "{state.searchQuery}"
              </span>
            </div>
            <div className="ai-response-content" style={{ whiteSpace: 'pre-wrap' }}>
              {state.aiResponse}
            </div>
            
            {/* Knowledge Base Entries */}
            {state.searchResults.filter(r => r.type === 'project').length > 0 && (
              <div className="ai-links-section">
                <div className="ai-links-title">📚 Relevant Knowledge Base Entries:</div>
                <div className="ai-links-container">
                  {state.searchResults.filter(r => r.type === 'project').map((result, index) => (
                    <button
                      key={`kb-${result.id}-${index}`}
                      className="ai-kb-link"
                      onClick={() => actions.showDetail(result)}
                    >
                      {result.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Components */}
            {state.searchResults.filter(r => r.type === 'component').length > 0 && (
              <div className="ai-links-section">
                <div className="ai-links-title">🖼️ Relevant Components:</div>
                <div className="ai-links-container">
                  {state.searchResults.filter(r => r.type === 'component').slice(0, 5).map((result, index) => (
                    <button
                      key={`screen-${result.id}-${index}`}
                      className="ai-screen-link"
                      onClick={() => {
                        actions.zoomToSid(result.sid!);
                        actions.showDetail(result);
                      }}
                    >
                      {result.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : state.searchResults.length === 0 ? (
          <div className="empty-state">
            <SearchIcon size={48} />
            <p>Search for design guidelines, components or terms</p>
            <p style={{ fontSize: 11, marginTop: 8 }}>
              e.g. "Icon size navigation" or "Button"
            </p>
          </div>
        ) : (
          state.searchResults.map((result, index) => (
            <div
              key={`${result.type}-${result.id}-${index}`}
              className="result-card"
              onClick={() => {
                if (result.type === 'component' && result.sid) {
                  actions.zoomToSid(result.sid);
                }
                actions.showDetail(result);
              }}
            >
              <div className="result-header">
                <span className={`result-type ${result.type}`}>
                  {result.category || getTypeLabel(result.type)}
                </span>
                <span className="result-title">{result.title}</span>
              </div>
              <div className="result-snippet">{formatSnippet(result.snippet)}</div>
              {result.tags && result.tags.length > 0 && (
                <div className="result-tags">
                  {result.tags.map((tag, i) => (
                    <span key={i} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
