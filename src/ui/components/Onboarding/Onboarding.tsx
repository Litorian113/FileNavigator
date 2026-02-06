import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MainKnowledgeBase } from '../../../shared/types';
import { 
  MoonIcon, 
  RocketIcon, 
  UsersIcon, 
  SparklesIcon, 
  PaletteIcon, 
  BookOpenIcon, 
  CheckCircleIcon,
  LoaderIcon 
} from '../shared/Icons';
import '../../styles/onboarding.css';

const TOTAL_STEPS = 6;

interface StepConfig {
  icon: React.FC<{ size?: number }>;
  question: string;
  hint: string;
  field: keyof FormData;
  placeholder: string;
  aiType: string;
  aiLabel?: string;
}

interface FormData {
  name: string;
  vision: string;
  audience: string;
  features: string;
  design: string;
  terminology: string;
}

const steps: StepConfig[] = [
  {
    icon: RocketIcon,
    question: 'What is your project called?',
    hint: 'The name and a brief vision help the AI understand the context.',
    field: 'name',
    placeholder: 'e.g. TeamChat Pro',
    aiType: 'vision',
    aiLabel: 'improve',
  },
  {
    icon: UsersIcon,
    question: 'Who uses the product?',
    hint: 'Describe the main target audience(s) as precisely as possible.',
    field: 'audience',
    placeholder: 'e.g. Remote-working teams in mid-sized tech companies...',
    aiType: 'audience',
    aiLabel: 'improve',
  },
  {
    icon: SparklesIcon,
    question: 'What are the core features?',
    hint: 'List the most important features your product offers.',
    field: 'features',
    placeholder: '• Real-time chat with threading\n• Video calls\n• File sharing',
    aiType: 'features',
    aiLabel: 'improve',
  },
  {
    icon: PaletteIcon,
    question: 'How does the product look and feel?',
    hint: 'Describe the design principles, color palette, tonality.',
    field: 'design',
    placeholder: 'e.g. Modern and clean with lots of whitespace. Primary color: Blue (#2563EB)...',
    aiType: 'design',
    aiLabel: 'improve',
  },
  {
    icon: BookOpenIcon,
    question: 'Are there important terms in the project?',
    hint: 'Define project-specific terms that the AI should know.',
    field: 'terminology',
    placeholder: '• Workspace = A team area\n• Channel = Topic-based chat room',
    aiType: 'terms',
    aiLabel: 'improve',
  },
  {
    icon: CheckCircleIcon,
    question: 'Summary',
    hint: 'Review your entries. You can edit them anytime later.',
    field: 'name',
    placeholder: '',
    aiType: '',
  },
];

interface OnboardingProps {
  initialData?: MainKnowledgeBase | null;
}

export default function Onboarding({ initialData }: OnboardingProps) {
  const { actions } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isImproving, setIsImproving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.projectName || '',
    vision: initialData?.vision || '',
    audience: initialData?.audience || '',
    features: initialData?.features || '',
    design: initialData?.design || '',
    terminology: initialData?.terminology || '',
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSave = () => {
    const kb: MainKnowledgeBase = {
      projectName: formData.name,
      vision: formData.vision,
      audience: formData.audience,
      features: formData.features,
      design: formData.design,
      terminology: formData.terminology,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    actions.saveMainKB(kb);
  };

  const handleImprove = async (field: keyof FormData, type: string) => {
    const text = formData[field];
    if (!text.trim()) {
      alert('Please enter text first for the AI to improve.');
      return;
    }

    setIsImproving(true);
    try {
      const improved = await actions.improveWithAI(text, type);
      setFormData((prev) => ({ ...prev, [field]: improved }));
    } catch (error) {
      console.error('AI improvement failed:', error);
      alert('Error with AI request.');
    } finally {
      setIsImproving(false);
    }
  };

  const renderStepDots = () => (
    <div className="stepper">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className={`step-dot ${
            i + 1 === currentStep ? 'active' : i + 1 < currentStep ? 'completed' : ''
          }`}
        />
      ))}
    </div>
  );

  const renderStepContent = () => {
    const step = steps[currentStep - 1];
    const StepIcon = step.icon;

    if (currentStep === TOTAL_STEPS) {
      return renderSummary();
    }

    const isFirstStep = currentStep === 1;

    return (
      <div className="step-content active">
        <div>
          <div className="step-question">
            <StepIcon size={20} />
            {step.question}
          </div>
          <div className="step-hint">{step.hint}</div>
        </div>

        {isFirstStep ? (
          <>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={step.placeholder}
            />
            <textarea
              className="step-textarea"
              value={formData.vision}
              onChange={(e) => handleChange('vision', e.target.value)}
              placeholder="What is the vision? e.g. A modern team communication platform for remote teams..."
            />
            <button
              className="ai-improve-btn"
              onClick={() => handleImprove('vision', 'vision')}
              disabled={isImproving}
            >
              {isImproving ? (
                <>
                  <LoaderIcon size={14} />
                  Improving...
                </>
              ) : (
                <>
                  <SparklesIcon size={14} />
                  improve
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <textarea
              className="step-textarea"
              value={formData[step.field]}
              onChange={(e) => handleChange(step.field, e.target.value)}
              placeholder={step.placeholder}
            />
            <button
              className="ai-improve-btn"
              onClick={() => handleImprove(step.field, step.aiType)}
              disabled={isImproving}
            >
              {isImproving ? (
                <>
                  <LoaderIcon size={14} />
                  Improving...
                </>
              ) : (
                <>
                  <SparklesIcon size={14} />
                  {step.aiLabel}
                </>
              )}
            </button>
          </>
        )}
      </div>
    );
  };

  const renderSummary = () => (
    <div className="step-content active">
      <div>
        <div className="step-question">
          <CheckCircleIcon size={20} />
          Summary
        </div>
        <div className="step-hint">
          Review your entries. You can edit them anytime later.
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SummarySection label="Project" value={formData.name} />
        <SummarySection label="Vision" value={formData.vision} />
        <SummarySection label="Target Audience" value={formData.audience} />
        <SummarySection label="Core Features" value={formData.features} />
        <SummarySection label="Design Language" value={formData.design} />
        <SummarySection label="Terminology" value={formData.terminology} />
      </div>
    </div>
  );

  return (
    <div className="onboarding-container visible">
      <div className="onboarding-header">
        <div className="onboarding-logo">
          <MoonIcon size={32} />
        </div>
        <h1 className="onboarding-title">Set up project</h1>
        <p className="onboarding-subtitle">
          Describe your project so the AI can help you better
        </p>
      </div>

      {renderStepDots()}
      {renderStepContent()}

      <div className="onboarding-nav">
        {currentStep > 1 && (
          <button className="btn btn-secondary" onClick={handleBack}>
            Back
          </button>
        )}
        <button className="btn btn-primary" onClick={handleNext}>
          {currentStep === TOTAL_STEPS ? '✓ Save project' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function SummarySection({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-section">
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value || '-'}</div>
    </div>
  );
}
