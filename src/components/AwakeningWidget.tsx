import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import { useAwakeningContext } from '@/contexts/AwakeningContext';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

const AwakeningWidget = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { score, loading, getLevelInfo, getProgressToNextLevel } = useAwakeningContext();

  if (loading) {
    return (
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-primary/20">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  if (!score) {
    return null;
  }

  const levelInfo = getLevelInfo();
  const progress = getProgressToNextLevel();
  const currentLevel = score.awakening_level || 1;
  const nextLevel = Math.min(currentLevel + 1, 10);

  return (
    <div
      onClick={() => navigate('/profile')}
      className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-primary/20 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg group"
    >
      {/* Level Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{levelInfo.icon}</span>
          <span className="text-xs font-medium text-foreground/80 truncate max-w-[100px]">
            {levelInfo.name}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      {/* Points */}
      <div className="flex items-center gap-1.5 mb-2">
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span className="text-sm font-semibold text-foreground">
          {score.total_points || 0}
        </span>
        <span className="text-xs text-muted-foreground">điểm</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress value={progress.progress} className="h-1.5" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{Math.round(progress.progress)}%</span>
          <span>→ Lv.{nextLevel}</span>
        </div>
      </div>
    </div>
  );
};

export default AwakeningWidget;
