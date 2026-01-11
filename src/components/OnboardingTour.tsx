import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';

const OnboardingTour = () => {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
  } = useOnboarding();
  
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive || !currentStepData?.targetSelector) {
      setTargetRect(null);
      return;
    }

    const findTarget = () => {
      const target = document.querySelector(currentStepData.targetSelector!);
      if (target) {
        setTargetRect(target.getBoundingClientRect());
        // Scroll target into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    };

    findTarget();
    window.addEventListener('resize', findTarget);
    return () => window.removeEventListener('resize', findTarget);
  }, [isActive, currentStepData]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with spotlight effect */}
      <div 
        className="absolute inset-0 bg-black/60 transition-all duration-300"
        onClick={skipTour}
      />

      {/* Spotlight on target */}
      {targetRect && (
        <div
          className="absolute rounded-xl pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            border: '3px solid #DAA520',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "absolute z-[101] max-w-sm p-6 rounded-2xl shadow-2xl",
          "transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
        )}
        style={{
          top: targetRect 
            ? Math.min(targetRect.bottom + 20, window.innerHeight - 250)
            : '50%',
          left: targetRect
            ? Math.max(20, Math.min(targetRect.left, window.innerWidth - 380))
            : '50%',
          transform: targetRect ? 'none' : 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #FFFBE6 0%, #FFF8DC 100%)',
          border: '2px solid #DAA520',
        }}
      >
        {/* Close button */}
        <button
          onClick={skipTour}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[#FFFACD] transition-colors"
          style={{ color: '#B8860B' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-6 h-6" style={{ color: '#DAA520' }} />
          <span className="text-sm font-medium" style={{ color: '#8B6914' }}>
            Bước {currentStep + 1}/{totalSteps}
          </span>
        </div>

        {/* Title */}
        <h3 
          className="text-lg font-bold mb-2"
          style={{ color: '#B8860B' }}
        >
          {currentStepData?.title}
        </h3>

        {/* Description */}
        <p 
          className="text-sm mb-6"
          style={{ color: '#5C4033' }}
        >
          {currentStepData?.description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                i === currentStep 
                  ? "w-6 bg-gradient-to-r from-[#DAA520] to-[#B8860B]" 
                  : "bg-[#DAA520]/30"
              )}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={skipTour}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-[#FFFACD]"
            style={{ color: '#8B6914' }}
          >
            Bỏ qua
          </button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="p-2 rounded-lg transition-colors hover:bg-[#FFFACD]"
                style={{ color: '#B8860B' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
              }}
            >
              {currentStep === totalSteps - 1 ? 'Hoàn thành' : 'Tiếp theo'}
              {currentStep < totalSteps - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
