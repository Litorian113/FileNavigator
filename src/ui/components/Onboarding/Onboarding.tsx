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
    question: 'Wie heißt dein Projekt?',
    hint: 'Der Name und eine kurze Vision helfen der KI, den Kontext zu verstehen.',
    field: 'name',
    placeholder: 'z.B. TeamChat Pro',
    aiType: 'vision',
    aiLabel: 'verbessern',
  },
  {
    icon: UsersIcon,
    question: 'Wer nutzt das Produkt?',
    hint: 'Beschreibe die Haupt-Zielgruppe(n) so genau wie möglich.',
    field: 'audience',
    placeholder: 'z.B. Remote-arbeitende Teams in mittelständischen Tech-Unternehmen...',
    aiType: 'audience',
    aiLabel: 'verbessern',
  },
  {
    icon: SparklesIcon,
    question: 'Was sind die Kernfeatures?',
    hint: 'Liste die wichtigsten Funktionen auf, die dein Produkt bietet.',
    field: 'features',
    placeholder: '• Echtzeit-Chat mit Threading\n• Videocalls\n• Dateifreigabe',
    aiType: 'features',
    aiLabel: 'verbessern',
  },
  {
    icon: PaletteIcon,
    question: 'Wie sieht und fühlt sich das Produkt an?',
    hint: 'Beschreibe die Design-Prinzipien, Farbpalette, Tonalität.',
    field: 'design',
    placeholder: 'z.B. Modern und clean mit viel Weißraum. Primärfarbe: Blau (#2563EB)...',
    aiType: 'design',
    aiLabel: 'verbessern',
  },
  {
    icon: BookOpenIcon,
    question: 'Gibt es wichtige Begriffe im Projekt?',
    hint: 'Definiere projektspezifische Begriffe, die die KI kennen sollte.',
    field: 'terminology',
    placeholder: '• Workspace = Ein Team-Bereich\n• Channel = Themenbasierter Chat-Raum',
    aiType: 'terms',
    aiLabel: 'verbessern',
  },
  {
    icon: CheckCircleIcon,
    question: 'Zusammenfassung',
    hint: 'Überprüfe deine Eingaben. Du kannst sie jederzeit später bearbeiten.',
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
      alert('Bitte erst Text eingeben, den die KI verbessern soll.');
      return;
    }

    setIsImproving(true);
    try {
      const improved = await actions.improveWithAI(text, type);
      setFormData((prev) => ({ ...prev, [field]: improved }));
    } catch (error) {
      console.error('AI improvement failed:', error);
      alert('Fehler bei der KI-Anfrage.');
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
              placeholder="Was ist die Vision? z.B. Eine moderne Team-Kommunikationsplattform für Remote-Teams..."
            />
            <button
              className="ai-improve-btn"
              onClick={() => handleImprove('vision', 'vision')}
              disabled={isImproving}
            >
              {isImproving ? (
                <>
                  <LoaderIcon size={14} />
                  Verbessere...
                </>
              ) : (
                <>
                  <SparklesIcon size={14} />
                  verbessern
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
                  Verbessere...
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
          Zusammenfassung
        </div>
        <div className="step-hint">
          Überprüfe deine Eingaben. Du kannst sie jederzeit später bearbeiten.
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SummarySection label="Projekt" value={formData.name} />
        <SummarySection label="Vision" value={formData.vision} />
        <SummarySection label="Zielgruppe" value={formData.audience} />
        <SummarySection label="Kernfeatures" value={formData.features} />
        <SummarySection label="Designsprache" value={formData.design} />
        <SummarySection label="Terminologie" value={formData.terminology} />
      </div>
    </div>
  );

  return (
    <div className="onboarding-container visible">
      <div className="onboarding-header">
        <div className="onboarding-logo">
          <MoonIcon size={32} />
        </div>
        <h1 className="onboarding-title">Projekt einrichten</h1>
        <p className="onboarding-subtitle">
          Beschreibe dein Projekt, damit die KI dir besser helfen kann
        </p>
      </div>

      {renderStepDots()}
      {renderStepContent()}

      <div className="onboarding-nav">
        {currentStep > 1 && (
          <button className="btn btn-secondary" onClick={handleBack}>
            Zurück
          </button>
        )}
        <button className="btn btn-primary" onClick={handleNext}>
          {currentStep === TOTAL_STEPS ? '✓ Projekt speichern' : 'Weiter'}
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
