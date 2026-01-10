import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Edge TTS voices for supported languages
const VOICES: Record<string, { female: string; male: string }> = {
  'vi-VN': { female: 'vi-VN-HoaiMyNeural', male: 'vi-VN-NamMinhNeural' },
  'en-US': { female: 'en-US-JennyNeural', male: 'en-US-GuyNeural' },
  'fr-FR': { female: 'fr-FR-DeniseNeural', male: 'fr-FR-HenriNeural' },
  'ja-JP': { female: 'ja-JP-NanamiNeural', male: 'ja-JP-KeitaNeural' },
  'ko-KR': { female: 'ko-KR-SunHiNeural', male: 'ko-KR-InJoonNeural' },
};

function generateSSML(text: string, voice: string, rate: string = '+0%', pitch: string = '+0Hz'): string {
  // Escape XML special characters
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="${voice}">
      <prosody rate="${rate}" pitch="${pitch}">
        ${escapedText}
      </prosody>
    </voice>
  </speak>`;
}

function generateRequestId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

async function synthesizeSpeech(text: string, voice: string, rate: string = '+0%', pitch: string = '+0Hz'): Promise<Uint8Array> {
  const requestId = generateRequestId();
  const timestamp = new Date().toISOString();
  
  // Edge TTS WebSocket endpoint
  const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${requestId}`;
  
  return new Promise((resolve, reject) => {
    const audioChunks: Uint8Array[] = [];
    let ws: WebSocket;
    
    try {
      ws = new WebSocket(wsUrl);
    } catch (error) {
      reject(new Error(`Failed to create WebSocket: ${error}`));
      return;
    }
    
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('WebSocket timeout'));
    }, 30000);
    
    ws.onopen = () => {
      // Send configuration
      const configMessage = `X-Timestamp:${timestamp}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
      ws.send(configMessage);
      
      // Send SSML
      const ssml = generateSSML(text, voice, rate, pitch);
      const ssmlMessage = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${timestamp}\r\nPath:ssml\r\n\r\n${ssml}`;
      ws.send(ssmlMessage);
    };
    
    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        // Text message - check for turn.end
        if (event.data.includes('Path:turn.end')) {
          clearTimeout(timeout);
          ws.close();
          
          // Combine all audio chunks
          const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const result = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of audioChunks) {
            result.set(chunk, offset);
            offset += chunk.length;
          }
          resolve(result);
        }
      } else if (event.data instanceof Blob) {
        // Binary audio data
        event.data.arrayBuffer().then((buffer: ArrayBuffer) => {
          const data = new Uint8Array(buffer);
          // Find audio data after header (search for "Path:audio")
          const headerEnd = findAudioDataStart(data);
          if (headerEnd > 0 && headerEnd < data.length) {
            audioChunks.push(data.slice(headerEnd));
          }
        });
      }
    };
    
    ws.onerror = (error) => {
      clearTimeout(timeout);
      reject(new Error(`WebSocket error: ${error}`));
    };
    
    ws.onclose = (event) => {
      clearTimeout(timeout);
      if (audioChunks.length === 0 && !event.wasClean) {
        reject(new Error('WebSocket closed without audio data'));
      }
    };
  });
}

function findAudioDataStart(data: Uint8Array): number {
  // Look for the pattern "Path:audio\r\n\r\n" in the binary data
  const searchPattern = new TextEncoder().encode('Path:audio\r\n');
  
  for (let i = 0; i < data.length - searchPattern.length; i++) {
    let found = true;
    for (let j = 0; j < searchPattern.length; j++) {
      if (data[i + j] !== searchPattern[j]) {
        found = false;
        break;
      }
    }
    if (found) {
      // Skip past the pattern and any additional \r\n
      let pos = i + searchPattern.length;
      while (pos < data.length && (data[pos] === 13 || data[pos] === 10)) {
        pos++;
      }
      return pos;
    }
  }
  return 0;
}

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice, languageCode, rate, pitch, gender } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine voice to use
    let selectedVoice = voice;
    if (!selectedVoice && languageCode) {
      const langVoices = VOICES[languageCode] || VOICES['vi-VN'];
      selectedVoice = gender === 'male' ? langVoices.male : langVoices.female;
    }
    if (!selectedVoice) {
      selectedVoice = 'vi-VN-HoaiMyNeural';
    }

    console.log(`[edge-tts] Synthesizing: "${text.substring(0, 50)}..." with voice: ${selectedVoice}`);

    // Synthesize speech
    const audioData = await synthesizeSpeech(
      text,
      selectedVoice,
      rate || '+0%',
      pitch || '+0Hz'
    );

    // Convert to base64
    const base64Audio = arrayBufferToBase64(audioData);

    console.log(`[edge-tts] Success! Audio size: ${audioData.length} bytes`);

    return new Response(
      JSON.stringify({ 
        audio: base64Audio,
        contentType: 'audio/mpeg',
        voice: selectedVoice
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[edge-tts] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
