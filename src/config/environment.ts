/**
 * Environment Configuration Module
 *
 * Centralized, type-safe environment variable management.
 * Validates all required variables at startup and provides typed access throughout the app.
 *
 * Usage:
 *   import { env } from '@/config/environment';
 *   console.log(env.SUPABASE_URL); // Fully typed, autocomplete works
 *
 * Validation:
 *   - Runs automatically on module load
 *   - Throws descriptive error if any required variable is missing
 *   - Supports both Vite client-side (VITE_*) and runtime variables
 */

/**
 * Environment variable schema with types and descriptions
 */
interface EnvironmentConfig {
  // Application
  APP_NAME: string;
  APP_ENV: "development" | "staging" | "production";
  APP_DEBUG: boolean;
  APP_LOG_LEVEL: "error" | "warn" | "info" | "debug" | "trace";
  APP_URL: string;
  API_URL: string;

  // Supabase (client-side)
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;

  // Cloudflare R2 (client-side public info)
  CLOUDFLARE_R2_BUCKET_NAME: string;
  CLOUDFLARE_R2_REGION: string;

  // Sentry (error tracking)
  SENTRY_DSN: string | null;
  SENTRY_ENVIRONMENT: string;
  SENTRY_RELEASE: string;

  // Feature Flags
  ENABLE_DARK_MODE: boolean;
  ENABLE_OCR_FALLBACK: boolean;
  ENABLE_USER_ACCOUNTS: boolean;
  ENABLE_AUDIO_DOWNLOAD: boolean;
  ENABLE_ADVANCED_SEARCH: boolean;
  ENABLE_OFFLINE_MODE: boolean;

  // Performance & Caching
  AUDIO_CACHE_TTL: number;
  CACHE_CLEANUP_INTERVAL: number;
  PDF_PARSING_TIMEOUT: number;
  AUDIO_GENERATION_TIMEOUT: number;

  // File Upload
  MAX_PDF_SIZE: number;
}

/**
 * Parse and validate environment variables
 */
function parseEnvironment(): EnvironmentConfig {
  // Helper to get Vite client-side env vars
  const getClientEnv = (key: string): string | undefined => {
    const viteKey = `VITE_${key}`;
    // @ts-ignore - import.meta.env is Vite-injected
    return import.meta.env[viteKey];
  };

  // Helper to parse boolean strings
  const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === "true";
  };

  // Helper to parse numbers
  const parseNumber = (value: string | undefined, defaultValue: number): number => {
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Helper to validate required variables
  const requireEnv = (key: string, envValue: string | undefined, errorMessage?: string): string => {
    if (!envValue) {
      throw new Error(
        errorMessage ||
          `Missing required environment variable: ${key}. Check .env.local or Vercel Environment Variables.`
      );
    }
    return envValue;
  };

  // Get environment values (Vite-prefixed for client-side)
  const appName = getClientEnv("APP_NAME") || "VoxNews";
  const appEnv = getClientEnv("APP_ENV") || "development";
  const appDebug = getClientEnv("APP_DEBUG") || "false";
  const appLogLevel = getClientEnv("APP_LOG_LEVEL") || "info";
  const appUrl = getClientEnv("APP_URL") || "http://localhost:3000";
  const apiUrl = getClientEnv("API_URL") || appUrl;

  const supabaseUrl = requireEnv("VITE_SUPABASE_URL", getClientEnv("SUPABASE_URL"));
  const supabaseAnonKey = requireEnv("VITE_SUPABASE_ANON_KEY", getClientEnv("SUPABASE_ANON_KEY"));

  const cloudflareR2BucketName = getClientEnv("CLOUDFLARE_R2_BUCKET_NAME") || "voxnews-audio";
  const cloudflareR2Region = getClientEnv("CLOUDFLARE_R2_REGION") || "auto";

  const sentryDsn = getClientEnv("SENTRY_DSN") || null;
  const sentryEnvironment = getClientEnv("SENTRY_ENVIRONMENT") || appEnv;
  const sentryRelease = getClientEnv("SENTRY_RELEASE") || "v0.1.0-dev";

  // Feature flags (default to false in production, true in development)
  const isDev = appEnv === "development";
  const enableDarkMode = parseBoolean(getClientEnv("ENABLE_DARK_MODE"), true);
  const enableOcrFallback = parseBoolean(getClientEnv("ENABLE_OCR_FALLBACK"), true);
  const enableUserAccounts = parseBoolean(getClientEnv("ENABLE_USER_ACCOUNTS"), false);
  const enableAudioDownload = parseBoolean(getClientEnv("ENABLE_AUDIO_DOWNLOAD"), false);
  const enableAdvancedSearch = parseBoolean(getClientEnv("ENABLE_ADVANCED_SEARCH"), false);
  const enableOfflineMode = parseBoolean(getClientEnv("ENABLE_OFFLINE_MODE"), false);

  // Performance settings
  const audioCacheTtl = parseNumber(getClientEnv("AUDIO_CACHE_TTL"), 30 * 24 * 60 * 60); // 30 days in seconds
  const cacheCleanupInterval = parseNumber(getClientEnv("CACHE_CLEANUP_INTERVAL"), 24 * 60 * 60); // 24 hours
  const pdfParsingTimeout = parseNumber(getClientEnv("PDF_PARSING_TIMEOUT"), 30000); // 30 seconds
  const audioGenerationTimeout = parseNumber(getClientEnv("AUDIO_GENERATION_TIMEOUT"), 10000); // 10 seconds

  // File upload settings
  const maxPdfSize = parseNumber(getClientEnv("MAX_PDF_SIZE"), 100 * 1024 * 1024); // 100 MB

  return {
    APP_NAME: appName,
    APP_ENV: appEnv as "development" | "staging" | "production",
    APP_DEBUG: parseBoolean(appDebug, isDev),
    APP_LOG_LEVEL: (appLogLevel as any) || "info",
    APP_URL: appUrl,
    API_URL: apiUrl,

    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,

    CLOUDFLARE_R2_BUCKET_NAME: cloudflareR2BucketName,
    CLOUDFLARE_R2_REGION: cloudflareR2Region,

    SENTRY_DSN: sentryDsn,
    SENTRY_ENVIRONMENT: sentryEnvironment,
    SENTRY_RELEASE: sentryRelease,

    ENABLE_DARK_MODE: enableDarkMode,
    ENABLE_OCR_FALLBACK: enableOcrFallback,
    ENABLE_USER_ACCOUNTS: enableUserAccounts,
    ENABLE_AUDIO_DOWNLOAD: enableAudioDownload,
    ENABLE_ADVANCED_SEARCH: enableAdvancedSearch,
    ENABLE_OFFLINE_MODE: enableOfflineMode,

    AUDIO_CACHE_TTL: audioCacheTtl,
    CACHE_CLEANUP_INTERVAL: cacheCleanupInterval,
    PDF_PARSING_TIMEOUT: pdfParsingTimeout,
    AUDIO_GENERATION_TIMEOUT: audioGenerationTimeout,

    MAX_PDF_SIZE: maxPdfSize,
  };
}

