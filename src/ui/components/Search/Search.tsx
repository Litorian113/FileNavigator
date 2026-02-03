import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SearchIcon, SparklesIcon } from '../shared/Icons';

// Erkennt ob die Query eine Frage/kontextuelle Suche ist
function isContextualQuery(query: string): boolean {
  const questionWords = ['wo ', 'wie ', 'was ', 'welche', 'warum', 'wann', 'wer ', 'zeig', 'find', 'such', 'gibt es', 'habe ich', 'haben wir', '?'];
  const lowerQuery = query.toLowerCase();
  return questionWords.some(word => lowerQuery.includes(word)) || query.length > 30;
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
      case 'knowledge': return 'Wissen';
      case 'screen': return 'Screen';
      case 'glossary': return 'Glossar';
      case 'project': return 'Projekt';
      default: return type;
    }
  };

  return (
    <div className="container visible">
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Suche in Knowledge Base und Screens..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="search-btn" onClick={handleSearch}>
          Suchen
        </button>
      </div>

      <div className="results-list">
        {isLoading ? (
          <div className="empty-state">
            <SparklesIcon size={24} />
            <p>Suche...</p>
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
            
            {/* Knowledge Base Einträge */}
            {state.searchResults.filter(r => r.type === 'project').length > 0 && (
              <div className="ai-links-section">
                <div className="ai-links-title">📚 Relevante Knowledge Base Einträge:</div>
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
            
            {/* Screens */}
            {state.searchResults.filter(r => r.type === 'screen').length > 0 && (
              <div className="ai-links-section">
                <div className="ai-links-title">🖼️ Relevante Screens:</div>
                <div className="ai-links-container">
                  {state.searchResults.filter(r => r.type === 'screen').slice(0, 5).map((result, index) => (
                    <button
                      key={`screen-${result.id}-${index}`}
                      className="ai-screen-link"
                      onClick={() => actions.zoomToSid(result.sid!)}
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
            <p>Suche nach Design-Richtlinien, Screens oder Begriffen</p>
            <p style={{ fontSize: 11, marginTop: 8 }}>
              z.B. "Icon Größe Navigation" oder "Button"
            </p>
          </div>
        ) : (
          state.searchResults.map((result, index) => (
            <div
              key={`${result.type}-${result.id}-${index}`}
              className="result-card"
              onClick={() => {
                if (result.type === 'screen' && result.sid) {
                  actions.zoomToSid(result.sid);
                } else {
                  actions.showDetail(result);
                }
              }}
            >
              <div className="result-header">
                <span className={`result-type ${result.type}`}>
                  {getTypeLabel(result.type)}
                </span>
                <span className="result-title">{result.title}</span>
              </div>
              <div className="result-snippet">{result.snippet}</div>
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
