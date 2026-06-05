import { useState, useEffect } from 'react';
import Header from './components/Header';
import PersonaSelector from './components/PersonaSelector';
import DocumentUpload from './components/DocumentUpload';
import ChatInterface from './components/ChatInterface';
import ReportCard from './components/ReportCard';
import SettingsModal from './components/SettingsModal';
import { useGemini } from './hooks/useGemini';
import { FileText, Cpu, Key, AlertTriangle } from 'lucide-react';

export default function App() {
  const {
    apiKey,
    setApiKey,
    role,
    setRole,
    persona,
    setPersona,
    model,
    setModel,
    phase,
    round,
    history,
    isAnalyzing,
    isSubmitting,
    currentQuestion,
    reportCard,
    error,
    startExam,
    submitUserResponse,
    resetExam,
  } = useGemini();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [analyzingText, setAnalyzingText] = useState('Ingesting thesis context...');

  // Effect to rotate scanning text
  useEffect(() => {
    if (phase !== 'ANALYZING') return;
    const phrases = [
      'Ingesting thesis context...',
      'Mapping system architectures...',
      'Pinpointing algorithmic shortcuts...',
      'Identifying security bottlenecks...',
      'Constructing critique matrix...',
      'Formulating opening salvo...',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phrases.length;
      setAnalyzingText(phrases[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, [phase]);

  // Set the dynamic theme class on body
  useEffect(() => {
    document.body.className = ''; // Reset
    if (persona === 'skeptic') document.body.classList.add('theme-skeptic');
    else if (persona === 'vc') document.body.classList.add('theme-vc');
    else if (persona === 'auditor') document.body.classList.add('theme-auditor');
  }, [persona]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasKey={!!apiKey}
        role={role}
      />

      <main style={{ flexGrow: 1, padding: '40px 0' }}>
        <div className="container">
          
          {/* Phase 1: Setup Layout */}
          {phase === 'SETUP' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
              {/* Introduction Hero banner */}
              <div
                className="glass-panel"
                style={{
                  padding: '36px',
                  background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, rgba(255,255,255,0.01) 100%)',
                  textAlign: 'left',
                  borderWidth: '1px',
                  borderColor: 'rgba(var(--color-primary-rgb), 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Glow sphere background */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
                
                <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', margin: '0 0 12px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                  Rigorous Technical <span style={{ color: 'var(--color-primary)' }}>Cross-Examination</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '780px', marginBottom: '24px' }}>
                  VivaForce AI uses Gemini 2.5 Pro's multimodal powers to simulate elite academic defense panels and VC investor reviews. Ingest your design, defend your trade-offs, and receive a formal scorecard audit.
                </p>

                {!apiKey && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 18px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(245, 158, 11, 0.06)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      color: '#f59e0b',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Key size={18} />
                    <span><strong>API Connection Missing:</strong> Click here to insert your Google AI Studio API Key to enable panel interrogations.</span>
                  </div>
                )}
              </div>

              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ef4444',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                >
                  <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>System Error:</strong> {error}
                  </div>
                </div>
              )}

              {/* Persona and Upload Panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                <PersonaSelector
                  activePersona={persona}
                  setPersona={setPersona}
                  activeRole={role}
                  setRole={setRole}
                />
                
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />

                <DocumentUpload
                  onUpload={startExam}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>
          )}

          {/* Phase 2: Analyzing / Scanning Transition */}
          {phase === 'ANALYZING' && (
            <div
              className="flex-center"
              style={{
                minHeight: '450px',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <div
                className="glass-panel anim-scan-container anim-glow"
                style={{
                  width: '120px',
                  height: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  border: '2px solid rgba(var(--color-primary-rgb), 0.3)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div className="anim-scan-line" />
                <FileText size={48} style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
                  Analyzing Project Corpus
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                  }}
                >
                  <Cpu size={16} className="anim-glow" style={{ animation: 'pulse 1.5s infinite' }} />
                  <span>{analyzingText}</span>
                </div>
              </div>
            </div>
          )}

          {/* Phase 3: Interrogation Chat Loop */}
          {phase === 'EXAM' && (
            <ChatInterface
              history={history}
              currentQuestion={currentQuestion}
              round={round}
              isSubmitting={isSubmitting}
              onSend={submitUserResponse}
              onExit={resetExam}
              persona={persona}
              role={role}
              error={error}
            />
          )}

          {/* Phase 4: Scoring Report Card */}
          {phase === 'REPORT' && reportCard && (
            <ReportCard
              data={reportCard}
              onRestart={resetExam}
            />
          )}

        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        model={model}
        setModel={setModel}
      />
    </div>
  );
}
