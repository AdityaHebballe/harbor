import { useEffect, useState } from "react";
import { useSampleArtwork } from "@/lib/sample-artwork";
import { useSettings } from "@/lib/settings";
import { useT } from "@/lib/i18n";
import { Section, Segmented, ToggleRow } from "../shared";
import { SFX } from "@/lib/sfx";

export function DisplaySection() {
  const t = useT();
  const { settings, update } = useSettings();
  const glassBlur = Number.isFinite(settings.defaultLiquidGlassBlur) ? settings.defaultLiquidGlassBlur : 2;
  const glassTint = Number.isFinite(settings.defaultLiquidGlassTint) ? settings.defaultLiquidGlassTint : 40;
  const { poster: previewPoster } = useSampleArtwork();
  const previewW = Math.round(108 * settings.posterScale);
  const soundEffectsEnabled = settings.soundTheme !== "none";
  const cardW = Math.round(150 * settings.posterScale);
  const cardH = Math.round(cardW * 1.5);
  return (
    <>
      <Section
        title={t("Poster card style")}
        subtitle={t("Tune the size and corner radius of every poster across Home, Discover, and your library. The preview updates live.")}
      >
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col gap-4 rounded-2xl border border-edge-soft bg-canvas/40 p-6 sm:w-[250px]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">{t("Live preview")}</span>
            <div className="flex justify-center py-1">
              <img
                src={previewPoster}
                alt=""
                draggable={false}
                className="aspect-[2/3] object-cover shadow-[0_10px_28px_-10px_rgba(0,0,0,0.65)] transition-[width,border-radius] duration-200"
                style={{ width: previewW, borderRadius: settings.posterRadius }}
              />
            </div>
            <div className="flex flex-col gap-2.5 text-[12.5px]">
              <span className="flex items-center justify-between gap-3">
                <span className="font-medium text-ink">{t("Width")}</span>
                <PxField
                  value={cardW}
                  min={90}
                  max={300}
                  onCommit={(px) => update({ posterScale: Math.round((px / 150) * 100) / 100 })}
                />
              </span>
              <span className="flex items-center justify-between gap-3">
                <span className="font-medium text-ink">{t("Corner radius")}</span>
                <PxField
                  value={settings.posterRadius}
                  min={0}
                  max={40}
                  onCommit={(px) => update({ posterRadius: px })}
                />
              </span>
              <span className="flex items-center justify-between gap-3 text-ink-subtle">
                <span>{t("Height")}</span>
                <PxField
                  value={cardH}
                  min={135}
                  max={450}
                  onCommit={(px) => update({ posterScale: Math.round((px / 225) * 100) / 100 })}
                />
              </span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">{t("Size")}</span>
              <Segmented
                value={posterSizeKey(settings.posterScale)}
                options={POSTER_SIZES.map((p) => ({ value: p.value, label: p.label }))}
                onChange={(v) =>
                  update({ posterScale: POSTER_SIZES.find((p) => p.value === v)?.scale ?? 1 })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">{t("Corner radius")}</span>
              <Segmented
                value={radiusKey(settings.posterRadius)}
                options={POSTER_RADII.map((p) => ({ value: p.value, label: t(p.label) }))}
                onChange={(v) => update({ posterRadius: POSTER_RADII.find((p) => p.value === v)?.px ?? 12 })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">{t("Load effect")}</span>
              <Segmented
                value={settings.posterEffect}
                options={[
                  { value: "blur", label: t("Blur up") },
                  { value: "fade", label: t("Fade") },
                  { value: "off", label: t("Instant") },
                ]}
                onChange={(v) => update({ posterEffect: v as "blur" | "fade" | "off" })}
              />
              <p className="text-[12px] leading-relaxed text-ink-subtle">
                {t("How posters appear as they load. Blur up looks smoothest; Fade is lighter on older or low-power devices; Instant turns it off.")}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">{t("Quality")}</span>
              <Segmented
                value={settings.posterQuality}
                options={[
                  { value: "balanced", label: t("Balanced") },
                  { value: "high", label: t("High") },
                  { value: "max", label: t("Maximum") },
                ]}
                onChange={(v) => update({ posterQuality: v as "balanced" | "high" | "max" })}
              />
              <p className="text-[12px] leading-relaxed text-ink-subtle">
                {t("Resolution posters are decoded at. High is sized to your screen with headroom and looks identical to full res while using far less memory; Balanced saves the most; Maximum keeps original resolution.")}
              </p>
            </div>
          </div>
        </div>
        <ToggleRow
          label={t("Liquid glass row arrows")}
          newId="theme:liquid-glass"
          sub={t("Render the row scroll arrows as a refracting liquid-glass button. Off by default; needs WebGL and falls back automatically.")}
          value={settings.liquidGlass}
          onChange={(v) => update({ liquidGlass: v })}
        />
        <ToggleRow
          label={t("Poster dock magnification")}
          newId="theme:poster-dock"
          sub={t("Gently magnify nearby posters as you move across a poster row, like a dock. Off by default.")}
          value={settings.posterDockMagnification}
          onChange={(posterDockMagnification) => update({ posterDockMagnification })}
        />
        {settings.posterDockMagnification && (
          <div className="flex items-center gap-4 px-1 py-1.5">
            <span className="w-32 shrink-0 text-[13.5px] font-medium text-ink">
              {t("Animation speed")}
            </span>
            <input
              type="range"
              min="250"
              max="1500"
              step="10"
              value={settings.posterDockTransitionMs}
              onChange={(event) => update({ posterDockTransitionMs: Number(event.target.value) })}
              className="h-1 flex-1 appearance-none rounded-full bg-edge-soft accent-ink"
            />
            <span className="w-16 shrink-0 text-end text-[13px] tabular-nums text-ink-muted">
              {settings.posterDockTransitionMs}ms
            </span>
            {settings.posterDockTransitionMs !== 760 && (
              <button
                type="button"
                onClick={() => update({ posterDockTransitionMs: 760 })}
                className="shrink-0 text-[12.5px] font-medium text-ink-subtle transition-colors hover:text-ink"
              >
                {t("Reset")}
              </button>
            )}
          </div>
        )}
        {settings.liquidGlass && (
          <>
            <ToggleRow
              label={t("Enhanced liquid glass")}
              sub={t("A richer glass treatment. May look better while using more graphics resources.")}
              value={settings.experimentalLiquidGlassEnabled}
              onChange={(experimentalLiquidGlassEnabled) => update({ experimentalLiquidGlassEnabled })}
            />
            {settings.experimentalLiquidGlassEnabled ? (
              <div className="mt-4 flex items-center gap-4 px-1 py-1.5">
                <span className="w-40 shrink-0 text-[13.5px] font-medium text-ink">{t("Glass opacity")}</span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={settings.experimentalLiquidGlassOpacity}
                  onChange={(e) => update({ experimentalLiquidGlassOpacity: Number(e.target.value) })}
                  className="h-1 flex-1 appearance-none rounded-full bg-edge-soft accent-ink"
                />
                <span className="w-14 shrink-0 text-end text-[13px] tabular-nums text-ink-muted">
                  {settings.experimentalLiquidGlassOpacity}%
                </span>
              </div>
            ) : (
              <>
                <div className="mt-4 flex items-center gap-4 px-1 py-1.5">
                  <span className="w-40 shrink-0 text-[13.5px] font-medium text-ink">{t("Glass blur")}</span>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={glassBlur}
                    onChange={(e) => update({ defaultLiquidGlassBlur: Number(e.target.value) })}
                    className="h-1 flex-1 appearance-none rounded-full bg-edge-soft accent-ink"
                  />
                  <span className="w-14 shrink-0 text-end text-[13px] tabular-nums text-ink-muted">{glassBlur}px</span>
                </div>
                <div className="mt-4 flex items-center gap-4 px-1 py-1.5">
                  <span className="w-40 shrink-0 text-[13.5px] font-medium text-ink">{t("Glass tint")}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={glassTint}
                    onChange={(e) => update({ defaultLiquidGlassTint: Number(e.target.value) })}
                    className="h-1 flex-1 appearance-none rounded-full bg-edge-soft accent-ink"
                  />
                  <span className="w-14 shrink-0 text-end text-[13px] tabular-nums text-ink-muted">{glassTint}%</span>
                </div>
              </>
            )}
          </>
        )}
      </Section>

      <Section
        title={t("Sound effects")}
        subtitle={t("Subtle audio feedback as you navigate and click. Off by default; pick a style to turn it on.")}
      >
        <div className="flex flex-col gap-4">
          <Segmented
            value={settings.soundTheme}
            options={[
              { value: "none", label: t("Off") },
              { value: "glass", label: t("Glass") },
              { value: "modern", label: t("Modern") },
              { value: "retro", label: t("Retro") },
              { value: "cinematic", label: t("Cinematic") },
            ]}
            onChange={(v) => update({ soundTheme: v as "none" | "glass" | "modern" | "retro" | "cinematic" })}
          />

          {soundEffectsEnabled && (
            <>
              <div className="flex items-center gap-4 px-1 py-1.5">
                <span className="w-32 shrink-0 text-[13.5px] font-medium text-ink">
                  {t("Sound effects volume")}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.sfxVolume ?? 50}
                  onChange={(e) => {
                    const volume = parseInt(e.target.value, 10);
                    update({ sfxVolume: volume });
                    SFX.setVolume(volume / 100);
                    SFX.click();
                  }}
                  className="h-1 flex-1 appearance-none rounded-full bg-edge-soft accent-ink"
                />
                <span className="w-14 shrink-0 text-end text-[13px] tabular-nums text-ink-muted">
                  {settings.sfxVolume ?? 50}%
                </span>
              </div>

              <ToggleRow
                label={t("Player volume sounds")}
                sub={t("Play a short sound when changing the player volume. Off by default.")}
                value={settings.playerVolumeSfx}
                onChange={(value) => update({ playerVolumeSfx: value })}
              />
            </>
          )}
        </div>
      </Section>

      <Section
        title={t("Title text")}
        subtitle={t("Resize the row titles on Home and the title shown in the player, without scaling the rest of the interface. You can also lead the player title with the series name instead of the episode.")}
      >
        <SizeSlider
          label={t("Row titles")}
          value={settings.rowTitleScale}
          onChange={(v) => update({ rowTitleScale: v })}
        />
        <SizeSlider
          label={t("Player title")}
          value={settings.playerTitleScale}
          onChange={(v) => update({ playerTitleScale: v })}
        />
        <ToggleRow
          label={t("Show series name first in the player")}
          sub={t("Lead with the show name instead of the episode title at the top of the player.")}
          value={settings.playerTitleSeriesFirst}
          onChange={(v) => update({ playerTitleSeriesFirst: v })}
        />
      </Section>

      <Section
        title={t("Accessibility")}
        subtitle={t("Make everything bigger and easier to read: sidebar, menus, popups, every page. The whole interface scales live as you drag, so you can see the change right here. Great on 4K and ultrawide monitors, or whenever the text feels small.")}
      >
        <div className="flex items-center gap-4 px-1 py-1.5">
          <span className="w-32 shrink-0 text-[13.5px] font-medium text-ink">{t("Interface scale")}</span>
          <input
            type="range"
            min={0.8}
            max={1.6}
            step={0.05}
            value={settings.uiScale}
            onChange={(e) => update({ uiScale: parseFloat(e.target.value) })}
            className="h-1 flex-1 appearance-none rounded-full bg-edge-soft accent-ink"
          />
          <span className="w-14 shrink-0 text-end text-[13px] tabular-nums text-ink-muted">
            {Math.round(settings.uiScale * 100)}%
          </span>
          {settings.uiScale !== 1 && (
            <button
              onClick={() => update({ uiScale: 1 })}
              className="shrink-0 text-[12.5px] font-medium text-ink-subtle transition-colors hover:text-ink"
            >
              {t("Reset")}
            </button>
          )}
        </div>
      </Section>

      <Section
        title={t("Home hero")}
        subtitle={t("Make the featured banner on Home bigger and sharper.")}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-[14px] font-medium text-ink">{t("Featured source")}</span>
          <span className="text-[12.5px] text-ink-subtle">
            {t("What fills the hero. Trending is a fresh top list from Harbor, refreshed through the day. Classic uses your own Home rows.")}
          </span>
          <Segmented
            value={settings.heroFeed}
            options={[
              { value: "trending", label: t("Trending") },
              { value: "trakt", label: t("Trakt") },
              { value: "simkl", label: t("Simkl") },
              { value: "classic", label: t("Classic") },
            ]}
            onChange={(v) => update({ heroFeed: v as "trending" | "trakt" | "simkl" | "classic" })}
          />
        </div>
        <ToggleRow
          label={t("Full hero banner")}
          sub={t("Stretch the featured hero edge to edge and taller, across every layout.")}
          value={settings.heroFull}
          onChange={(v) => update({ heroFull: v })}
        />
        <ToggleRow
          label={t("Full quality hero image")}
          sub={t("Load the highest-resolution artwork for the featured hero. Uses more bandwidth.")}
          value={settings.heroFullQuality}
          onChange={(v) => update({ heroFullQuality: v })}
        />
        <ToggleRow
          label={t("Play trailers in the hero")}
          newId="theme:hero-video"
          sub={t("After a moment on a slide, the featured title's trailer plays muted in the background. Uses more bandwidth.")}
          value={settings.heroTrailers}
          onChange={(v) => update({ heroTrailers: v })}
        />
        {settings.heroTrailers && (
          <ToggleRow
            label={t("Home hero audio")}
            sub={t("The home hero trailer plays with sound and a mute button in the corner, then shows a replay button when it ends. Auto-rotation pauses so it stays on the featured title.")}
            value={settings.heroTrailerAudio}
            onChange={(v) => update({ heroTrailerAudio: v })}
          />
        )}
      </Section>

      <Section
        title={t("Screensaver")}
        subtitle={t("When Harbor sits idle in the foreground, it drifts through cinematic backdrops with a clock and what's trending. Any movement or key brings you back. Off by default.")}
      >
        <ToggleRow
          label={t("Ambient screensaver")}
          value={settings.screensaver}
          onChange={(v) => update({ screensaver: v })}
        />
        {settings.screensaver && (
          <div className="mt-3 flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              {t("Start after")}
            </span>
            <Segmented
              value={String(settings.screensaverDelayMin)}
              options={[
                { value: "1", label: t("1 min") },
                { value: "3", label: t("3 min") },
                { value: "5", label: t("5 min") },
                { value: "10", label: t("10 min") },
                { value: "15", label: t("15 min") },
              ]}
              onChange={(v) => update({ screensaverDelayMin: Number(v) })}
            />
          </div>
        )}
      </Section>

      <Section
        title={t("Home hero shadow")}
        subtitle={t("How dark the gradient behind the featured title on Home is. 100% is the classic look; lower it to let more of the artwork show through.")}
      >
        <div className="flex items-center gap-4 px-1 py-1.5">
          <span className="w-32 shrink-0 text-[13.5px] font-medium text-ink">{t("Shadow")}</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={settings.heroShadow}
            onChange={(e) => update({ heroShadow: parseInt(e.target.value, 10) })}
            className="h-1 flex-1 appearance-none rounded-full bg-edge-soft accent-ink"
          />
          <span className="w-14 shrink-0 text-end text-[13px] tabular-nums text-ink-muted">
            {settings.heroShadow}%
          </span>
          {settings.heroShadow !== 100 && (
            <button
              onClick={() => update({ heroShadow: 100 })}
              className="shrink-0 text-[12.5px] font-medium text-ink-subtle transition-colors hover:text-ink"
            >
              {t("Reset")}
            </button>
          )}
        </div>
      </Section>

      <Section
        title={t("Trailer quality")}
        subtitle={t("How sharp trailers play. Auto follows your connection speed, and the Watch Trailer button targets 1080p. Pick 1080p or Best (up to 4K when the source has it) to force higher. 1080p and Best merge separate video and audio with the bundled ffmpeg, so they take a beat longer to start.")}
      >
        <Segmented
          value={settings.trailerQuality}
          options={[
            { value: "auto", label: "Auto" },
            { value: "360p", label: "360p" },
            { value: "720p", label: "720p" },
            { value: "1080p", label: "1080p" },
            { value: "best", label: "Best" },
          ]}
          onChange={(v) => update({ trailerQuality: v })}
        />
        <ToggleRow
          label={t("Autoplay trailer on detail pages")}
          sub={t("Plays a muted trailer in the backdrop when you open a title. Click the speaker to unmute. Falls back to the image when no trailer is available.")}
          value={settings.detailTrailerAutoplay}
          onChange={(v) => update({ detailTrailerAutoplay: v })}
        />
        {settings.detailTrailerAutoplay && (
          <ToggleRow
            label={t("Start trailers with audio")}
            sub={t("Detail page trailers begin unmuted. Falls back to muted if the browser blocks sound until you interact.")}
            value={settings.detailTrailerAudio}
            onChange={(v) => update({ detailTrailerAudio: v })}
          />
        )}
      </Section>
    </>
  );
}

function SizeSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const t = useT();
  return (
    <div className="flex items-center gap-4 px-1 py-1.5">
      <span className="w-32 shrink-0 text-[13.5px] font-medium text-ink">{label}</span>
      <input
        type="range"
        min={0.8}
        max={1.6}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 flex-1 appearance-none rounded-full bg-edge-soft accent-ink"
      />
      <span className="w-14 shrink-0 text-end text-[13px] tabular-nums text-ink-muted">
        {Math.round(value * 100)}%
      </span>
      {value !== 1 && (
        <button
          onClick={() => onChange(1)}
          className="shrink-0 text-[12.5px] font-medium text-ink-subtle transition-colors hover:text-ink"
        >
          {t("Reset")}
        </button>
      )}
    </div>
  );
}

