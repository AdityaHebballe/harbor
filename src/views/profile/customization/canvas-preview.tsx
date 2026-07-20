import { Eye, EyeOff } from "lucide-react";
import type { CustomizationInput } from "../profile-types";
import { CanvasFrame } from "./canvas-frame";

export function CanvasPreview({
  form,
  visible,
  onToggle,
}: {
  form: CustomizationInput;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-[14px] bg-surface p-3 ring-1 ring-edge-soft">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink">Live preview</span>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-[10px] px-2.5 text-[13px] font-medium text-ink-muted ring-1 ring-edge-soft hover:bg-elevated"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {visible ? (
        <CanvasFrame html={form.customHtml} css={form.customCss} height={form.canvasHeight} />
      ) : (
        <p className="px-1 py-6 text-center text-[13px] text-ink-subtle">Preview hidden. Show it to see your canvas render.</p>
      )}
    </div>
  );
}
