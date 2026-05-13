// Client-side PDF parsing with pdfjs-dist.
// Extracts articles by detecting headline-sized text vs body text.

import * as pdfjsLib from "pdfjs-dist";
// eslint-disable-next-line import/no-unresolved
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export type ParsedArticle = {
  id: string;
  headline: string;
  body: string;
  minutes: number;
  category: string;
  page: number;
};

export type ProgressStage = "loading" | "reading" | "structuring" | "ocr";
export type ProgressUpdate = {
  stage: ProgressStage;
  /** 0..1 overall */
  progress: number;
  /** Human-readable label, e.g. "Reading page 3 of 14" */
  label: string;
  page?: number;
  totalPages?: number;
  /** True once the parser falls back to OCR. */
  ocrActive?: boolean;
};

export class PdfCancelledError extends Error {
  constructor() {
    super("Cancelled");
    this.name = "PdfCancelledError";
  }
}

type Line = { text: string; size: number; page: number; y: number };

const WORDS_PER_MIN = 180;

function readTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MIN));
}

function guessCategory(headline: string, body: string): string {
  const t = (headline + " " + body).toLowerCase();
  if (/(market|sensex|rupee|rbi|gdp|stock|earning|invest)/.test(t)) return "Business";
  if (/(cricket|football|match|tournament|olympic|sport)/.test(t)) return "Sports";
  if (/(film|movie|music|actor|bollywood|culture)/.test(t)) return "Culture";
  if (/(election|minister|parliament|govt|government|policy|delhi|modi)/.test(t)) return "Politics";
  if (/(isro|space|science|study|research|tech|ai)/.test(t)) return "Science";
  if (/(weather|monsoon|imd|rain|cyclone|temperature)/.test(t)) return "Weather";
  if (/(editorial|opinion|view|column)/.test(t)) return "Opinion";
  return "National";
}

export type ParseOptions = {
  signal?: AbortSignal;
  onProgress?: (u: ProgressUpdate) => void;
  /** Run OCR if regular text extraction yields fewer than `ocrMinArticles` articles. */
  enableOcr?: boolean;
  /** Threshold below which OCR will run. Defaults to 2. */
  ocrMinArticles?: number;
  /** Language code(s) for Tesseract, e.g. "eng" or "eng+hin". Defaults to "eng". */
  ocrLanguage?: string;
};

export async function parsePdfToArticles(
  file: File,
  opts: ParseOptions = {}
): Promise<{ fileName: string; pages: number; articles: ParsedArticle[] }> {
  const { signal, onProgress } = opts;

  const throwIfAborted = () => {
    if (signal?.aborted) throw new PdfCancelledError();
  };

  onProgress?.({ stage: "loading", progress: 0.02, label: "Opening file…" });
  const buf = await file.arrayBuffer();
  throwIfAborted();

  const loadingTask = pdfjsLib.getDocument({ data: buf });

  // Cancel pdfjs work if the user aborts during load.
  const onAbort = () => {
    try { loadingTask.destroy(); } catch { /* ignore */ }
  };
  signal?.addEventListener("abort", onAbort);

  loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
    if (total > 0) {
      onProgress?.({
        stage: "loading",
        progress: 0.02 + 0.08 * Math.min(1, loaded / total),
        label: "Loading PDF…",
      });
    }
  };

  let pdf;
  try {
    pdf = await loadingTask.promise;
  } catch (err) {
    if (signal?.aborted) throw new PdfCancelledError();
    throw err;
  }
  throwIfAborted();

  const lines: Line[] = [];
  const totalPages = pdf.numPages;

  for (let p = 1; p <= totalPages; p++) {
    throwIfAborted();
    onProgress?.({
      stage: "reading",
      progress: 0.1 + 0.8 * ((p - 1) / totalPages),
      label: `Reading page ${p} of ${totalPages}`,
      page: p,
      totalPages,
    });

    const page = await pdf.getPage(p);
    const content = await page.getTextContent();

    type Item = { text: string; size: number; x: number; y: number };
    const items: Item[] = [];
    for (const it of content.items as Array<{
      str: string;
      transform: number[];
      width: number;
    }>) {
      if (!it.str || !it.str.trim()) continue;
      const size = Math.hypot(it.transform[0], it.transform[1]);
      const x = it.transform[4];
      const y = it.transform[5];
      items.push({ text: it.str, size, x, y });
    }

    items.sort((a, b) => (b.y - a.y) || (a.x - b.x));

    let current: { y: number; size: number; parts: string[] } | null = null;
    for (const it of items) {
      if (!current || Math.abs(it.y - current.y) > 2) {
        if (current) {
          lines.push({
            text: current.parts.join(" ").replace(/\s+/g, " ").trim(),
            size: current.size,
            page: p,
            y: current.y,
          });
        }
        current = { y: it.y, size: it.size, parts: [it.text] };
      } else {
        current.parts.push(it.text);
        current.size = Math.max(current.size, it.size);
      }
    }
    if (current) {
      lines.push({
        text: current.parts.join(" ").replace(/\s+/g, " ").trim(),
        size: current.size,
        page: p,
        y: current.y,
      });
    }
  }

  signal?.removeEventListener("abort", onAbort);
  throwIfAborted();

  onProgress?.({ stage: "structuring", progress: 0.92, label: "Finding articles…" });

  let articles = buildArticlesFromLines(lines);

  // OCR fallback: if regular extraction was too thin and the user opted in,
  // rasterize each page and run Tesseract.js, then reconstruct articles from text.
  const minArticles = opts.ocrMinArticles ?? 2;
  if ((articles.length < minArticles) && opts.enableOcr) {
    try {
      const ocrText = await runOcrOnDocument(pdf, {
        signal,
        onProgress,
        language: opts.ocrLanguage ?? "eng",
      });
      throwIfAborted();
      const ocrArticles = buildArticlesFromOcrText(ocrText);
      // Prefer whichever produced more articles.
      if (ocrArticles.length > articles.length) {
        articles = ocrArticles;
      }
    } catch (err) {
      if (err instanceof PdfCancelledError) throw err;
      console.error("OCR fallback failed:", err);
    }
  }

  onProgress?.({ stage: "structuring", progress: 1, label: "Done" });

  return { fileName: file.name, pages: totalPages, articles };
}

