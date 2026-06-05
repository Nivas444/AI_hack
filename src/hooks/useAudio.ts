import { useState, useRef, useEffect } from 'react';

export interface UseAudioReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  analyserNode: AnalyserNode | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  clearAudio: () => void;
  recordingTime: number;
}

export function useAudio(): UseAudioReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      cleanupAudio();
    };
  }, [audioUrl]);

  const cleanupAudio = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAnalyserNode(null);
  };

  const startRecording = async () => {
    cleanupAudio();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up AudioContext and AnalyserNode for live visualization
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      setAnalyserNode(analyser);

      // Set up MediaRecorder
      // Choose supported mimeType
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      } else {
        mimeType = ''; // Let browser decide
      }

      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);
      };

      recorder.start(100); // chunk every 100ms
      setIsRecording(true);

      // Start recording timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to access microphone or initialize audio recording:', err);
      alert('Microphone access is required for audio responses. Please allow microphone permissions.');
    }
  };

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }

      // We listen to the stop event once to resolve the promise with the final blob
      const oldStop = recorder.onstop;
      recorder.onstop = (e) => {
        // Run original stop logic
        if (oldStop) oldStop.call(recorder, e);

        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        resolve(blob);
      };

      recorder.stop();
      setIsRecording(false);
      cleanupAudio();
    });
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  return {
    isRecording,
    audioBlob,
    audioUrl,
    analyserNode,
    startRecording,
    stopRecording,
    clearAudio,
    recordingTime,
  };
}
