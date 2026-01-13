import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const EVALUATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-conversation`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface EvaluationResult {
  success: boolean;
  points_awarded?: number;
  feedback?: string;
  skip?: boolean;
  existing?: boolean;
}

export function useConversationEvaluation() {
  const { user, session } = useAuth();
  const evaluatedConversations = useRef<Set<string>>(new Set());
  const pendingEvaluation = useRef<{ conversationId: string; messages: Message[] } | null>(null);
  const evaluationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Evaluate a conversation
  const evaluateConversation = useCallback(async (
    conversationId: string,
    messages: Message[]
  ): Promise<EvaluationResult | null> => {
    if (!user || !session?.access_token) {
      console.log('[evaluate] No user or session, skipping evaluation');
      return null;
    }

    // Skip if already evaluated
    if (evaluatedConversations.current.has(conversationId)) {
      console.log('[evaluate] Conversation already evaluated:', conversationId);
      return null;
    }

    // Need at least 3 user messages
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length < 3) {
      console.log('[evaluate] Not enough messages for evaluation:', userMessages.length);
      return null;
    }

    try {
      console.log('[evaluate] Evaluating conversation:', conversationId);
      
      const response = await fetch(EVALUATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          messages,
        }),
      });

      if (!response.ok) {
        console.error('[evaluate] Evaluation request failed:', response.status);
        return null;
      }

      const result = await response.json();
      
      // Mark as evaluated
      evaluatedConversations.current.add(conversationId);
      
      if (result.success) {
        console.log('[evaluate] ✨ Evaluation complete:', result.points_awarded, 'points');
      } else if (result.existing) {
        console.log('[evaluate] Conversation already evaluated (server)');
      } else if (result.skip) {
        console.log('[evaluate] Evaluation skipped (not enough messages)');
      }

      return result;
    } catch (error) {
      console.error('[evaluate] Evaluation error:', error);
      return null;
    }
  }, [user, session]);

  // Schedule evaluation after delay (for idle detection)
  const scheduleEvaluation = useCallback((conversationId: string, messages: Message[]) => {
    // Clear any existing timeout
    if (evaluationTimeout.current) {
      clearTimeout(evaluationTimeout.current);
    }

    // Store pending evaluation
    pendingEvaluation.current = { conversationId, messages };

    // Schedule evaluation after 30 seconds of inactivity
    evaluationTimeout.current = setTimeout(async () => {
      if (pendingEvaluation.current && 
          pendingEvaluation.current.conversationId === conversationId) {
        await evaluateConversation(conversationId, messages);
        pendingEvaluation.current = null;
      }
    }, 30000);
  }, [evaluateConversation]);

  // Evaluate immediately (on page leave or conversation switch)
  const evaluateNow = useCallback(async () => {
    if (pendingEvaluation.current) {
      const { conversationId, messages } = pendingEvaluation.current;
      pendingEvaluation.current = null;
      
      if (evaluationTimeout.current) {
        clearTimeout(evaluationTimeout.current);
        evaluationTimeout.current = null;
      }

      return await evaluateConversation(conversationId, messages);
    }
    return null;
  }, [evaluateConversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (evaluationTimeout.current) {
        clearTimeout(evaluationTimeout.current);
      }
      // Try to evaluate pending conversation on unmount
      if (pendingEvaluation.current && user && session?.access_token) {
        const { conversationId, messages } = pendingEvaluation.current;
        // Use beacon API for reliable delivery on page unload
        const data = JSON.stringify({ conversation_id: conversationId, messages });
        navigator.sendBeacon?.(EVALUATE_URL, new Blob([data], { type: 'application/json' }));
      }
    };
  }, [user, session]);

  return {
    evaluateConversation,
    scheduleEvaluation,
    evaluateNow,
    isEvaluated: (conversationId: string) => evaluatedConversations.current.has(conversationId),
  };
}