/* -------------------- Article reconstruction -------------------- */

function buildArticlesFromLines(lines: Line[]): ParsedArticle[] {
  if (lines.length === 0) return [];

  const sizes = lines.map((l) => l.size).sort((a, b) => a - b);
  const median = sizes[Math.floor(sizes.length / 2)] || 10;
  const threshold = median * 1.4;

  const isHeadline = (l: Line) => {
    const wc = l.text.split(/\s+/).length;
    return l.size >= threshold && wc >= 3 && wc <= 25 && !/^page\s*\d+/i.test(l.text);
  };

  const articles: ParsedArticle[] = [];
  let buffer: { headline: string; body: string[]; page: number } | null = null;

  const flush = () => {
    if (!buffer) return;
    const body = buffer.body.join(" ").replace(/\s+/g, " ").trim();
    if (body.split(/\s+/).length < 25) {
      if (articles.length && body) {
        articles[articles.length - 1].body += " " + body;
        articles[articles.length - 1].minutes = readTime(articles[articles.length - 1].body);
      }
    } else {
      const headline = buffer.headline.replace(/\s+/g, " ").trim();
      articles.push({
        id: `art-${articles.length + 1}`,
        headline,
        body,
        minutes: readTime(body),
        category: guessCategory(headline, body),
        page: buffer.page,
      });
    }
    buffer = null;
  };

  for (const l of lines) {
    if (isHeadline(l)) {
      flush();
      buffer = { headline: l.text, body: [], page: l.page };
    } else if (buffer) {
      buffer.body.push(l.text);
    }
  }
  flush();
  return articles;
}

/* -------------------- OCR fallback -------------------- */

type OcrPage = { page: number; text: string };

async function runOcrOnDocument(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  opts: { signal?: AbortSignal; onProgress?: (u: ProgressUpdate) => void; language: string }
): Promise<OcrPage[]> {
  const { signal, onProgress, language } = opts;
  const totalPages = pdf.numPages as number;

  // Lazy import: keeps tesseract.js out of the initial bundle.
  const { createWorker } = await import("tesseract.js");

  onProgress?.({
    stage: "ocr",
    progress: 0.0,
    label: "Preparing OCR engine…",
    ocrActive: true,
  });

  const worker = await createWorker(language, undefined, {
    logger: (m: { status: string; progress: number }) => {
      // surface tesseract micro-progress within the current page slot
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        // we update coarse progress per-page below; ignore here to avoid noise
      }
    },
  });

  const pages: OcrPage[] = [];
  try {
    for (let p = 1; p <= totalPages; p++) {
      if (signal?.aborted) throw new PdfCancelledError();

      onProgress?.({
        stage: "ocr",
        progress: 0.05 + 0.9 * ((p - 1) / totalPages),
        label: `OCR page ${p} of ${totalPages}`,
        page: p,
        totalPages,
        ocrActive: true,
      });

      const page = await pdf.getPage(p);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context for OCR");

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      if (signal?.aborted) throw new PdfCancelledError();

      const { data } = await worker.recognize(canvas);
      pages.push({ page: p, text: data.text || "" });

      // free the canvas
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    try { await worker.terminate(); } catch { /* ignore */ }
  }

  return pages;
}

function buildArticlesFromOcrText(pages: OcrPage[]): ParsedArticle[] {
  const articles: ParsedArticle[] = [];

  for (const { page, text } of pages) {
    if (!text.trim()) continue;
    // Split into paragraph blocks separated by blank lines.
    const blocks = text
      .split(/\n{2,}/)
      .map((b) => b.replace(/[ \t]+/g, " ").trim())
      .filter(Boolean);

    let pending: { headline: string; body: string[] } | null = null;

    const flush = () => {
      if (!pending) return;
      const body = pending.body.join(" ").replace(/\s+/g, " ").trim();
      if (body.split(/\s+/).length >= 25) {
        const headline = pending.headline.replace(/\s+/g, " ").trim();
        articles.push({
          id: `art-${articles.length + 1}`,
          headline,
          body,
          minutes: readTime(body),
          category: guessCategory(headline, body),
          page,
        });
      } else if (articles.length && body) {
        articles[articles.length - 1].body += " " + body;
        articles[articles.length - 1].minutes = readTime(articles[articles.length - 1].body);
      }
      pending = null;
    };

    for (const block of blocks) {
      const lines = block.split(/\n+/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      const first = lines[0];
      const wc = first.split(/\s+/).length;
      const looksLikeHeadline =
        wc >= 3 &&
        wc <= 18 &&
        !/[.!?]$/.test(first) &&
        // Title case or all-caps heuristic
        (/^[A-Z]/.test(first) && first.replace(/[^A-Za-z]/g, "").length > 0);

      if (looksLikeHeadline && lines.length > 1) {
        flush();
        pending = { headline: first, body: lines.slice(1) };
      } else if (pending) {
        pending.body.push(...lines);
      } else {
        // No headline yet — start a synthetic one from the first sentence
        const sentence = block.split(/(?<=[.!?])\s+/)[0] || block;
        const head = sentence.split(/\s+/).slice(0, 10).join(" ");
        pending = { headline: head + (sentence.length > head.length ? "…" : ""), body: lines };
      }
    }
    flush();
  }

  return articles;
}
