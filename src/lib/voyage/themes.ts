import { GENRE_PALETTE } from "@/components/genre-tiles";
import type { VoyageTheme } from "./types";

const MH = (tt: string) => `https://images.metahub.space/background/medium/${tt}/img`;

export const VOYAGE_THEMES: VoyageTheme[] = [
  {
    id: "heist",
    label: "The Heist Line",
    tagline: "Crews, cons, and one last job.",
    type: "movie",
    genre: "Crime",
    accent: "oklch(0.72 0.13 45)",
    backdrop: MH("tt0240772"),
  },
  {
    id: "dark",
    label: "Into the Dark",
    tagline: "Slow dread and sharp scares.",
    type: "movie",
    genre: "Horror",
    accent: "oklch(0.6 0.15 25)",
    backdrop: MH("tt1457767"),
  },
  {
    id: "laugh",
    label: "Laugh It Off",
    tagline: "Nothing heavy. Just good company.",
    type: "movie",
    genre: "Comedy",
    accent: "oklch(0.82 0.14 90)",
    backdrop: MH("tt0829482"),
  },
  {
    id: "edge",
    label: "Edge of the Seat",
    tagline: "Momentum that never lets up.",
    type: "movie",
    genre: "Thriller",
    accent: "oklch(0.7 0.14 260)",
    backdrop: MH("tt3397884"),
  },
  {
    id: "tears",
    label: "Tears at Sea",
    tagline: "Stories that stay with you.",
    type: "movie",
    genre: "Drama",
    accent: "oklch(0.68 0.1 200)",
    backdrop: MH("tt0111161"),
  },
  {
    id: "uncharted",
    label: "Uncharted Waters",
    tagline: "No map. Trust the current.",
    type: "movie",
    accent: "oklch(0.78 0.13 160)",
    backdrop: MH("tt1392190"),
  },
];

export const THEME_PALETTE: Record<string, { from: string; to: string }> = {
  heist: GENRE_PALETTE.Crime,
  dark: GENRE_PALETTE.Horror,
  laugh: GENRE_PALETTE.Comedy,
  edge: GENRE_PALETTE.Thriller,
  tears: GENRE_PALETTE.Drama,
  uncharted: { from: "oklch(0.40 0.10 165)", to: "oklch(0.16 0.05 185)" },
};

export function themeById(id: string): VoyageTheme | undefined {
  return VOYAGE_THEMES.find((t) => t.id === id);
}
