import React from 'react';
import { useApp } from '../context/AppContext';
import { BookIcon } from './shared/Icons';

export default function Header() {
  const { state } = useApp();
  
  const projectName = state.mainKnowledgeBase?.projectName || 'FutureDocumentation';
  
  return (
    <div className="brand-header">
      <BookIcon size={20} />
      <span className="brand-name">{projectName}</span>
      <span className="brand-tag">Knowledge Base</span>
    </div>
  );
}
