import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Upload, Camera, Share2, Play, Pause, Plus, Check,
  Wifi, Newspaper, FileText, ChevronRight, Headphones,
  Settings as SettingsIcon, Languages, Volume2, ListMusic,
  Loader2, X, Zap,
} from "lucide-react";
import {
  parsePdfToArticles,
  PdfCancelledError,
  type ParsedArticle,
  type ProgressUpdate,
} from "@/lib/pdf-parser";
import { generateAudio } from "@/lib/audio-service";
import { AudioPlayer } from "@/components/AudioPlayer";

export const Route = createFileRoute("/")({
  component: VoxNewsApp,
  head: () => ({
    meta: [
      { title: "VoxNews Bharat — Listen to your newspapers" },
      {
        name: "description",
        content:
          "Share any newspaper PDF on WhatsApp and VoxNews turns it into an audio playlist. Built for Bharat.",
      },
    ],
  }),
});

type Article = {
  id: string;
  headline: string;
  source: string;
  minutes: number;
  category: string;
  body?: string;
};

const SAMPLE: Article[] = [
  { id: "a1", headline: "Monsoon arrives early in Kerala, IMD confirms onset", source: "The Hindu · Page 1", minutes: 4, category: "National" },
  { id: "a2", headline: "RBI holds repo rate steady, signals festive-season cheer", source: "Mint · Page 3", minutes: 6, category: "Business" },
  { id: "a3", headline: "ISRO sets September window for Gaganyaan crew rehearsal", source: "Indian Express · Page 5", minutes: 5, category: "Science" },
  { id: "a4", headline: "Mumbai local trains add 38 services on Western line", source: "TOI · Mumbai · Page 2", minutes: 3, category: "City" },
  { id: "a5", headline: "Editorial: A blueprint for India's small-town transit", source: "Editorial · Page 8", minutes: 7, category: "Opinion" },
  { id: "a6", headline: "Asia Cup squad announced: three uncapped names earn nod", source: "Sportstar · Page 11", minutes: 4, category: "Sports" },
];

type ImportedDoc = {
  fileName: string;
  pages: number;
  articles: Article[];
  totalMinutes: number;
};

function articlesFromParsed(parsed: ParsedArticle[], fileName: string): Article[] {
  const stem = fileName.replace(/\.pdf$/i, "");
  return parsed.map((a) => ({
    id: a.id,
    headline: a.headline,
    source: `${stem} · Page ${a.page}`,
    minutes: a.minutes,
    category: a.category,
    body: a.body,
  }));
}

