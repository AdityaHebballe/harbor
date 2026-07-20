export const BADGE_ICON_BASE = "https://harbor.site/themes/api/images/badges";

export const BADGE_NAMES = [
  "addon_developer_v2",
  "admin",
  "beta",
  "community_manager",
  "content_creator",
  "contri",
  "dev",
  "donator",
  "moderator",
  "og",
  "stremio_supporter",
  "tester",
  "theme_creator",
  "top_donator",
  "top_theme_creator",
  "translator",
  "verified",
  "vip",
] as const;

export type BadgeName = (typeof BADGE_NAMES)[number];

const KNOWN = new Set<string>(BADGE_NAMES);

export function badgeIconUrl(key?: string): string | undefined {
  if (!key) return undefined;
  const name = key.trim().toLowerCase();
  if (KNOWN.has(name)) return `${BADGE_ICON_BASE}/${name}.webp`;
  if (/^https?:\/\//i.test(key.trim())) return key.trim();
  return undefined;
}
