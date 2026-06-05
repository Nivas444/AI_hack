import { Award, CheckCircle, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import type { ReportCardData } from '../services/geminiService';

interface ReportCardProps {
  data: ReportCardData;
  onRestart: () => void;
}

export default function ReportCard({ data, onRestart }: ReportCardProps) {
  // Score helper colors
  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10b981'; // Green
    if (score >= 70) return '#f59e0b'; // Gold
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Distinguished';
    if (score >= 80) return 'Strong Defense';
    if (score >= 70) return 'Passable';
    return 'Unsatisfactory';
  };

  const metrics = [
    { label: 'Technical Depth', value: data.technicalDepth, desc: 'Use of exact engineering terms, math, and architecture accuracy.' },
    { label: 'Defensive Reasoning', value: data.defensiveReasoning, desc: 'Ability to address vulnerabilities logically rather than getting defensive.' },
    { label: 'Presentation Clarity', value: data.presentationClarity, desc: 'Structured delivery, precision, and tone consistency.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      {/* 1. Header Hero Card */}
      <div
        className="glass-panel anim-glow"
        style={{
          padding: '40px 32px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, rgba(0,0,0,0.4) 100%)',
          borderWidth: '1px',
          borderColor: 'rgba(var(--color-primary-rgb), 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(var(--color-primary-rgb), 0.1)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(var(--color-primary-rgb), 0.2)',
          }}
        >
          <Award size={44} />
        </div>

        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
            Viva Performance Report Card
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Rigorous Technical Cross-Examination Complete</p>
        </div>

        {/* Huge Grade Circle */}
        <div style={{ marginTop: '16px', position: 'relative' }}>
          <div
            style={{
              fontSize: '4.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: getScoreColor(data.overallScore),
              lineHeight: 1,
            }}
          >
            {data.overallScore}
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: '6px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              padding: '4px 12px',
              borderRadius: '9999px',
              border: '1px solid var(--border-color)',
              display: 'inline-block',
            }}
          >
            Grade: {getScoreLabel(data.overallScore)}
          </div>
        </div>
      </div>

      {/* 2. Score Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {metrics.map((m, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{m.label}</span>
              <span style={{ fontWeight: 700, color: getScoreColor(m.value), fontSize: '1.2rem' }}>{m.value}%</span>
            </div>
            {/* Visual Bar Indicator */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
              <div
                style={{
                  width: `${m.value}%`,
                  height: '100%',
                  background: getScoreColor(m.value),
                  boxShadow: `0 0 10px ${getScoreColor(m.value)}`,
                  transition: 'width 1s ease-out',
                }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* 3. Qualitative Breakdown Panels */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
          General Panel Evaluation
        </h3>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '32px' }}>
          {data.generalCritique}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {/* Strengths */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#10b981' }}>
              <CheckCircle size={20} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Key Strengths Defended</h4>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.strengths.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '10px',
                    paddingLeft: '16px',
                    position: 'relative',
                  }}
                >
                  <span style={{ position: 'absolute', left: 0, color: '#10b981' }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#ef4444' }}>
              <AlertTriangle size={20} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Vulnerabilities Exposed</h4>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.weaknesses.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '10px',
                    paddingLeft: '16px',
                    position: 'relative',
                  }}
                >
                  <span style={{ position: 'absolute', left: 0, color: '#ef4444' }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-color)', margin: '32px 0' }} />

        {/* Actionable Recommendations */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--color-primary)' }}>
            <Lightbulb size={20} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Actionable Action Plan</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {data.recommendations.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(var(--color-primary-rgb), 0.1)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Restart Button */}
      <button
        className="btn btn-primary"
        onClick={onRestart}
        style={{ padding: '16px', width: '100%' }}
      >
        <RefreshCw size={18} />
        Initialize New Panel Interrogation
      </button>
    </div>
  );
}
