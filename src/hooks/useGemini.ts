import { useState } from 'react';
import type {
  ChatMessage,
  PersonaType,
  ProjectRole,
  ExamCritique,
  ReportCardData,
} from '../services/geminiService';
import {
  analyzeDocumentAndGetFirstQuestion,
  submitAnswerAndGetCritique,
  compileReportCard,
} from '../services/geminiService';

export interface UseGeminiReturn {
  apiKey: string;
  setApiKey: (key: string) => void;
  role: ProjectRole;
  setRole: (role: ProjectRole) => void;
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
  model: string;
  setModel: (model: string) => void;
  
  phase: 'SETUP' | 'ANALYZING' | 'EXAM' | 'REPORT';
  round: number;
  history: ChatMessage[];
  isAnalyzing: boolean;
  isSubmitting: boolean;
  currentQuestion: string | null;
  lastCritique: { validation: string; exposure: string } | null;
  reportCard: ReportCardData | null;
  error: string | null;

  startExam: (file: File) => Promise<void>;
  submitUserResponse: (textAnswer: string, audioBlob: Blob | null) => Promise<void>;
  resetExam: () => void;
}

// Convert a Blob to base64 object for Gemini inlineData
async function blobToGenerativePart(blob: Blob): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: blob.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useGemini(): UseGeminiReturn {
  const [apiKey, setApiKeyInternal] = useState<string>(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('vivaforce_api_key') || '';
  });
  const [role, setRole] = useState<ProjectRole>('student');
  const [persona, setPersona] = useState<PersonaType>('skeptic');
  const [model, setModelInternal] = useState<string>(() => localStorage.getItem('vivaforce_model') || 'gemini-2.5-pro');

  const setModel = (m: string) => {
    setModelInternal(m);
    localStorage.setItem('vivaforce_model', m);
  };

  const [phase, setPhase] = useState<'SETUP' | 'ANALYZING' | 'EXAM' | 'REPORT'>('SETUP');
  const [round, setRound] = useState<number>(1);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [lastCritique, setLastCritique] = useState<{ validation: string; exposure: string } | null>(null);
  const [reportCard, setReportCard] = useState<ReportCardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cached file part to send with subsequent turns
  const [filePart, setFilePart] = useState<any>(null);

  const setApiKey = (key: string) => {
    setApiKeyInternal(key);
    localStorage.setItem('vivaforce_api_key', key);
  };

  const startExam = async (file: File) => {
    if (!apiKey) {
      setError('Please provide a Gemini API Key in Settings to begin.');
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setPhase('ANALYZING');

    try {
      const { openingQuestion, filePart: resolvedPart } = await analyzeDocumentAndGetFirstQuestion(
        apiKey,
        file,
        role,
        persona,
        model
      );

      setFilePart(resolvedPart);
      setCurrentQuestion(openingQuestion);
      setHistory([]);
      setRound(1);
      setLastCritique(null);
      setReportCard(null);
      setPhase('EXAM');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to analyze the document. Please verify your API Key and connection.');
      setPhase('SETUP');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitUserResponse = async (textAnswer: string, audioBlob: Blob | null) => {
    if (isSubmitting || !currentQuestion) return;
    setError(null);
    setIsSubmitting(true);

    // Save user's text representation in history
    const userMsgText = textAnswer || "[Voice Response]";
    const newHistory: ChatMessage[] = [...history, { role: 'user', text: userMsgText }];
    setHistory(newHistory);

    try {
      let audioPart = null;
      if (audioBlob) {
        audioPart = await blobToGenerativePart(audioBlob);
      }

      if (round >= 5) {
        // This was the 5th answer, complete and show report card
        // We'll add a final mock "model" message showing the processing
        setHistory((prev) => [...prev, { role: 'model', text: 'Compiling final performance report card...' }]);
        
        // Wait briefly for smooth user transition
        await new Promise((r) => setTimeout(r, 1000));
        
        const card = await compileReportCard(apiKey, newHistory, role, persona, filePart, model);
        setReportCard(card);
        setPhase('REPORT');
      } else {
        // Get critique and next question
        const critique: ExamCritique = await submitAnswerAndGetCritique(
          apiKey,
          newHistory,
          textAnswer,
          audioPart,
          role,
          persona,
          filePart,
          model
        );

        setLastCritique({
          validation: critique.validation,
          exposure: critique.exposure,
        });

        // Add the examiner response with critique to history
        const examinerMessageText = `**Critique:**\n- *Validation:* ${critique.validation}\n- *Exposure:* ${critique.exposure}\n\n**Next Question:**\n${critique.nextQuestion}`;
        
        setHistory((prev) => [
          ...prev,
          {
            role: 'model',
            text: examinerMessageText,
            critique: {
              validation: critique.validation,
              exposure: critique.exposure,
            },
          },
        ]);

        setCurrentQuestion(critique.nextQuestion);
        setRound((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to submit response. Please try again.');
      // Rollback history additions if failed
      setHistory(history);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetExam = () => {
    setPhase('SETUP');
    setRound(1);
    setHistory([]);
    setCurrentQuestion(null);
    setLastCritique(null);
    setReportCard(null);
    setFilePart(null);
    setError(null);
  };

  return {
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
    lastCritique,
    reportCard,
    error,

    startExam,
    submitUserResponse,
    resetExam,
  };
}
