import type { Meta } from "@/lib/cinemeta";

export type VoyageTheme = {
  id: string;
  label: string;
  tagline: string;
  type: "movie" | "series";
  genre?: string;
  accent: string;
  backdrop?: string;
};

export type Voyage = {
  id: string;
  themeId: string;
  themeLabel: string;
  tagline: string;
  accent: string;
  createdAt: number;
  targetLength: number;
  pool: Meta[];
  routeIds: string[];
  headingIds: string[];
  seen: string[];
};

export type VoyageState = {
  active: Voyage | null;
  streak: number;
  lastSail: string | null;
};
