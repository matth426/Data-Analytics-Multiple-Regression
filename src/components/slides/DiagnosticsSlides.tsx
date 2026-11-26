import React, { useMemo, useState } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import {
  computeBreuschPagan,
  computeOLS,
  DataPoint,
  DEFAULT_DATASET,
  generateSyntheticDiagnosticsData,
} from '../../utils/olsMath';
import { DiscussionReveal } from '../DiscussionReveal';
import { RegressionPlane3D } from '../RegressionPlane3D';

interface DiagnosticsSlidesProps {
  slideIndex: number;
}

export const DiagnosticsSlides: React.FC<DiagnosticsSlidesProps> = ({ slideIndex }) => {
  const [corrR, setCorrR] = useState(0.8);
  const [sampleSeed14, setSampleSeed14] = useState(1);

  const [funnel15, setFunnel15] = useState(false);
  const [severity15, setSeverity15] = useState(1.0);
  const [sampleSeed15, setSampleSeed15] = useState(1);

  const [useRealData16, setUseRealData16] = useState(true);
  const [hetero16, setHetero16] = useState(true);
  const [useHC3, setUseHC3] = useState(false);

  const [yValues17, setYValues17] = useState<[number, number, number, number]>([4, 11, 10, 13]);

  const vif14 = 1 / Math.max(0.01, 1 - corrR * corrR);
  const seInflation = Math.sqrt(vif14);
  const vifLabel =
    vif14 > 10 ? 'SEVERE (VIF > 10)' : vif14 > 5 ? 'CONCERN (VIF 5–10)' : 'NOMINAL (VIF < 5)';

  const scatter14 = useMemo(() => {
    const pts: { x1: number; x2: number }[] = [];
    let s = 17 + sampleSeed14 * 31;
    const nextN = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      const u1 = Math.max(1e-5, s / 4294967296);
      s = (s * 1664525 + 1013904223) % 4294967296;
      const u2 = s / 4294967296;
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    };
    for (let i = 0; i < 24; i++) {
      const z1 = nextN();
      const z2 = nextN();
      const x1 = z1;
      const x2 = corrR * z1 + Math.sqrt(Math.max(0, 1 - corrR * corrR)) * z2;
      pts.push({ x1, x2 });
    }
    return pts;
  }, [corrR, sampleSeed14]);

  const betaSamples14 = useMemo(() => {
    let s = 99 + sampleSeed14 * 13;
    const nextN = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      const u1 = Math.max(1e-5, s / 4294967296);
      s = (s * 1664525 + 1013904223) % 4294967296;
      const u2 = s / 4294967296;
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    };
    const baseSE = 0.45 * seInflation;
    return Array.from({ length: 8 }, () => {
      const shock = nextN() * baseSE;
      return { b1: 1.0 + shock };
    });
  }, [seInflation, sampleSeed14]);

  const residPoints15 = useMemo(() => {
    let s = 101 + sampleSeed15 * 47;
    const nextN = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      const u1 = Math.max(1e-5, s / 4294967296);
      s = (s * 1664525 + 1013904223) % 4294967296;
      const u2 = s / 4294967296;
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    };
    return Array.from({ length: 18 }, (_, i) => {
      const t = i / 17;
      const spread = funnel15 ? 0.12 + t * 1.45 * severity15 : 0.65;
      const e = Math.max(-1.8, Math.min(1.8, nextN() * spread));
      return { t, e };
    });
  }, [funnel15, severity15, sampleSeed15]);

  const data16: DataPoint[] = useMemo(() => {
    if (!useRealData16) return DEFAULT_DATASET;
    return generateSyntheticDiagnosticsData(hetero16);
  }, [useRealData16, hetero16]);

  const ols16 = useMemo(() => computeOLS(data16, true), [data16]);
  const bp16 = useMemo(
    () => computeBreuschPagan(data16, ols16.residuals),
    [data16, ols16.residuals]
  );

  const dataset17: DataPoint[] = useMemo(
    () => DEFAULT_DATASET.map((d, i) => ({ ...d, y: yValues17[i] })),
    [yValues17]
  );
  const ols17 = useMemo(() => computeOLS(dataset17, true), [dataset17]);

  if (slideIndex === 14) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start py-2">
        <div className="lg:col-span-4 space-y-5">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Predictor Overlap</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">Multicollinearity</h2>
          </div>

          <div className="divide-y divide-slate-200 border-t border-b border-slate-200 text-base text-slate-700">
            <div className="py-3">
              <strong className="text-slate-900">What it is:</strong> Predictors are strongly correlated.
            </div>
            <div className="py-3">
              <strong className="text-slate-900">Why it hurts:</strong> SE inflates; β̂ wobbles and can flip sign. Predictions stay fine.
            </div>
            <div className="py-3">
              <strong className="text-slate-900">Fixes:</strong> Drop/combine predictors, PCA, or ridge regression.
            </div>
          </div>

          <div className="font-mono text-base space-y-1 text-slate-900">
            <div>VIFⱼ = 1 / (1 − Rⱼ²)</div>
            <div className="text-emerald-700 font-semibold">Our data: r = 0.80 → VIF = 2.78</div>
          </div>

          <DiscussionReveal
            question="Rule of thumb: VIF > 5 concern, > 10 severe. Is 2.78 a problem?"
            answer="Not severe — 2.78 is below 5."
          />
        </div>

        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-slate-900">Correlation & VIF Simulator</h3>
            <button
              type="button"
              onClick={() => setCorrR(0.8)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Reset (r = 0.80)
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-base font-mono tabular-nums">
              <span className="text-slate-800">r(x₁, x₂) = <strong>{corrR.toFixed(2)}</strong></span>
              <span className="font-bold text-emerald-700">
                VIF = {vif14.toFixed(2)} · {vifLabel}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={0.98}
              step={0.02}
              value={corrR}
              onChange={(e) => setCorrR(Number(e.target.value))}
              className="w-full accent-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-base font-medium text-slate-700">Predictor Cloud (x₁ vs x₂)</div>
              <svg viewBox="0 0 220 170" className="w-full h-auto bg-white rounded-lg border border-slate-200">
                <line x1="24" y1="146" x2="200" y2="146" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="24" y1="20" x2="24" y2="146" stroke="#CBD5E1" strokeWidth="1.5" />
                {scatter14.map((pt, i) => (
                  <circle
                    key={i}
                    cx={112 + pt.x1 * 30}
                    cy={84 - pt.x2 * 24}
                    r="4.5"
                    fill="#0F172A"
                    opacity="0.8"
                  />
                ))}
              </svg>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-base font-medium text-slate-700">
                <span>8 Sample β̂₁ Estimates</span>
                <button
                  type="button"
                  onClick={() => setSampleSeed14((s) => s + 1)}
                  className="text-emerald-700 hover:underline inline-flex items-center gap-1.5 text-sm cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resample
                </button>
              </div>
              <svg viewBox="0 0 220 170" className="w-full h-auto bg-white rounded-lg border border-slate-200">
                <line x1="70" y1="18" x2="70" y2="142" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="70" y="160" textAnchor="middle" className="text-[12px] font-mono fill-slate-500">0 (flip)</text>

                <line x1="114" y1="18" x2="114" y2="142" stroke="#059669" strokeWidth="2.5" />
                <text x="114" y="160" textAnchor="middle" className="text-[12px] font-mono fill-emerald-700 font-semibold">true β₁=1</text>

                {betaSamples14.map((s, i) => {
                  const cx = Math.max(14, Math.min(206, 70 + s.b1 * 44));
                  const cy = 26 + i * 16;
                  return (
                    <g key={i}>
                      <line x1="114" y1={cy} x2={cx} y2={cy} stroke="#CBD5E1" strokeWidth="1.5" />
                      <circle cx={cx} cy={cy} r="5" fill={s.b1 < 0 ? '#0F172A' : '#059669'} />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-base font-mono tabular-nums text-slate-700">
            SE Inflation Factor = √VIF = <strong className="text-emerald-700">{seInflation.toFixed(2)}×</strong>
          </div>
        </div>
      </div>
    );
  }

  if (slideIndex === 15) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start py-2">
        <div className="lg:col-span-4 space-y-5">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Residual Spread</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">Homoscedasticity</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              &ldquo;Same spread&rdquo;: prediction errors have constant variance across all fitted values{' '}
              <span className="font-mono text-slate-900">Var(ε) = σ²</span>.
            </p>
          </div>

          <div className="divide-y divide-slate-200 border-t border-b border-slate-200 text-base text-slate-700">
            <div className="py-3">
              <strong className="text-slate-900">Why it matters:</strong> OLS uses one shared <span className="font-mono text-slate-900">s²</span> to compute all <span className="font-mono text-slate-900">SE(βⱼ)</span>.
            </div>
            <div className="py-3">
              <strong className="text-emerald-700">If violated (funnel):</strong> <span className="font-mono text-slate-900">β̂</span> stays unbiased, but <span className="font-mono text-slate-900">SE</span>, <span className="font-mono text-slate-900">t</span>, and <span className="font-mono text-slate-900">p</span> become unreliable.
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-1 p-1 border border-slate-200 rounded-lg bg-slate-50 w-fit">
              <button
                type="button"
                onClick={() => setFunnel15(false)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md cursor-pointer ${
                  !funnel15 ? 'bg-emerald-700 text-white' : 'text-slate-600'
                }`}
              >
                Even Band
              </button>
              <button
                type="button"
                onClick={() => setFunnel15(true)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md cursor-pointer ${
                  funnel15 ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                Funnel
              </button>
            </div>

            {funnel15 && (
              <label className="block space-y-1.5 text-base">
                <div className="flex justify-between font-mono tabular-nums">
                  <span className="text-slate-600">Funnel Severity</span>
                  <span className="font-semibold text-slate-900">{severity15.toFixed(1)}×</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={1.8}
                  step={0.1}
                  value={severity15}
                  onChange={(e) => setSeverity15(Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </label>
            )}

            <button
              type="button"
              onClick={() => setSampleSeed15((s) => s + 1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-base font-medium text-slate-800 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Draw New Sample</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">
              {funnel15 ? 'Funnel: Heteroscedastic' : 'Even Band: Homoscedastic'}
            </h3>
            <span className="text-base font-mono text-slate-500">Residuals e vs ŷ</span>
          </div>

          <svg viewBox="0 0 540 285" className="w-full h-auto bg-white">
            {funnel15 ? (
              <polygon
                points={`36,${140 - 14} 504,${140 - 102 * severity15} 504,${140 + 102 * severity15} 36,${140 + 14}`}
                fill="rgba(15, 23, 42, 0.04)"
                stroke="#94A3B8"
                strokeDasharray="5 4"
              />
            ) : (
              <rect
                x="36"
                y="90"
                width="468"
                height="100"
                fill="rgba(5, 150, 105, 0.05)"
                stroke="#059669"
                strokeOpacity="0.35"
                strokeDasharray="5 4"
              />
            )}

            <line x1="30" y1="140" x2="510" y2="140" stroke="#0F172A" strokeWidth="2" />

            {residPoints15.map((pt, i) => {
              const cx = 46 + pt.t * 448;
              const cy = 140 - pt.e * 64;
              return (
                <g key={i}>
                  <line x1={cx} y1="140" x2={cx} y2={cy} stroke="#CBD5E1" strokeWidth="1.5" />
                  <circle
                    cx={cx}
                    cy={cy}
                    r="6.5"
                    fill={funnel15 ? '#0F172A' : '#059669'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            <text x="270" y="272" textAnchor="middle" className="text-[15px] font-mono fill-slate-600">
              Fitted Values ŷ →
            </text>
          </svg>

          <div className="pt-3 border-t border-slate-200 text-base text-slate-700 leading-relaxed">
            {funnel15 ? (
              <p>
                <strong className="text-slate-900">Heteroscedastic (Funnel):</strong> Errors are tight at low ŷ and wide at high ŷ. Averaging them into one s² corrupts SEs, t-tests, and p-values—fix with log(y), WLS, or <span className="font-mono text-slate-900">HC3</span> robust SEs.
              </p>
            ) : (
              <p>
                <strong className="text-emerald-700">Homoscedastic (Even Band):</strong> Residual spread stays roughly uniform from left to right, so a single constant σ² accurately describes model uncertainty.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (slideIndex === 16) {
    const activeSE = useHC3 ? ols16.hc3Se : ols16.se;
    const activeT = useHC3 ? ols16.hc3TStats : ols16.tStats;
    const activeP = useHC3 ? ols16.hc3PValues : ols16.pValues;

    const minFit = Math.min(...ols16.yHat);
    const maxFit = Math.max(...ols16.yHat);
    const maxAbsRes = Math.max(1.5, ...ols16.residuals.map((r) => Math.abs(r)));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start py-2">
        <div className="lg:col-span-4 space-y-5">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Automated Checks</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">Diagnostics in Python</h2>
          </div>

          <pre className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-4 font-mono text-xs lg:text-sm leading-6 overflow-x-auto">
{`[vif(Xc, i) for i in (1, 2)]
het_breuschpagan(res.resid, Xc)
sm.OLS(y, Xc).fit(cov_type="HC3")`}
          </pre>

          <div className="space-y-3">
            <div className="flex items-center gap-1 p-1 border border-slate-200 rounded-lg bg-slate-50 w-fit">
              <button
                type="button"
                onClick={() => setUseRealData16(false)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md cursor-pointer ${
                  !useRealData16 ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                Our n=4
              </button>
              <button
                type="button"
                onClick={() => setUseRealData16(true)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md cursor-pointer ${
                  useRealData16 ? 'bg-emerald-700 text-white' : 'text-slate-600'
                }`}
              >
                Demo n=40
              </button>
            </div>

            {useRealData16 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setHetero16((v) => !v)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-800 cursor-pointer"
                >
                  {hetero16 ? 'Funnel Noise: ON' : 'Constant Noise'}
                </button>
                <button
                  type="button"
                  onClick={() => setUseHC3((v) => !v)}
                  className={`px-3.5 py-1.5 rounded-lg border text-sm font-mono font-medium cursor-pointer ${
                    useHC3
                      ? 'border-emerald-700 bg-emerald-700 text-white'
                      : 'border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {useHC3 ? 'cov_type="HC3" ON' : 'Use HC3 SE'}
                </button>
              </div>
            )}
          </div>

          <p className="text-base text-slate-600 leading-relaxed">
            If heteroscedasticity fails: transform y (log), use WLS, or report robust <span className="font-mono text-slate-900">HC3</span> standard errors.
          </p>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="grid grid-cols-3 gap-4 font-mono text-base tabular-nums border-b border-slate-200 pb-4">
            <div>
              <div className="text-sm text-slate-500">VIF</div>
              <div className="font-bold text-slate-900">{ols16.vif1.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">BP Stat</div>
              <div className="font-bold text-slate-900">{bp16.lm.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">BP p-value</div>
              <div className={`font-bold ${bp16.pValue < 0.05 ? 'text-emerald-700' : 'text-slate-900'}`}>
                {bp16.pValue.toFixed(4)} {bp16.pValue < 0.05 ? '(Hetero)' : '(OK)'}
              </div>
            </div>
          </div>

          <svg viewBox="0 0 460 165" className="w-full h-auto bg-white">
            <line x1="28" y1="82" x2="436" y2="82" stroke="#0F172A" strokeWidth="1.5" strokeDasharray="4 4" />
            {ols16.yHat.map((yh, i) => {
              const cx = 42 + ((yh - minFit) / Math.max(1e-3, maxFit - minFit)) * 380;
              const cy = 82 - (ols16.residuals[i] / maxAbsRes) * 62;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={useRealData16 ? 5 : 7}
                  fill="#059669"
                  opacity="0.85"
                />
              );
            })}
            <text x="230" y="156" textAnchor="middle" className="text-[14px] font-mono fill-slate-500">
              res.fittedvalues vs res.resid
            </text>
          </svg>

          <table className="w-full text-left font-mono text-base tabular-nums border-t border-slate-200">
            <thead className="text-slate-500 border-b border-slate-200 text-sm">
              <tr>
                <th className="py-2.5">Term</th>
                <th className="py-2.5 text-right">coef</th>
                <th className="py-2.5 text-right">{useHC3 ? 'HC3 SE' : 'OLS SE'}</th>
                <th className="py-2.5 text-right">t (p)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {['const', 'Hours', 'Quizzes'].map((label, idx) => (
                <tr key={label}>
                  <td className="py-2.5 text-slate-900">{label}</td>
                  <td className="py-2.5 text-right font-semibold text-slate-900">{ols16.beta[idx].toFixed(2)}</td>
                  <td className={`py-2.5 text-right font-semibold ${useHC3 ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {activeSE[idx].toFixed(3)}
                  </td>
                  <td className="py-2.5 text-right text-slate-600">
                    {activeT[idx].toFixed(2)} ({activeP[idx].toFixed(3)})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Slide 17: Pitfalls and Recap + Live Interactive Exercise
  const isExercise14 =
    yValues17[3] === 14 && yValues17[0] === 4 && yValues17[1] === 11 && yValues17[2] === 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start py-2">
      <div className="lg:col-span-4 space-y-6">
        <div className="space-y-2">
          <p className="text-base font-medium text-emerald-700">Summary & Exercise</p>
          <h2 className="text-4xl font-bold text-slate-900 leading-tight">Pitfalls and Recap</h2>
        </div>

        <div className="divide-y divide-slate-200 border-t border-b border-slate-200 text-base text-slate-700">
          <div className="py-3">
            <strong className="text-slate-900">Multicollinearity:</strong> Correlated x inflates SE. Check VIF.
          </div>
          <div className="py-3">
            <strong className="text-slate-900">Overfitting:</strong> n = 4 leaves 1 df. Use Adj R².
          </div>
          <div className="py-3">
            <strong className="text-slate-900">Causation:</strong> Association, not cause.
          </div>
        </div>

        <div className="space-y-2 font-mono text-base text-slate-800">
          <div>• β̂ = (XᵀX)⁻¹ Xᵀy</div>
          <div>• sklearn predicts, statsmodels explains</div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => setYValues17([4, 11, 10, 14])}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isExercise14
                ? 'bg-emerald-700 text-white'
                : 'border border-emerald-700 text-emerald-800 bg-white hover:bg-emerald-50'
            }`}
          >
            Exercise: Set y₄ = 14
          </button>
          <button
            type="button"
            onClick={() => setYValues17([4, 11, 10, 13])}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset y₄ = 13</span>
          </button>
        </div>
      </div>

      <div className="lg:col-span-6 space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Live Exercise: Edit yᵢ & Recompute β̂
            </h3>
            <span className="font-mono text-base font-bold text-emerald-700 tabular-nums">
              β̂ = [{ols17.beta.map((b) => b.toFixed(2)).join(', ')}]ᵀ
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {dataset17.map((d, idx) => (
              <label key={d.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm font-mono">
                <div className="text-slate-500 mb-1">y{d.id}</div>
                <input
                  type="number"
                  min={0}
                  max={25}
                  step={1}
                  value={yValues17[idx]}
                  onChange={(e) => {
                    const next: [number, number, number, number] = [...yValues17];
                    next[idx] = Number(e.target.value) || 0;
                    setYValues17(next);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded border bg-white text-base font-semibold tabular-nums ${
                    idx === 3 && yValues17[3] !== 13
                      ? 'border-emerald-700 text-emerald-700'
                      : 'border-slate-300 text-slate-900'
                  }`}
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200 font-mono text-base tabular-nums">
            <div>
              <span className="text-slate-500">Xᵀy:</span>{' '}
              <strong className="text-slate-900">[{ols17.Xty.join(', ')}]</strong>
            </div>
            <div>
              <span className="text-slate-500">R²:</span>{' '}
              <strong className="text-slate-900">{ols17.rSquared.toFixed(3)}</strong>
            </div>
            <div>
              <span className="text-slate-500">Adj R²:</span>{' '}
              <strong className="text-emerald-700">{ols17.adjRSquared.toFixed(3)}</strong>
            </div>
          </div>
        </div>

        <RegressionPlane3D
          beta={[ols17.beta[0], ols17.beta[1], ols17.beta[2]]}
          points={dataset17}
          height={310}
          caption={`ŷ = ${ols17.beta[0].toFixed(2)} + ${ols17.beta[1].toFixed(2)}·Hours + ${ols17.beta[2].toFixed(2)}·Quizzes`}
        />
      </div>
    </div>
  );
};