function VoxNewsApp() {
  const [tab, setTab] = useState<"home" | "howto" | "settings">("home");
  const [doc, setDoc] = useState<ImportedDoc | null>(null);
  const [queue, setQueue] = useState<string[]>(["a1", "a2"]);
  const [playing, setPlaying] = useState<string | null>("a1");
  const [wifiOnly, setWifiOnly] = useState(true);
  const [enableOcr, setEnableOcr] = useState(true);
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const articles = doc?.articles ?? SAMPLE;
  const sourceLabel = doc
    ? `${doc.fileName} · ${doc.pages} pages · ${doc.totalMinutes} mins total`
    : "Imported via WhatsApp · 14 pages · 32 mins total";
  const sourceTitle = doc?.fileName ?? "TheHindu_12May.pdf";

  const toggleQueue = (id: string) =>
    setQueue((q) => (q.includes(id) ? q.filter((x) => x !== id) : [...q, id]));

  const totalMinutes = articles
    .filter((a) => queue.includes(a.id))
    .reduce((s, a) => s + a.minutes, 0);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleCancelImport = () => {
    abortRef.current?.abort();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-upload of same file
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
      setImportError("Please pick a PDF file.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setImporting(true);
    setImportError(null);
    setPendingFileName(file.name);
    setProgress({ stage: "loading", progress: 0, label: "Starting…" });

    try {
      const result = await parsePdfToArticles(file, {
        signal: controller.signal,
        onProgress: (u) => setProgress(u),
        enableOcr,
      });
      if (result.articles.length === 0) {
        setImportError(
          enableOcr
            ? "Couldn't read this PDF, even with OCR. Try a clearer scan."
            : "Couldn't read any text from this PDF. It may be scanned — turn on OCR fallback in Settings."
        );
      } else {
        const arts = articlesFromParsed(result.articles, result.fileName);
        const totalMins = arts.reduce((s, a) => s + a.minutes, 0);
        setDoc({
          fileName: result.fileName,
          pages: result.pages,
          articles: arts,
          totalMinutes: totalMins,
        });
        setQueue([arts[0].id]);
        setPlaying(arts[0].id);
      }
    } catch (err) {
      if (err instanceof PdfCancelledError) {
        // silent — the user asked for it
      } else {
        console.error(err);
        setImportError("Sorry, we couldn't open that PDF.");
      }
    } finally {
      abortRef.current = null;
      setImporting(false);
      setProgress(null);
      setPendingFileName(null);
    }
  };

  const playingArticle = articles.find((a) => a.id === playing) ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground newsprint-grain">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <PhoneFrame>
        <StatusBar />
        <Masthead />

        <div className="px-5 pb-32">
          {tab === "home" && (
            <HomeView
              articles={articles}
              queue={queue}
              playing={playing}
              setPlaying={setPlaying}
              toggleQueue={toggleQueue}
              totalMinutes={totalMinutes}
              sourceTitle={sourceTitle}
              sourceLabel={sourceLabel}
              isImported={!!doc}
              onUpload={handlePickFile}
              onOpenArticle={(a) => setOpenArticle(a)}
              importing={importing}
              importError={importError}
              progress={progress}
              pendingFileName={pendingFileName}
              onCancelImport={handleCancelImport}
            />
          )}
          {tab === "howto" && <HowToView />}
          {tab === "settings" && (
            <SettingsView
              wifiOnly={wifiOnly} setWifiOnly={setWifiOnly}
              enableOcr={enableOcr} setEnableOcr={setEnableOcr}
            />
          )}
        </div>

        {playingArticle && tab !== "howto" && (
          <NowPlayingBar
            article={playingArticle}
            onToggle={() => setPlaying(playing ? null : articles[0].id)}
            queueCount={queue.length}
          />
        )}

        <BottomNav tab={tab} setTab={setTab} />
      </PhoneFrame>

      {openArticle && (
        <ArticleSheet article={openArticle} onClose={() => setOpenArticle(null)} />
      )}
    </div>
  );
}

/* ---------- Layout chrome ---------- */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[440px] min-h-screen bg-card relative shadow-[0_0_60px_-20px_oklch(0.2_0.03_60/0.25)]">
      {children}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-1 text-xs font-medium text-muted-foreground">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-saffron" /> Hindi · English
      </span>
      <span>5G</span>
    </div>
  );
}

function Masthead() {
  return (
    <header className="px-5 pt-3 pb-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Aaj ka Akhbar · Tuesday
          </p>
          <h1 className="font-display text-3xl font-black leading-none mt-1">
            VoxNews <span className="text-saffron">Bharat</span>
          </h1>
        </div>
        <button className="h-11 w-11 rounded-full border border-border bg-background grid place-items-center">
          <Headphones className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 h-[3px] bg-foreground" />
      <div className="mt-1 h-[1px] rule-line" />
    </header>
  );
}

/* ---------- HOME ---------- */

