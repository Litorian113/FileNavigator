import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SettingsIcon, SparklesIcon, MessageIcon, LoaderIcon } from '../shared/Icons';

export default function Editor() {
  const { state, actions } = useApp();
  const { selectedNode, mainKnowledgeBase, categories } = state;

  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [category, setCategory] = useState('pages');
  const [isImproving, setIsImproving] = useState(false);

  // Sync form with selected node
  useEffect(() => {
    if (selectedNode) {
      setDescription(selectedNode.altText || '');
      setFeatures(selectedNode.features || '');
      setCategory(selectedNode.category || 'pages');
    } else {
      setDescription('');
      setFeatures('');
      setCategory('pages');
    }
  }, [selectedNode]);

  const handleSave = () => {
    actions.saveScreenData({ description, features, category });
  };

  const handleCancel = () => {
    // Reset to original values
    if (selectedNode) {
      setDescription(selectedNode.altText || '');
      setFeatures(selectedNode.features || '');
      setCategory(selectedNode.category || 'pages');
    }
  };

  const handleImproveDescription = async () => {
    if (!description.trim()) {
      alert('Bitte erst eine Beschreibung eingeben.');
      return;
    }

    setIsImproving(true);
    try {
      const improved = await actions.improveWithAI(description, 'description');
      setDescription(improved);
    } catch (error) {
      console.error('AI improvement failed:', error);
      alert('Fehler bei der KI-Anfrage.');
    } finally {
      setIsImproving(false);
    }
  };

  const handleOpenProjectSettings = () => {
    actions.navigateTo('onboarding');
  };

  return (
    <div className="container visible">
      {/* AI Context Badge */}
      {mainKnowledgeBase?.projectName && (
        <div className="ai-context-badge">
          <MessageIcon size={14} />
          <span>
            KI kennt: <strong>{mainKnowledgeBase.projectName}</strong>
          </span>
        </div>
      )}

      {/* Project Settings Button */}
      <button className="project-settings-btn" onClick={handleOpenProjectSettings}>
        <SettingsIcon size={14} />
        Projekt-Knowledge Base bearbeiten
      </button>

      {/* Selected Frame Info */}
      <div className="editor-section">
        <span className="editor-label">Ausgewählter Frame</span>
        <div className={`editor-value ${selectedNode ? 'highlight' : ''}`}>
          {selectedNode?.name || 'Kein Frame ausgewählt'}
        </div>
      </div>

      {/* SID Display */}
      <div className="editor-section">
        <span className="editor-label">System ID (SID)</span>
        <div className="editor-value sid-display">
          {selectedNode?.sid || '-'}
        </div>
      </div>

      {/* Category Select */}
      <div className="editor-section">
        <span className="editor-label">Kategorie</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontFamily: 'var(--font-stack)',
            fontSize: '13px',
            background: 'white',
            cursor: 'pointer',
          }}
          disabled={!selectedNode}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="editor-section">
        <span className="editor-label">Beschreibung</span>
        <div className="textarea-wrapper">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Was zeigt dieser Screen? Wofür wird er verwendet?"
            disabled={!selectedNode}
          />
          <button
            className="inline-ai-btn"
            onClick={handleImproveDescription}
            disabled={!selectedNode || isImproving}
          >
            {isImproving ? (
              <>
                <LoaderIcon size={12} />
                Verbessere...
              </>
            ) : (
              <>
                <SparklesIcon size={12} />
                verbessern
              </>
            )}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="editor-section">
        <span className="editor-label">Features / Tags</span>
        <input
          type="text"
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          placeholder="z.B. Login, SSO, Dark Mode"
          disabled={!selectedNode}
        />
        <span className="features-hint">Kommagetrennte Keywords für die Suche</span>
      </div>

      {/* Buttons */}
      <div className="button-group">
        <button
          className="btn btn-secondary"
          onClick={handleCancel}
          disabled={!selectedNode}
        >
          Abbrechen
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!selectedNode}
        >
          Speichern
        </button>
      </div>
    </div>
  );
}
