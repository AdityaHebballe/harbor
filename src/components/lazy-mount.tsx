import { startTransition, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const CULL_MARGIN = "2000px";

export function LazyMount({
  children,
  fallback,
  rootMargin = "1200px",
  minHeight = 240,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [far, setFar] = useState(false);
  const shownRef = useRef(false);
  shownRef.current = shown;

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const inViewport = (r: DOMRect) => {
      const vh = window.innerHeight || 800;
      return r.bottom > -vh * 0.5 && r.top < vh * 1.5;
    };
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e?.isIntersecting) return;
        io.disconnect();
        if (inViewport(e.boundingClientRect)) setShown(true);
        else startTransition(() => setShown(true));
      },
      { rootMargin },
    );
    io.observe(el);
    let safety = 0;
    let tries = 0;
    const arm = (delay: number) => {
      if (++tries > 60) return;
      safety = window.setTimeout(() => {
        if (el.offsetParent === null) return arm(1500);
        if (typeof el.checkVisibility === "function" && !el.checkVisibility()) return arm(1500);
        const vh = window.innerHeight || 800;
        const r = el.getBoundingClientRect();
        if (r.top > vh * 3 || r.bottom < -vh * 3) return arm(1200);
        if (inViewport(r)) setShown(true);
        else startTransition(() => setShown(true));
      }, delay);
    };
    arm(800);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [shown, rootMargin]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const near = entries[0]?.isIntersecting ?? true;
        if (shownRef.current) startTransition(() => setFar(!near));
      },
      { rootMargin: CULL_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (shown) {
    const cull: CSSProperties | undefined = far
      ? { contentVisibility: "auto", containIntrinsicSize: `auto ${minHeight}px` }
      : undefined;
    return (
      <div ref={ref} style={cull}>
        {children}
      </div>
    );
  }
  return (
    <div ref={ref} style={{ minHeight }} aria-hidden>
      {fallback}
    </div>
  );
}
