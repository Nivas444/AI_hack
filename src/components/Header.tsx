import { Settings, CheckCircle, AlertCircle } from 'lucide-react';
import type { ProjectRole } from '../services/geminiService';

interface HeaderProps {
  onOpenSettings: () => void;
  hasKey: boolean;
  role: ProjectRole;
}

export default function Header({ onOpenSettings, hasKey, role }: HeaderProps) {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        background: 'rgba(7, 7, 9, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--google-blue)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M12 2L2 7v10l10 5 10-5V7z" />
              <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.15" />
              <line x1="12" y1="2" x2="12" y2="9" />
              <line x1="12" y1="15" x2="12" y2="22" />
              <line x1="2" y1="7" x2="9.5" y2="10.5" />
              <line x1="22" y1="7" x2="14.5" y2="10.5" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '1.15rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            VivaForce <span style={{ color: 'var(--google-blue)', fontWeight: 500 }}>AI</span>
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Active Mode Badge */}
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: '9999px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Mode:
            <span style={{ color: 'var(--color-primary)', textTransform: 'uppercase' }}>
              {role === 'student' ? 'Academic (Student)' : 'Pitch (Founder)'}
            </span>
          </div>

          {/* Key status */}
          <button
            onClick={onOpenSettings}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              color: hasKey ? '#10b981' : '#f59e0b',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: hasKey ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
              border: `1px solid ${hasKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`,
              transition: 'var(--transition-smooth)',
            }}
          >
            {hasKey ? (
              <>
                <CheckCircle size={16} />
                <span>API Key Loaded</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} />
                <span>API Key Needed</span>
              </>
            )}
          </button>

          {/* Settings trigger */}
          <button
            onClick={onOpenSettings}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
            }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
