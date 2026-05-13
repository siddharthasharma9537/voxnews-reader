/**
 * Chandra OCR 2 - Free Tier Integration
 * For extracting Telugu and other Indic script text from scanned PDFs
 */

export interface ChandraOCRPage {
  page: number;
  text: string;
  confidence: number;
  lines?: Array<{
    text: string;
    confidence: number;
    boundingBox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export interface ChandraOCRResponse {
  success: boolean;
  pages: ChandraOCRPage[];
  processingTimeMs: number;
}

/**
 * Extract text from PDF using Chandra OCR 2 free tier
 * Falls back to body text if OCR fails
 */
export async function extractTextWithChandraOCR(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ChandraOCRResponse> {
  const apiUrl = import.meta.env.VITE_CHANDRA_OCR_API;
  const apiKey = import.meta.env.VITE_CHANDRA_OCR_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      "Chandra OCR credentials missing. Check .env.local for VITE_CHANDRA_OCR_API and VITE_CHANDRA_OCR_KEY"
    );
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", "te"); // Telugu

    const startTime = Date.now();
    onProgress?.(10);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    onProgress?.(50);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Chandra OCR error: ${response.status} - ${errorData.message || response.statusText}`
      );
    }

    const result: ChandraOCRResponse = await response.json();
    const processingTimeMs = Date.now() - startTime;

    onProgress?.(100);

    return {
      ...result,
      processingTimeMs,
    };
  } catch (error) {
    console.error("Chandra OCR extraction failed:", error);
    throw error;
  }
}

/**
 * Format Chandra OCR response into readable text
 */
export function formatChandraOCRText(response: ChandraOCRResponse): string {
  return response.pages
    .map((page) => `[Page ${page.page}]\n${page.text}`)
    .join("\n\n");
}

/**
 * Check Chandra OCR API health
 */
export async function checkChandraOCRHealth(): Promise<boolean> {
  const apiUrl = import.meta.env.VITE_CHANDRA_OCR_API;
  const apiKey = import.meta.env.VITE_CHANDRA_OCR_KEY;

  if (!apiUrl || !apiKey) {
    return false;
  }

  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
