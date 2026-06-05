import { useState } from 'react';
import { Settings, X, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  model,
  setModel,
}: SettingsModalProps) {
  const isEnvKey = !!import.meta.env.VITE_GEMINI_API_KEY && apiKey === import.meta.env.VITE_GEMINI_API_KEY;
  const [localKey, setLocalKey] = useState(isEnvKey ? '' : apiKey);
  const [localModel, setLocalModel] = useState(model);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (isEnvKey && !localKey) {
      setApiKey(import.meta.env.VITE_GEMINI_API_KEY);
    } else {
      setApiKey(localKey);
    }
    setModel(localModel);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '32px',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.1)',
              color: 'var(--color-primary)',
            }}
          >
            <Settings size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>System Settings</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Configure API connections</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <label
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Gemini API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder={isEnvKey ? "•••••••••••• (Loaded securely from .env)" : "AIzaSy..."}
              className="form-input"
              style={{ paddingRight: '48px' }}
            />
            {!isEnvKey && localKey && (
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
          {isEnvKey && (
            <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
              ✓ Loaded from .env (raw key is hidden for security). Enter a key above to override.
            </p>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Get your key from the{' '}
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
            >
              Google AI Studio Console
            </a>
            .
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          <label
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Gemini Model Selection
          </label>
          <select
            value={localModel}
            onChange={(e) => setLocalModel(e.target.value)}
            className="form-input"
            style={{ background: 'rgba(0, 0, 0, 0.4)', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Standard)</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (High Free Quota)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          </select>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            If you hit 429 quota exhaustion errors on Pro, switch to **Gemini 2.5 Flash** for high free tier availability.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            marginBottom: '28px',
          }}
        >
          <ShieldCheck size={28} style={{ color: '#10b981', flexShrink: 0 }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Your key is saved locally in your browser's local storage and is sent directly to Google's API servers.
            It never touches any third-party intermediary.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
