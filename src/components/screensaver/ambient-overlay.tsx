import { useEffect, useRef, useState } from "react";

export type AmbientItem = { bg: string; title: string; sub: string };

function useClock(): { time: string; date: string } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  return { time, date };
}

function AmbientSlide({ src, visible, reduce }: { src: string; visible: boolean; reduce: boolean }) {
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    if (!visible || reduce) {
      setZoomed(false);
      return;
    }
    const id = window.setTimeout(() => setZoomed(true), 60);
    return () => window.clearTimeout(id);
  }, [visible, reduce, src]);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
      style={{
        opacity: visible ? 1 : 0,
        transform: reduce ? undefined : zoomed ? "scale(1.12)" : "scale(1.02)",
        transformOrigin: "50% 42%",
        transition: reduce
          ? "opacity 1800ms ease-out"
          : "opacity 1800ms ease-out, transform 15000ms linear",
      }}
    />
  );
}

export function AmbientOverlay({
  items,
  reduce,
  visible,
  onDismiss,
}: {
  items: AmbientItem[];
  reduce: boolean;
  visible: boolean;
  onDismiss: () => void;
}) {
  const { time, date } = useClock();
  const idxRef = useRef(0);
  const [a, setA] = useState<AmbientItem>(items[0]);
  const [b, setB] = useState<AmbientItem | null>(items[1] ?? null);
  const [showA, setShowA] = useState(true);

  useEffect(() => {
    if (items.length < 2) return;
    idxRef.current = 0;
    const id = window.setInterval(() => {
      idxRef.current = (idxRef.current + 1) % items.length;
      const next = items[idxRef.current];
      setShowA((prev) => {
        if (prev) setB(next);
        else setA(next);
        return !prev;
      });
    }, 13000);
    return () => window.clearInterval(id);
  }, [items]);

  const current = showA ? a : b ?? a;

  return (
    <div
      role="presentation"
      aria-hidden
      onPointerDown={(e) => {
        e.preventDefault();
        onDismiss();
      }}
      className="fixed inset-0 z-[200] cursor-none select-none bg-black"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${visible ? 900 : 420}ms ease-out`,
        willChange: "opacity",
      }}
    >
      <AmbientSlide src={a.bg} visible={showA} reduce={reduce} />
      {b && <AmbientSlide src={b.bg} visible={!showA} reduce={reduce} />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 26%, rgba(0,0,0,0.22) 52%, rgba(0,0,0,0) 78%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-10">
        <span className="font-display text-[26px] font-semibold tracking-tight text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
          Harbor
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-8 p-12">
        <div className="flex flex-col">
          <span className="text-[15px] font-medium uppercase tracking-[0.22em] text-white/60 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
            {date}
          </span>
          <span className="mt-1 text-[92px] font-light leading-none tabular-nums text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.75)]">
            {time}
          </span>
        </div>
        <div className="mb-2 flex max-w-[46%] flex-col items-end text-end">
          {current.sub && (
            <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/65 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
              {current.sub}
            </span>
          )}
          <span className="mt-1 truncate text-[30px] font-semibold tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.75)]">
            {current.title}
          </span>
        </div>
      </div>
    </div>
  );
}
