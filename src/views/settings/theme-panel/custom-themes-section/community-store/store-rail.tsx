import { Row } from "@/components/row";
import type { StoreTheme } from "@/lib/theme-store";
import { ThemeCard } from "./theme-card";

export function StoreRail({
  title,
  subtitle,
  themes,
  ranked,
  scrollKey,
  onOpen,
  onViewAll,
}: {
  title: string;
  subtitle?: string;
  themes: StoreTheme[];
  ranked?: boolean;
  scrollKey: string;
  onOpen: (t: StoreTheme) => void;
  onViewAll?: () => void;
}) {
  if (themes.length === 0) return null;
  return (
    <Row
      title={title}
      titleExtra={subtitle ? <span className="truncate text-[12.5px] text-ink-subtle">{subtitle}</span> : undefined}
      shape="landscape"
      min={252}
      scrollKey={scrollKey}
      onViewAll={onViewAll}
      viewAllLabel="Browse all"
    >
      {themes.map((t, i) => (
        <ThemeCard key={t.id} theme={t} rank={ranked ? i + 1 : undefined} onOpen={onOpen} />
      ))}
    </Row>
  );
}
