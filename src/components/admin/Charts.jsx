import { useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/* ============================================================
   Lightweight SVG charts — no external deps.
   Brand palette: revenue = terracotta accent (#c2593c),
   orders = blue (#2563eb). Both validated colorblind-safe.
   Follows the house dataviz specs: 2px lines, ~10% area wash,
   hairline recessive gridlines, capped columns with rounded
   tops, direct hover tooltips, clean rounded y-ticks.
   ============================================================ */

const ACCENT = '#c2593c';
const BLUE = '#2563eb';
const GRID = '#ececeb';
const AXIS_TEXT = '#6b6b6b';
const SURFACE = '#ffffff';

// Round a max up to a clean tick ceiling and return evenly spaced ticks.
// Pass `integer` for count data (e.g. visitors) so ticks are always whole numbers.
function niceTicks(max, count = 4, integer = false) {
  if (!max || max <= 0) return [0, 1];
  const rawStep = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  let step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
  if (integer) step = Math.max(1, Math.round(step));
  const niceMax = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= niceMax + step / 2; v += step) {
    ticks.push(integer ? Math.round(v) : Math.round(v * 100) / 100);
  }
  return ticks;
}

const compact = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${Math.round(n)}`;
};

const shortDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/* ---- Trend chart: area (revenue) or column (orders) over time ---- */
export function TrendChart({ data = [], yKey, mode = 'area', color = ACCENT, formatValue = compact, unit = '', integer = false }) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null); // index

  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No data available yet.</p>;
  }

  const W = 720, H = 260;
  const padL = 52, padR = 16, padT = 16, padB = 28;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const n = data.length;

  const maxVal = Math.max(1, ...data.map((d) => d[yKey] || 0));
  const ticks = niceTicks(maxVal, 4, integer);
  const top = ticks[ticks.length - 1];

  const x = (i) => padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v) => padT + ih - (v / top) * ih;

  const band = iw / n;
  const barW = Math.min(18, band - 4);

  const linePts = data.map((d, i) => `${x(i)},${y(d[yKey] || 0)}`).join(' ');
  const areaPath = `M ${padL},${padT + ih} L ${data.map((d, i) => `${x(i)},${y(d[yKey] || 0)}`).join(' L ')} L ${padL + iw},${padT + ih} Z`;

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const leftF = padL / W, rightF = (W - padR) / W;
    let t = (frac - leftF) / (rightF - leftF);
    t = Math.max(0, Math.min(1, t));
    const idx = mode === 'column' ? Math.min(n - 1, Math.floor(t * n)) : Math.round(t * (n - 1));
    setHover(idx);
  };

  const hv = hover != null ? data[hover] : null;

  return (
    <div ref={wrapRef} className="relative w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
        {/* gridlines + y ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={padL + iw} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {unit}{formatValue(t)}
            </text>
          </g>
        ))}

        {/* data */}
        {mode === 'area' ? (
          <>
            <path d={areaPath} fill={color} opacity="0.1" />
            <polyline points={linePts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </>
        ) : (
          data.map((d, i) => {
            const v = d[yKey] || 0;
            const bx = x(i) - barW / 2;
            const bh = Math.max(0, (v / top) * ih);
            const active = hover === i;
            return (
              <rect
                key={i}
                x={bx}
                y={padT + ih - bh}
                width={barW}
                height={bh}
                rx="3"
                fill={color}
                opacity={hover == null || active ? 1 : 0.5}
              />
            );
          })
        )}

        {/* hover crosshair + marker (area mode) */}
        {hv != null && mode === 'area' && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} stroke={color} strokeWidth="1" opacity="0.4" />
            <circle cx={x(hover)} cy={y(hv[yKey] || 0)} r="4.5" fill={color} stroke={SURFACE} strokeWidth="2" />
          </>
        )}

        {/* x labels — first, middle, last to avoid crowding */}
        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize="11" fill={AXIS_TEXT}>
            {shortDate(data[i].date)}
          </text>
        ))}
      </svg>

      {/* tooltip */}
      {hv != null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap"
          style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(hv[yKey] || 0) / H) * 100}%`, marginTop: -10 }}
        >
          <div className="font-semibold">{unit}{formatValue(hv[yKey] || 0)}{unit ? '' : ''}</div>
          <div className="text-gray-400">{shortDate(hv.date)}</div>
        </div>
      )}
    </div>
  );
}

