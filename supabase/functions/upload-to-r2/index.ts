import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to create HMAC-SHA256 signature
async function hmacSha256(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

// Create AWS4 signing key
async function getSigningKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const kDate = await hmacSha256(encoder.encode("AWS4" + secretKey).buffer as ArrayBuffer, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

// Create signature
async function createSignature(signingKey: ArrayBuffer, stringToSign: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey("raw", signingKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    new TextEncoder().encode(stringToSign)
  );
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// SHA256 hash
async function sha256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const R2_ENDPOINT = Deno.env.get('R2_ENDPOINT');
    const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID');
    const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY');
    const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME');
    const R2_PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL');

    console.log('R2 Config check:', {
      hasEndpoint: !!R2_ENDPOINT,
      hasAccessKey: !!R2_ACCESS_KEY_ID,
      hasSecretKey: !!R2_SECRET_ACCESS_KEY,
      hasBucket: !!R2_BUCKET_NAME,
      hasPublicUrl: !!R2_PUBLIC_URL,
    });

    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      throw new Error('Missing R2 configuration. Please check environment variables.');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Generate unique key
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split('-')[0];
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${randomId}-${sanitizedName}`;

    // Read file content
    const fileArrayBuffer = await file.arrayBuffer();
    const fileContent = new Uint8Array(fileArrayBuffer);
    const contentHash = await sha256(fileArrayBuffer);

    // Parse endpoint to get account ID and construct host
    // R2_ENDPOINT format: https://<account_id>.r2.cloudflarestorage.com
    const endpointUrl = new URL(R2_ENDPOINT);
    const host = `${R2_BUCKET_NAME}.${endpointUrl.host}`;
    const url = `https://${host}/${key}`;

    // AWS4 signature components
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const region = 'auto';
    const service = 's3';

    // Create canonical request
    const method = 'PUT';
    const canonicalUri = '/' + encodeURIComponent(key).replace(/%2F/g, '/');
    const canonicalQueryString = '';
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
    const canonicalHeaders = 
      `content-type:${file.type}\n` +
      `host:${host}\n` +
      `x-amz-content-sha256:${contentHash}\n` +
      `x-amz-date:${amzDate}\n`;

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      contentHash
    ].join('\n');

    const canonicalRequestHash = await sha256(new TextEncoder().encode(canonicalRequest).buffer as ArrayBuffer);

    // Create string to sign
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      canonicalRequestHash
    ].join('\n');

    // Create signature
    const signingKey = await getSigningKey(R2_SECRET_ACCESS_KEY, dateStamp, region, service);
    const signature = await createSignature(signingKey, stringToSign);

    // Create authorization header
    const authHeader = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    console.log('Uploading to R2:', url);

    // Upload to R2
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Host': host,
        'x-amz-content-sha256': contentHash,
        'x-amz-date': amzDate,
        'Authorization': authHeader,
      },
      body: fileContent,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('R2 upload failed:', uploadResponse.status, errorText);
      throw new Error(`R2 upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    // Construct public URL
    const publicUrl = R2_PUBLIC_URL 
      ? `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`
      : url;

    console.log('Upload successful:', publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        key: key,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('R2 upload error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
