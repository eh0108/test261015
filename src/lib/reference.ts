import { REFERENCE_INTERVALS, RefInterval, Sex } from '../data/referenceIntervals';

export function matchIntervals(
  analyteId: string, ageYears: number, sex: Sex, specimen: string,
  table: RefInterval[] = REFERENCE_INTERVALS,
): RefInterval[] {
  return table.filter(
    (r) =>
      r.analyteId === analyteId &&
      r.specimen === specimen &&
      (r.sex === 'any' || r.sex === sex) &&
      ageYears >= r.ageMinYears && ageYears < r.ageMaxYears,
  );
}

export type Flag = 'low' | 'normal' | 'high';
export function judge(value: number, r: RefInterval): Flag {
  if (r.low !== undefined && value < r.low) return 'low';
  if (r.high !== undefined && value > r.high) return 'high';
  return 'normal';
}
