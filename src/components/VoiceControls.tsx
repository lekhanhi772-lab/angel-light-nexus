import { Mic, MicOff, Volume2, VolumeX, Settings2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface VoiceControlsProps {
  // STT props
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isSTTSupported: boolean;
  transcript?: string;
  
  // TTS props  
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  isTTSSupported: boolean;
  
  // Settings
  rate: number;
  onRateChange: (rate: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
  
  // Loading state
  isLoading?: boolean;
}

const VoiceControls = ({
  isListening,
  onStartListening,
  onStopListening,
  isSTTSupported,
  transcript,
  isSpeaking,
  onStopSpeaking,
  isTTSSupported,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  voices,
  selectedVoice,
  onVoiceChange,
  isLoading,
}: VoiceControlsProps) => {
  const [showSettings, setShowSettings] = useState(false);

  // Filter voices to show Vietnamese first
  const sortedVoices = [...voices].sort((a, b) => {
    const aIsVi = a.lang.includes('vi') || a.lang.includes('VI');
    const bIsVi = b.lang.includes('vi') || b.lang.includes('VI');
    if (aIsVi && !bIsVi) return -1;
    if (!aIsVi && bIsVi) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex items-center gap-1">
      {/* Microphone Button - Voice Input */}
      {isSTTSupported && (
        <button
          onClick={isListening ? onStopListening : onStartListening}
          disabled={isLoading}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative"
          style={{
            background: isListening 
              ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
              : 'linear-gradient(135deg, rgba(135, 206, 235, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%)',
            border: isListening 
              ? '2px solid #EF4444'
              : '1px solid rgba(184, 134, 11, 0.3)',
            boxShadow: isListening 
              ? '0 0 20px rgba(239, 68, 68, 0.5)'
              : '0 2px 8px rgba(255, 215, 0, 0.2)',
          }}
          title={isListening ? 'Dừng ghi âm' : 'Nói để nhập (Tiếng Việt)'}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 text-white" />
              {/* Pulsing animation */}
              <span 
                className="absolute inset-0 rounded-xl animate-ping"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.4)',
                  animationDuration: '1s',
                }}
              />
            </>
          ) : (
            <Mic className="w-5 h-5" style={{ color: '#B8860B' }} />
          )}
        </button>
      )}

      {/* Speaker Button - Stop Speaking */}
      {isTTSSupported && isSpeaking && (
        <button
          onClick={onStopSpeaking}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            border: '2px solid #8B5CF6',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
          }}
          title="Dừng đọc"
        >
          <VolumeX className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Voice Settings */}
      {(isSTTSupported || isTTSSupported) && (
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(184, 134, 11, 0.2)',
              }}
              title="Cài đặt giọng nói"
            >
              <Settings2 className="w-4 h-4" style={{ color: '#B8860B' }} />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-72 p-4"
            style={{
              background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 100%)',
              border: '1px solid rgba(184, 134, 11, 0.3)',
              boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2)',
            }}
          >
            <div className="space-y-4">
              <h4 
                className="font-medium text-sm"
                style={{ color: '#B8860B' }}
              >
                🔊 Cài đặt Voice I/O
              </h4>

              {/* Voice Selection */}
              {isTTSSupported && voices.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium" style={{ color: '#006666' }}>
                    Giọng đọc
                  </label>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = voices.find(v => v.name === e.target.value);
                      onVoiceChange(voice || null);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(184, 134, 11, 0.2)',
                      color: '#006666',
                    }}
                  >
                    {sortedVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Speed */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium" style={{ color: '#006666' }}>
                    Tốc độ đọc
                  </label>
                  <span className="text-xs" style={{ color: '#87CEEB' }}>
                    {rate.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[rate]}
                  onValueChange={([value]) => onRateChange(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Pitch */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium" style={{ color: '#006666' }}>
                    Cao độ
                  </label>
                  <span className="text-xs" style={{ color: '#87CEEB' }}>
                    {pitch.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[pitch]}
                  onValueChange={([value]) => onPitchChange(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Info */}
              <p className="text-[10px] text-center" style={{ color: '#87CEEB' }}>
                ✨ Sử dụng Web Speech API miễn phí
              </p>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Transcript indicator */}
      {isListening && transcript && (
        <div 
          className="absolute bottom-full left-0 right-0 mb-2 px-3 py-2 rounded-xl text-sm"
          style={{
            background: 'rgba(255, 251, 230, 0.95)',
            border: '1px solid rgba(184, 134, 11, 0.3)',
            color: '#006666',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)',
          }}
        >
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#B8860B' }} />
            <span className="truncate">{transcript}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceControls;
