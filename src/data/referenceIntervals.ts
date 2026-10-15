export type Sex = 'F' | 'M' | 'any';

export interface RefInterval {
  analyteId: string;
  specimen: string;       // e.g. 'serum', 'plasma', 'urine'
  sex: Sex;
  ageMinYears: number;    // inclusive
  ageMaxYears: number;    // exclusive
  low?: number;
  high?: number;
  unit: string;
  source: { label: string; url: string };
}

/**
 * Published reference intervals. INTENTIONALLY EMPTY.
 *
 * The RCPA Harmonised Reference Intervals (Table 6, rcpa.edu.au) could not be
 * retrieved while building (outbound access to rcpa.edu.au was blocked: HTTP 403 /
 * DNS failure), and values must not be reconstructed from memory.
 * Add rows here once the source is checked against the published table.
 * TODO(verify): populate from RCPA Table 6.
 */
export const REFERENCE_INTERVALS: RefInterval[] = [];

export const PEDIATRIC_RESOURCE = {
  label: 'CALIPER (소아 참고구간)',
  url: 'https://caliperproject.ca/',
};
