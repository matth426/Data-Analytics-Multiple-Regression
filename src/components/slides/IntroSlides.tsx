import React, { useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { DEFAULT_DATASET } from '../../utils/olsMath';
import { RegressionPlane3D } from '../RegressionPlane3D';
import { DiscussionReveal } from '../DiscussionReveal';

interface IntroSlideProps {
  slideIndex: number;
  goToSlide: (index: number) => void;
}

export const IntroSlides: React.FC<IntroSlideProps> = ({ slideIndex, goToSlide }) => {
  const [controlled, setControlled] = useState(false);

  const [mode4, setMode4] = useState<'multiple' | 'simple'>('multiple');
  const [b0, setB0] = useState(2);
  const [b1, setB1] = useState(1);
  const [b2, setB2] = useState(2);
  const [sliceX2, setSliceX2] = useState<number | null>(2);

  const [activeAssumption, setActiveAssumption] = useState<number>(4);

  if (slideIndex === 1) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-center py-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="text-base font-medium text-emerald-700">
            IT365 — Data Analytics 1 · Lesson 7
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08]">
            Multiple Regression Analysis
          </h1>

          <p className="text-xl text-slate-600 leading-relaxed">
            Linear algebra by hand, then <span className="font-mono text-slate-900">sklearn</span> and{' '}
            <span className="font-mono text-slate-900">statsmodels</span>.
          </p>

          <div className="pt-2 text-base text-slate-500">
            Mattheus Marcus Contreras
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => goToSlide(2)}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-base font-medium transition-colors cursor-pointer"
            >
              <span>Start Lesson</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <RegressionPlane3D
            beta={[2, 1, 2]}
            points={DEFAULT_DATASET}
            height={460}
            autoRotate={true}
            showResiduals={true}
            caption="ŷ = 2 + 1·Hours + 2·Quizzes (drag to orbit)"
          />
        </div>
      </div>
    );
  }

  if (slideIndex === 2) {
    const objectives = [
      {
        num: '01',
        title: 'Explain what multiple regression models',
        targetSlide: 4,
        preview: 'ŷ = β₀ + β₁x₁ + … + βₖxₖ',
      },
      {
        num: '02',
        title: 'Write the model in matrix form',
        targetSlide: 6,
        preview: 'β̂ = (XᵀX)⁻¹ Xᵀy',
      },
      {
        num: '03',
        title: 'Solve for β̂ by hand with linear algebra',
        targetSlide: 8,
        preview: 'β̂ = [2, 1, 2]ᵀ',
      },
      {
        num: '04',
        title: 'Fit the model in sklearn and statsmodels',
        targetSlide: 11,
        preview: 'LinearRegression vs sm.OLS',
      },
      {
        num: '05',
        title: 'Read R², adjusted R², t-tests, and p-values',
        targetSlide: 10,
        preview: 'R² = 0.911 · Adj R² = 0.733',
      },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start py-4">
        <div className="lg:col-span-3 space-y-4">
          <p className="text-base font-medium text-emerald-700">Lesson Roadmap</p>
          <h2 className="text-4xl font-bold text-slate-900 leading-tight">
            Learning Objectives
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            At the end of this lesson, students should be able to complete five core tasks. Click any row to jump directly to it.
          </p>
        </div>

        <div className="lg:col-span-7 divide-y divide-slate-200 border-t border-b border-slate-200">
          {objectives.map((obj) => (
            <button
              key={obj.num}
              type="button"
              onClick={() => goToSlide(obj.targetSlide)}
              className="w-full text-left py-5 px-2 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-baseline gap-5">
                <span className="font-mono text-lg font-semibold text-emerald-700 tabular-nums">
                  {obj.num}
                </span>
                <span className="text-xl font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {obj.title}
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-base text-slate-500">{obj.preview}</span>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (slideIndex === 3) {
    const svgW = 560;
    const svgH = 340;
    const pad = { l: 64, r: 30, t: 28, b: 52 };
    const xScale = (x: number) => pad.l + ((x - 0.5) / 4) * (svgW - pad.l - pad.r);
    const yScale = (y: number) => svgH - pad.b - ((y - 2) / 14) * (svgH - pad.t - pad.b);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start py-2">
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Intuition First</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Predict before we Calculate
            </h2>
            <p className="text-lg text-slate-600">
              Exam score depends on hours studied.
            </p>
          </div>

          <DiscussionReveal
            question="Q1: If we also know practice quizzes taken, should the hours coefficient change?"
            answer="Yes. Each coefficient is the effect of one variable while the others are held constant."
            detail="Without Quizzes in the model, Hours steals credit for Quizzes (+2.60 pts/hr). Holding Quizzes constant isolates the true partial slope of Hours (+1.00 pt/hr)."
          />

          <DiscussionReveal
            question="Q2: Can one extra predictor ever hurt the model?"
            answer="Yes — extra predictors reduce degrees of freedom and can inflate variance."
          />
        </div>

        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-lg font-semibold text-slate-900">
              {controlled ? 'Partial Effect (Quizzes Held Fixed)' : 'Simple Slope (Ignoring Quizzes)'}
            </div>
            <div className="flex items-center gap-1 p-1 border border-slate-200 rounded-lg bg-slate-50">
              <button
                type="button"
                onClick={() => setControlled(false)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  !controlled ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hours Only
              </button>
              <button
                type="button"
                onClick={() => setControlled(true)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  controlled ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Control for Quizzes
              </button>
            </div>
          </div>

          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto bg-white">
            <line x1={pad.l} y1={svgH - pad.b} x2={svgW - pad.r} y2={svgH - pad.b} stroke="#94A3B8" strokeWidth="1.5" />
            <line x1={pad.l} y1={pad.t} x2={pad.l} y2={svgH - pad.b} stroke="#94A3B8" strokeWidth="1.5" />

            {[1, 2, 3, 4].map((x) => (
              <g key={x}>
                <line x1={xScale(x)} y1={svgH - pad.b} x2={xScale(x)} y2={svgH - pad.b + 6} stroke="#64748B" />
                <text x={xScale(x)} y={svgH - pad.b + 24} textAnchor="middle" className="text-[14px] fill-slate-600 font-mono">
                  {x}h
                </text>
              </g>
            ))}
            {[4, 8, 12, 16].map((y) => (
              <g key={y}>
                <line x1={pad.l - 6} y1={yScale(y)} x2={pad.l} y2={yScale(y)} stroke="#64748B" />
                <text x={pad.l - 12} y={yScale(y) + 5} textAnchor="end" className="text-[14px] fill-slate-600 font-mono">
                  {y}
                </text>
              </g>
            ))}

            <text x={(pad.l + svgW - pad.r) / 2} y={svgH - 6} textAnchor="middle" className="text-[15px] fill-slate-700 font-medium">
              Hours Studied (x₁)
            </text>
            <text x={18} y={svgH / 2} textAnchor="middle" transform={`rotate(-90, 18, ${svgH / 2})`} className="text-[15px] fill-slate-700 font-medium">
              Exam Score (y)
            </text>

            {!controlled ? (
              <line
                x1={xScale(0.7)}
                y1={yScale(3 + 2.6 * 0.7)}
                x2={xScale(4.3)}
                y2={yScale(3 + 2.6 * 4.3)}
                stroke="#0F172A"
                strokeWidth="3"
              />
            ) : (
              [1, 2, 3, 4].map((q) => (
                <g key={q}>
                  <line
                    x1={xScale(0.7)}
                    y1={yScale(2 + 1 * 0.7 + 2 * q)}
                    x2={xScale(4.3)}
                    y2={yScale(2 + 1 * 4.3 + 2 * q)}
                    stroke={q === 2 || q === 3 ? '#059669' : '#CBD5E1'}
                    strokeWidth={q === 2 || q === 3 ? 3 : 1.5}
                  />
                  <text
                    x={xScale(4.25)}
                    y={yScale(2 + 1 * 4.3 + 2 * q) - 6}
                    textAnchor="end"
                    className="text-[13px] font-mono fill-slate-700"
                  >
                    q={q}
                  </text>
                </g>
              ))
            )}

            {DEFAULT_DATASET.map((d) => (
              <g key={d.id}>
                <circle
                  cx={xScale(d.x1)}
                  cy={yScale(d.y)}
                  r={7}
                  fill={controlled ? '#059669' : '#0F172A'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={xScale(d.x1) + 12}
                  y={yScale(d.y) - 8}
                  className="text-[14px] font-mono fill-slate-800"
                >
                  {controlled ? `Q=${d.x2}, y=${d.y}` : `(${d.x1}, ${d.y})`}
                </text>
              </g>
            ))}
          </svg>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-mono text-lg tabular-nums">
            <span className="text-slate-600">
              {controlled ? 'Partial slope (Quizzes fixed):' : 'Simple slope (Hours alone):'}
            </span>
            <span className="font-bold text-emerald-700">
              {controlled ? 'β̂_Hours = +1.00' : 'β̂_Hours = +2.60'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (slideIndex === 4) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start py-2">
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Model Definition</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              What is Multiple Regression?
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Predict one numeric <span className="font-mono text-slate-900">y</span> from two or more predictors <span className="font-mono text-slate-900">x</span>.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-base text-slate-900">
            ŷ = β₀ + β₁x₁ + β₂x₂ + … + βₖxₖ
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-200 text-base text-slate-700">
            <div>
              <span className="font-semibold text-slate-900">Simple:</span> One x. Fits a line.
            </div>
            <div>
              <span className="font-semibold text-slate-900">Multiple:</span> Many x. Fits a plane or hyperplane.
            </div>
            <div>
              <span className="font-semibold text-emerald-700">βⱼ:</span> Change in y per +1 in xⱼ, others fixed.
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-1 p-1 border border-slate-200 rounded-lg bg-slate-50">
              <button
                type="button"
                onClick={() => setMode4('simple')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  mode4 === 'simple' ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                Simple (Line)
              </button>
              <button
                type="button"
                onClick={() => setMode4('multiple')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  mode4 === 'multiple' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                }`}
              >
                Multiple (Plane)
              </button>
            </div>

            {mode4 === 'multiple' && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">Hold x₂ fixed:</span>
                {[null, 1, 2, 3, 4].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setSliceX2(val)}
                    className={`px-3 py-1 rounded border font-mono cursor-pointer transition-colors ${
                      sliceX2 === val
                        ? 'border-emerald-700 bg-emerald-700 text-white font-medium'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {val === null ? 'Off' : `x₂=${val}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <RegressionPlane3D
            beta={[b0, b1, b2]}
            points={DEFAULT_DATASET}
            height={360}
            mode={mode4}
            sliceX2={mode4 === 'multiple' ? sliceX2 : null}
            caption={
              mode4 === 'multiple'
                ? `ŷ = ${b0.toFixed(1)} + ${b1.toFixed(1)}·x₁ + ${b2.toFixed(1)}·x₂`
                : `ŷ = ${b0.toFixed(1)} + ${b1.toFixed(1)}·x₁`
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
            <label className="space-y-1.5 text-base">
              <div className="flex justify-between font-mono tabular-nums">
                <span className="text-slate-600">β₀</span>
                <span className="font-semibold text-slate-900">{b0.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={-2}
                max={6}
                step={0.5}
                value={b0}
                onChange={(e) => setB0(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </label>
            <label className="space-y-1.5 text-base">
              <div className="flex justify-between font-mono tabular-nums">
                <span className="text-slate-600">β₁ (Hours)</span>
                <span className="font-semibold text-slate-900">{b1.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={-1}
                max={4}
                step={0.5}
                value={b1}
                onChange={(e) => setB1(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </label>
            <label className="space-y-1.5 text-base">
              <div className="flex justify-between font-mono tabular-nums">
                <span className="text-slate-600">β₂ (Quizzes)</span>
                <span className="font-semibold text-slate-900">{b2.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={-1}
                max={4}
                step={0.5}
                value={b2}
                disabled={mode4 === 'simple'}
                onChange={(e) => setB2(Number(e.target.value))}
                className="w-full accent-emerald-700 disabled:opacity-40"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setB0(2);
                setB1(1);
                setB2(2);
                setSliceX2(2);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to OLS fit (2, 1, 2)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Slide 5: Assumptions to Check
  const assumptions = [
    {
      title: 'Linear relationship between each x and y',
      goodDesc: 'Points scatter evenly around a straight partial trend.',
      badDesc: 'Curved U-shape means linear βⱼ misses curvature.',
      renderGood: () => (
        <svg viewBox="0 0 240 130" className="w-full h-auto bg-white rounded-lg border border-slate-200">
          <line x1="24" y1="104" x2="216" y2="26" stroke="#059669" strokeWidth="2.5" />
          {[
            [38, 96], [62, 85], [90, 80], [116, 62], [146, 56], [176, 38], [202, 32],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="#0F172A" />
          ))}
        </svg>
      ),
      renderBad: () => (
        <svg viewBox="0 0 240 130" className="w-full h-auto bg-white rounded-lg border border-slate-200">
          <line x1="24" y1="70" x2="216" y2="70" stroke="#64748B" strokeWidth="2" strokeDasharray="5 4" />
          {[
            [36, 102], [64, 65], [92, 40], [120, 30], [148, 40], [176, 66], [204, 104],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="#0F172A" />
          ))}
        </svg>
      ),
    },
    {
      title: 'Independent errors',
      goodDesc: 'No autocorrelation across observation order.',
      badDesc: 'Drifting waves show sequential errors are correlated.',
      renderGood: () => (
        <svg viewBox="0 0 240 130" className="w-full h-auto bg-white rounded-lg border border-slate-200">
          <line x1="20" y1="65" x2="220" y2="65" stroke="#94A3B8" strokeWidth="1.5" />
          {[
            [32, 42], [56, 86], [82, 48], [108, 82], [134, 44], [160, 90], [186, 54], [210, 74],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="#059669" />
          ))}
        </svg>
      ),
      renderBad: () => (
        <svg viewBox="0 0 240 130" className="w-full h-auto bg-white rounded-lg border border-slate-200">
          <line x1="20" y1="65" x2="220" y2="65" stroke="#94A3B8" strokeWidth="1.5" />
          <path d="M 32 92 Q 78 22 124 65 T 210 38" fill="none" stroke="#0F172A" strokeWidth="2.5" />
          {[
            [32, 92], [58, 58], [84, 40], [110, 44], [136, 66], [162, 86], [188, 88], [210, 56],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="#0F172A" />
          ))}
        </svg>
      ),
    },
    {
      title: 'Constant variance of residuals',
      goodDesc: 'Even vertical spread across all fitted values ŷ.',
      badDesc: 'Funnel shape means SE, t, and p-values become unreliable.',
      renderGood: () => (
        <svg viewBox="0 0 240 130" className="w-full h-auto bg-white rounded-lg border border-slate-200">
          <line x1="20" y1="65" x2="220" y2="65" stroke="#059669" strokeWidth="1.5" />
          {[
            [34, 48], [58, 82], [84, 50], [110, 80], [138, 48], [164, 84], [194, 52],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="#059669" />
          ))}
        </svg>
      ),
      renderBad: () => (
        <svg viewBox="0 0 240 130" className="w-full h-auto bg-white rounded-lg border border-slate-200">
          <line x1="20" y1="65" x2="220" y2="65" stroke="#64748B" strokeWidth="1.5" />
          {[
            [32, 61], [56, 70], [84, 52], [114, 80], [146, 38], [176, 98], [204, 22], [208, 108],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="#0F172A" />
          ))}
        </svg>
      ),
    },
    {
      title: 'Normal residuals (matters for p-values)',
      goodDesc: 'Symmetric bell errors validate finite-sample t and F p-values.',
      badDesc: 'Heavy skew or outliers distort small-sample t-tests.',
      renderGood: () => (
        <svg viewBox="0 0 240 130" className="w-full h-auto bg-white rounded-lg border border-slate-200">
          <path d="M 24 108 C 66 108, 84 26, 120 26 C 156 26, 174 108, 216 108" fill="rgba(5,150,105,0.12)" stroke="#059669" strokeWidth="2.5" />
        </svg>
      ),
      renderBad: () => (
        <svg viewBox="0 0 240 130" className="w-full h-auto bg-white rounded-lg border border-slate-200">
          <path d="M 24 108 C 42 108, 52 26, 74 26 C 102 26, 138 100, 218 108" fill="rgba(15,23,42,0.08)" stroke="#0F172A" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      title: 'No severe multicollinearity between predictors',
      goodDesc: 'Predictors vary independently, keeping SEs tight.',
      badDesc: 'r(x₁, x₂) ≈ 1 inflates SEs and makes β̂ unstable.',
      renderGood: () => (
        <svg viewBox="0 0 240 130" className="w-full h-auto bg-white rounded-lg border border-slate-200">
          {[
            [48, 36], [66, 92], [102, 52], [126, 98], [154, 34], [180, 78], [202, 50], [84, 74],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="#059669" />
          ))}
        </svg>
      ),
      renderBad: () => (
        <svg viewBox="0 0 240 130" className="w-full h-auto bg-white rounded-lg border border-slate-200">
          <line x1="36" y1="108" x2="204" y2="24" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 4" />
          {[
            [42, 104], [66, 92], [94, 78], [120, 65], [146, 52], [172, 39], [198, 27],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="#0F172A" />
          ))}
        </svg>
      ),
    },
  ];

  const currentA = assumptions[activeAssumption];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start py-2">
      <div className="lg:col-span-4 space-y-5">
        <div className="space-y-2">
          <p className="text-base font-medium text-emerald-700">Model Validity</p>
          <h2 className="text-4xl font-bold text-slate-900 leading-tight">
            Assumptions to Check
          </h2>
        </div>

        <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
          {assumptions.map((a, idx) => (
            <button
              key={a.title}
              type="button"
              onClick={() => setActiveAssumption(idx)}
              className={`w-full text-left py-3.5 px-3 transition-colors cursor-pointer text-base lg:text-lg ${
                activeAssumption === idx
                  ? 'text-emerald-700 font-semibold bg-slate-50'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {a.title}
            </button>
          ))}
        </div>

        <DiscussionReveal
          question="Which assumption is new compared with simple regression?"
          answer="No severe multicollinearity between predictors."
          detail="Simple regression has only one predictor x, so predictors cannot correlate with each other."
        />
      </div>

      <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <h3 className="text-2xl font-semibold text-slate-900">{currentA.title}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-base font-semibold text-emerald-700">● Satisfied</div>
            {currentA.renderGood()}
            <p className="text-base text-slate-600 leading-relaxed">{currentA.goodDesc}</p>
          </div>

          <div className="space-y-3">
            <div className="text-base font-semibold text-slate-900">▲ Violated</div>
            {currentA.renderBad()}
            <p className="text-base text-slate-600 leading-relaxed">{currentA.badDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
