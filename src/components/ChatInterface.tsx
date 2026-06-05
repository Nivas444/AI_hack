import { useState, useRef, useEffect } from 'react';
import { Send, LogOut, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import type { ChatMessage, PersonaType, ProjectRole } from '../services/geminiService';
import VoiceRecorder from './VoiceRecorder';
import { useTTS } from '../hooks/useTTS';

interface ChatInterfaceProps {
  history: ChatMessage[];
  currentQuestion: string | null;
  round: number;
  isSubmitting: boolean;
  onSend: (text: string, audio: Blob | null) => void;
  onExit: () => void;
  persona: PersonaType;
  role: ProjectRole;
  error: string | null;
}

export default function ChatInterface({
  history,
  currentQuestion,
  round,
  isSubmitting,
  onSend,
  onExit,
  persona,
  error,
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const { isSpeaking, speak, stop, supported, autoRead, setAutoRead } = useTTS();

  // Automatically read new question when it changes
  useEffect(() => {
    if (autoRead && currentQuestion) {
      speak(currentQuestion, persona);
    }
  }, [currentQuestion, autoRead, persona, speak]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isSubmitting]);

  const handleSendText = () => {
    if (inputText.trim() && !isSubmitting) {
      onSend(inputText.trim(), null);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleAudioReady = (audioBlob: Blob | null, textAlternative: string) => {
    if (audioBlob) {
      onSend(textAlternative || '[Voice Response]', audioBlob);
    }
  };

  const getPersonaName = (p: PersonaType) => {
    if (p === 'skeptic') return 'The Academic Skeptic';
    if (p === 'vc') return 'The Venture Capitalist';
    return 'The Technical Auditor';
  };

  // Parse custom format: **Critique:** \n - *Validation:* X \n - *Exposure:* Y \n\n **Next Question:** \n Z
  const renderMessageContent = (text: string, critique?: any) => {
    // If the message contains structured critiques, let's extract them for custom design blocks
    if (critique) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Validation */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.04)',
              borderLeft: '4px solid #10b981',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: '#10b981', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
              Validation:
            </strong>
            <span style={{ color: 'var(--text-primary)' }}>{critique.validation}</span>
          </div>

          {/* Exposure */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.04)',
              borderLeft: '4px solid #ef4444',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: '#ef4444', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
              Vulnerability Exposed:
            </strong>
            <span style={{ color: 'var(--text-primary)' }}>{critique.exposure}</span>
          </div>
        </div>
      );
    }

    // Default formatting helper for prompt text
    // Handles markdown bold text `**`
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={idx} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 140px)', // adjust based on header
        maxHeight: '800px',
      }}
    >
      {/* 1. Exam Header Panel */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          borderBottom: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
              Cross-Examination Panel
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Examiner: <strong style={{ color: 'var(--color-primary)' }}>{getPersonaName(persona)}</strong>
            </span>
          </div>
        </div>

        {/* Progress Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              SESSION ROUNDS
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Round {round} of 5
            </span>
          </div>
          {/* Visual round bars */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((r) => (
              <div
                key={r}
                style={{
                  width: '8px',
                  height: '18px',
                  borderRadius: '2px',
                  background: r < round ? 'var(--color-primary)' : r === round ? 'rgba(var(--color-primary-rgb), 0.3)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${r === round ? 'var(--color-primary)' : 'transparent'}`,
                  boxShadow: r < round ? '0 0 8px var(--color-primary)' : 'none',
                  transition: 'var(--transition-smooth)',
                }}
              />
            ))}
          </div>

          {supported && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (isSpeaking) {
                  stop();
                } else if (currentQuestion) {
                  speak(currentQuestion, persona);
                }
              }}
              style={{
                padding: '8px 12px',
                fontSize: '0.8rem',
                height: 'fit-content',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isSpeaking ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderColor: isSpeaking ? 'var(--color-primary)' : 'var(--border-color)',
              }}
            >
              <Volume2 size={14} className={isSpeaking ? 'anim-glow' : ''} style={{ animation: isSpeaking ? 'pulseGlow 2s infinite' : 'none' }} />
              <span>{isSpeaking ? 'Stop Voice' : 'Speak Question'}</span>
            </button>
          )}

          {supported && (
            <button
              className="btn btn-secondary"
              onClick={() => setAutoRead(!autoRead)}
              style={{
                padding: '8px 12px',
                fontSize: '0.8rem',
                height: 'fit-content',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: autoRead ? '#10b981' : 'var(--text-muted)',
                borderColor: autoRead ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)',
              }}
            >
              {autoRead ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>Auto-Read: {autoRead ? 'ON' : 'OFF'}</span>
            </button>
          )}

          <button
            className="btn btn-secondary btn-danger"
            onClick={onExit}
            style={{ padding: '8px 12px', fontSize: '0.8rem', height: 'fit-content' }}
          >
            <LogOut size={14} />
            Exit Exam
          </button>
        </div>
      </div>

      {/* 2. Messages Feed */}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderLeft: '1px solid var(--border-color)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Welcome Salvo (if no history, show current question as first item) */}
        {history.length === 0 && currentQuestion && (
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              maxWidth: '85%',
              alignSelf: 'flex-start',
              borderLeft: '3px solid var(--color-primary)',
              background: 'rgba(var(--color-primary-rgb), 0.02)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                  {getPersonaName(persona)} (Panel)
                </span>
                {supported && (
                  <button
                    onClick={() => speak(currentQuestion, persona)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Read question out loud"
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
              <div>{renderMessageContent(currentQuestion)}</div>
            </div>
          </div>
        )}

        {/* Regular Message History */}
        {history.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={isUser ? '' : 'glass-panel'}
              style={{
                padding: isUser ? '12px 18px' : '20px',
                maxWidth: '85%',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                borderRadius: isUser ? 'var(--radius-md) var(--radius-md) 0 var(--radius-md)' : 'var(--radius-md)',
                background: isUser ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.2)',
                border: isUser ? '1px solid var(--border-color)' : `1px solid var(--border-color)`,
                borderLeft: isUser ? '1px solid var(--border-color)' : `3px solid var(--color-primary)`,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: isUser ? 'var(--text-muted)' : 'var(--color-primary)',
                    }}
                  >
                    {isUser ? 'Candidate Response' : getPersonaName(persona)}
                  </span>
                  {!isUser && supported && (
                    <button
                      onClick={() => speak(msg.text, persona)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Read out loud"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
                <div>{renderMessageContent(msg.text, msg.critique)}</div>
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isSubmitting && (
          <div
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <RefreshCw className="anim-glow" size={16} style={{ animation: 'spin 2s linear infinite' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Examiner panel is cross-referencing thesis details...
            </span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: '#ef4444',
              fontSize: '0.85rem',
              maxWidth: '85%',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Controls & Inputs Panel */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          borderTop: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your structured engineering defense here..."
            className="form-input"
            rows={2}
            disabled={isSubmitting}
            style={{ resize: 'none', fontFamily: 'var(--font-sans)' }}
          />
          <button
            onClick={handleSendText}
            disabled={isSubmitting || !inputText.trim()}
            className="btn btn-primary"
            style={{ padding: '0 24px', height: 'auto' }}
          >
            <Send size={18} />
          </button>
        </div>

        {/* Voice alternative */}
        <VoiceRecorder onAudioReady={handleAudioReady} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
