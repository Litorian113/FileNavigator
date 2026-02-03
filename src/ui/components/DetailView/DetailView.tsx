import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeftIcon } from '../shared/Icons';

// Formatiert inline Markdown (bold, italic)
function formatInlineText(text: string): React.ReactNode {
  // Regex für **bold** und *italic*
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Kombiniertes Regex für **bold** und *italic* (bold zuerst, da ** vor * matchen muss)
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Text vor dem Match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
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
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}

// Formatiert Inhalt mit Aufzählungszeichen und Markdown
function formatContent(content: string): React.ReactNode {
  if (!content) return null;
  
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
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
        {/* Projektname für KB-Einträge */}
        {detailItem.type === 'project' && projectName && (
          <div className="detail-section">
            <div className="detail-section-title">{projectName}</div>
          </div>
        )}
        
        {/* Hauptinhalt - formatiert */}
        {mainContent && (
          <div className="detail-section">
            {formatContent(mainContent)}
          </div>
        )}

        {/* Spezifikationen (für Knowledge Items) */}
        {detailItem.specs && (
          <div className="detail-section">
            <div className="detail-section-title">Spezifikationen</div>
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

        {/* Regeln */}
        {detailItem.rules && detailItem.rules.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Regeln</div>
            <ul className="rule-list">
              {detailItem.rules.map((rule: string, index: number) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Beispiele */}
        {detailItem.examples && detailItem.examples.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Beispiele</div>
            <ul className="rule-list">
              {detailItem.examples.map((example: string, index: number) => (
                <li key={index}>{example}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bearbeiten-Button für Projekt-Einträge */}
        {detailItem.type === 'project' && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => actions.navigateTo('onboarding')}
            >
              ✏️ Bearbeiten
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
