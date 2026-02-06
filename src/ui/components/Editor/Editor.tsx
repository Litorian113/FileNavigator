import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SettingsIcon, SparklesIcon, MessageIcon, LoaderIcon, CheckCircleIcon } from '../shared/Icons';

export default function Editor() {
  const { state, actions } = useApp();
  const { selectedNode, mainKnowledgeBase, categories } = state;
  const { isSynthesizing, lastSynthesisResult } = state;

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
      alert('Please enter a description first.');
      return;
    }

    setIsImproving(true);
    try {
      const improved = await actions.improveWithAI(description, 'description');
      setDescription(improved);
    } catch (error) {
      console.error('AI improvement failed:', error);
      alert('Error with AI request.');
    } finally {
      setIsImproving(false);
    }
  };

  const handleOpenProjectSettings = () => {
    actions.navigateTo('onboarding');
  };

  return (
    <div className="container visible">
      {/* Knowledge Synthesis Feedback */}
      {isSynthesizing && (
        <div className="synthesis-banner synthesizing">
          <LoaderIcon size={14} />
          <span>Checking if knowledge base needs to be updated...</span>
        </div>
      )}
      {lastSynthesisResult && !isSynthesizing && (
        <div className={`synthesis-banner ${lastSynthesisResult.shouldUpdate ? 'updated' : 'no-update'}`}>
          {lastSynthesisResult.shouldUpdate ? (
            <>
              <CheckCircleIcon size={14} />
              <div className="synthesis-info">
                <strong>Knowledge base updated</strong>
                <span>{lastSynthesisResult.reason}</span>
                {lastSynthesisResult.newInsight && (
                  <span className="synthesis-insight">New insight: {lastSynthesisResult.newInsight}</span>
                )}
              </div>
            </>
          ) : (
            <>
              <MessageIcon size={14} />
              <span>No new insights — KB is up to date.</span>
            </>
          )}
          <button className="synthesis-dismiss" onClick={actions.dismissSynthesisResult}>✕</button>
        </div>
      )}

      {/* Selected Frame Info */}
      <div className="editor-section">
        <span className="editor-label">Selected Frame</span>
        <div className={`editor-value ${selectedNode ? 'highlight' : ''}`}>
          {selectedNode?.name || 'No frame selected'}
        </div>
      </div>

      {/* Category Select */}
      <div className="editor-section">
        <span className="editor-label">Category</span>
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
        <span className="editor-label">Description</span>
        <div className="textarea-wrapper">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this component show? What is it used for?"
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
                Improving...
              </>
            ) : (
              <>
                <SparklesIcon size={12} />
                improve
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
          placeholder="e.g. Login, SSO, Dark Mode"
          disabled={!selectedNode}
        />
        <span className="features-hint">Comma-separated keywords for search</span>
      </div>

      {/* Buttons */}
      <div className="button-group">
        <button
          className="btn btn-secondary"
          onClick={handleCancel}
          disabled={!selectedNode}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!selectedNode}
        >
          Save
        </button>
      </div>
    </div>
  );
}
