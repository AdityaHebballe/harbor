import flagUa from "@/assets/flags/flag-ukr.svg";
import flagAe from "@/assets/regions/ae.svg";
import flagAr from "@/assets/regions/ar.svg";
import flagAu from "@/assets/regions/au.svg";
import flagBr from "@/assets/regions/br.svg";
import flagCa from "@/assets/regions/ca.svg";
import flagCl from "@/assets/regions/cl.svg";
import flagCn from "@/assets/regions/cn.svg";
import flagCo from "@/assets/regions/co.svg";
import flagDe from "@/assets/regions/de.svg";
import flagDk from "@/assets/regions/dk.svg";
import flagEs from "@/assets/regions/es.svg";
import flagFi from "@/assets/regions/fi.svg";
import flagFr from "@/assets/regions/fr.svg";
import flagGb from "@/assets/regions/gb.svg";
import flagHk from "@/assets/regions/hk.svg";
import flagId from "@/assets/regions/id.svg";
import flagIe from "@/assets/regions/ie.svg";
import flagIn from "@/assets/regions/in.svg";
import flagIt from "@/assets/regions/it.svg";
import flagJp from "@/assets/regions/jp.svg";
import flagKr from "@/assets/regions/kr.svg";
import flagMx from "@/assets/regions/mx.svg";
import flagMy from "@/assets/regions/my.svg";
import flagNl from "@/assets/regions/nl.svg";
import flagNo from "@/assets/regions/no.svg";
import flagNz from "@/assets/regions/nz.svg";
import flagPh from "@/assets/regions/ph.svg";
import flagPl from "@/assets/regions/pl.svg";
import flagPt from "@/assets/regions/pt.svg";
import flagRu from "@/assets/regions/ru.svg";
import flagSa from "@/assets/regions/sa.svg";
import flagSe from "@/assets/regions/se.svg";
import flagSg from "@/assets/regions/sg.svg";
import flagTh from "@/assets/regions/th.svg";
import flagTr from "@/assets/regions/tr.svg";
import flagTw from "@/assets/regions/tw.svg";
import flagUs from "@/assets/regions/us.svg";
import flagZa from "@/assets/regions/za.svg";

export const REGION_FLAGS: Record<string, string> = {
  AE: flagAe,
  AR: flagAr,
  AU: flagAu,
  BR: flagBr,
  CA: flagCa,
  CL: flagCl,
  CN: flagCn,
  CO: flagCo,
  DE: flagDe,
  DK: flagDk,
  ES: flagEs,
  FI: flagFi,
  FR: flagFr,
  GB: flagGb,
  HK: flagHk,
  ID: flagId,
  IE: flagIe,
  IN: flagIn,
  IT: flagIt,
  JP: flagJp,
  KR: flagKr,
  MX: flagMx,
  MY: flagMy,
  NL: flagNl,
  NO: flagNo,
  NZ: flagNz,
  PH: flagPh,
  PL: flagPl,
  PT: flagPt,
  RU: flagRu,
  SA: flagSa,
  SE: flagSe,
  SG: flagSg,
  TH: flagTh,
  TR: flagTr,
  TW: flagTw,
  UA: flagUa,
  US: flagUs,
  ZA: flagZa,
};

export function regionFlagSrc(code: string): string | null {
  return REGION_FLAGS[(code || "").toUpperCase()] ?? null;
}
