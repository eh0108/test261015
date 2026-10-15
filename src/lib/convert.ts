import { UcumLhcUtils } from '@lhncbc/ucum-lhc';
import { ANALYTES, Analyte, molWeightOf } from './analytes';
import { convertSpecial } from './special';

export interface Source { label: string; url: string; verified: boolean }
export interface Basis {
  method: string;
  factor: number;
  formula: string;
  assumptions: string[];
  sources: Source[];
}
export type ConvertResult =
  | { ok: true; value: number; basis: Basis }
  | { ok: false; reason: string };

const UCUM_SRC: Source = { label: 'UCUM (ucum.org) via @lhncbc/ucum-lhc', url: 'https://ucum.org/ucum', verified: false };
const IUPAC_SRC: Source = { label: 'IUPAC/CIAAW standard atomic weights', url: 'https://ciaaw.org/atomic-weights.htm', verified: false };

const ut = UcumLhcUtils.getInstance();

/** UI unit label -> UCUM code. */
export function toUcum(u: string): string {
  return u.trim().replace(/µ/g, 'u').replace(/mEq/g, 'meq');
}

export function convert(analyte: Analyte, value: number, from: string, to: string): ConvertResult {
  if (!Number.isFinite(value)) return { ok: false, reason: '숫자를 입력하세요.' };
  if (from === to) {
    return { ok: true, value, basis: { method: '동일 단위', factor: 1, formula: `값 × 1`, assumptions: [], sources: [] } };
  }
  if (analyte.special) {
    const r = convertSpecial(analyte, value, from, to);
    if (r) return r;
  }
  const mw = molWeightOf(analyte);
  const opts: Record<string, number> = {};
  if (mw !== undefined) opts.molecularWeight = mw;
  if (analyte.charge !== undefined) opts.charge = analyte.charge;
  const f = toUcum(from), t = toUcum(to);
  const res = ut.convertUnitTo(f, value, t, opts);
  if (res.status !== 'succeeded') {
    const code: string | undefined = res.code;
    if (code === 'incommensurable') {
      return { ok: false, reason: `${from} → ${to} 변환 거부: 두 단위의 차원이 달라 근거 있는 변환식이 없습니다 (예: 질량농도 ↔ 효소활성 U/L는 효소·기질·측정조건에 따라 달라지므로 환산 불가). UCUM: ${(res.msg || []).join(' ')}` };
    }
    if (code && code.startsWith('missing')) {
      return { ok: false, reason: `${analyte.en}는 분자량/전하 정보가 없어 ${from} → ${to} 변환을 할 수 없습니다.` };
    }
    return { ok: false, reason: `변환 불가: ${(res.msg || []).join(' ') || code || '알 수 없는 오류'}` };
  }
  const out: number = res.toVal;
  const factor = value !== 0 ? out / value : ucumFactor(f, t, opts);
  const massMolar = mw !== undefined && out !== value;
  const assumptions: string[] = [];
  if (analyte.note) assumptions.push(analyte.note);
  const sources: Source[] = [UCUM_SRC];
  let method = 'UCUM 차원 검사 + 스케일 변환';
  let formula = `결과 = 값 × ${fmt(factor)}`;
  if (mw !== undefined && (isMassConc(f) !== isMassConc(t))) {
    method = 'UCUM 변환 + 분자량(IUPAC 원자량으로 계산)';
    assumptions.push(`${analyte.formula} 분자량 = ${mw.toFixed(3)} g/mol (원자량 합산)`);
    sources.push(IUPAC_SRC);
    formula = `mmol/L = (mg/dL × 10) ÷ ${mw.toFixed(3)}  — 일반식: 몰농도 = 질량농도 ÷ 분자량`;
  }
  if (t.includes('meq') || f.includes('meq')) {
    assumptions.push(`전하 |z| = ${analyte.charge}: mEq/L = mmol/L × ${analyte.charge}`);
    formula += ` ; mEq = mmol × |z|(${analyte.charge})`;
  }
  void massMolar;
  return { ok: true, value: out, basis: { method, factor, formula, assumptions, sources } };
}

function ucumFactor(f: string, t: string, opts: Record<string, number>): number {
  return ut.convertUnitTo(f, 1, t, opts).toVal;
}
function isMassConc(u: string): boolean {
  return /^(g|mg|ug|ng|kg)\//.test(u);
}
export function fmt(n: number): string {
  if (n === 0) return '0';
  const a = Math.abs(n);
  return a >= 0.001 && a < 1e6 ? String(+n.toPrecision(6)) : n.toExponential(4);
}
export { ANALYTES };
