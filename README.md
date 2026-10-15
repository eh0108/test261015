# 임상검사 단위 변환 · 참고구간

React + TypeScript + Vite 정적 사이트 (GitHub Pages).

**Pages URL: https://eh0108.github.io/test261015/**

## 구성
- **변환 탭**: UCUM(`@lhncbc/ucum-lhc`)으로 차원 검사·스케일 변환, IUPAC 원자량으로 계산한 분자량·이온 전하로 mg/dL↔mmol/L, mEq/L. 계수는 계산으로 얻음. 특수 변환(HbA1c, uACR/uPCR, BUN↔요소, 중성지방)은 공식·출처 표시. 근거 없는 변환(예: mg/dL→U/L)은 이유와 함께 거부.
- **참고구간 탭**: 공표된 구간만 표시(외삽 없음), low/normal/high 판정. 소아는 CALIPER 안내.

## 데이터를 구하지 못한 부분 (TODO(verify))
| 항목 | 상태 |
|---|---|
| RCPA Harmonised Reference Intervals Table 6 | 빌드 환경에서 rcpa.edu.au 접근 불가 → `src/data/referenceIntervals.ts` **비어 있음** (기억으로 채우지 않음) |
| NGSP HbA1c 마스터 방정식 | ngsp.org 접근 불가. 계수(0.09148, 2.152)는 기억 기반 → 원문 확인 필요 |
| KDIGO 2024 uACR/uPCR | 접근 불가. 환산은 크레아티닌 분자량으로 계산(KDIGO 표의 반올림값과 약간 차이) |
| IUPAC 원자량 | ciaaw.org 접근 불가. 값은 기억 기반 → 확인 필요 |
| CALIPER | 링크 안내만 (데이터 미포함) |
| Labcorp / CMEinfo / NBME 교차검증 | 접근 불가 → `it.todo`로만 남김 |

## 개발
```
npm ci
npm test
npm run build
```
