import { Pencil, ScrollText } from "lucide-react";
import { useMemo } from "react";
import { renderBbcode } from "@/lib/social/bbcode";
import { openLinkOut } from "@/lib/social/link-out";
import { SectionHeader } from "./section-header";

export function AboutCard({
  description,
  isOwner,
  userFont,
  onEdit,
}: {
  description?: string;
  isOwner: boolean;
  userFont?: string;
  onEdit?: () => void;
}) {
  const html = useMemo(() => (description ? renderBbcode(description) : ""), [description]);
  const copyFont = userFont ? { fontFamily: `"${userFont}", inherit` } : undefined;

  return (
    <section aria-label="About" className="rounded-[14px] bg-surface p-5 ring-1 ring-edge-soft">
      <SectionHeader icon={<ScrollText size={20} />} label="About" />
      {html ? (
        <div
          className="max-w-none break-words text-[14px] leading-relaxed text-ink-muted [&_a]:break-words"
          style={copyFont}
          onClick={(e) => {
            const a = (e.target as HTMLElement).closest?.("a");
            const href = a?.getAttribute("href");
            if (a && href) {
              e.preventDefault();
              openLinkOut(href);
            }
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : isOwner ? (
        <button
          onClick={onEdit}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-edge text-[13px] font-medium text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
        >
          <Pencil size={16} /> Write something about yourself
        </button>
      ) : (
        <p className="py-6 text-center text-[13px] text-ink-subtle">
          This user hasn't written anything yet
        </p>
      )}
    </section>
  );
}
