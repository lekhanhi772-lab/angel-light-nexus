import React, { createContext, useContext, ReactNode } from 'react';
import { 
  useAwakeningScore, 
  AwakeningScore, 
  ConversationEvaluation, 
  CamlyClaim 
} from '@/hooks/useAwakeningScore';

interface AwakeningContextType {
  score: AwakeningScore | null;
  recentEvaluations: ConversationEvaluation[];
  claims: CamlyClaim[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getProgressToNextLevel: () => {
    current: number;
    next: number;
    progress: number;
    pointsToNext?: number;
  };
  getLevelInfo: () => {
    name: string;
    icon: string;
    level: number;
  };
  claimCamly: (pointsToConvert: number, walletAddress: string) => Promise<string>;
}

const AwakeningContext = createContext<AwakeningContextType | undefined>(undefined);

export const AwakeningProvider = ({ children }: { children: ReactNode }) => {
  const awakeningData = useAwakeningScore();

  return (
    <AwakeningContext.Provider value={awakeningData}>
      {children}
    </AwakeningContext.Provider>
  );
};

export const useAwakeningContext = () => {
  const context = useContext(AwakeningContext);
  if (context === undefined) {
    throw new Error('useAwakeningContext must be used within an AwakeningProvider');
  }
  return context;
};
