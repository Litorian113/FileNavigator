import React from 'react';
import { useApp } from '../../context/AppContext';
import { SparklesIcon, getCategoryIcon, BookOpenIcon } from '../shared/Icons';

export default function Browse() {
  const { state, actions } = useApp();
  const { mainKnowledgeBase, screens, categories } = state;

  // Group screens by category
  const screensByCategory = screens.reduce((acc, screen) => {
    const cat = screen.category || 'pages';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(screen);
    return acc;
  }, {} as Record<string, typeof screens>);

  return (
    <div className="container visible">
      {/* Project Knowledge Section */}
      {mainKnowledgeBase && (
        <div className="kb-section">
          <div className="kb-section-header">
            <SparklesIcon size={14} />
            Project Knowledge
          </div>
          
          {mainKnowledgeBase.vision && (
            <div
              className="kb-item"
              onClick={() => actions.showDetail({
                type: 'project',
                id: 'vision',
                title: 'Vision & Goal',
                content: mainKnowledgeBase.vision,
              })}
            >
              <BookOpenIcon size={16} />
              Vision & Goal
            </div>
          )}
          
          {mainKnowledgeBase.audience && (
            <div
              className="kb-item"
              onClick={() => actions.showDetail({
                type: 'project',
                id: 'audience',
                title: 'Target Audience',
                content: mainKnowledgeBase.audience,
              })}
            >
              <BookOpenIcon size={16} />
              Target Audience
            </div>
          )}
          
          {mainKnowledgeBase.features && (
            <div
              className="kb-item"
              onClick={() => actions.showDetail({
                type: 'project',
                id: 'features',
                title: 'Core Features',
                content: mainKnowledgeBase.features,
              })}
            >
              <BookOpenIcon size={16} />
              Core Features
            </div>
          )}
          
          {mainKnowledgeBase.design && (
            <div
              className="kb-item"
              onClick={() => actions.showDetail({
                type: 'project',
                id: 'design',
                title: 'Design Language',
                content: mainKnowledgeBase.design,
              })}
            >
              <BookOpenIcon size={16} />
              Design Language
            </div>
          )}
          
          {mainKnowledgeBase.terminology && (
            <div
              className="kb-item"
              onClick={() => actions.showDetail({
                type: 'project',
                id: 'terminology',
                title: 'Terminology',
                content: mainKnowledgeBase.terminology,
              })}
            >
              <BookOpenIcon size={16} />
              Terminology
            </div>
          )}
        </div>
      )}

      {/* Screens Section */}
      {categories.map((category) => {
        const categoryScreens = screensByCategory[category.id] || [];
        if (categoryScreens.length === 0) return null;

        const CategoryIcon = getCategoryIcon(category.id);

        return (
          <div key={category.id} className="kb-section">
            <div className="kb-section-header">
              <CategoryIcon size={14} />
              {category.label} ({categoryScreens.length})
            </div>
            {categoryScreens.map((screen) => (
              <div
                key={screen.sid}
                className="kb-item"
                onClick={() => {
                  // Zoom zum Frame UND zeige Details
                  actions.zoomToSid(screen.sid);
                  actions.showDetail({
                    type: 'component',
                    id: screen.sid,
                    sid: screen.sid,
                    title: screen.name,
                    content: screen.description,
                    tags: screen.features ? screen.features.split(',').map(f => f.trim()) : [],
                    category: screen.category
                  });
                }}
              >
                <CategoryIcon size={16} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{screen.name}</div>
                  {screen.description && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {screen.description.substring(0, 60)}
                      {screen.description.length > 60 ? '...' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Empty State */}
      {screens.length === 0 && !mainKnowledgeBase && (
        <div className="empty-state">
          <BookOpenIcon size={48} />
          <p>No components documented yet</p>
          <p style={{ fontSize: 11, marginTop: 8 }}>
            Select a frame and document it in the Editor
          </p>
        </div>
      )}
    </div>
  );
}
