import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInterface;
}

// Extend Window interface for webkit prefixed APIs
declare global {
  interface Window {
    webkitSpeechRecognition: SpeechRecognitionConstructor;
    SpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface UseVoiceIOOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  onTranscript?: (text: string) => void;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

interface UseVoiceIOReturn {
  // Speech Recognition (STT)
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSTTSupported: boolean;
  
  // Speech Synthesis (TTS)
  isSpeaking: boolean;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isTTSSupported: boolean;
  
  // Settings
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
}

export const useVoiceIO = (options: UseVoiceIOOptions = {}): UseVoiceIOReturn => {
  const {
    lang = 'vi-VN',
    rate: initialRate = 1.0,
    pitch: initialPitch = 1.0,
    onTranscript,
    onSpeakStart,
    onSpeakEnd,
  } = options;

  // STT State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  
  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(initialRate);
  const [pitch, setPitch] = useState(initialPitch);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  const isSTTSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const isTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isTTSSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Try to select Vietnamese voice by default
      const vietnameseVoice = availableVoices.find(
        v => v.lang.includes('vi') || v.lang.includes('VI')
      );
      if (vietnameseVoice) {
        setSelectedVoice(vietnameseVoice);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [isTTSSupported]);

  // Initialize Speech Recognition
  const initRecognition = useCallback(() => {
    if (!isSTTSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const results = event.results;
      const currentTranscript = results[results.length - 1][0].transcript;
      setTranscript(currentTranscript);
      
      // If final result, call callback
      if (results[results.length - 1].isFinal) {
        onTranscript?.(currentTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast.error('Vui lòng cho phép truy cập microphone để sử dụng tính năng giọng nói 🎤');
      } else if (event.error === 'no-speech') {
        toast.info('Không nghe thấy giọng nói. Hãy thử lại nhé! ✨');
      } else if (event.error !== 'aborted') {
        toast.error('Có lỗi xảy ra với microphone. Vui lòng thử lại.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [isSTTSupported, lang, onTranscript]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSTTSupported) {
      toast.error('Trình duyệt không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome, Edge hoặc Safari nhé! 🌐');
      return;
    }

    // Stop any ongoing speech
    if (isSpeaking) {
      stopSpeaking();
    }

    recognitionRef.current = initRecognition();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast.error('Không thể bắt đầu nhận dạng giọng nói. Vui lòng thử lại.');
      }
    }
  }, [isSTTSupported, initRecognition, isSpeaking]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!isTTSSupported) {
      toast.error('Trình duyệt không hỗ trợ đọc văn bản. 🔊');
      return;
    }

    // Stop any ongoing speech
    speechSynthesis.cancel();
    
    // Stop listening if active
    if (isListening) {
      stopListening();
    }

    // Clean text for better speech
    const cleanText = text
      .replace(/[✨💛🌟⭐🎨💫🌿🌈💖🦋]/g, '') // Remove emojis
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '') // Remove markdown italic
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`/g, '') // Remove inline code
      .trim();

    if (!cleanText) {
      toast.info('Không có nội dung để đọc ✨');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      onSpeakStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      if (event.error !== 'canceled') {
        toast.error('Có lỗi khi đọc văn bản. Vui lòng thử lại.');
      }
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isTTSSupported, lang, rate, pitch, selectedVoice, isListening, stopListening, onSpeakStart, onSpeakEnd]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      speechSynthesis.cancel();
    };
  }, []);

  return {
    // STT
    isListening,
    transcript,
    startListening,
    stopListening,
    isSTTSupported,
    
    // TTS
    isSpeaking,
    speak,
    stopSpeaking,
    isTTSSupported,
    
    // Settings
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
  };
};

export default useVoiceIO;
