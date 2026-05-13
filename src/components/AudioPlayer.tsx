import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Loader2, Volume2 } from "lucide-react";
import { Button } from "./ui/button";

export interface AudioPlayerProps {
  audioUrl: string;
  headline: string;
  durationSeconds?: number | null;
  onError?: (error: Error) => void;
}

export function AudioPlayer({
  audioUrl,
  headline,
  durationSeconds,
  onError,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if this is Web Speech API audio (no actual audio file)
  const isWebSpeechAPI = audioUrl.startsWith("web-speech:");

  useEffect(() => {
    // Skip event listeners for Web Speech API (no audio element)
    if (isWebSpeechAPI) {
      setIsLoading(false);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleError = (e: Event) => {
      const err = new Error(`Audio playback failed: ${(e.target as HTMLAudioElement).error?.message}`);
      setError(err.message);
      onError?.(err);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
    };
  }, [onError, isWebSpeechAPI]);

  const togglePlay = () => {
    if (isWebSpeechAPI) {
      // Web Speech API controls
      const synth = window.speechSynthesis;
      if (!synth) {
        setError("Web Speech API not available");
        return;
      }

      if (isPlaying) {
        synth.pause();
        setIsPlaying(false);
      } else {
        synth.resume();
        setIsPlaying(true);
      }
      return;
    }

    // Regular audio element controls
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        setError(`Playback error: ${err.message}`);
        onError?.(err);
      });
    }
  };

  const handleDownload = async () => {
    if (isWebSpeechAPI) {
      setError("Download not available for browser-synthesized audio");
      return;
    }

    try {
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${headline.replace(/\s+/g, "-").toLowerCase()}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(`Download failed: ${error.message}`);
      onError?.(error);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-200 p-4 shadow-sm">
      {/* Audio element - only for non-Web Speech API */}
      {!isWebSpeechAPI && <audio ref={audioRef} src={audioUrl} crossOrigin="anonymous" />}

      {/* Web Speech API indicator */}
      {isWebSpeechAPI && (
        <div className="mb-2 text-xs text-gray-600 flex items-center gap-2">
          <Volume2 className="w-3 h-3" />
          <span>Using browser text-to-speech</span>
        </div>
      )}

      {/* Headline */}
      <h3 className="text-sm font-semibold text-gray-800 mb-3 line-clamp-2">
        {headline}
      </h3>

      {/* Error display */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-3 space-y-1">
        <div className="w-full h-1 bg-orange-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={togglePlay}
          disabled={isLoading}
          size="sm"
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Play
            </>
          )}
        </Button>

        <Button
          onClick={handleDownload}
          disabled={isLoading || isWebSpeechAPI}
          variant="outline"
          size="sm"
          className="border-orange-200 hover:bg-orange-50"
          title={isWebSpeechAPI ? "Download not available for synthesized audio" : "Download audio file"}
        >
          <Download className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1 text-orange-600">
          <Volume2 className="w-4 h-4" />
          <span className="text-xs font-medium">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
