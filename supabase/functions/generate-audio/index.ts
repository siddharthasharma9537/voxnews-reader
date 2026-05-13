import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

interface GenerateAudioRequest {
  headline: string;
  body: string;
  language: "en" | "te";
  contentHash: string;
}

interface TTSResponse {
  status: "success" | "error";
  audio_url?: string;
  message?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body: GenerateAudioRequest = await req.json();
    const { headline, body: articleBody, language, contentHash } = body;

    // Validate inputs
    if (!headline || !articleBody || !language || !contentHash) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if audio already cached
    const { data: cachedAudio, error: cacheError } = await supabase
      .from("audio_cache")
      .select("*")
      .eq("content_hash", contentHash)
      .eq("language", language)
      .single();

    if (cachedAudio && !cacheError) {
      console.log("Audio found in cache:", contentHash);
      return new Response(
        JSON.stringify({
          audioUrl: cachedAudio.audio_url,
          durationSeconds: cachedAudio.duration_seconds,
          cached: true,
        }),
        { headers: corsHeaders }
      );
    }

    // Combine text for TTS
    const textToSpeak = `${headline}. ${articleBody}`.substring(0, 5000);
    const characterCount = textToSpeak.length;

    // Call appropriate TTS service
    let ttsResult: TTSResponse;
    let ttsService: string;

    if (language === "en") {
      // Google Translate TTS for English
      ttsService = "google-translate";
      ttsResult = await callGoogleTranslateTTS(textToSpeak);
    } else if (language === "te") {
      // Indic TTS for Telugu
      ttsService = "indic-tts";
      ttsResult = await callIndicTTS(textToSpeak, language);
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }

    if (ttsResult.status !== "success" || !ttsResult.audio_url) {
      throw new Error(ttsResult.message || "TTS generation failed");
    }

    // Estimate duration (rough: ~4-5 characters per second)
    const estimatedDurationSeconds = Math.ceil(characterCount / 4);

    // Store in cache
    const { error: insertError } = await supabase.from("audio_cache").insert({
      content_hash: contentHash,
      headline: headline.substring(0, 500),
      language: language,
      audio_url: ttsResult.audio_url,
      duration_seconds: estimatedDurationSeconds,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (insertError) {
      console.error("Cache insert error:", insertError);
    }

    // Track TTS usage
    await supabase.from("tts_usage").insert({
      article_id: contentHash,
      characters_processed: characterCount,
      tts_service: ttsService,
      cost_cents: calculateTTSCost(characterCount, ttsService),
    });

    return new Response(
      JSON.stringify({
        audioUrl: ttsResult.audio_url,
        durationSeconds: estimatedDurationSeconds,
        cached: false,
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in generate-audio function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

/**
 * Call Google Translate TTS API (free)
 */
async function callGoogleTranslateTTS(text: string): Promise<TTSResponse> {
  try {
    // Google Translate free endpoint for TTS
    // This uses Google's text-to-speech without official API
    const params = new URLSearchParams({
      client: "gtx",
      sl: "en",
      tl: "en",
      q: text,
    });

    const url = `https://translate.google.com/translate_a/element.js?callback=googleTranslateElementInit&${params}`;

    // For production, you'd want a more reliable TTS service
    // This is a workaround using Google's public endpoint
    const audioUrl = `https://translate.google.com/translate_tts?client=gtx&sl=en&tl=en&q=${encodeURIComponent(text)}`;

    return {
      status: "success",
      audio_url: audioUrl,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Google TTS failed",
    };
  }
}

/**
 * Call Indic TTS API (free)
 */
async function callIndicTTS(
  text: string,
  language: string
): Promise<TTSResponse> {
  try {
    const response = await fetch("https://tts.ai4bharat.org/api/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [{ source: text }],
        controlConfig: {
          language: {
            sourceLanguage: language,
          },
        },
        audioConfig: {
          audioFormat: "mp3",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Indic TTS API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === 200 && result.audio && result.audio[0]) {
      return {
        status: "success",
        audio_url: `data:audio/mp3;base64,${result.audio[0]}`,
      };
    } else {
      throw new Error(
        result.message || "Indic TTS returned unexpected response"
      );
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Indic TTS failed",
    };
  }
}

/**
 * Calculate estimated TTS API cost
 */
function calculateTTSCost(
  characterCount: number,
  service: string
): number {
  // Google Translate: ~free but low quality
  // Indic TTS: ~free
  // In production, integrate actual pricing
  // Returns cost in cents
  if (service === "indic-tts") {
    return Math.ceil(characterCount / 1000); // Rough estimate
  }
  return 0; // Google Translate free
}
