import { describe, it, expect } from 'vitest';
import { ANALYTES } from './analytes';
import { convert } from './convert';
import { molarMass } from './chem';

const A = (id: string) => ANALYTES.find((a) => a.id === id)!;
const val = (r: ReturnType<typeof convert>) => { if (!r.ok) throw new Error(r.reason); return r.value; };

describe('molar mass from atomic weights', () => {
  it('glucose ≈ 180.156', () => expect(molarMass('C6H12O6')).toBeCloseTo(180.156, 2));
  it('rejects unknown element', () => expect(() => molarMass('Xx')).toThrow());
});
describe('mass <-> molar', () => {
  it('glucose 100 mg/dL ≈ 5.55 mmol/L', () => expect(val(convert(A('glucose'), 100, 'mg/dL', 'mmol/L'))).toBeCloseTo(5.55, 1));
  it('creatinine 1 mg/dL ≈ 88.4 umol/L', () => expect(val(convert(A('creatinine'), 1, 'mg/dL', 'umol/L'))).toBeCloseTo(88.4, 0));
  it('round trip', () => {
    const x = val(convert(A('cholesterol'), 200, 'mg/dL', 'mmol/L'));
    expect(val(convert(A('cholesterol'), x, 'mmol/L', 'mg/dL'))).toBeCloseTo(200, 6);
  });
});
describe('mEq/L', () => {
  it('calcium 10 mg/dL ≈ 2.5 mmol/L ≈ 5 mEq/L', () => {
    expect(val(convert(A('calcium'), 10, 'mg/dL', 'mmol/L'))).toBeCloseTo(2.495, 2);
    expect(val(convert(A('calcium'), 10, 'mg/dL', 'mEq/L'))).toBeCloseTo(4.99, 1);
  });
  it('sodium mEq/L == mmol/L', () => expect(val(convert(A('sodium'), 140, 'mEq/L', 'mmol/L'))).toBeCloseTo(140));
});
describe('special conversions', () => {
  it('HbA1c round trip & 53 mmol/mol ≈ 7%', () => {
    expect(val(convert(A('hba1c'), 53, 'mmol/mol', '%'))).toBeCloseTo(7.0, 1);
    const ifcc = val(convert(A('hba1c'), 6.5, '%', 'mmol/mol'));
    expect(val(convert(A('hba1c'), ifcc, 'mmol/mol', '%'))).toBeCloseTo(6.5, 8);
  });
  it('uACR 30 mg/g ≈ 3.4 mg/mmol (computed, unrounded)', () => expect(val(convert(A('uacr'), 30, 'mg/g', 'mg/mmol'))).toBeCloseTo(3.39, 1));
  it('BUN 14 mg/dL -> urea ≈ 30 mg/dL', () => expect(val(convert(A('bun'), 14, 'mg/dL', 'urea mg/dL'))).toBeCloseTo(30, 0));
  it('triglyceride 100 mg/dL ≈ 1.13 mmol/L', () => expect(val(convert(A('triglyceride'), 100, 'mg/dL', 'mmol/L'))).toBeCloseTo(1.13, 1));
});
describe('rejections', () => {
  it('mg/dL -> U/L is refused with a reason', () => {
    const r = convert(A('alt'), 10, 'mg/dL', 'U/L');
    expect(r.ok).toBe(false);
  });
  it('enzyme U/L <-> ukat/L is allowed (UCUM)', () => expect(val(convert(A('alt'), 60, 'U/L', 'ukat/L'))).toBeCloseTo(1.0, 2));
});
describe('cross-validation against external tables', () => {
  // TODO(verify): Labcorp SI table, CMEinfo PDF and NBME PDF were unreachable; no values entered from memory.
  it.todo('Labcorp SI Unit Conversion Table');
  it.todo('CMEinfo conversion table');
  it.todo('NBME Laboratory Reference Values');
});
