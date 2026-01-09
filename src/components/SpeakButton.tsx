import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SpeakButtonProps {
  text: string;
  isSpeaking: boolean;
  currentSpeakingId: string | null;
  messageId: string;
  onSpeak: (text: string, id: string) => void;
  onStop: () => void;
  isTTSSupported: boolean;
}

const SpeakButton = ({
  text,
  isSpeaking,
  currentSpeakingId,
  messageId,
  onSpeak,
  onStop,
  isTTSSupported,
}: SpeakButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!isTTSSupported) return null;
  
  const isThisMessageSpeaking = isSpeaking && currentSpeakingId === messageId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisMessageSpeaking) {
      onStop();
    } else {
      onSpeak(text, messageId);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-2 sm:p-1.5 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 rounded-lg transition-all duration-200 flex items-center justify-center"
      style={{
        background: isThisMessageSpeaking 
          ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
          : isHovered 
            ? 'rgba(255, 215, 0, 0.4)'
            : 'rgba(255, 215, 0, 0.3)',
        border: isThisMessageSpeaking
          ? '2px solid #8B5CF6'
          : '2px solid rgba(184, 134, 11, 0.35)',
        boxShadow: isThisMessageSpeaking 
          ? '0 0 10px rgba(139, 92, 246, 0.4)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
      title={isThisMessageSpeaking ? 'Dừng đọc' : 'Nghe Angel đọc'}
    >
      {isThisMessageSpeaking ? (
        <VolumeX className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
      ) : (
        <Volume2 className="w-5 h-5 sm:w-4 sm:h-4" style={{ color: '#B8860B' }} />
      )}
    </button>
  );
};

export default SpeakButton;
