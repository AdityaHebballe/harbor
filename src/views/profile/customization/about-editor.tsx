import { useRef, useState } from "react";
import {
  Bold,
  Code,
  Eye,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Music2,
  Pencil,
  Quote,
  Strikethrough,
  Underline,
  Youtube,
} from "lucide-react";
import { renderBbcode } from "@/lib/social/bbcode";

export const ABOUT_MAX = 4000;

type Tool = { icon: typeof Bold; label: string; open: string; close: string; placeholder?: string };

const TOOLS: Tool[] = [
  { icon: Bold, label: "Bold", open: "[b]", close: "[/b]" },
  { icon: Italic, label: "Italic", open: "[i]", close: "[/i]" },
  { icon: Underline, label: "Underline", open: "[u]", close: "[/u]" },
  { icon: Strikethrough, label: "Strikethrough", open: "[s]", close: "[/s]" },
  { icon: Quote, label: "Quote", open: "[quote]", close: "[/quote]" },
  { icon: Code, label: "Code", open: "[code]", close: "[/code]" },
  { icon: List, label: "List", open: "[list]\n[*] ", close: "\n[/list]", placeholder: "item" },
  { icon: Link2, label: "Link", open: "[url=https://]", close: "[/url]", placeholder: "link text" },
  { icon: ImageIcon, label: "Image", open: "[img]", close: "[/img]", placeholder: "https://" },
  { icon: Youtube, label: "YouTube", open: "[youtube]", close: "[/youtube]", placeholder: "https://youtu.be/..." },
  { icon: Music2, label: "Spotify", open: "[spotify]", close: "[/spotify]", placeholder: "https://open.spotify.com/..." },
];

export function AboutEditor({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  const apply = (tool: Tool) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = value.slice(start, end) || tool.placeholder || "";
    const next = value.slice(0, start) + tool.open + sel + tool.close + value.slice(end);
    onChange(next.slice(0, ABOUT_MAX));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + tool.open.length + sel.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const over = value.length > ABOUT_MAX;

  return (
    <div className="flex flex-col gap-2 rounded-[10px] bg-elevated p-2.5 ring-1 ring-edge-soft">
      <div className="flex flex-wrap items-center gap-0.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            onClick={() => apply(tool)}
            title={tool.label}
            aria-label={tool.label}
            className="grid h-8 w-8 place-items-center rounded-[6px] text-ink-subtle transition-colors hover:bg-raised hover:text-ink active:scale-90 motion-reduce:active:scale-100"
          >
            <tool.icon size={15} strokeWidth={2.1} />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="ms-auto flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-[12px] font-semibold text-ink-subtle transition-colors hover:bg-raised hover:text-ink"
        >
          {preview ? <Pencil size={13} /> : <Eye size={14} />} {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div className="min-h-[120px] rounded-[8px] bg-canvas/40 p-3">
          {value.trim() ? (
            <div
              className="max-w-none break-words text-[14px] leading-relaxed text-ink-muted"
              dangerouslySetInnerHTML={{ __html: renderBbcode(value) }}
            />
          ) : (
            <span className="text-[13px] text-ink-subtle">Nothing to preview yet.</span>
          )}
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder="Show off. [b]bold[/b], [color=gold]color[/color], [youtube]link[/youtube], [img]https://...[/img] and more."
          className="min-h-[120px] resize-y rounded-[8px] bg-canvas/40 p-3 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-ink-subtle focus:ring-1 focus:ring-edge"
        />
      )}

      <div className="flex items-center justify-end">
        <span className={`text-[11.5px] tabular-nums ${over ? "text-danger" : "text-ink-subtle"}`}>
          {value.length}/{ABOUT_MAX}
        </span>
      </div>
    </div>
  );
}