const POSTER_RADII = [
  { value: "sharp", label: "Sharp", px: 0 },
  { value: "subtle", label: "Subtle", px: 6 },
  { value: "classic", label: "Classic", px: 12 },
  { value: "rounded", label: "Rounded", px: 18 },
  { value: "pill", label: "Pill", px: 28 },
];

function radiusKey(px: number): string {
  return POSTER_RADII.reduce((best, p) => (Math.abs(p.px - px) < Math.abs(best.px - px) ? p : best)).value;
}

function PxField({
  value,
  min,
  max,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  onCommit: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);
  const commit = () => {
    const n = Math.max(min, Math.min(max, Math.round(Number(draft) || value)));
    onCommit(n);
    setEditing(false);
  };
  if (editing) {
    return (
      <input
        type="number"
        autoFocus
        value={draft}
        min={min}
        max={max}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          else if (e.key === "Escape") setEditing(false);
        }}
        className="w-14 rounded-md border border-ink bg-canvas px-1.5 py-0.5 text-[12px] tabular-nums text-ink outline-none"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Click to edit"
      className="rounded px-1 py-0.5 tabular-nums text-ink-muted transition-colors hover:bg-raised hover:text-ink"
    >
      {value}px
    </button>
  );
}

const POSTER_SIZES = [
  { value: "compact", label: "Compact", scale: 0.8 },
  { value: "dense", label: "Dense", scale: 0.9 },
  { value: "standard", label: "Standard", scale: 1 },
  { value: "balanced", label: "Balanced", scale: 1.15 },
  { value: "comfort", label: "Comfort", scale: 1.3 },
  { value: "large", label: "Large", scale: 1.5 },
] as const;

function posterSizeKey(scale: number): string {
  let best: (typeof POSTER_SIZES)[number] = POSTER_SIZES[0];
  for (const p of POSTER_SIZES) {
    if (Math.abs(p.scale - scale) < Math.abs(best.scale - scale)) best = p;
  }
  return best.value;
}
