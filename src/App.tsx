import { useMemo, useState } from 'react';
import { ANALYTES, findAnalytes } from './lib/analytes';
import { convert, fmt } from './lib/convert';
import { REFERENCE_INTERVALS, PEDIATRIC_RESOURCE, Sex } from './data/referenceIntervals';
import { judge, matchIntervals } from './lib/reference';

type Tab = 'convert' | 'ref';

export function App() {
  const [tab, setTab] = useState<Tab>('convert');
  return (
    <main>
      <h1>임상검사 단위 변환 · 참고구간</h1>
      <p className="warn">교육/참고용입니다. 임상 의사결정에 단독으로 사용하지 마세요.</p>
      <nav role="tablist">
        <button role="tab" aria-selected={tab === 'convert'} onClick={() => setTab('convert')}>변환</button>
        <button role="tab" aria-selected={tab === 'ref'} onClick={() => setTab('ref')}>참고구간</button>
      </nav>
      {tab === 'convert' ? <ConvertTab /> : <RefTab />}
    </main>
  );
}

function AnalytePicker({ id, onChange }: { id: string; onChange: (id: string) => void }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => findAnalytes(q), [q]);
  return (
    <>
      <label>분석물 검색 (영문·한글·동의어)
        <input value={q} onChange={(e) => { setQ(e.target.value); const r = findAnalytes(e.target.value); if (r.length && !r.some((a) => a.id === id)) onChange(r[0].id); }} placeholder="예: glucose, 혈당, a1c" />
      </label>
      <label>분석물
        <select value={list.some((a) => a.id === id) ? id : ''} onChange={(e) => onChange(e.target.value)}>
          {list.map((a) => <option key={a.id} value={a.id}>{a.en} / {a.ko}</option>)}
        </select>
      </label>
      {list.length === 0 && <p className="muted">일치하는 분석물이 없습니다.</p>}
    </>
  );
}

function ConvertTab() {
  const [id, setId] = useState('glucose');
  const analyte = ANALYTES.find((a) => a.id === id)!;
  const [from, setFrom] = useState('mg/dL');
  const [to, setTo] = useState('mmol/L');
  const [val, setVal] = useState('100');
  const [copied, setCopied] = useState(false);

  const pick = (nid: string) => {
    const a = ANALYTES.find((x) => x.id === nid)!;
    setId(nid); setFrom(a.units[0]); setTo(a.units[1] ?? a.units[0]);
  };
  const allUnits = Array.from(new Set([...analyte.units, 'mg/dL', 'U/L']));
  const num = parseFloat(val);
  const res = val.trim() === '' ? null : convert(analyte, num, from, to);
  const text = res && res.ok ? `${fmt(res.value)} ${to}` : '';

  return (
    <section>
      <AnalytePicker id={id} onChange={pick} />
      <div className="row">
        <label>값<input inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} /></label>
        <label>원본 단위<select value={from} onChange={(e) => setFrom(e.target.value)}>{allUnits.map((u) => <option key={u}>{u}</option>)}</select></label>
        <button type="button" aria-label="단위 스왑" onClick={() => { setFrom(to); setTo(from); if (res && res.ok) setVal(String(+res.value.toPrecision(8))); }}>⇄</button>
        <label>대상 단위<select value={to} onChange={(e) => setTo(e.target.value)}>{allUnits.map((u) => <option key={u}>{u}</option>)}</select></label>
      </div>
      {res && res.ok && (
        <div className="result">
          <div className="big">{text}</div>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>{copied ? '복사됨' : '복사'}</button>
          <h3>계산 근거</h3>
          <dl>
            <dt>방법</dt><dd>{res.basis.method}</dd>
            <dt>계수</dt><dd>{fmt(res.basis.factor)}</dd>
            <dt>수식</dt><dd>{res.basis.formula}</dd>
            <dt>가정</dt><dd>{res.basis.assumptions.length ? <ul>{res.basis.assumptions.map((s) => <li key={s}>{s}</li>)}</ul> : '없음'}</dd>
            <dt>출처</dt><dd>{res.basis.sources.length ? <ul>{res.basis.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>{!s.verified && ' (TODO(verify): 빌드 시 원문 미확인)'}</li>)}</ul> : '—'}</dd>
          </dl>
        </div>
      )}
      {res && !res.ok && <div className="result reject"><strong>변환 거부</strong><p>{res.reason}</p></div>}
    </section>
  );
}

function RefTab() {
  const [id, setId] = useState('glucose');
  const [age, setAge] = useState('40');
  const [sex, setSex] = useState<Sex>('F');
  const [specimen, setSpecimen] = useState('serum');
  const [val, setVal] = useState('');
  const matches = matchIntervals(id, parseFloat(age), sex, specimen);
  const n = parseFloat(val);
  return (
    <section>
      <AnalytePicker id={id} onChange={setId} />
      <div className="row">
        <label>나이(세)<input inputMode="decimal" value={age} onChange={(e) => setAge(e.target.value)} /></label>
        <label>성별<select value={sex} onChange={(e) => setSex(e.target.value as Sex)}><option value="F">여</option><option value="M">남</option></select></label>
        <label>검체<select value={specimen} onChange={(e) => setSpecimen(e.target.value)}><option value="serum">혈청</option><option value="plasma">혈장</option><option value="whole blood">전혈</option><option value="urine">소변</option></select></label>
        <label>결과 값<input inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} /></label>
      </div>
      {REFERENCE_INTERVALS.length === 0 && (
        <div className="result reject">
          <strong>참고구간 데이터가 아직 없습니다.</strong>
          <p>RCPA Harmonised Reference Intervals(Table 6)를 개발 환경에서 가져오지 못해 수치를 임의로 채우지 않았습니다. TODO(verify): 원문 확인 후 <code>src/data/referenceIntervals.ts</code>에 추가.</p>
        </div>
      )}
      {REFERENCE_INTERVALS.length > 0 && matches.length === 0 && (
        <div className="result reject"><p>해당 조건(분석물·나이·성별·검체)에 공표된 구간이 없습니다. 다른 나이 구간에서 외삽하지 않습니다.</p></div>
      )}
      {matches.map((r, i) => (
        <div className="result" key={i}>
          <div className="big">{r.low ?? '—'} – {r.high ?? '—'} {r.unit}</div>
          <p>검체: {r.specimen} · 나이: {r.ageMinYears}–{r.ageMaxYears}세 · 성별: {r.sex}</p>
          <p>출처: <a href={r.source.url} target="_blank" rel="noreferrer">{r.source.label}</a></p>
          {Number.isFinite(n) && <p className={`flag ${judge(n, r)}`}>{judge(n, r).toUpperCase()}</p>}
        </div>
      ))}
      <p className="muted">소아(18세 미만) 참고구간은 <a href={PEDIATRIC_RESOURCE.url} target="_blank" rel="noreferrer">{PEDIATRIC_RESOURCE.label}</a>를 참조하세요.</p>
    </section>
  );
}
