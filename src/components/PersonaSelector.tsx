import { BookOpen, TrendingUp, Terminal, Award, Briefcase } from 'lucide-react';
import type { PersonaType, ProjectRole } from '../services/geminiService';

interface PersonaSelectorProps {
  activePersona: PersonaType;
  setPersona: (p: PersonaType) => void;
  activeRole: ProjectRole;
  setRole: (r: ProjectRole) => void;
}

export default function PersonaSelector({
  activePersona,
  setPersona,
  activeRole,
  setRole,
}: PersonaSelectorProps) {
  const roles = [
    {
      id: 'student' as ProjectRole,
      title: 'Academic Student',
      subtitle: 'Prepare for Thesis & Viva Defenses',
      icon: BookOpen,
      desc: 'Simulate university final thesis defense panels. Rigorous academic cross-examination focusing on technical viability and methodology.',
    },
    {
      id: 'founder' as ProjectRole,
      title: 'Startup Founder',
      subtitle: 'Prepare for VC Pitch Review',
      icon: Briefcase,
      desc: 'Simulate venture capital investor screenings. Focuses on unit economics, business scale, defensibility, and market validation.',
    },
  ];

  const personas = [
    {
      id: 'skeptic' as PersonaType,
      title: 'The Academic Skeptic',
      subtitle: 'Rigorous Technical & Math Depth',
      icon: Award,
      color: '#3b82f6',
      badgeColor: 'rgba(59, 130, 246, 0.15)',
      themeClass: 'theme-skeptic',
      focus: ['Algorithmic complexity', 'Theoretical bounds', 'Architectural flaws', 'Math verification'],
    },
    {
      id: 'vc' as PersonaType,
      title: 'The Venture Capitalist',
      subtitle: 'Market Defensibility & Growth',
      icon: TrendingUp,
      color: '#10b981',
      badgeColor: 'rgba(16, 185, 129, 0.15)',
      themeClass: 'theme-vc',
      focus: ['Market viability & sizing', 'Defensive moats', 'Unit economics', 'CAC / LTV scale'],
    },
    {
      id: 'auditor' as PersonaType,
      title: 'The Technical Auditor',
      subtitle: 'Security & Scaling Bottlenecks',
      icon: Terminal,
      color: '#f97316',
      badgeColor: 'rgba(249, 115, 22, 0.15)',
      themeClass: 'theme-auditor',
      focus: ['Vulnerabilities & privacy', 'Concurrency bottlenecks', 'Resource leakages', 'Failure modes'],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* 1. Project Role Selector */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            marginBottom: '4px',
          }}
        >
          1. Select Your Project Role
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '18px' }}>
          Tailor the contextual frame of reference for the interrogation
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {roles.map((item) => {
            const Icon = item.icon;
            const isSelected = activeRole === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setRole(item.id)}
                className="glass-panel"
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  borderWidth: '2px',
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)',
                  boxShadow: isSelected ? '0 0 20px rgba(var(--color-primary-rgb), 0.1)' : 'none',
                  background: isSelected ? 'rgba(255, 255, 255, 0.02)' : 'var(--bg-surface)',
                  transition: 'var(--transition-smooth)',
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(var(--color-primary-rgb), 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 'fit-content',
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{item.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                      {item.subtitle}
                    </span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Panel Persona Selector */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            marginBottom: '4px',
          }}
        >
          2. Select Your Panel Persona
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '18px' }}>
          Choose your primary cross-examiner theme. The interface styling adapts to the selected persona.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {personas.map((item) => {
            const Icon = item.icon;
            const isSelected = activePersona === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setPersona(item.id)}
                className={`glass-panel ${item.themeClass}`}
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  borderWidth: '2px',
                  borderColor: isSelected ? item.color : 'var(--border-color)',
                  boxShadow: isSelected ? `0 0 25px ${item.badgeColor}` : 'none',
                  background: isSelected ? 'rgba(255, 255, 255, 0.02)' : 'var(--bg-surface)',
                  transition: 'var(--transition-smooth)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: isSelected ? item.badgeColor : 'rgba(255, 255, 255, 0.02)',
                        color: isSelected ? item.color : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{item.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.subtitle}</span>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, marginTop: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        display: 'block',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Audit Focus:
                    </span>
                    <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.focus.map((f, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
