import { useState, useRef, useCallback, useEffect } from 'react';

interface UseEdgeTTSOptions {
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
}

interface UseEdgeTTSReturn {
  isSpeaking: boolean;
  isLoading: boolean;
  speak: (text: string, voice?: string, languageCode?: string) => Promise<boolean>;
  stopSpeaking: () => void;
  error: string | null;
}

const EDGE_TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/edge-tts`;

export const useEdgeTTS = (options: UseEdgeTTSOptions = {}): UseEdgeTTSReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const stopSpeaking = useCallback(() => {
    cleanup();
    setIsSpeaking(false);
    setIsLoading(false);
    options.onSpeakingEnd?.();
  }, [cleanup, options]);

  const speak = useCallback(async (
    text: string, 
    voice?: string, 
    languageCode?: string
  ): Promise<boolean> => {
    // Stop any current speech
    stopSpeaking();
    
    if (!text.trim()) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(EDGE_TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: text.trim(),
          voice,
          languageCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.audio) {
        throw new Error('No audio data received');
      }

      // Decode base64 to blob
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.contentType || 'audio/mpeg' });
      
      // Create audio element
      const audioUrl = URL.createObjectURL(blob);
      audioUrlRef.current = audioUrl;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event handlers
      audio.onplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
        options.onSpeakingStart?.();
      };

      audio.onended = () => {
        setIsSpeaking(false);
        options.onSpeakingEnd?.();
        cleanup();
      };

      audio.onerror = (e) => {
        console.error('[useEdgeTTS] Audio playback error:', e);
        setError('Audio playback failed');
        setIsSpeaking(false);
        setIsLoading(false);
        options.onSpeakingEnd?.();
        cleanup();
      };

      // Play audio
      await audio.play();
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useEdgeTTS] Error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      setIsSpeaking(false);
      return false;
    }
  }, [stopSpeaking, cleanup, options]);

  return {
    isSpeaking,
    isLoading,
    speak,
    stopSpeaking,
    error,
  };
};
