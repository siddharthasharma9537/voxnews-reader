import { supabase } from "./supabase-client";

export interface GenerateAudioRequest {
  headline: string;
  body: string;
  language: "en" | "te";
  contentHash: string;
}

export interface AudioCacheEntry {
  id: string;
  content_hash: string;
  headline: string;
  language: string;
  audio_url: string;
  duration_seconds: number | null;
  created_at: string;
  expires_at: string;
}

/**
 * Generate audio using browser's Web Speech API
 * No external API calls needed - uses built-in browser TTS
 */
function generateAudioWithWebSpeechAPI(
  text: string,
  language: "en" | "te"
): Promise<{ audioUrl: string; durationSeconds: number }> {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      reject(new Error("Web Speech API not supported in this browser"));
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "te" ? "te-IN" : "en-US";
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    // Estimate duration: ~4-5 characters per second
    const estimatedDurationSeconds = Math.ceil(text.length / 4.5);

    // Create a reference ID for this audio instance
    const audioUrl = `web-speech:${Date.now()}`;

    utterance.onend = () => {
      resolve({
        audioUrl,
        durationSeconds: estimatedDurationSeconds,
      });
    };

    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    console.log(`🎤 Speaking ${language === "te" ? "Telugu" : "English"}...`);
    synth.speak(utterance);
  });
}

/**
 * Generate audio from article text, using cache when available
 * Uses Web Speech API (free, no external API calls, no network restrictions)
 */
export async function generateAudio(
  request: GenerateAudioRequest
): Promise<{ audioUrl: string; durationSeconds: number | null; cached: boolean }> {
  try {
    // Check if audio already cached
    const { data: cached } = await supabase
      .from("audio_cache")
      .select("*")
      .eq("content_hash", request.contentHash)
      .eq("language", request.language);

    if (cached && cached.length > 0) {
      console.log("✓ Audio found in cache");
      return {
        audioUrl: cached[0].audio_url,
        durationSeconds: cached[0].duration_seconds,
        cached: true,
      };
    }

    // Generate audio using Web Speech API (browser native, no external API)
    const textToSpeak = `${request.headline}. ${request.body}`;

    console.log("📝 Generating audio with Web Speech API...");
    const { audioUrl, durationSeconds } = await generateAudioWithWebSpeechAPI(
      textToSpeak,
      request.language
    );

    // Cache the metadata in Supabase for future reference
    const { error: insertError } = await supabase
      .from("audio_cache")
      .insert({
        content_hash: request.contentHash,
        headline: request.headline.substring(0, 500),
        language: request.language,
        audio_url: audioUrl,
        duration_seconds: durationSeconds,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      console.warn("⚠️ Cache store warning:", insertError);
      // Non-fatal: audio generation succeeded even if cache failed
    }

    console.log("✓ Audio generated and cached");
    return {
      audioUrl,
      durationSeconds,
      cached: false,
    };
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
}

/**
 * Get usage stats for monitoring TTS API calls
 */
export async function getTtsUsageStats() {
  try {
    const { data, error } = await supabase
      .from("tts_usage")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching TTS usage:", error);
    return [];
  }
}

/**
 * Delete cached audio older than 30 days (cleanup)
 */
export async function cleanupExpiredCache() {
  try {
    const { error } = await supabase
      .from("audio_cache")
      .delete()
      .lt("expires_at", new Date().toISOString());

    if (error) throw error;
    console.log("✓ Expired cache entries cleaned");
  } catch (error) {
    console.error("Error cleaning up cache:", error);
  }
}
