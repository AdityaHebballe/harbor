import { useState } from "react";
import { AlertCircle, RefreshCw, Search, Sparkles, Upload } from "lucide-react";
import { getTheme, type StoreTheme } from "@/lib/theme-store";
import { ThemeDetail } from "./theme-detail";
import { NotificationBell } from "./notifications/notification-bell";
import { ThemeUploadFlow } from "../theme-upload-flow";
import { useStoreThemes } from "./use-store-themes";
import { StoreDiscover } from "./store-discover";
import { StoreBrowse } from "./store-browse";
import { StoreSkeleton } from "./store-skeleton";

export function CommunityStore() {
  const { data, loading, error, reload } = useStoreThemes();
  const [mode, setMode] = useState<"discover" | "browse">("discover");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StoreTheme | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const ready = !!data && !loading && !error;
  const empty = ready && data.all.length === 0;
  const interactive = ready && !empty;

  const goDiscover = () => {
    setMode("discover");
    setQuery("");
  };
  const onSearch = (v: string) => {
    setQuery(v);
    if (v && mode === "discover") setMode("browse");
  };
  const onAuthor = (author: string) => {
    setQuery(author);
    setMode("browse");
  };
  const openThemeById = (themeId: string) => {
    const t = data?.all.find((x) => x.id === themeId);
    if (t) {
      setSelected(t);
      return;
    }
    getTheme(themeId).then(setSelected).catch(() => {});
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3 ps-[9px]">
        <Segmented mode={mode} onDiscover={goDiscover} onBrowse={() => setMode("browse")} disabled={!interactive} />
        <div className="ms-auto flex items-center gap-2.5">
          <div
            className={`flex h-9 items-center gap-2 rounded-full border border-edge-soft bg-elevated/40 px-3.5 transition-opacity ${
              interactive ? "" : "pointer-events-none opacity-40"
            }`}
          >
            <Search size={15} className="text-ink-subtle" />
            <input
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search themes"
              className="w-44 bg-transparent text-[13px] text-ink placeholder:text-ink-subtle focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-semibold text-canvas transition-[opacity,transform] hover:opacity-90 active:scale-[0.97] motion-reduce:active:scale-100"
          >
            <Upload size={14} strokeWidth={2.2} /> Share a theme
          </button>
          <NotificationBell onOpenTheme={openThemeById} />
        </div>
      </div>

      {loading ? (
        <StoreSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.all.length === 0 ? (
        <EmptyState onShare={() => setUploadOpen(true)} />
      ) : mode === "discover" ? (
        <StoreDiscover data={data} onOpen={setSelected} onAuthor={onAuthor} onBrowseAll={() => setMode("browse")} />
      ) : (
        <StoreBrowse themes={data.all} query={query} onOpen={setSelected} />
      )}

      {selected && <ThemeDetail theme={selected} onClose={() => setSelected(null)} />}
      {uploadOpen && <ThemeUploadFlow onClose={() => setUploadOpen(false)} />}
    </section>
  );
}

function Segmented({
  mode,
  onDiscover,
  onBrowse,
  disabled,
}: {
  mode: "discover" | "browse";
  onDiscover: () => void;
  onBrowse: () => void;
  disabled: boolean;
}) {
  return (
    <div
      className={`relative inline-flex h-9 items-center rounded-full bg-elevated/50 p-1 ring-1 ring-edge-soft transition-opacity ${
        disabled ? "pointer-events-none opacity-40" : ""
      }`}
    >
      <span
        aria-hidden
        className="absolute bottom-1 left-1 top-1 w-[112px] rounded-full bg-ink shadow-[0_4px_14px_-6px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: mode === "browse" ? "translateX(112px)" : "translateX(0)" }}
      />
      <button
        type="button"
        onClick={onDiscover}
        className={`relative z-10 inline-flex h-7 w-[112px] items-center justify-center gap-1.5 rounded-full text-[12.5px] font-semibold transition-colors ${
          mode === "discover" ? "text-canvas" : "text-ink-muted hover:text-ink"
        }`}
      >
        <Sparkles size={13} strokeWidth={2.2} /> Discover
      </button>
      <button
        type="button"
        onClick={onBrowse}
        className={`relative z-10 inline-flex h-7 w-[112px] items-center justify-center rounded-full text-[12.5px] font-semibold transition-colors ${
          mode === "browse" ? "text-canvas" : "text-ink-muted hover:text-ink"
        }`}
      >
        Browse all
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-[6px] border border-edge-soft bg-surface px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-danger/12 text-danger">
        <AlertCircle size={22} />
      </span>
      <p className="text-[13.5px] text-ink-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-semibold text-canvas transition-[opacity,transform] hover:opacity-90 active:scale-[0.97] motion-reduce:active:scale-100"
      >
        <RefreshCw size={14} strokeWidth={2.2} /> Try again
      </button>
    </div>
  );
}

function EmptyState({ onShare }: { onShare: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-[6px] border border-dashed border-edge bg-surface/40 px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/12 text-accent">
        <Sparkles size={26} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[18px] font-semibold tracking-tight text-ink">No community themes yet</h3>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          Be the first to share a look. Publish a theme and it shows up here for everyone.
        </p>
      </div>
      <button
        type="button"
        onClick={onShare}
        className="flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-[13.5px] font-semibold text-canvas transition-[opacity,transform] hover:opacity-90 active:scale-[0.97] motion-reduce:active:scale-100"
      >
        <Upload size={15} strokeWidth={2.2} /> Share a theme
      </button>
    </div>
  );
}
