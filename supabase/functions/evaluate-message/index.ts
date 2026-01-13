import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId, conversationId, userId, userMessage } = await req.json();

    if (!userId || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip evaluation for very short messages
    if (userMessage.length < 10) {
      return new Response(
        JSON.stringify({ points: 0, reason: 'Message too short' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Quick AI evaluation of the message
    const evaluationPrompt = `Đánh giá nhanh câu hỏi sau của user trong 1-2 câu:

"${userMessage.substring(0, 500)}"

Đánh giá dựa trên các tiêu chí:
1. Câu hỏi ánh sáng (is_light_question): Câu hỏi về tâm linh, chữa lành, yêu thương, biết ơn, phát triển tâm hồn
2. Chất lượng (quality): Câu hỏi rõ ràng, có chiều sâu, thể hiện sự suy nghĩ
3. Khám phá (exploration): Thể hiện năng lượng tìm tòi, học hỏi, mong muốn hiểu biết
4. Chiều sâu (depth): Câu hỏi có tầng sâu triết lý, không bề mặt

Trả về CHÍNH XÁC JSON format này (KHÔNG markdown, KHÔNG giải thích):
{"is_light_question":true/false,"quality":0-10,"exploration":0-10,"depth":0-10,"reason":"1 câu ngắn gọn"}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: 'You are a quick evaluator. Return ONLY valid JSON, no markdown, no explanation.' },
          { role: 'user', content: evaluationPrompt }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI evaluation failed:', await response.text());
      return new Response(
        JSON.stringify({ points: 1, reason: 'Default point' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';
    
    // Parse AI response
    let evaluation = {
      is_light_question: false,
      quality: 3,
      exploration: 3,
      depth: 3,
      reason: 'Câu hỏi cơ bản'
    };

    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```/g, '');
      }
      evaluation = JSON.parse(cleanContent);
    } catch (parseErr) {
      console.log('Parse error, using default evaluation:', parseErr);
    }

    // Award points via RPC
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: pointsAwarded, error: rpcError } = await supabase.rpc('award_message_points', {
      p_user_id: userId,
      p_message_id: messageId || null,
      p_conversation_id: conversationId || null,
      p_is_light_question: evaluation.is_light_question,
      p_quality_score: Math.min(10, Math.max(0, evaluation.quality || 0)),
      p_exploration_score: Math.min(10, Math.max(0, evaluation.exploration || 0)),
      p_depth_score: Math.min(10, Math.max(0, evaluation.depth || 0)),
      p_ai_reason: evaluation.reason || 'Đã đánh giá'
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return new Response(
        JSON.stringify({ points: 0, reason: 'Award error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        points: pointsAwarded || 0, 
        isLightQuestion: evaluation.is_light_question,
        reason: evaluation.reason
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Evaluate message error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
