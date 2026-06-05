import { useState, useEffect, useCallback } from 'react';
import type { PersonaType } from '../services/geminiService';

export interface UseTTSReturn {
  isSpeaking: boolean;
  speak: (text: string, persona: PersonaType) => void;
  stop: () => void;
  supported: boolean;
  autoRead: boolean;
  setAutoRead: (val: boolean) => void;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [autoRead, setAutoReadInternal] = useState<boolean>(() => {
    return localStorage.getItem('vivaforce_autoread') === 'true';
  });

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const setAutoRead = (val: boolean) => {
    setAutoReadInternal(val);
    localStorage.setItem('vivaforce_autoread', String(val));
  };

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string, persona: PersonaType) => {
    if (!('speechSynthesis' in window)) return;

    stop();

    // Clean markdown formatting before reading
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/- /g, '')
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      .replace(/Critique:/i, '')
      .replace(/Validation:/i, 'Validation: ')
      .replace(/Exposure:/i, 'Exposure: ')
      .replace(/Next Question:/i, 'Next Question: ');

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Apply voice settings based on Persona
    if (persona === 'skeptic') {
      utterance.rate = 0.9;   // Slower and academic
      utterance.pitch = 0.95;  // Slightly deeper tone
    } else if (persona === 'vc') {
      utterance.rate = 1.15;  // Faster, high energy
      utterance.pitch = 1.05;  // Slightly higher tone
    } else if (persona === 'auditor') {
      utterance.rate = 1.0;   // Measured speed
      utterance.pitch = 0.85;  // Serious and monotone
    }

    // Assign English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en')
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
    supported,
    autoRead,
    setAutoRead,
  };
}
