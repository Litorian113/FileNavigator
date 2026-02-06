import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SearchIcon, SparklesIcon, LoadingSpinner, ChatIcon } from '../shared/Icons';

// Formatiert AI Response mit Markdown (bold, italic, lists)
function formatAIResponse(text: string): React.ReactNode {
  if (!text) return '';
  
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  
  const formatInline = (line: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\*\*([^*]+)\*\*/g;
    let match;
    
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : line;
  };
  
  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} style={{ margin: '8px 0', paddingLeft: 20 }}>
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      flushList();
      return;
    }
    
    // Headers #### 
    if (trimmedLine.startsWith('#### ')) {
      flushList();
      elements.push(
        <h5 key={`h4-${index}`} style={{ fontSize: 12, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>
          {formatInline(trimmedLine.substring(5))}
        </h5>
      );
    }
    // Headers ###
    else if (trimmedLine.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${index}`} style={{ fontSize: 13, fontWeight: 600, marginTop: 14, marginBottom: 6 }}>
          {formatInline(trimmedLine.substring(4))}
        </h4>
      );
    }
    // Bullet points
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
      currentList.push(
        <li key={`li-${index}`} style={{ marginBottom: 4 }}>
          {formatInline(trimmedLine.substring(2))}
        </li>
      );
    }
    // Normal paragraph
    else {
      flushList();
      elements.push(
        <p key={`p-${index}`} style={{ marginBottom: 8 }}>
          {formatInline(trimmedLine)}
        </p>
      );
    }
  });
  
  flushList();
  return elements;
}

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

// Detects if query needs AI (always true now - we're a chat interface)
function shouldUseAI(query: string): boolean {
  // Always use AI for the chat interface
  return true;
}

export default function Search() {
  const { state, actions } = useApp();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      if (state.apiKey) {
        // Always use AI search for chat interface
        await actions.aiSearch(query.trim());
        setIsLoading(false);
      } else {
        // Fallback to keyword search if no API key
        actions.search(query.trim());
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
          placeholder="Ask about your project..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="search-btn" onClick={handleSearch}>
          Ask
        </button>
      </div>

      <div className="results-list">
        {isLoading ? (
          <div className="empty-state">
            <LoadingSpinner size={32} />
            <p>Thinking...</p>
          </div>
        ) : state.aiResponse ? (
          <div className="ai-response-card">
            <div className="ai-response-header">
              <span className="result-type project">
                <SparklesIcon size={14} /> AI Response
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                for "{state.searchQuery}"
              </span>
            </div>
            <div className="ai-response-content">
              {formatAIResponse(state.aiResponse)}
            </div>
            
            {/* Knowledge Base Entries */}
            {state.searchResults.filter(r => r.type === 'project').length > 0 && (
              <div className="ai-links-section">
                <div className="ai-links-title">Relevant Knowledge Base Entries:</div>
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
                <div className="ai-links-title">Relevant Components:</div>
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
            <ChatIcon size={48} />
            <p>Ask anything about your project</p>
            <p style={{ fontSize: 11, marginTop: 8 }}>
              e.g. "What are the primary colors?" or "Show me the nav component"
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
                {result.pageName && (
                  <span className="result-page" style={{
                    fontSize: 10,
                    color: 'var(--text-secondary)',
                    marginLeft: 'auto',
                    fontStyle: 'italic'
                  }}>
                    📄 {result.pageName}
                  </span>
                )}
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
