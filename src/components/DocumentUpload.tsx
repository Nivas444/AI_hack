import { useState, useRef } from 'react';
import { Upload, FileText, X, AlertTriangle, Cpu } from 'lucide-react';

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
}

export default function DocumentUpload({ onUpload, isAnalyzing }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile: File) => {
    const isPDF = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
    const isPPTX =
      selectedFile.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      selectedFile.name.endsWith('.pptx');

    if (!isPDF && !isPPTX) {
      setError('Unsupported file type. Please upload a PDF or PPTX file.');
      return false;
    }

    // Size limit: 15MB
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('File size exceeds 15MB limit. Please upload a smaller file.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartExam = () => {
    if (file) {
      onUpload(file);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            marginBottom: '4px',
          }}
        >
          3. Upload Project Document
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '18px' }}>
          Upload your Thesis, Project Report, or Pitch Slide Deck to feed the examiner panel.
        </p>
      </div>

      <div
        className="glass-panel"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: '2px dashed var(--border-color)',
          borderColor: dragActive ? 'var(--color-primary)' : 'var(--border-color)',
          padding: '40px 24px',
          textAlign: 'center',
          borderRadius: 'var(--radius-lg)',
          background: dragActive ? 'rgba(var(--color-primary-rgb), 0.02)' : 'rgba(0, 0, 0, 0.2)',
          cursor: file ? 'default' : 'pointer',
          transition: 'var(--transition-smooth)',
        }}
        onClick={file ? undefined : onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.pptx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {!file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Upload size={28} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Drag and drop your file here, or{' '}
                <span style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>browse</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Supports PDF or PPTX slide decks (Max 15MB)
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '600px', margin: '0 auto', padding: '12px 18px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
              <div
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: 'rgba(var(--color-primary-rgb), 0.1)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={24} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{file.name}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatBytes(file.size)}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              style={{
                padding: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: 'var(--radius-sm)',
            color: '#ef4444',
            fontSize: '0.85rem',
          }}
        >
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          {file.name.endsWith('.pptx') && (
            <div
              style={{
                display: 'flex',
                gap: '10px',
                padding: '12px',
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                borderRadius: 'var(--radius-sm)',
                color: '#f59e0b',
                fontSize: '0.75rem',
                lineHeight: 1.4,
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>
                Note: PDF format is recommended for slide decks to ensure full graphical layout extraction. PPTX files will have text extracted for processing.
              </span>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleStartExam}
            disabled={isAnalyzing}
            style={{ width: '100%', padding: '16px' }}
          >
            <Cpu size={18} />
            {isAnalyzing ? 'Analyzing Technical Context...' : 'Initialize Interrogation Panel'}
          </button>
        </div>
      )}
    </div>
  );
}
