import { molarMass } from './chem';

export interface Analyte {
  id: string;
  en: string;
  ko: string;
  synonyms: string[];
  /** Chemical formula of the measured species (MW computed from IUPAC atomic weights). */
  formula?: string;
  /** |charge| of the measured ion, for mEq/L. */
  charge?: number;
  /** Units offered in the UI. */
  units: string[];
  /** Assumption note shown in the basis panel. */
  note?: string;
  /** Special-case converter id (see special.ts). */
  special?: 'hba1c' | 'uacr' | 'upcr' | 'bun-urea';
}

const mol = (a: Analyte) => (a.formula ? molarMass(a.formula) : undefined);
export const molWeightOf = mol;

export const ANALYTES: Analyte[] = [
  { id: 'glucose', en: 'Glucose', ko: '포도당 (혈당)', synonyms: ['blood sugar', '혈당', 'glu'], formula: 'C6H12O6', units: ['mg/dL', 'mmol/L', 'g/L'] },
  { id: 'creatinine', en: 'Creatinine', ko: '크레아티닌', synonyms: ['crea', 'cr'], formula: 'C4H7N3O', units: ['mg/dL', 'umol/L', 'mmol/L'] },
  { id: 'urea', en: 'Urea', ko: '요소', synonyms: ['urea'], formula: 'CH4N2O', units: ['mg/dL', 'mmol/L'] },
  { id: 'bun', en: 'Blood urea nitrogen (BUN)', ko: '혈액요소질소 (BUN)', synonyms: ['bun', 'urea nitrogen'], formula: 'N2', units: ['mg/dL', 'mmol/L', 'urea mg/dL'], special: 'bun-urea',
    note: 'BUN은 요소의 질소 질량만 보고하는 값입니다. mmol/L는 요소 mmol/L(= BUN 질소 원자 2개당 1분자)로 환산합니다.' },
  { id: 'uric-acid', en: 'Uric acid', ko: '요산', synonyms: ['urate'], formula: 'C5H4N4O3', units: ['mg/dL', 'umol/L', 'mmol/L'] },
  { id: 'cholesterol', en: 'Total cholesterol', ko: '총콜레스테롤', synonyms: ['tc', 'hdl', 'ldl', 'cholesterol', '콜레스테롤'], formula: 'C27H46O', units: ['mg/dL', 'mmol/L', 'g/L'],
    note: 'HDL·LDL 콜레스테롤도 동일한 콜레스테롤 분자량(C27H46O)을 사용합니다.' },
  { id: 'triglyceride', en: 'Triglycerides', ko: '중성지방', synonyms: ['tg', 'tag', 'triacylglycerol'], formula: 'C57H104O6', units: ['mg/dL', 'mmol/L'],
    note: '중성지방은 지방산 조성이 다양한 혼합물입니다. 대표 분자(트리올레인, C57H104O6)를 가정한 근사 변환입니다.' },
  { id: 'calcium', en: 'Calcium', ko: '칼슘', synonyms: ['ca'], formula: 'Ca', charge: 2, units: ['mg/dL', 'mmol/L', 'mEq/L'] },
  { id: 'magnesium', en: 'Magnesium', ko: '마그네슘', synonyms: ['mg'], formula: 'Mg', charge: 2, units: ['mg/dL', 'mmol/L', 'mEq/L'] },
  { id: 'sodium', en: 'Sodium', ko: '나트륨', synonyms: ['na'], formula: 'Na', charge: 1, units: ['mmol/L', 'mEq/L', 'mg/dL'] },
  { id: 'potassium', en: 'Potassium', ko: '칼륨', synonyms: ['k'], formula: 'K', charge: 1, units: ['mmol/L', 'mEq/L', 'mg/dL'] },
  { id: 'chloride', en: 'Chloride', ko: '염소', synonyms: ['cl'], formula: 'Cl', charge: 1, units: ['mmol/L', 'mEq/L', 'mg/dL'] },
  { id: 'phosphate', en: 'Phosphorus (inorganic)', ko: '인 (무기인)', synonyms: ['phosphate', 'phos', '인산'], formula: 'P', units: ['mg/dL', 'mmol/L'],
    note: '무기인 원소(P) 질량 기준입니다. mEq/L는 pH에 따라 전하가 달라 제공하지 않습니다.' },
  { id: 'iron', en: 'Iron', ko: '철', synonyms: ['fe', 'serum iron'], formula: 'Fe', units: ['ug/dL', 'umol/L'] },
  { id: 'bilirubin', en: 'Bilirubin', ko: '빌리루빈', synonyms: ['bili', 'total bilirubin'], formula: 'C33H36N4O6', units: ['mg/dL', 'umol/L'] },
  { id: 'hba1c', en: 'HbA1c', ko: '당화혈색소', synonyms: ['a1c', 'glycated hemoglobin', 'glycohemoglobin'], units: ['%', 'mmol/mol'], special: 'hba1c' },
  { id: 'uacr', en: 'Urine albumin/creatinine ratio (uACR)', ko: '소변 알부민/크레아티닌 비 (uACR)', synonyms: ['acr', 'albuminuria'], units: ['mg/g', 'mg/mmol'], special: 'uacr' },
  { id: 'upcr', en: 'Urine protein/creatinine ratio (uPCR)', ko: '소변 단백/크레아티닌 비 (uPCR)', synonyms: ['pcr', 'proteinuria'], units: ['mg/g', 'mg/mmol'], special: 'upcr' },
  { id: 'alt', en: 'ALT', ko: 'ALT (알라닌아미노전이효소)', synonyms: ['sgpt'], units: ['U/L', 'ukat/L'] },
  { id: 'ast', en: 'AST', ko: 'AST (아스파르테이트아미노전이효소)', synonyms: ['sgot'], units: ['U/L', 'ukat/L'] },
];

export function findAnalytes(q: string): Analyte[] {
  const s = q.trim().toLowerCase();
  if (!s) return ANALYTES;
  return ANALYTES.filter((a) => [a.en, a.ko, a.id, ...a.synonyms].some((n) => n.toLowerCase().includes(s)));
}