/* ---- Horizontal bars: order status breakdown ---- */
const STATUS_COLOR = {
  pending: '#9ca3af',
  processing: BLUE,
  shipped: '#7c3aed',
  delivered: '#16a34a',
  cancelled: '#dc2626',
};

export function StatusBreakdown({ data = [] }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No orders to break down yet.</p>;
  }
  const total = data.reduce((s, d) => s + d.count, 0);
  const max = Math.max(1, ...data.map((d) => d.count));

  if (total === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No orders to break down yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.status} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-xs font-medium capitalize text-gray-600">{d.status}</span>
          <div className="flex-1 h-6 rounded-md bg-gray-50 overflow-hidden">
            <div
              className="h-full rounded-md flex items-center justify-end pr-2"
              style={{ width: `${Math.max((d.count / max) * 100, d.count ? 6 : 0)}%`, backgroundColor: STATUS_COLOR[d.status] }}
            >
              {d.count > 0 && <span className="text-[11px] font-semibold text-white tabular-nums">{d.count}</span>}
            </div>
          </div>
          <span className="w-10 shrink-0 text-right text-xs text-gray-400 tabular-nums">
            {total ? Math.round((d.count / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---- Delta badge: up/down % vs previous period ---- */
export function DeltaBadge({ value, suffix = '' }) {
  if (value == null) return <span className="text-xs text-gray-300">—</span>;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value)}%{suffix}
    </span>
  );
}

