import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeftIcon, SparklesIcon } from '../shared/Icons';

// Formatiert inline Markdown (bold, italic)
function formatInlineText(text: string | any): React.ReactNode {
  if (!text) return '';
  const textStr = typeof text === 'string' ? text : String(text);
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let match;
  
  while ((match = regex.exec(textStr)) !== null) {
    if (match.index > lastIndex) {
      parts.push(textStr.substring(lastIndex, match.index));
    }
    
    if (match[1]) {
      parts.push(<strong key={match.index}>{match[1]}</strong>);
    } else if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
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
        <ul key={`list-${elements.length}`} style={{ margin: '8px 0', paddingLeft: 20 }}>
          {currentList.map((item, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{formatInlineText(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };
  
  lines.forEach((line, index) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      flushList();
      const headingText = line.slice(2, -2);
      elements.push(
        <h4 key={`h-${index}`} style={{ 
          fontSize: 13, 
          fontWeight: 600, 
          marginTop: index > 0 ? 12 : 0, 
          marginBottom: 6,
          color: 'var(--text-primary)'
        }}>
          {headingText}
        </h4>
      );
    }
    else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      flushList();
      const headingText = line.slice(1, -1);
      elements.push(
        <h4 key={`h-${index}`} style={{ 
          fontSize: 13, 
          fontWeight: 600, 
          marginTop: index > 0 ? 12 : 0, 
          marginBottom: 6,
          color: 'var(--text-primary)'
        }}>
          {headingText}
        </h4>
      );
    }
    else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      currentList.push(line.substring(1).trim());
    }
    else {
      flushList();
      elements.push(
        <p key={`p-${index}`} style={{ marginBottom: 6, lineHeight: 1.5 }}>
          {formatInlineText(line)}
        </p>
      );
    }
  });
  
  flushList();
  
  return elements;
}

export default function ProjectOverview() {
  const { state, actions } = useApp();
  const kb = state.mainKnowledgeBase;

  if (!kb) return null;

  const sections = [
    { label: 'Vision', value: kb.vision },
    { label: 'Target Audience', value: kb.audience },
    { label: 'Core Features', value: kb.features },
    { label: 'Design Language', value: kb.design },
    { label: 'Terminology', value: kb.terminology },
  ];

  return (
    <div className="container visible">
      <div className="detail-header">
        <button className="back-btn" onClick={actions.goBack}>
          <ArrowLeftIcon size={18} />
        </button>
        <div className="detail-title">{kb.projectName}</div>
      </div>

      {kb.contributingScreens ? (
        <div className="project-meta">
          <span>{kb.contributingScreens} components have contributed to the knowledge base</span>
          <span>Last updated: {new Date(kb.updatedAt).toLocaleDateString('en-US')}</span>
        </div>
      ) : null}

      <div className="project-sections">
        {sections.map(({ label, value }) => (
          <div key={label} className="project-section">
            <div className="project-section-label">{label}</div>
            <div className="project-section-value">
              {value ? formatContent(value) : <span className="text-muted">Not defined</span>}
            </div>
          </div>
        ))}

        {kb.learnedInsights && kb.learnedInsights.length > 0 && (
          <div className="project-section">
            <div className="project-section-label">
              <SparklesIcon size={12} /> Learned Insights
            </div>
            <ul className="insights-list">
              {kb.learnedInsights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="button-group">
        <button className="btn btn-secondary" onClick={() => actions.navigateTo('onboarding')}>
          Edit
        </button>
      </div>
    </div>
  );
}
