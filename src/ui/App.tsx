import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Onboarding from './components/Onboarding';
import Search from './components/Search';
import Browse from './components/Browse';
import Editor from './components/Editor';
import DetailView from './components/DetailView';
import ProjectOverview from './components/ProjectOverview';
import './styles/global.css';
import './styles/components.css';

export default function App() {
  const { state } = useApp();
  const { currentView, mainKnowledgeBase, isLoading } = state;

  // Loading state
  if (isLoading) {
    return (
      <div className="main-content-wrapper" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="empty-state">
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid var(--border-color)', 
            borderTopColor: 'var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px'
          }} />
          <p>Lade Projektdaten...</p>
        </div>
      </div>
    );
  }

  // Onboarding view
  if (currentView === 'onboarding') {
    return (
      <div className="main-content-wrapper">
        <Onboarding initialData={mainKnowledgeBase} />
      </div>
    );
  }

  // Main app views
  return (
    <div className="main-content-wrapper">
      <Header />
      <Navigation />
      
      {currentView === 'search' && <Search />}
      {currentView === 'browse' && <Browse />}
      {currentView === 'editor' && <Editor />}
      {currentView === 'detail' && <DetailView />}
      {currentView === 'project' && <ProjectOverview />}
    </div>
  );
}
