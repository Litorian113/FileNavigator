import React from 'react';
import { useApp } from '../context/AppContext';
import { BookIcon } from './shared/Icons';

export default function Header() {
  const { state, actions } = useApp();
  
  const projectName = state.mainKnowledgeBase?.projectName || 'FutureDocumentation';
  
  const handleClick = () => {
    if (state.mainKnowledgeBase) {
      actions.navigateTo('project');
    }
  };
  
  return (
    <div className="brand-header" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <BookIcon size={20} />
      <span className="brand-name">{projectName}</span>
      <span className="brand-tag">Knowledge Base</span>
    </div>
  );
}
