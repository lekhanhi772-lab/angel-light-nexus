import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EvaluationResult {
  spiritual_score: number;
  positive_score: number;
  growth_score: number;
  gratitude_score: number;
  compassion_score: number;
  feedback: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation_id, messages } = await req.json();

    if (!conversation_id || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'conversation_id and messages array are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this conversation was already evaluated
    const { data: existingEval } = await supabase
      .from('conversation_evaluations')
      .select('id')
      .eq('conversation_id', conversation_id)
      .maybeSingle();

    if (existingEval) {
      return new Response(
        JSON.stringify({ message: 'Conversation already evaluated', existing: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter only user messages for evaluation
    const userMessages = messages.filter((m: any) => m.role === 'user');
    
    // Minimum 3 user messages for meaningful evaluation
    if (userMessages.length < 3) {
      return new Response(
        JSON.stringify({ message: 'Not enough messages for evaluation', skip: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare conversation text for AI evaluation
    const conversationText = messages
      .slice(-20) // Last 20 messages
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Angel'}: ${m.content}`)
      .join('\n');

    // Call AI for evaluation
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('Missing LOVABLE_API_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const evaluationPrompt = `Bạn là một AI đánh giá tâm linh. Phân tích cuộc trò chuyện sau và đánh giá người dùng theo 5 tiêu chí (thang điểm 0-10):

1. **Chiều Sâu Tâm Linh (spiritual_score)**: Mức độ sâu sắc trong suy ngẫm về ý nghĩa cuộc sống, kết nối với vũ trụ, tìm kiếm chân lý.

2. **Năng Lượng Tích Cực (positive_score)**: Thể hiện sự lạc quan, yêu thương, nhẹ nhàng trong ngôn từ.

3. **Tư Duy Phát Triển (growth_score)**: Mong muốn học hỏi, cải thiện bản thân, cởi mở với kiến thức mới.

4. **Lòng Biết Ơn (gratitude_score)**: Biểu lộ sự cảm kích, trân trọng cuộc sống và những điều tốt đẹp.

5. **Tình Thương (compassion_score)**: Thể hiện sự quan tâm đến người khác, lòng trắc ẩn, muốn giúp đỡ.

CUỘC TRÒ CHUYỆN:
${conversationText}

TRẢ VỀ JSON ĐÚNG FORMAT (KHÔNG markdown, KHÔNG giải thích):
{
  "spiritual_score": <0-10>,
  "positive_score": <0-10>,
  "growth_score": <0-10>,
  "gratitude_score": <0-10>,
  "compassion_score": <0-10>,
  "feedback": "<1-2 câu nhận xét ngắn gọn, ấm áp, khích lệ bằng tiếng Việt>"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: evaluationPrompt }],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI evaluation failed:', await aiResponse.text());
      return new Response(
        JSON.stringify({ error: 'AI evaluation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON from AI response
    let evaluation: EvaluationResult;
    try {
      // Clean up response - remove markdown code blocks if present
      let jsonStr = aiContent.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      evaluation = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI evaluation:', aiContent);
      // Default evaluation if parsing fails
      evaluation = {
        spiritual_score: 5,
        positive_score: 5,
        growth_score: 5,
        gratitude_score: 5,
        compassion_score: 5,
        feedback: 'Cảm ơn con đã trò chuyện với Angel! Hãy tiếp tục hành trình tỉnh thức nhé 💛'
      };
    }

    // Ensure scores are within bounds
    const clamp = (n: number) => Math.max(0, Math.min(10, Math.round(n)));
    evaluation.spiritual_score = clamp(evaluation.spiritual_score);
    evaluation.positive_score = clamp(evaluation.positive_score);
    evaluation.growth_score = clamp(evaluation.growth_score);
    evaluation.gratitude_score = clamp(evaluation.gratitude_score);
    evaluation.compassion_score = clamp(evaluation.compassion_score);

    // Calculate points awarded (total score, max 50 per conversation)
    const totalScore = evaluation.spiritual_score + evaluation.positive_score + 
                       evaluation.growth_score + evaluation.gratitude_score + 
                       evaluation.compassion_score;
    const pointsAwarded = Math.min(totalScore, 50);

    // Insert evaluation record
    const { data: evalRecord, error: insertError } = await supabase
      .from('conversation_evaluations')
      .insert({
        conversation_id,
        user_id: user.id,
        spiritual_score: evaluation.spiritual_score,
        positive_score: evaluation.positive_score,
        growth_score: evaluation.growth_score,
        gratitude_score: evaluation.gratitude_score,
        compassion_score: evaluation.compassion_score,
        points_awarded: pointsAwarded,
        ai_feedback: evaluation.feedback,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert evaluation:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save evaluation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✨ Evaluated conversation ${conversation_id}: +${pointsAwarded} points`);

    return new Response(
      JSON.stringify({
        success: true,
        evaluation: evalRecord,
        points_awarded: pointsAwarded,
        feedback: evaluation.feedback,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Evaluation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