function HomeView({
  articles, queue, playing, setPlaying, toggleQueue, totalMinutes,
  sourceTitle, sourceLabel, isImported, onUpload, onOpenArticle,
  importing, importError, progress, pendingFileName, onCancelImport,
}: {
  articles: Article[];
  queue: string[];
  playing: string | null;
  setPlaying: (id: string) => void;
  toggleQueue: (id: string) => void;
  totalMinutes: number;
  sourceTitle: string;
  sourceLabel: string;
  isImported: boolean;
  onUpload: () => void;
  onOpenArticle: (a: Article) => void;
  importing: boolean;
  importError: string | null;
  progress: ProgressUpdate | null;
  pendingFileName: string | null;
  onCancelImport: () => void;
}) {
  return (
    <>
      {/* Hero share card */}
      <section className="mt-2 rounded-3xl bg-foreground text-background p-6 shadow-[var(--shadow-lift)] relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-saffron/30 blur-2xl" />
        <p className="text-[11px] uppercase tracking-[0.2em] opacity-70">New here?</p>
        <h2 className="font-display text-2xl leading-tight mt-2">
          Receive a PDF on WhatsApp? <br />
          <span className="text-saffron">Share it with VoxNews</span> to hear it.
        </h2>
        <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-background text-foreground px-5 py-3 text-sm font-semibold">
          <Share2 className="h-4 w-4" /> Show me how
          <ChevronRight className="h-4 w-4" />
        </button>
      </section>

      {/* Primary actions */}
      <section className="mt-5 grid grid-cols-2 gap-3">
        <ActionTile
          icon={importing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          label={importing ? "Reading…" : "Upload PDF"}
          hint={importing ? "Parsing your file" : "From your phone"}
          primary
          onClick={importing ? undefined : onUpload}
          disabled={importing}
        />
        <ActionTile
          icon={<Camera className="h-6 w-6" />}
          label="Camera Scan"
          hint="Snap a page"
        />
      </section>

      {importing && (
        <ImportProgress
          progress={progress}
          fileName={pendingFileName}
          onCancel={onCancelImport}
        />
      )}

      {importError && (
        <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm px-3 py-2">
          {importError}
        </div>
      )}

      {/* Ready to listen */}
      <SectionHeader
        kicker={isImported ? "Just imported" : "Today's Edition"}
        title="Ready to Listen"
        meta={`${articles.length} articles`}
      />

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-paper-shade border-b border-border">
          <div className="h-10 w-10 rounded-lg bg-foreground text-background grid place-items-center">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{sourceTitle}</p>
            <p className="text-xs text-muted-foreground truncate">{sourceLabel}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-saffron">
            {isImported ? "Yours" : "New"}
          </span>
        </div>

        <ul className="divide-y divide-border">
          {articles.map((a, i) => (
            <PlaylistItem
              key={a.id}
              index={i + 1}
              article={a}
              isPlaying={playing === a.id}
              isQueued={queue.includes(a.id)}
              onPlay={() => setPlaying(a.id)}
              onQueue={() => toggleQueue(a.id)}
              onOpen={a.body ? () => onOpenArticle(a) : undefined}
            />
          ))}
        </ul>
      </div>

      {/* Queue summary */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-border bg-paper-shade px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <ListMusic className="h-4 w-4 text-saffron" />
          <span className="font-semibold">{queue.length} queued</span>
          <span className="text-muted-foreground">· {totalMinutes} mins back-to-back</span>
        </div>
        <button className="text-xs font-bold uppercase tracking-wider text-foreground">
          Play all
        </button>
      </div>
    </>
  );
}

function ActionTile({
  icon, label, hint, primary, onClick, disabled,
}: {
  icon: React.ReactNode; label: string; hint: string;
  primary?: boolean; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-2xl p-4 text-left h-28 flex flex-col justify-between transition-transform active:scale-[0.98] disabled:opacity-70",
        primary
          ? "bg-saffron text-saffron-foreground shadow-[var(--shadow-lift)]"
          : "bg-card border border-border",
      ].join(" ")}
    >
      <div
        className={[
          "h-10 w-10 rounded-xl grid place-items-center",
          primary ? "bg-foreground text-background" : "bg-paper-shade",
        ].join(" ")}
      >
        {icon}
      </div>
      <div>
        <p className="font-display text-lg font-bold leading-none">{label}</p>
        <p className="text-xs opacity-70 mt-1">{hint}</p>
      </div>
    </button>
  );
}

function ImportProgress({
  progress, fileName, onCancel,
}: {
  progress: ProgressUpdate | null;
  fileName: string | null;
  onCancel: () => void;
}) {
  const pct = Math.round((progress?.progress ?? 0) * 100);
  const stageLabel =
    progress?.stage === "loading" ? "Loading"
    : progress?.stage === "reading" ? "Reading pages"
    : progress?.stage === "ocr" ? "OCR (scanned pages)"
    : progress?.stage === "structuring" ? "Finding articles"
    : "Starting";
  return (
    <div
      className="mt-3 rounded-2xl border border-border bg-card p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-paper-shade grid place-items-center shrink-0">
          <Loader2 className="h-5 w-5 animate-spin text-saffron" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{fileName ?? "Your PDF"}</p>
          <p className="text-xs text-muted-foreground truncate">
            {stageLabel} · {progress?.label ?? "Working…"}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="h-9 px-3 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 shrink-0"
        >
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-paper-shade overflow-hidden">
        <div
          className="h-full bg-saffron transition-[width] duration-200 ease-out"
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{pct}%</span>
        <span>Tap cancel anytime</span>
      </div>
    </div>
  );
}

