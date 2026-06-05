import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface VoiceRecorderProps {
  onAudioReady: (blob: Blob | null, textAlternative: string) => void;
  isSubmitting: boolean;
}

export default function VoiceRecorder({ onAudioReady, isSubmitting }: VoiceRecorderProps) {
  const {
    isRecording,
    audioBlob,
    audioUrl,
    analyserNode,
    startRecording,
    stopRecording,
    clearAudio,
    recordingTime,
  } = useAudio();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [textInput, setTextInput] = useState('');

  // Waveform visualization loop
  useEffect(() => {
    if (!isRecording || !analyserNode || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      animationRef.current = requestAnimationFrame(draw);

      analyserNode.getByteFrequencyData(dataArray);

      // Clear Canvas
      ctx.fillStyle = 'rgba(7, 7, 9, 0.4)'; // matches --bg-base
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waves
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      // Get computed color primary from CSS variable
      const rootStyle = getComputedStyle(document.documentElement);
      const primaryColor = rootStyle.getPropertyValue('--color-primary').trim() || '#06b6d4';

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.8;

        // Draw symmetric bars from center
        const yTop = (canvas.height - barHeight) / 2;
        ctx.fillStyle = primaryColor;
        ctx.fillRect(x, yTop, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, analyserNode]);

  const handleStop = async () => {
    await stopRecording();
  };

  const handleSend = () => {
    if (audioBlob) {
      onAudioReady(audioBlob, textInput.trim());
      clearAudio();
      setTextInput('');
    }
  };

  const handleDiscard = () => {
    clearAudio();
    setTextInput('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '16px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {isRecording ? 'RECORDING VOICE RESPONSE...' : audioBlob ? 'AUDIO RESPONSE PREVIEW' : 'SUBMIT A VOICE RESPONSE'}
        </span>
        {isRecording && (
          <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
            {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {/* Recording Visualizer / Wave */}
      {isRecording && (
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          style={{
            width: '100%',
            height: '80px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
          }}
        />
      )}

      {/* Playback preview */}
      {audioUrl && !isRecording && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <audio src={audioUrl} controls style={{ flexGrow: 1, height: '40px' }} />
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-start' }}>
        {!isRecording && !audioBlob && (
          <button className="btn btn-secondary" onClick={startRecording} disabled={isSubmitting}>
            <Mic size={16} style={{ color: 'var(--color-primary)' }} />
            Record Voice
          </button>
        )}

        {isRecording && (
          <button className="btn btn-danger" onClick={handleStop}>
            <Square size={16} />
            Stop Recording
          </button>
        )}

        {audioBlob && !isRecording && (
          <>
            <button className="btn btn-primary" onClick={handleSend} disabled={isSubmitting}>
              Send Audio Response
            </button>
            <button className="btn btn-secondary" onClick={handleDiscard} disabled={isSubmitting}>
              <Trash2 size={16} />
              Discard
            </button>
          </>
        )}
      </div>

      {audioBlob && !isRecording && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Speech Notes / Context (Optional text alternative for Gemini)
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Add brief details about what you spoke (helps model context)"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
