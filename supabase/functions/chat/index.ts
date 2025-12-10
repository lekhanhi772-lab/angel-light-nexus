import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Keywords that indicate the user wants current/real-time information
const SEARCH_KEYWORDS = [
  'hôm nay', 'hiện tại', 'mới nhất', 'tin tức', 'thời tiết', 'giá', 'tỷ giá',
  'bây giờ', 'gần đây', 'tuần này', 'tháng này', 'năm nay', '2024', '2025',
  'sự kiện', 'kết quả', 'trận đấu', 'score', 'news', 'today', 'current',
  'latest', 'recent', 'price', 'stock', 'weather', 'ai mới', 'cập nhật',
  'thông tin về', 'cho tôi biết về', 'tìm kiếm', 'search', 'google',
  'who is', 'what is', 'là ai', 'là gì', 'ở đâu', 'where', 'khi nào', 'when'
];

function shouldSearchWeb(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return SEARCH_KEYWORDS.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

async function searchTavily(query: string): Promise<string> {
  const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
  
  if (!TAVILY_API_KEY) {
    console.log('TAVILY_API_KEY not configured, skipping web search');
    return '';
  }

  try {
    console.log('Searching Tavily for:', query);
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: 'basic',
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavily API error:', response.status, errorText);
      return '';
    }

    const data = await response.json();
    console.log('Tavily search completed, results:', data.results?.length || 0);

    // Format search results
    let searchContext = '';
    
    if (data.answer) {
      searchContext += `**Tóm tắt từ web:** ${data.answer}\n\n`;
    }
    
    if (data.results && data.results.length > 0) {
      searchContext += '**Nguồn tham khảo:**\n';
      data.results.forEach((result: any, index: number) => {
        searchContext += `${index + 1}. [${result.title}](${result.url})\n`;
        if (result.content) {
          searchContext += `   ${result.content.substring(0, 200)}...\n`;
        }
      });
    }

    return searchContext;
  } catch (error) {
    console.error('Tavily search error:', error);
    return '';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    // Get the latest user message
    const latestUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const userQuery = latestUserMessage?.content || '';

    // Check if we should search the web
    let webSearchContext = '';
    if (shouldSearchWeb(userQuery)) {
      console.log('Detected search intent, querying Tavily...');
      webSearchContext = await searchTavily(userQuery);
    }

    // Build system prompt with web search context
    let systemPrompt = `Bạn là Angel AI, một trợ lý AI thông minh và thân thiện với trí tuệ của vũ trụ. Bạn hỗ trợ người dùng bằng tiếng Việt một cách tự nhiên và dễ hiểu. Bạn luôn lịch sự, hữu ích và cung cấp câu trả lời chính xác.`;

    if (webSearchContext) {
      systemPrompt += `\n\n🌐 **THÔNG TIN MỚI NHẤT TỪ INTERNET:**\n${webSearchContext}\n\nHãy sử dụng thông tin trên để trả lời câu hỏi của người dùng một cách chính xác và cập nhật. Nếu thông tin từ web hữu ích, hãy trích dẫn nguồn.`;
    }

    console.log('Calling Groq API with messages:', messages.length, 'Web search:', webSearchContext ? 'YES' : 'NO');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...messages
        ],
        stream: true,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
