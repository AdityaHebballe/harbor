import { useState } from "react";
import { Check, Copy, Download, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { setCustomThemePreview } from "@/lib/custom-themes";
import type { ThemePreset } from "@/lib/theme";
import { fileToPreviewDataUrl } from "./theme-upload/upload-utils";

export function BrowserCard({
  theme,
  removable,
  active,
  onActivate,
  onExport,
  onDownload,
  onRemove,
}: {
  theme: ThemePreset;
  removable: boolean;
  active: boolean;
  onActivate: () => void;
  onExport: () => void;
  onDownload: () => void;
  onRemove: () => void;
}) {
  const hasImage = !!theme.previewImage;
  const bg = theme.background?.image ?? `linear-gradient(135deg, ${theme.swatch[0]}, ${theme.swatch[1]})`;
  const [busy, setBusy] = useState(false);
  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      setBusy(true);
      const url = await fileToPreviewDataUrl(f);
      if (url) setCustomThemePreview(theme.id, url);
      setBusy(false);
    };
    input.click();
  };
  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-[4px] border transition-all ${
        active
          ? "border-accent shadow-[0_0_0_2px_var(--color-accent-soft),0_18px_40px_-22px_rgba(0,0,0,0.35)]"
          : "border-edge-soft bg-surface hover:border-edge"
      }`}
    >
      <div
        className="relative h-40 w-full"
        style={
          hasImage
            ? {
                backgroundImage: `url(${theme.previewImage})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: theme.swatch[0],
              }
            : { background: bg }
        }
      >
        {active && (
          <span className="absolute end-3 top-3 flex h-7 items-center gap-1.5 rounded-full bg-accent px-2.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-canvas shadow-[0_4px_12px_-4px_rgba(0,0,0,0.4)]">
            <Check size={11} strokeWidth={3} /> Active
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 flex h-2">
          {theme.swatch.map((c, i) => (
            <span key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
        {removable && !hasImage && (
          <button
            type="button"
            onClick={addImage}
            disabled={busy}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-canvas/45 text-[12px] font-semibold text-ink-muted opacity-0 backdrop-blur-[1px] transition-opacity hover:text-ink group-hover:opacity-100"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} strokeWidth={1.9} />}
            {busy ? "Adding" : "Add image"}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[16px] font-semibold tracking-tight text-ink">{theme.name}</span>
          {theme.blurb && (
            <span className="line-clamp-2 text-[12.5px] leading-relaxed text-ink-muted">{theme.blurb}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onActivate}
            disabled={active}
            className={`h-10 flex-1 rounded-[6px] text-[13px] font-semibold transition-opacity ${
              active ? "bg-elevated/70 text-ink ring-1 ring-edge" : "bg-ink text-canvas hover:opacity-90"
            }`}
          >
            {active ? "Active" : "Apply"}
          </button>
          <IconButton label="Copy theme" onClick={onExport}>
            <Copy size={14} strokeWidth={2.2} />
          </IconButton>
          <IconButton label="Download" onClick={onDownload}>
            <Download size={14} strokeWidth={2.2} />
          </IconButton>
          {removable && (
            <IconButton label="Remove" onClick={onRemove} danger>
              <Trash2 size={14} strokeWidth={2.2} />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-[6px] border border-edge-soft text-ink-muted transition-colors ${
        danger ? "hover:border-danger/40 hover:text-danger" : "hover:border-edge hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
