import { ArrowLeft, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BETA_THEMES } from "@/lib/theme";
import { BetaThemesCard, BetaThemesModal } from "./beta-themes-modal";
import { clearUnseenDownloads, getUnseenDownloads, subscribeUnseen } from "@/lib/theme-store";
import { CommunityStore } from "./community-store/community-store";
import { MyThemesDashboard } from "./my-themes-dashboard";
import type { LibraryEntry } from "./library-grid";
import { BrowserCard } from "./library-browser-card";
import { ThemeUpdatesBanner } from "./theme-updates-banner";

export function LibraryBrowser({
  entries,
  activeId,
  onActivate,
  onExport,
  onDownload,
  onRemove,
  onClose,
}: {
  entries: LibraryEntry[];
  activeId: string;
  onActivate: (id: string) => void;
  onExport: (id: string) => void;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const [tab, setTab] = useState<"library" | "community" | "mine">("library");
  const [betaOpen, setBetaOpen] = useState(false);
  const [unseen, setUnseen] = useState(() => getUnseenDownloads().length);

  useEffect(() => subscribeUnseen(() => setUnseen(getUnseenDownloads().length)), []);
  useEffect(() => {
    if (tab === "library") clearUnseenDownloads();
  }, [tab]);

  const builtIn = entries.filter((e) => e.category === "Built-in");
  const featured = entries.filter((e) => e.category === "Featured");
  const templates = entries.filter((e) => e.category === "Template");
  const yours = entries.filter((e) => e.category === "Yours");

  return createPortal(
    <div
      className="fixed inset-0 z-[210] flex flex-col bg-canvas"
      role="dialog"
      aria-label="Theme library"
    >
      <header data-tauri-drag-region className="flex shrink-0 items-center justify-between gap-4 border-b border-edge-soft bg-surface/40 px-10 py-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center gap-2 rounded-full border border-edge-soft bg-canvas/60 px-4 text-[13px] font-semibold text-ink-muted transition-all hover:-translate-x-0.5 rtl:hover:translate-x-0.5 hover:border-edge hover:text-ink"
          >
            <ArrowLeft size={15} strokeWidth={2.2} className="dir-icon" />
            Back to settings
          </button>
          <div data-tauri-drag-region className="flex flex-col">
            <h1 className="pointer-events-none text-[24px] font-semibold tracking-tight text-ink">Theme Library</h1>
            <p className="pointer-events-none text-[13px] text-ink-subtle">
              {entries.length} themes. Click Apply on any card to use it.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
        >
          <X size={18} strokeWidth={2.2} />
        </button>
      </header>

      <div className="flex shrink-0 items-center gap-2 border-b border-edge-soft bg-surface/20 px-10 py-3">
        <TabBtn active={tab === "library"} onClick={() => setTab("library")}>
          My library
          {unseen > 0 && (
            <span className="harbor-pop ms-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-canvas">
              {unseen}
            </span>
          )}
        </TabBtn>
        <TabBtn active={tab === "community"} onClick={() => setTab("community")}>
          Community
        </TabBtn>
        <TabBtn active={tab === "mine"} onClick={() => setTab("mine")}>
          My themes
        </TabBtn>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-10 py-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-12">
          {tab === "community" ? (
            <CommunityStore />
          ) : tab === "mine" ? (
            <MyThemesDashboard />
          ) : (
          <>
          <ThemeUpdatesBanner />
          {featured.length > 0 && (
            <BrowserSection title="Featured" subtitle="Hand-picked reskins from the Harbor crew.">
              <BrowserGrid
                entries={featured}
                activeId={activeId}
                onActivate={onActivate}
                onExport={onExport}
                onDownload={onDownload}
                onRemove={onRemove}
              />
            </BrowserSection>
          )}

          {BETA_THEMES.length > 0 && (
            <BrowserSection title="Beta" subtitle="Experimental 1:1 ports of other apps.">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <BetaThemesCard count={BETA_THEMES.length} onClick={() => setBetaOpen(true)} />
              </div>
            </BrowserSection>
          )}

          {builtIn.length > 0 && (
            <BrowserSection title="Built-in" subtitle="Ships with Harbor. Always available.">
              <BrowserGrid
                entries={builtIn}
                activeId={activeId}
                onActivate={onActivate}
                onExport={onExport}
                onDownload={onDownload}
                onRemove={onRemove}
              />
            </BrowserSection>
          )}

          {templates.length > 0 && (
            <BrowserSection title="Templates" subtitle="Starting points to remix and save your own.">
              <BrowserGrid
                entries={templates}
                activeId={activeId}
                onActivate={onActivate}
                onExport={onExport}
                onDownload={onDownload}
                onRemove={onRemove}
              />
            </BrowserSection>
          )}

          {yours.length > 0 && (
            <BrowserSection title="Your themes" subtitle="Themes you imported or built.">
              <BrowserGrid
                entries={yours}
                activeId={activeId}
                onActivate={onActivate}
                onExport={onExport}
                onDownload={onDownload}
                onRemove={onRemove}
              />
            </BrowserSection>
          )}
          </>
          )}
        </div>
      </div>
      <BetaThemesModal
        open={betaOpen}
        activeId={activeId}
        onActivate={onActivate}
        onClose={() => setBetaOpen(false)}
      />
    </div>,
    document.body,
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center rounded-full px-4 text-[13px] font-semibold transition-colors ${
        active ? "bg-ink text-canvas" : "text-ink-muted hover:bg-elevated hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function BrowserSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h3 className="text-[17px] font-semibold tracking-tight text-ink">{title}</h3>
        <p className="text-[13px] text-ink-subtle">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function BrowserGrid({
  entries,
  activeId,
  onActivate,
  onExport,
  onDownload,
  onRemove,
}: {
  entries: LibraryEntry[];
  activeId: string;
  onActivate: (id: string) => void;
  onExport: (id: string) => void;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {entries.map((e) => (
        <BrowserCard
          key={e.theme.id}
          theme={e.theme}
          removable={e.removable}
          active={activeId === e.theme.id}
          onActivate={() => onActivate(e.theme.id)}
          onExport={() => onExport(e.theme.id)}
          onDownload={() => onDownload(e.theme.id)}
          onRemove={() => onRemove(e.theme.id)}
        />
      ))}
    </div>
  );
}
