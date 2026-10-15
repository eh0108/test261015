import type { Analyte } from './analytes';
import { molarMass } from './chem';
import type { ConvertResult, Source } from './convert';

const NGSP: Source = { label: 'NGSP – IFCC standardization (master equation)', url: 'https://ngsp.org/ifcc.asp', verified: false };
const KDIGO: Source = { label: 'KDIGO 2024 CKD Guideline (ACR/PCR conversions)', url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/', verified: false };
const IUPAC: Source = { label: 'IUPAC/CIAAW atomic weights', url: 'https://ciaaw.org/atomic-weights.htm', verified: false };

// NGSP(%) = 0.09148 × IFCC(mmol/mol) + 2.152   TODO(verify): coefficients recalled from NGSP master equation; ngsp.org unreachable.
export const HBA1C_SLOPE = 0.09148;
export const HBA1C_INTERCEPT = 2.152;

export function convertSpecial(a: Analyte, v: number, from: string, to: string): ConvertResult | null {
  if (a.special === 'hba1c') {
    if (from === '%' && to === 'mmol/mol') {
      return ok((v - HBA1C_INTERCEPT) / HBA1C_SLOPE, 'NGSP → IFCC 마스터 방정식', 1 / HBA1C_SLOPE,
        `IFCC = (NGSP − ${HBA1C_INTERCEPT}) ÷ ${HBA1C_SLOPE}`, ['선형 관계(마스터 방정식)이며 비선형 계수 단순 곱이 아닙니다.'], [NGSP]);
    }
    if (from === 'mmol/mol' && to === '%') {
      return ok(HBA1C_SLOPE * v + HBA1C_INTERCEPT, 'IFCC → NGSP 마스터 방정식', HBA1C_SLOPE,
        `NGSP = ${HBA1C_SLOPE} × IFCC + ${HBA1C_INTERCEPT}`, ['선형 관계(마스터 방정식)이며 단순 비례가 아닙니다.'], [NGSP]);
    }
  }
  if (a.special === 'uacr' || a.special === 'upcr') {
    // mg analyte / g creatinine  ->  mg analyte / mmol creatinine: × (MW_creatinine g/mol ÷ 1000 mg/g... ) computed
    const k = molarMass('C4H7N3O') / 1000; // g creat per mmol creat
    const label = a.special === 'uacr' ? 'KDIGO 2024: uACR' : 'KDIGO 2024: uPCR';
    if (from === 'mg/g' && to === 'mg/mmol')
      return ok(v * k, `${label} 단위 환산`, k, `mg/mmol = mg/g × ${k.toFixed(5)} (크레아티닌 g/mmol)`,
        ['분모 크레아티닌의 질량↔몰 환산(분자량 계산값)입니다. KDIGO 표의 반올림 값(예: 30 mg/g ≈ 3 mg/mmol)과 약간 다를 수 있습니다.'], [KDIGO, IUPAC]);
    if (from === 'mg/mmol' && to === 'mg/g')
      return ok(v / k, `${label} 단위 환산`, 1 / k, `mg/g = mg/mmol ÷ ${k.toFixed(5)}`,
        ['분모 크레아티닌의 질량↔몰 환산(분자량 계산값)입니다. KDIGO 표의 반올림 값과 약간 다를 수 있습니다.'], [KDIGO, IUPAC]);
  }
  if (a.special === 'bun-urea') {
    const mwUrea = molarMass('CH4N2O'), mwN2 = molarMass('N2');
    const k = mwUrea / mwN2;
    if (from === 'mg/dL' && to === 'urea mg/dL')
      return ok(v * k, 'BUN → 요소 질량농도', k, `요소 mg/dL = BUN mg/dL × ${mwUrea.toFixed(3)} ÷ ${mwN2.toFixed(3)}`, ['BUN = 요소 분자 속 질소(N₂)의 질량만 보고한 값'], [IUPAC]);
    if (from === 'urea mg/dL' && to === 'mg/dL')
      return ok(v / k, '요소 → BUN 질량농도', 1 / k, `BUN mg/dL = 요소 mg/dL × ${mwN2.toFixed(3)} ÷ ${mwUrea.toFixed(3)}`, ['BUN = 요소 분자 속 질소(N₂)의 질량만 보고한 값'], [IUPAC]);
    if (from === 'urea mg/dL' || to === 'urea mg/dL') {
      // route through BUN mg/dL then generic path is handled by caller; keep explicit rejection simple
      return { ok: false, reason: '요소 mg/dL ↔ BUN mg/dL 만 직접 지원합니다. BUN mmol/L는 요소 mmol/L와 동일합니다.' };
    }
  }
  return null;
}

function ok(value: number, method: string, factor: number, formula: string, assumptions: string[], sources: Source[]): ConvertResult {
  return { ok: true, value, basis: { method, factor, formula, assumptions, sources } };
}