/**
 * Singleton environment configuration instance
 * Validated and parsed at application startup
 */
let envCache: EnvironmentConfig | null = null;

/**
 * Get validated environment configuration
 * Throws descriptive error if required variables are missing
 */
export function getEnvironment(): EnvironmentConfig {
  if (!envCache) {
    envCache = parseEnvironment();

    // Log environment info in development
    if (envCache.APP_DEBUG) {
      console.info(
        `[Environment] Loaded ${envCache.APP_ENV} environment (${envCache.APP_NAME} v${envCache.SENTRY_RELEASE})`
      );
    }
  }

  return envCache;
}

/**
 * Pre-parsed environment configuration (recommended usage)
 * Typed and autocompleted throughout the application
 */
export const env = getEnvironment();

/**
 * Type-safe environment configuration object
 * Export this type for strict typing in other modules
 */
export type Environment = EnvironmentConfig;

/**
 * Helper: Check if running in development
 */
export const isDevelopment = (): boolean => env.APP_ENV === "development";

/**
 * Helper: Check if running in staging
 */
export const isStaging = (): boolean => env.APP_ENV === "staging";

/**
 * Helper: Check if running in production
 */
export const isProduction = (): boolean => env.APP_ENV === "production";

/**
 * Helper: Check if feature flag is enabled
 */
export const isFeatureEnabled = (featureName: keyof EnvironmentConfig): boolean => {
  const value = env[featureName];
  return typeof value === "boolean" && value;
};

/**
 * Validate critical environment variables at startup
 * Call this in your app entry point to fail fast on misconfiguration
 */
export function validateEnvironment(): void {
  try {
    const validated = getEnvironment();

    // Check critical variables
    if (!validated.SUPABASE_URL || !validated.SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase credentials in environment variables");
    }

    if (!validated.APP_URL) {
      throw new Error("Missing APP_URL in environment variables");
    }

    // Log validation success
    if (validated.APP_DEBUG) {
      console.info("[Environment] ✅ All environment variables validated successfully");
    }
  } catch (error) {
    console.error("[Environment] ❌ Configuration error:", error);
    throw error;
  }
}

/**
 * Get a display-safe version of the config (no secrets)
 * Safe to log or send to analytics
 */
export function getPublicEnvironment(): Omit<
  EnvironmentConfig,
  "SUPABASE_ANON_KEY" | "SENTRY_DSN"
> {
  const { SUPABASE_ANON_KEY: _, SENTRY_DSN: __, ...publicEnv } = env;
  return publicEnv;
}
