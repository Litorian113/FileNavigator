import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeftIcon, TrashIcon } from '../shared/Icons';

// Formatiert inline Markdown (bold, italic)
function formatInlineText(text: string | any): React.ReactNode {
  if (!text) return '';
  const textStr = typeof text === 'string' ? text : String(text);
  
  // Regex für **bold** und *italic*
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Kombiniertes Regex für **bold** und *italic* (bold zuerst, da ** vor * matchen muss)
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let match;
  
  while ((match = regex.exec(textStr)) !== null) {
    // Text vor dem Match
    if (match.index > lastIndex) {
      parts.push(textStr.substring(lastIndex, match.index));
    }
    
    if (match[1]) {
      // **bold**
      parts.push(<strong key={match.index}>{match[1]}</strong>);
    } else if (match[2]) {
      // *italic* - wenn am Zeilenanfang, als Überschrift behandeln
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Rest des Textes
  if (lastIndex < textStr.length) {
    parts.push(textStr.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : textStr;
}

// Formatiert Inhalt mit Aufzählungszeichen und Markdown
function formatContent(content: string | any): React.ReactNode {
  if (!content) return null;
  
  // Ensure content is a string
  const textContent = typeof content === 'string' ? content : String(content);
  
  const lines = textContent.split('\n').map(line => line.trim()).filter(line => line);
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  
  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="rule-list">
          {currentList.map((item, i) => (
            <li key={i}>{formatInlineText(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };
  
  lines.forEach((line, index) => {
    // Überschrift mit ** am Anfang und Ende
    if (line.startsWith('**') && line.endsWith('**')) {
      flushList();
      const headingText = line.slice(2, -2);
      elements.push(
        <h3 key={`h-${index}`} style={{ 
          fontSize: 14, 
          fontWeight: 600, 
          marginTop: index > 0 ? 16 : 0, 
          marginBottom: 8,
          color: 'var(--text-primary)'
        }}>
          {headingText}
        </h3>
      );
    }
    // Überschrift mit * am Anfang und Ende (alternative)
    else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      flushList();
      const headingText = line.slice(1, -1);
      elements.push(
        <h3 key={`h-${index}`} style={{ 
          fontSize: 14, 
          fontWeight: 600, 
          marginTop: index > 0 ? 16 : 0, 
          marginBottom: 8,
          color: 'var(--text-primary)'
        }}>
          {headingText}
        </h3>
      );
    }
    // Aufzählungszeichen
    else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      currentList.push(line.substring(1).trim());
    }
    // Normaler Paragraph
    else {
      flushList();
      elements.push(
        <p key={`p-${index}`} style={{ marginBottom: 8 }}>
          {formatInlineText(line)}
        </p>
      );
    }
  });
  
  flushList(); // Letzte Liste ausgeben
  
  return elements;
}

export default function DetailView() {
  const { state, actions } = useApp();
  const { detailItem } = state;

  if (!detailItem) {
    return null;
  }

  // Für SearchResults: content oder snippet als Hauptinhalt verwenden
  const mainContent = detailItem.content || detailItem.snippet || detailItem.description;
  
  // Projektname aus Tags holen (für KB-Einträge)
  const projectName = detailItem.tags && detailItem.tags.length > 0 ? detailItem.tags[0] : null;

  return (
    <div className="container visible">
      <div className="detail-header">
        <button className="back-btn" onClick={actions.goBack}>
          <ArrowLeftIcon size={20} />
        </button>
        <span className="detail-title">{detailItem.title || 'Detail'}</span>
      </div>

      <div className="detail-content">
        {/* Component specific view */}
        {detailItem.type === 'component' && (
          <>
            <div className="detail-section">
              <div className="detail-section-title">Description</div>
              <div style={{ marginBottom: 8, lineHeight: 1.5 }}>
                {formatContent(detailItem.content || detailItem.snippet || 'No description available.')}
              </div>
            </div>
            
            {detailItem.tags && detailItem.tags.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">Features</div>
                <div className="result-tags" style={{ marginTop: 8 }}>
                  {detailItem.tags.map((tag: string, i: number) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Delete Button for Components */}
            {detailItem.sid && (
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                <button 
                  className="btn btn-danger"
                  style={{ 
                    width: '100%',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                  onClick={() => {
                    if (confirm(`Remove documentation for "${detailItem.title}"?`)) {
                      actions.deleteScreen(detailItem.sid);
                      actions.goBack();
                    }
                  }}
                >
                  <TrashIcon size={14} />
                  Remove Documentation
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Projektname für KB-Einträge */}
        {detailItem.type === 'project' && projectName && (
          <div className="detail-section">
            <div className="detail-section-title">{projectName}</div>
          </div>
        )}
        
        {/* Hauptinhalt - formatiert (nicht für components) */}
        {detailItem.type !== 'component' && mainContent && (
          <div className="detail-section">
            {formatContent(mainContent)}
          </div>
        )}

        {/* Specifications (for Knowledge Items) */}
        {detailItem.specs && (
          <div className="detail-section">
            <div className="detail-section-title">Specifications</div>
            <div className="spec-grid">
              {Object.entries(detailItem.specs).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <div className="spec-label">{key}</div>
                  <div className="spec-value">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules */}
        {detailItem.rules && detailItem.rules.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Rules</div>
            <ul className="rule-list">
              {detailItem.rules.map((rule: string, index: number) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Examples */}
        {detailItem.examples && detailItem.examples.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Examples</div>
            <ul className="rule-list">
              {detailItem.examples.map((example: string, index: number) => (
                <li key={index}>{example}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Edit button for project entries */}
        {detailItem.type === 'project' && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => actions.navigateTo('onboarding')}
            >
              ✏️ Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
