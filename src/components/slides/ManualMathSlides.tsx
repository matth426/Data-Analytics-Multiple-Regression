import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { computeOLS, DEFAULT_DATASET } from '../../utils/olsMath';
import { DiscussionReveal } from '../DiscussionReveal';
import { RegressionPlane3D } from '../RegressionPlane3D';

interface ManualMathSlidesProps {
  slideIndex: number;
}

const ols = computeOLS(DEFAULT_DATASET, true);

export const ManualMathSlides: React.FC<ManualMathSlidesProps> = ({ slideIndex }) => {
  const [derivStep, setDerivStep] = useState(0);
  const [datasetView7, setDatasetView7] = useState<'table' | '3d'>('table');

  const [selectedCell, setSelectedCell] = useState<{
    target: 'xtx' | 'xty';
    row: number;
    col: number;
  }>({ target: 'xtx', row: 1, col: 2 });
  const [autoPlay8, setAutoPlay8] = useState(false);

  const [selectedBetaRow, setSelectedBetaRow] = useState<number>(0);
  const [showDetDetail, setShowDetDetail] = useState(false);
  const [predHours, setPredHours] = useState(3);
  const [predQuizzes, setPredQuizzes] = useState(4);

  const [selectedCoef10, setSelectedCoef10] = useState<number>(1);

  useEffect(() => {
    if (!autoPlay8 || slideIndex !== 8) return;
    const sequence: { target: 'xtx' | 'xty'; row: number; col: number }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        sequence.push({ target: 'xtx', row: r, col: c });
      }
    }
    for (let r = 0; r < 3; r++) {
      sequence.push({ target: 'xty', row: r, col: 0 });
    }
    const timer = setInterval(() => {
      setSelectedCell((prev) => {
        const idx = sequence.findIndex(
          (s) => s.target === prev.target && s.row === prev.row && s.col === prev.col
        );
        return sequence[(idx + 1) % sequence.length];
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [autoPlay8, slideIndex]);

  if (slideIndex === 6) {
    const steps = [
      {
        label: '1. Model in Matrix Form',
        eq: 'y = Xβ + ε',
        note: 'Stack all n rows. Prepend a column of 1s to X for the intercept.',
      },
      {
        label: '2. Minimize Sum of Squared Errors',
        eq: 'SSE = Σ(y − ŷ)² = (y − Xβ)ᵀ(y − Xβ)',
        note: 'Choose β that minimizes vertical squared residuals.',
      },
      {
        label: '3. Normal Equation',
        eq: 'XᵀX β = Xᵀy',
        note: 'Residual vector e = y − Xβ̂ is orthogonal to every column of X.',
      },
      {
        label: '4. Closed-Form Solution',
        eq: 'β̂ = (XᵀX)⁻¹ Xᵀy',
        note: 'Multiply both sides on the left by (XᵀX)⁻¹.',
      },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start py-2">
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Linear Algebra</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">Matrix Form</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Stack all <span className="font-mono text-slate-900">n</span> rows. Add a column of <span className="font-mono text-slate-900">1</span>s to <span className="font-mono text-slate-900">X</span> for the intercept.
            </p>
          </div>

          <div className="border-t border-b border-slate-200 py-4 font-mono text-base space-y-1.5 text-slate-800">
            <div>X is n × (k + 1)</div>
            <div>y is n × 1</div>
            <div>β is (k + 1) × 1</div>
          </div>

          <DiscussionReveal
            question="Why must XᵀX be invertible?"
            answer="So β̂ = (XᵀX)⁻¹ Xᵀy has a unique solution."
            detail="If columns of X are linearly dependent or n < k + 1, det(XᵀX) = 0 and infinitely many planes tie for minimum SSE."
          />
        </div>

        <div className="lg:col-span-6">
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white overflow-hidden">
            {steps.map((s, idx) => {
              const active = derivStep === idx;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setDerivStep(idx)}
                  className={`w-full text-left p-5 transition-colors cursor-pointer ${
                    active ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-base font-semibold ${active ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {s.label}
                    </span>
                    <span className="font-mono text-sm text-slate-400">{idx + 1}/4</span>
                  </div>
                  <div className={`font-mono text-xl lg:text-2xl font-semibold mt-2 ${active ? 'text-slate-900' : 'text-slate-700'}`}>
                    {s.eq}
                  </div>
                  {active && (
                    <p className="text-base text-slate-600 mt-2 leading-relaxed">{s.note}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (slideIndex === 7) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start py-2">
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Working Example</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">Practice Dataset</h2>
            <p className="text-lg text-slate-600 font-mono">
              Score = β₀ + β₁·Hours + β₂·Quizzes
            </p>
            <p className="text-lg text-slate-600 font-mono">n = 4, k = 2</p>
          </div>

          <div className="flex items-center gap-1 p-1 border border-slate-200 rounded-lg bg-slate-50 w-fit">
            <button
              type="button"
              onClick={() => setDatasetView7('table')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md cursor-pointer ${
                datasetView7 === 'table' ? 'bg-emerald-700 text-white' : 'text-slate-600'
              }`}
            >
              Data Table
            </button>
            <button
              type="button"
              onClick={() => setDatasetView7('3d')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md cursor-pointer ${
                datasetView7 === '3d' ? 'bg-emerald-700 text-white' : 'text-slate-600'
              }`}
            >
              3D Points
            </button>
          </div>

          <DiscussionReveal
            question="What are the sizes of X and y? How many degrees of freedom are left?"
            answer="X is 4 × 3, y is 4 × 1, and df = 4 − 2 − 1 = 1."
          />
        </div>

        <div className="lg:col-span-6">
          {datasetView7 === 'table' ? (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50 font-mono text-base text-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">x₁ Hours</th>
                    <th className="px-6 py-4 font-semibold">x₂ Quizzes</th>
                    <th className="px-6 py-4 font-semibold text-emerald-700">y Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-xl tabular-nums">
                  {DEFAULT_DATASET.map((row) => (
                    <tr key={row.id}>
                      <td className="px-6 py-5 text-slate-500">{row.id}</td>
                      <td className="px-6 py-5 text-slate-900">{row.x1}</td>
                      <td className="px-6 py-5 text-slate-900">{row.x2}</td>
                      <td className="px-6 py-5 font-bold text-emerald-700">{row.y}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <RegressionPlane3D
              beta={[2, 1, 2]}
              points={DEFAULT_DATASET}
              height={420}
              showResiduals={false}
              caption="4 observations in 3D feature space"
            />
          )}
        </div>
      </div>
    );
  }

  if (slideIndex === 8) {
    const Xt = [
      ols.X.map((r) => r[0]),
      ols.X.map((r) => r[1]),
      ols.X.map((r) => r[2]),
    ];

    const colNames = ['1s', 'x₁ Hours', 'x₂ Quizzes'];
    const leftVec = Xt[selectedCell.row];
    const rightVec =
      selectedCell.target === 'xtx'
        ? ols.X.map((r) => r[selectedCell.col])
        : ols.y;
    const products = leftVec.map((v, idx) => v * rightVec[idx]);
    const total = products.reduce((a, b) => a + b, 0);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start py-2">
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Manual Step 1</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Build X, XᵀX, Xᵀy
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Click any entry in <span className="font-mono text-slate-900">XᵀX</span> or <span className="font-mono text-slate-900">Xᵀy</span> to trace its dot product.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setAutoPlay8((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {autoPlay8 ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{autoPlay8 ? 'Pause' : 'Animate'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoPlay8(false);
                setSelectedCell({ target: 'xtx', row: 1, col: 2 });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Spotlight 29</span>
            </button>
          </div>

          {/* Live dot product formula */}
          <div className="border-t border-b border-slate-200 py-4 space-y-2">
            <div className="text-sm font-medium text-slate-500">
              {selectedCell.target === 'xtx'
                ? `Row ${selectedCell.row + 1} (${colNames[selectedCell.row]}) · Col ${selectedCell.col + 1} (${colNames[selectedCell.col]})`
                : `Row ${selectedCell.row + 1} (${colNames[selectedCell.row]}) · y`}
            </div>
            <div className="font-mono text-lg text-slate-900 tabular-nums flex flex-wrap items-center gap-1.5">
              {leftVec.map((lv, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-400">+</span>}
                  <span>({lv}·{rightVec[idx]})</span>
                </React.Fragment>
              ))}
              <span className="text-slate-400">=</span>
              <span className="font-bold text-emerald-700 text-xl">{total}</span>
            </div>
          </div>

          <DiscussionReveal
            question="Check: What does the 29 in XᵀX count?"
            answer="Σ(x₁ · x₂) = (1·1) + (2·3) + (3·2) + (4·4) = 29."
            defaultOpen={true}
          />
        </div>

        <div className="lg:col-span-6 space-y-6">
          {/* Input matrices */}
          <div className="grid grid-cols-2 gap-6 rounded-xl border border-slate-200 bg-white p-5">
            <div>
              <div className="text-sm font-mono text-slate-500 mb-2">Xᵀ (3 × 4)</div>
              <div className="space-y-1.5 font-mono text-lg tabular-nums">
                {Xt.map((row, rIdx) => (
                  <div
                    key={rIdx}
                    className={`grid grid-cols-4 gap-1 text-center py-1 rounded ${
                      selectedCell.row === rIdx
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    {row.map((val, cIdx) => (
                      <span key={cIdx}>{val}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-mono text-slate-500 mb-2">
                {selectedCell.target === 'xtx' ? 'X (4 × 3)' : 'y (4 × 1)'}
              </div>
              {selectedCell.target === 'xtx' ? (
                <div className="space-y-1.5 font-mono text-lg tabular-nums">
                  {ols.X.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-3 gap-1 text-center">
                      {row.map((val, cIdx) => (
                        <span
                          key={cIdx}
                          className={`py-1 rounded ${
                            selectedCell.col === cIdx
                              ? 'bg-emerald-50 text-emerald-800 font-bold'
                              : 'text-slate-700'
                          }`}
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-lg tabular-nums">
                  {ols.y.map((val, idx) => (
                    <div key={idx} className="py-1 rounded bg-emerald-50 text-emerald-800 font-bold text-center">
                      {val}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Result matrices */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            <div className="sm:col-span-8 rounded-xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-mono text-slate-500 mb-3">XᵀX (click any cell)</div>
              <div className="grid grid-cols-3 gap-2.5 font-mono text-xl tabular-nums">
                {ols.XtX.map((row, r) =>
                  row.map((val, c) => {
                    const active =
                      selectedCell.target === 'xtx' &&
                      selectedCell.row === r &&
                      selectedCell.col === c;
                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => {
                          setAutoPlay8(false);
                          setSelectedCell({ target: 'xtx', row: r, col: c });
                        }}
                        className={`py-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                          active
                            ? 'border-emerald-700 bg-emerald-700 text-white font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="sm:col-span-4 rounded-xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-mono text-slate-500 mb-3">Xᵀy</div>
              <div className="space-y-2.5 font-mono text-xl tabular-nums">
                {ols.Xty.map((val, r) => {
                  const active = selectedCell.target === 'xty' && selectedCell.row === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setAutoPlay8(false);
                        setSelectedCell({ target: 'xty', row: r, col: 0 });
                      }}
                      className={`w-full py-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                        active
                          ? 'border-emerald-700 bg-emerald-700 text-white font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slideIndex === 9) {
    const invRow = ols.adjXtX[selectedBetaRow];
    const dotParts = invRow.map((v, i) => v * ols.Xty[i]);
    const numer = dotParts.reduce((a, b) => a + b, 0);
    const predY = 2 + 1 * predHours + 2 * predQuizzes;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start py-2">
        <div className="lg:col-span-4 space-y-5">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Manual Step 2</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">Invert and Solve</h2>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 font-mono text-base tabular-nums">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">det(XᵀX) = 36</span>
              <button
                type="button"
                onClick={() => setShowDetDetail((v) => !v)}
                className="text-sm text-emerald-700 font-sans font-medium hover:underline cursor-pointer"
              >
                {showDetDetail ? 'Hide' : 'Cofactor math'}
              </button>
            </div>

            {showDetDetail && (
              <div className="text-sm text-slate-600 pt-2 border-t border-slate-200">
                4(59) − 10(10) + 10(−10) = 36
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="text-sm text-slate-500 font-sans">
                (XᵀX)⁻¹ = (1/36) · adj(XᵀX) — click row:
              </div>
              {ols.adjXtX.map((row, r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedBetaRow(r)}
                  className={`w-full grid grid-cols-4 items-center px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                    selectedBetaRow === r
                      ? 'border-emerald-700 bg-emerald-700 text-white font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span className="text-left text-sm">β̂{r}</span>
                  {row.map((val, c) => (
                    <span key={c} className="text-right">
                      {val}
                    </span>
                  ))}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 text-sm text-slate-700">
              {numer} / 36 = <strong className="text-emerald-700 text-lg">{ols.beta[selectedBetaRow]}</strong>
            </div>
          </div>

          <div className="font-mono text-xl font-bold text-slate-900">
            ŷ = 2 + 1·Hours + 2·Quizzes
          </div>
        </div>

        <div className="lg:col-span-6 space-y-5">
          <RegressionPlane3D
            beta={[2, 1, 2]}
            points={DEFAULT_DATASET}
            predictedPoint={{ x1: predHours, x2: predQuizzes, y: predY }}
            height={380}
            caption={`Predicted Score (${predHours} Hours, ${predQuizzes} Quizzes) = ${predY.toFixed(1)}`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center pt-1">
            <label className="space-y-1 text-base">
              <div className="flex justify-between font-mono tabular-nums">
                <span className="text-slate-600">Hours</span>
                <span className="font-semibold text-slate-900">{predHours}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={predHours}
                onChange={(e) => setPredHours(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </label>
            <label className="space-y-1 text-base">
              <div className="flex justify-between font-mono tabular-nums">
                <span className="text-slate-600">Quizzes</span>
                <span className="font-semibold text-slate-900">{predQuizzes}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={predQuizzes}
                onChange={(e) => setPredQuizzes(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </label>
            <div className="font-mono text-xl font-bold text-emerald-700 tabular-nums sm:text-right">
              ŷ = {predY.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slide 10: Manual Step 3: Fit Quality
  const tCurvePoints = Array.from({ length: 81 }, (_, i) => {
    const t = -4 + i * 0.1;
    const pdf = 1 / (Math.PI * (1 + t * t));
    return { t, pdf };
  });
  const selectedT = ols.tStats[selectedCoef10];
  const selectedSE = ols.se[selectedCoef10];
  const selectedP = ols.pValues[selectedCoef10];
  const coefLabels = ['β₀ (const)', 'β₁ (Hours)', 'β₂ (Quizzes)'];
  const diagVals = ['59/36', '20/36', '20/36'];
  const seMeanings = [
    'SE(β₀) = 2.56 measures uncertainty in the intercept (baseline Score when Hours = 0 and Quizzes = 0). Because (0,0) is outside our data, β₀ wobbles most.',
    'SE(β₁) = 1.49 measures how much the Hours slope would typically vary (±1.49 pts/hr) if we drew new 4-student samples.',
    'SE(β₂) = 1.49 measures how much the Quizzes slope would typically vary (±1.49 pts/quiz) across repeated 4-student samples.',
  ];
  const tMeanings = [
    't = β̂₀ / SE(β₀) = 2 / 2.56 = 0.78 tests H₀: β₀ = 0. Only 0.78 SEs from zero (need |t| > 12.71 at df = 1), so p = 0.58 is not significant.',
    't = β̂₁ / SE(β₁) = 1 / 1.49 = 0.67 tests H₀: β₁ = 0 (does Hours matter?). Just 0.67 SEs from zero (need |t| > 12.71 at df = 1), so p = 0.62.',
    't = β̂₂ / SE(β₂) = 2 / 1.49 = 1.34 tests H₀: β₂ = 0 (does Quizzes matter?). 1.34 SEs from zero (need |t| > 12.71 at df = 1), so p = 0.41.',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start py-2">
      <div className="lg:col-span-4 space-y-6">
        <div className="space-y-2">
          <p className="text-base font-medium text-emerald-700">Manual Step 3</p>
          <h2 className="text-4xl font-bold text-slate-900 leading-tight">Fit Quality</h2>
        </div>

        <div className="divide-y divide-slate-200 border-t border-b border-slate-200 font-mono text-base tabular-nums">
          <div className="py-3 flex justify-between">
            <span className="text-slate-600">ŷ</span>
            <span className="text-slate-900">5, 10, 9, 14</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-600">e = y − ŷ</span>
            <span className="text-slate-900">−1, 1, 1, −1</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-600">SSE / SST / SSR</span>
            <span className="text-slate-900">4 / 45 / 41</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-600">R² = 1 − 4/45</span>
            <span className="font-bold text-slate-900">0.911</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-600">Adj R²</span>
            <span className="font-bold text-emerald-700">0.733</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-600">s² = SSE/(n−k−1)</span>
            <span className="text-slate-900">4 / 1 = 4</span>
          </div>
        </div>

        <div className="space-y-2 text-base text-slate-600 leading-relaxed">
          <div>
            <strong className="text-slate-900">SE(βⱼ):</strong> Expected wobble in β̂ⱼ from sample noise.
          </div>
          <div>
            <strong className="text-slate-900">t-value:</strong> Signal-to-noise ratio (<span className="font-mono text-slate-900">β̂ⱼ / SE</span>) testing <span className="font-mono text-slate-900">H₀: βⱼ = 0</span>.
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        {/* Variance decomposition bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-base font-mono tabular-nums">
            <span className="font-semibold text-emerald-700">SSR = 41 (91.1%)</span>
            <span className="text-slate-600">SSE = 4 (8.9%)</span>
          </div>
          <div className="h-6 w-full rounded-lg overflow-hidden flex border border-slate-200">
            <div
              className="bg-emerald-700 h-full flex items-center justify-center text-sm font-mono text-white font-semibold"
              style={{ width: `${(41 / 45) * 100}%` }}
            >
              SSR = 41
            </div>
            <div
              className="bg-slate-200 h-full flex items-center justify-center text-sm font-mono text-slate-800 font-semibold"
              style={{ width: `${(4 / 45) * 100}%` }}
            >
              4
            </div>
          </div>
        </div>

        {/* SE & t-test */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-slate-900">Std Errors &amp; t-Test (df = 1)</h3>
            <div className="flex items-center gap-1 p-1 border border-slate-200 rounded-lg bg-slate-50">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCoef10(idx)}
                  className={`px-3.5 py-1 text-base font-mono rounded-md cursor-pointer transition-colors ${
                    selectedCoef10 === idx
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  β{idx}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-4 font-mono text-lg tabular-nums">
            <div>
              SE({coefLabels[selectedCoef10]}) = √(4 · {diagVals[selectedCoef10]}) ={' '}
              <strong className="text-slate-900">{selectedSE.toFixed(2)}</strong>
            </div>
            <div className="text-emerald-700 font-bold">
              t = {selectedT.toFixed(2)} (p ≈ {selectedP.toFixed(2)})
            </div>
          </div>

          <svg viewBox="0 0 460 135" className="w-full h-auto bg-white">
            <line x1="25" y1="106" x2="435" y2="106" stroke="#94A3B8" strokeWidth="1.5" />
            <path
              d={tCurvePoints
                .map((pt, i) => {
                  const x = 230 + pt.t * 48;
                  const y = 106 - pt.pdf * 240;
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                })
                .join(' ')}
              fill="none"
              stroke="#0F172A"
              strokeWidth="2.5"
            />
            <line
              x1={230 + selectedT * 48}
              y1="20"
              x2={230 + selectedT * 48}
              y2="106"
              stroke="#059669"
              strokeWidth="3"
            />
            <circle cx={230 + selectedT * 48} cy="20" r="5.5" fill="#059669" />
            <text
              x={230 + selectedT * 48 + 10}
              y="26"
              className="text-[15px] font-mono fill-emerald-700 font-semibold"
            >
              t = {selectedT.toFixed(2)}
            </text>
            {[-3, -2, -1, 0, 1, 2, 3].map((tick) => (
              <text
                key={tick}
                x={230 + tick * 48}
                y="126"
                textAnchor="middle"
                className="text-[13px] font-mono fill-slate-500"
              >
                {tick}
              </text>
            ))}
          </svg>

          <div className="pt-3 border-t border-slate-200 space-y-2 text-base text-slate-700 leading-relaxed">
            <p>{seMeanings[selectedCoef10]}</p>
            <p className="text-slate-900 font-medium">{tMeanings[selectedCoef10]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
