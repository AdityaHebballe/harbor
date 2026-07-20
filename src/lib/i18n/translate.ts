import en from "./locales/en";
import ar from "./locales/ar";
import pt from "./locales/pt";
import { getUiLanguage, useUiLanguage } from "./store";
import { isRtl, LANGUAGES, type UiLanguage } from "./languages";

type Vars = Record<string, string | number>;

const catalogs: Record<UiLanguage, Record<string, string>> = { en, ar, pt };
const sourceKeysByTranslation = Object.fromEntries(
  (Object.keys(catalogs) as UiLanguage[]).map((language) => {
    const reverse = new Map<string, string>();
    for (const [key, value] of Object.entries(catalogs[language])) {
      if (!reverse.has(value)) reverse.set(value, key);
    }
    return [language, reverse];
  }),
) as Record<UiLanguage, Map<string, string>>;

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  let out = template;
  for (const [name, value] of Object.entries(vars)) {
    out = out.split(`{${name}}`).join(String(value));
  }
  return out;
}

function resolve(lang: UiLanguage, key: string): string {
  const active = catalogs[lang]?.[key];
  if (active !== undefined) return active;
  const fallback = catalogs.en[key];
  if (fallback !== undefined) return fallback;
  return key;
}

export function t(key: string, vars?: Vars): string {
  return interpolate(resolve(getUiLanguage(), key), vars);
}

export function sourceTranslationKey(value: string): string {
  return sourceKeysByTranslation[getUiLanguage()].get(value) ?? value;
}

export function useT(): (key: string, vars?: Vars) => string {
  const lang = useUiLanguage();
  return (key: string, vars?: Vars) => interpolate(resolve(lang, key), vars);
}

export { useUiLanguage, isRtl, LANGUAGES };