function SectionHeader({ kicker, title, meta }: { kicker: string; title: string; meta?: string }) {
  return (
    <div className="mt-7 mb-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{kicker}</p>
          <h3 className="font-display text-2xl font-bold leading-tight">{title}</h3>
        </div>
        {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
      </div>
      <div className="mt-2 h-[2px] bg-foreground/80" />
    </div>
  );
}

function PlaylistItem({
  index, article, isPlaying, isQueued, onPlay, onQueue, onOpen,
}: {
  index: number;
  article: Article;
  isPlaying: boolean;
  isQueued: boolean;
  onPlay: () => void;
  onQueue: () => void;
  onOpen?: () => void;
}) {
  return (
    <li className="flex items-start gap-3 p-4">
      <button
        onClick={onPlay}
        className={[
          "h-12 w-12 shrink-0 rounded-full grid place-items-center transition",
          isPlaying
            ? "bg-saffron text-saffron-foreground"
            : "bg-foreground text-background",
        ].join(" ")}
        aria-label="Play article"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
      </button>

      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        className="flex-1 min-w-0 text-left disabled:cursor-default"
      >
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>No. {String(index).padStart(2, "0")}</span>
          <span>·</span>
          <span className="text-saffron font-bold">{article.category}</span>
        </div>
        <p className="font-display text-[17px] font-semibold leading-snug mt-1">
          {article.headline}
        </p>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="truncate">{article.source}</span>
          <span>· {article.minutes} mins</span>
        </div>
      </button>

      <button
        onClick={onQueue}
        className={[
          "h-10 w-10 shrink-0 rounded-full grid place-items-center border transition",
          isQueued
            ? "bg-foreground text-background border-foreground"
            : "border-border text-foreground",
        ].join(" ")}
        aria-label="Add to queue"
      >
        {isQueued ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </li>
  );
}

function ArticleSheet({ article, onClose }: { article: Article; onClose: () => void }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "te">("en");

  const generateContentHash = async (text: string): Promise<string> => {
    try {
      const buffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(text)
      );
      const hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      // Fallback: simple hash
      return `hash-${article.id}-${selectedLanguage}-${Date.now()}`;
    }
  };

  const handleGenerateAudio = async () => {
    if (!article.body) return;

    setLoading(true);
    setError(null);
    try {
      const contentToHash = `${article.headline}${article.body}${selectedLanguage}`;
      const contentHash = await generateContentHash(contentToHash);

      const result = await generateAudio({
        headline: article.headline,
        body: article.body,
        language: selectedLanguage,
        contentHash,
      });

      setAudioUrl(result.audioUrl);
      console.log(result.cached ? "✓ Audio from cache" : "✓ Audio generated");
    } catch (err) {
      console.error("Audio generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[440px] max-h-[85vh] bg-background rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-[var(--shadow-lift)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-border">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-saffron font-bold">{article.category}</p>
            <h3 className="font-display text-xl font-bold leading-tight mt-1">{article.headline}</h3>
            <p className="text-xs text-muted-foreground mt-1">{article.source} · {article.minutes} mins</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-paper-shade grid place-items-center shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Audio player section */}
        {audioUrl && (
          <div className="px-5 pt-4 pb-3 bg-paper-shade border-b border-border">
            <AudioPlayer audioUrl={audioUrl} />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/40 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Article body */}
        <div className="overflow-y-auto flex-1 p-5 text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {article.body}
        </div>

        {/* Audio generation footer */}
        {!audioUrl && article.body && (
          <div className="px-5 py-4 border-t border-border bg-paper-shade space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground">Language</label>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setSelectedLanguage("en")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedLanguage === "en"
                      ? "bg-saffron text-saffron-foreground"
                      : "bg-background border border-border text-foreground"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setSelectedLanguage("te")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedLanguage === "te"
                      ? "bg-saffron text-saffron-foreground"
                      : "bg-background border border-border text-foreground"
                  }`}
                >
                  Telugu
                </button>
              </div>
            </div>
            <button
              onClick={handleGenerateAudio}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                loading
                  ? "bg-foreground/30 text-foreground/50 cursor-not-allowed"
                  : "bg-saffron text-saffron-foreground hover:bg-saffron/90"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating audio...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate Audio
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- HOW TO ---------- */

function HowToView() {
  const steps = [
    {
      n: 1,
      title: "Open your newspaper PDF in WhatsApp",
      body: "Find the PDF a friend or group sent you. Tap it once to open the preview.",
    },
    {
      n: 2,
      title: "Tap the Share icon",
      body: "Look for the share arrow at the top right of the PDF preview screen.",
    },
    {
      n: 3,
      title: "Select VoxNews to start the audio magic",
      body: "We'll split the PDF into articles and start reading aloud — in your language.",
    },
  ];
  return (
    <>
      <SectionHeader kicker="Get started in 30 seconds" title="Share a PDF, hear the news" />
      <ol className="space-y-3">
        {steps.map((s) => (
          <li key={s.n} className="rounded-2xl bg-card border border-border p-5 flex gap-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-foreground text-background grid place-items-center font-display text-2xl font-black">
              {s.n}
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight">{s.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-2xl bg-saffron/15 border border-saffron/40 p-4 flex items-start gap-3">
        <Share2 className="h-5 w-5 text-saffron mt-0.5" />
        <p className="text-sm">
          Tip: You can also share PDFs from Gmail, Drive, or any file manager. Anywhere there's a
          share button, VoxNews will appear.
        </p>
      </div>
    </>
  );
}

/* ---------- SETTINGS ---------- */

function SettingsView({
  wifiOnly, setWifiOnly, enableOcr, setEnableOcr,
}: {
  wifiOnly: boolean; setWifiOnly: (v: boolean) => void;
  enableOcr: boolean; setEnableOcr: (v: boolean) => void;
}) {
  return (
    <>
      <SectionHeader kicker="Preferences" title="Settings" />

      <div className="rounded-2xl bg-card border border-border divide-y divide-border">
        <ToggleRow
          icon={<Wifi className="h-5 w-5" />}
          title="Data-Saver Mode"
          subtitle="Download audio over Wi-Fi only. Saves your mobile data."
          value={wifiOnly}
          onChange={setWifiOnly}
        />
        <ToggleRow
          icon={<FileText className="h-5 w-5" />}
          title="OCR fallback for scanned PDFs"
          subtitle="If we can't read text, scan each page like a photo. Slower, uses more battery."
          value={enableOcr}
          onChange={setEnableOcr}
        />
        <Row icon={<Languages className="h-5 w-5" />} title="Reading language" value="Hindi + English" />
        <Row icon={<Volume2 className="h-5 w-5" />} title="Voice" value="Aarav · Natural" />
        <Row icon={<SettingsIcon className="h-5 w-5" />} title="Playback speed" value="1.0×" />
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        VoxNews Bharat · Made for every reader, in every village.
      </p>
    </>
  );
}

function ToggleRow({
  icon, title, subtitle, value, onChange,
}: {
  icon: React.ReactNode; title: string; subtitle: string;
  value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="h-10 w-10 rounded-xl bg-paper-shade grid place-items-center">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={[
          "h-7 w-12 rounded-full p-0.5 transition",
          value ? "bg-saffron" : "bg-border",
        ].join(" ")}
        aria-pressed={value}
      >
        <span
          className={[
            "block h-6 w-6 rounded-full bg-background shadow transition-transform",
            value ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function Row({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-4 text-left">
      <div className="h-10 w-10 rounded-xl bg-paper-shade grid place-items-center">{icon}</div>
      <span className="flex-1 font-semibold">{title}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

/* ---------- Now Playing & Nav ---------- */

function NowPlayingBar({
  article, onToggle, queueCount,
}: { article: Article; onToggle: () => void; queueCount: number }) {
  return (
    <div className="absolute bottom-[68px] left-3 right-3 rounded-2xl bg-foreground text-background p-3 flex items-center gap-3 shadow-[var(--shadow-lift)]">
      <button
        onClick={onToggle}
        className="h-11 w-11 rounded-full bg-saffron text-saffron-foreground grid place-items-center shrink-0"
      >
        <Pause className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider opacity-60">Now playing</p>
        <p className="text-sm font-semibold truncate">{article.headline}</p>
      </div>
      <div className="text-right text-[11px] opacity-70">
        <ListMusic className="h-4 w-4 inline" /> {queueCount}
      </div>
    </div>
  );
}

function BottomNav({
  tab, setTab,
}: { tab: "home" | "howto" | "settings"; setTab: (t: "home" | "howto" | "settings") => void }) {
  const items = [
    { id: "home", label: "Inbox", icon: Newspaper },
    { id: "howto", label: "How to", icon: Share2 },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ] as const;
  return (
    <nav className="absolute bottom-0 inset-x-0 bg-card border-t border-border px-3 pt-2 pb-4 flex">
      {items.map((it) => {
        const Active = tab === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className="flex-1 flex flex-col items-center gap-1 py-1"
          >
            <Icon className={["h-6 w-6", Active ? "text-saffron" : "text-muted-foreground"].join(" ")} />
            <span className={["text-[11px] font-semibold", Active ? "text-foreground" : "text-muted-foreground"].join(" ")}>
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