/* ---- Donut chart: sales by category ---- */
export function DonutChart({ data = [], formatValue = (v) => v }) {
  const [hover, setHover] = useState(null);
  const items = data.filter((d) => d.value > 0);
  if (items.length === 0) {
    // Empty state: show a full gray ring at 0 (fills with color once any data arrives)
    return (
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <svg viewBox="0 0 180 180" width="160" height="160">
            <circle cx="90" cy="90" r="57" fill="none" stroke="#e5e7eb" strokeWidth="26" />
            <text x="90" y="84" textAnchor="middle" fontSize="12" fill="#9ca3af">Total</text>
            <text x="90" y="104" textAnchor="middle" fontSize="18" fontWeight="700" fill="#9ca3af">{formatValue(0)}</text>
          </svg>
        </div>
        <div className="flex-1 w-full">
          <p className="text-sm text-gray-400">No sales in this range yet.</p>
        </div>
      </div>
    );
  }

  const total = items.reduce((s, d) => s + d.value, 0);
  const R = 70, r = 44, C = 90;
  let acc = 0;
  const segs = items.map((d) => {
    const frac = d.value / total;
    const seg = { ...d, start: acc, end: acc + frac };
    acc += frac;
    return seg;
  });

  const arc = (start, end) => {
    const a0 = start * 2 * Math.PI - Math.PI / 2;
    const a1 = end * 2 * Math.PI - Math.PI / 2;
    const large = end - start > 0.5 ? 1 : 0;
    const x0 = C + R * Math.cos(a0), y0 = C + R * Math.sin(a0);
    const x1 = C + R * Math.cos(a1), y1 = C + R * Math.sin(a1);
    const xi1 = C + r * Math.cos(a1), yi1 = C + r * Math.sin(a1);
    const xi0 = C + r * Math.cos(a0), yi0 = C + r * Math.sin(a0);
    return `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r} ${r} 0 ${large} 0 ${xi0} ${yi0} Z`;
  };

  const hv = hover != null ? segs[hover] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg viewBox="0 0 180 180" width="160" height="160">
          {segs.map((s, i) => (
            <path
              key={i}
              d={arc(s.start, s.end)}
              fill={s.color}
              opacity={hover == null || hover === i ? 1 : 0.4}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ transition: 'opacity .15s' }}
            />
          ))}
          <text x="90" y="84" textAnchor="middle" fontSize="12" fill="#9ca3af">
            {hv ? hv.name : 'Total'}
          </text>
          <text x="90" y="104" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">
            {formatValue(hv ? hv.value : total)}
          </text>
        </svg>
      </div>
      <div className="flex-1 w-full space-y-2">
        {segs.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="flex-1 truncate text-gray-700">{s.name}</span>
            <span className="text-gray-400 tabular-nums">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Popularity bars: product demand ---- */
export function PopularityBars({ data = [], unit = '' }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No product sales yet.</p>;
  }
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700 truncate pr-2">{d.name}</span>
            <span className="text-xs text-gray-400 tabular-nums shrink-0">{unit}{d.value}</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max((d.value / max) * 100, 4)}%`, backgroundColor: d.color || BLUE }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- Simple bar chart with a category label per bar (weekly/monthly toggle) ---- */
export function BarChart({ data = [], color = '#4f46e5', formatValue = compact, unit = '' }) {
  const [hover, setHover] = useState(null);
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No data available yet.</p>;
  }
  const W = 720, H = 240;
  const padL = 52, padR = 16, padT = 16, padB = 28;
  const iw = W - padL - padR, ih = H - padT - padB;
  const n = data.length;
  const maxVal = Math.max(1, ...data.map((d) => d.value || 0));
  const ticks = niceTicks(maxVal, 4);
  const top = ticks[ticks.length - 1];
  const band = iw / n;
  const barW = Math.min(34, band - 12);
  const cx = (i) => padL + band * i + band / 2;
  const y = (v) => padT + ih - (v / top) * ih;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={padL + iw} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {unit}{formatValue(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const v = d.value || 0;
          const bh = Math.max(0, (v / top) * ih);
          const active = hover === i;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={cx(i) - band / 2} y={padT} width={band} height={ih} fill="transparent" />
              <rect
                x={cx(i) - barW / 2}
                y={padT + ih - bh}
                width={barW}
                height={bh}
                rx="4"
                fill={color}
                opacity={hover == null || active ? 1 : 0.5}
              />
              <text x={cx(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap"
          style={{ left: `${(cx(hover) / W) * 100}%`, top: `${(y(data[hover].value || 0) / H) * 100}%`, marginTop: -10 }}
        >
          <div className="font-semibold">{unit}{formatValue(data[hover].value || 0)}</div>
          <div className="text-gray-400">{data[hover].label}</div>
        </div>
      )}
    </div>
  );
}

/* ---- Dual-area chart: two independently-scaled series (e.g. revenue vs visits) ---- */
export function DualAreaChart({ data = [], seriesA, seriesB }) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No data available yet.</p>;
  }
  const W = 720, H = 270;
  const padL = 54, padR = 52, padT = 18, padB = 34;
  const iw = W - padL - padR, ih = H - padT - padB;
  const n = data.length;
  const fmtA = seriesA.format || ((v) => compact(v));
  const fmtB = seriesB.format || ((v) => compact(v));

  const maxA = Math.max(1, ...data.map((d) => d[seriesA.key] || 0));
  const maxB = Math.max(1, ...data.map((d) => d[seriesB.key] || 0));
  const x = (i) => padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const yA = (v) => padT + ih - (v / maxA) * ih * 0.92;
  const yB = (v) => padT + ih - (v / maxB) * ih * 0.92;

  const line = (key, yf) => data.map((d, i) => `${x(i)},${yf(d[key] || 0)}`).join(' ');
  const area = (key, yf) =>
    `M ${padL},${padT + ih} L ${data.map((d, i) => `${x(i)},${yf(d[key] || 0)}`).join(' L ')} L ${padL + iw},${padT + ih} Z`;

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const leftF = padL / W, rightF = (W - padR) / W;
    let t = (frac - leftF) / (rightF - leftF);
    t = Math.max(0, Math.min(1, t));
    setHover(Math.round(t * (n - 1)));
  };

  const hv = hover != null ? data[hover] : null;

  return (
    <div ref={wrapRef} className="relative w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
        {[0.25, 0.5, 0.75, 1].map((f, i) => {
          const gy = padT + ih - ih * 0.92 * f;
          return (
            <g key={i}>
              <line x1={padL} x2={padL + iw} y1={gy} y2={gy} stroke={GRID} strokeWidth="1" />
              {/* left axis — series A (e.g. Revenue) */}
              <text x={padL - 8} y={gy + 4} textAnchor="end" fontSize="11" fill={seriesA.color} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {fmtA(maxA * f)}
              </text>
              {/* right axis — series B (e.g. Visitors) */}
              <text x={padL + iw + 8} y={gy + 4} textAnchor="start" fontSize="11" fill={seriesB.color} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {fmtB(maxB * f)}
              </text>
            </g>
          );
        })}
        <path d={area(seriesA.key, yA)} fill={seriesA.color} opacity="0.12" />
        <path d={area(seriesB.key, yB)} fill={seriesB.color} opacity="0.12" />
        <polyline points={line(seriesA.key, yA)} fill="none" stroke={seriesA.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={line(seriesB.key, yB)} fill="none" stroke={seriesB.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {hv != null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} stroke="#9ca3af" strokeWidth="1" opacity="0.4" />
            <circle cx={x(hover)} cy={yA(hv[seriesA.key] || 0)} r="4" fill={seriesA.color} stroke={SURFACE} strokeWidth="2" />
            <circle cx={x(hover)} cy={yB(hv[seriesB.key] || 0)} r="4" fill={seriesB.color} stroke={SURFACE} strokeWidth="2" />
          </>
        )}
        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize="11" fill={AXIS_TEXT}>
            {shortDate(data[i].date)}
          </text>
        ))}
      </svg>
      <div className="flex items-center justify-center gap-6 mt-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seriesA.color }} />{seriesA.label}</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seriesB.color }} />{seriesB.label}</span>
      </div>
      {hv != null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap"
          style={{ left: `${(x(hover) / W) * 100}%`, top: 4 }}
        >
          <div className="text-gray-300 mb-0.5">{shortDate(hv.date)}</div>
          <div><span style={{ color: seriesA.color }}>●</span> {seriesA.label}: {seriesA.format ? seriesA.format(hv[seriesA.key] || 0) : hv[seriesA.key] || 0}</div>
          <div><span style={{ color: seriesB.color }}>●</span> {seriesB.label}: {seriesB.format ? seriesB.format(hv[seriesB.key] || 0) : hv[seriesB.key] || 0}</div>
        </div>
      )}
    </div>
  );
}

/* ---- Country / region breakdown: grouped bars for orders · traffic · inquiries ---- */
// ISO alpha-2 → flag emoji (regional-indicator letters). Empty for missing/unknown.
const flagEmoji = (code) => {
  if (!code || code.length !== 2) return '';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
};

const COUNTRY_SERIES = [
  { key: 'orders', label: 'Orders', color: '#4f46e5' },
  { key: 'traffic', label: 'Traffic', color: '#0ea5e9' },
  { key: 'inquiries', label: 'Inquiries', color: '#f59e0b' },
];

export function CountryBreakdownChart({ data }) {
  const [active, setActive] = useState(null); // click a legend chip to isolate one series
  const countries = data?.countries || [];
  if (countries.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No country data in this range yet.</p>;
  }
  const totals = data.totals || { orders: 0, traffic: 0, inquiries: 0 };
  const shown = active ? COUNTRY_SERIES.filter((s) => s.key === active) : COUNTRY_SERIES;
  // Shared scale across every visible bar so lengths are comparable country-to-country.
  const max = Math.max(1, ...countries.flatMap((c) => shown.map((s) => c[s.key] || 0)));

  return (
    <div>
      {/* legend + range totals — click a chip to isolate that series */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {COUNTRY_SERIES.map((s) => {
          const on = !active || active === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActive(active === s.key ? null : s.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${on ? 'border-gray-200 text-gray-700 hover:bg-gray-50' : 'border-gray-100 text-gray-300'}`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: on ? s.color : '#d1d5db' }} />
              {s.label}
              <span className="tabular-nums text-gray-400">{totals[s.key] || 0}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {countries.map((c) => (
          <div key={c.name} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-sm text-gray-700" title={c.name}>
              <span className="mr-1">{flagEmoji(c.code)}</span>{c.name}
            </span>
            <div className="flex-1 space-y-1">
              {shown.map((s) => {
                const v = c[s.key] || 0;
                return (
                  <div key={s.key} className="flex items-center gap-2">
                    <div className="flex-1 h-3 rounded-full bg-gray-50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${v ? Math.max((v / max) * 100, 3) : 0}%`, backgroundColor: s.color }}
                        title={`${s.label}: ${v}`}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs text-gray-400 tabular-nums">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Multi-line trend: smooth curves for several series over time ---- */
// Catmull-Rom → cubic bezier so the lines flow smoothly like a sparkline set.
function smoothPath(points) {
  if (points.length < 2) return points.length ? `M ${points[0][0]},${points[0][1]}` : '';
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function MultiLineChart({ data = [], series = [], integer = true, formatValue = (v) => `${v}` }) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  if (!data || data.length === 0 || series.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No data available yet.</p>;
  }

  const W = 720, H = 260;
  const padL = 44, padR = 16, padT = 16, padB = 28;
  const iw = W - padL - padR, ih = H - padT - padB;
  const n = data.length;

  // Shared y-scale across all series so the lines are directly comparable.
  const maxVal = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key] || 0)));
  const ticks = niceTicks(maxVal, 4, integer);
  const top = ticks[ticks.length - 1];

  const x = (i) => padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v) => padT + ih - (v / top) * ih;

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const leftF = padL / W, rightF = (W - padR) / W;
    let t = (frac - leftF) / (rightF - leftF);
    t = Math.max(0, Math.min(1, t));
    setHover(Math.round(t * (n - 1)));
  };

  const hv = hover != null ? data[hover] : null;

  return (
    <div ref={wrapRef} className="relative w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
        {/* gridlines + y ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={padL + iw} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatValue(t)}
            </text>
          </g>
        ))}

        {/* one smooth line per series */}
        {series.map((s) => {
          const pts = data.map((d, i) => [x(i), y(d[s.key] || 0)]);
          return (
            <path key={s.key} d={smoothPath(pts)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          );
        })}

        {/* hover crosshair + markers */}
        {hv != null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} stroke="#9ca3af" strokeWidth="1" opacity="0.4" />
            {series.map((s) => (
              <circle key={s.key} cx={x(hover)} cy={y(hv[s.key] || 0)} r="4" fill={s.color} stroke={SURFACE} strokeWidth="2" />
            ))}
          </>
        )}

        {/* x labels — first, middle, last */}
        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize="11" fill={AXIS_TEXT}>
            {shortDate(data[i].date)}
          </text>
        ))}
      </svg>

      {/* legend */}
      <div className="flex items-center justify-center gap-5 mt-2">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />{s.label}
          </span>
        ))}
      </div>

      {/* tooltip */}
      {hv != null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap"
          style={{ left: `${(x(hover) / W) * 100}%`, top: 4 }}
        >
          <div className="text-gray-300 mb-0.5">{shortDate(hv.date)}</div>
          {series.map((s) => (
            <div key={s.key}><span style={{ color: s.color }}>●</span> {s.label}: <span className="tabular-nums">{hv[s.key] || 0}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}
