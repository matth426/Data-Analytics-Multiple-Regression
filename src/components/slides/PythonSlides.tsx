import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { computeOLS, DEFAULT_DATASET } from '../../utils/olsMath';
import { DiscussionReveal } from '../DiscussionReveal';
import { RegressionPlane3D } from '../RegressionPlane3D';

interface PythonSlidesProps {
  slideIndex: number;
}

const olsWithIntercept = computeOLS(DEFAULT_DATASET, true);
const olsNoIntercept = computeOLS(DEFAULT_DATASET, false);

export const PythonSlides: React.FC<PythonSlidesProps> = ({ slideIndex }) => {
  const [step11, setStep11] = useState(8);
  const [includeOnes, setIncludeOnes] = useState(true);

  const [showSummary12, setShowSummary12] = useState(true);

  const [spotlight13, setSpotlight13] = useState<'coef' | 'tp' | 'r2' | 'f'>('coef');

  if (slideIndex === 11) {
    const codeLines = [
      { code: 'import numpy as np', out: 'NumPy loaded' },
      { code: 'from sklearn.linear_model import LinearRegression', out: 'LinearRegression imported' },
      { code: 'X = np.array([[1,1],[2,3],[3,2],[4,4]]); y = np.array([4,11,10,13])', out: 'X: (4, 2), y: (4,)' },
      {
        code: includeOnes ? 'Xd = np.column_stack([np.ones(4), X])' : '# Omitted np.ones(4)! Xd = X',
        out: includeOnes ? 'Xd shape: (4, 3) with 1s column' : 'Xd shape: (4, 2) — NO intercept!',
      },
      {
        code: 'np.linalg.solve(Xd.T @ Xd, Xd.T @ y)',
        out: includeOnes
          ? 'array([2., 1., 2.])'
          : `array([${olsNoIntercept.beta[0].toFixed(3)}, ${olsNoIntercept.beta[1].toFixed(3)}])`,
      },
      { code: 'm = LinearRegression().fit(X, y)', out: 'LinearRegression fitted' },
      { code: 'm.intercept_, m.coef_', out: '(2.0, array([1., 2.]))' },
      { code: 'm.score(X, y)', out: '0.9111' },
    ];

    const activeBeta: [number, number, number] = includeOnes
      ? [2, 1, 2]
      : [0, olsNoIntercept.beta[0], olsNoIntercept.beta[1]];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start py-2">
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Python Implementation</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">sklearn and NumPy</h2>
          </div>

          <div className="flex items-center gap-1 p-1 border border-slate-200 rounded-lg bg-slate-50 w-fit">
            <button
              type="button"
              onClick={() => setIncludeOnes(true)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                includeOnes ? 'bg-emerald-700 text-white' : 'text-slate-600'
              }`}
            >
              With np.ones(4)
            </button>
            <button
              type="button"
              onClick={() => setIncludeOnes(false)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                !includeOnes ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              Omit np.ones(4)
            </button>
          </div>

          <DiscussionReveal
            question="sklearn adds the intercept for you. Does NumPy?"
            answer="No. NumPy only solves what you pass in Xd."
            detail="Without np.ones(4), NumPy forces the plane through (0, 0, 0), distorting slopes to [1.45, 2.25]."
          />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-5 font-mono text-sm lg:text-base space-y-1.5">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-slate-400">
              <span>Click any line to inspect output</span>
              <button
                type="button"
                onClick={() => setStep11((prev) => (prev >= codeLines.length ? 1 : prev + 1))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Step Line</span>
              </button>
            </div>
            {codeLines.map((line, idx) => {
              const active = idx < step11;
              const isCurrent = idx === step11 - 1;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStep11(idx + 1)}
                  className={`w-full text-left px-3 py-1.5 rounded transition-colors block cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-800 border border-emerald-500'
                      : active
                      ? 'hover:bg-slate-800/70 border border-transparent'
                      : 'opacity-40 hover:opacity-75 border border-transparent'
                  }`}
                >
                  <div className="text-slate-100">
                    <span className="text-slate-500 mr-3 select-none">{idx + 1}</span>
                    {line.code}
                  </div>
                  {isCurrent && (
                    <div className="text-sm text-emerald-400 mt-1 pl-6">→ {line.out}</div>
                  )}
                </button>
              );
            })}
          </div>

          <RegressionPlane3D
            beta={activeBeta}
            points={DEFAULT_DATASET}
            height={280}
            caption={
              includeOnes
                ? 'With intercept: ŷ = 2.00 + 1.00·x₁ + 2.00·x₂'
                : `No intercept (origin forced): ŷ = 0 + ${olsNoIntercept.beta[0].toFixed(2)}·x₁ + ${olsNoIntercept.beta[1].toFixed(2)}·x₂`
            }
          />
        </div>
      </div>
    );
  }

  if (slideIndex === 12) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start py-2">
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <p className="text-base font-medium text-emerald-700">Statistical Inference</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">statsmodels</h2>
          </div>

          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            <div className="py-4 space-y-1">
              <div className="text-lg font-semibold font-mono text-slate-900">sklearn</div>
              <p className="text-base text-slate-600 leading-relaxed">
                Built for <strong>prediction</strong>. Gives coefficients and R².
              </p>
            </div>
            <div className="py-4 space-y-1">
              <div className="text-lg font-semibold font-mono text-emerald-700">statsmodels</div>
              <p className="text-base text-slate-600 leading-relaxed">
                Built for <strong>inference</strong>. Gives SE, t, p, F, and confidence intervals.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <pre className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-5 font-mono text-base leading-7 overflow-x-auto">
{`import statsmodels.api as sm
Xc = sm.add_constant(X)  # adds the 1s column
res = sm.OLS(y, Xc).fit()
print(res.summary())
res.params, res.pvalues, res.rsquared_adj`}
          </pre>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
              <span className="text-sm font-mono font-semibold text-slate-700">
                print(res.summary())
              </span>
              <button
                type="button"
                onClick={() => setShowSummary12((v) => !v)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-800 cursor-pointer"
              >
                {showSummary12 ? 'Hide Output' : 'Show Output'}
              </button>
            </div>
            {showSummary12 && (
              <pre className="p-5 text-sm font-mono tabular-nums text-slate-800 overflow-x-auto leading-6 bg-white">
{`Dep. Variable: y        R-squared:       0.911
Model:         OLS      Adj. R-squared:  0.733
F-statistic:   5.125    Prob (F-stat):   0.299
Df Residuals:  1        Df Model:        2
----------------------------------------------------
               coef    std err       t      P>|t|
----------------------------------------------------
const        2.0000      2.560   0.781      0.578
x1 (Hours)   1.0000      1.491   0.671      0.624
x2 (Quizzes) 2.0000      1.491   1.342      0.408
----------------------------------------------------`}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Slide 13: Reading the Output
  const cards: {
    id: 'coef' | 'tp' | 'r2' | 'f';
    title: string;
    body: string;
  }[] = [
    {
      id: 'coef',
      title: 'Coefficients',
      body: 'const 2, Hours 1, Quizzes 2. Matches our hand result.',
    },
    {
      id: 'tp',
      title: 't and p',
      body: 'Hours: t = 0.67, p ≈ 0.62. Quizzes: t = 1.34, p ≈ 0.41. Neither is significant.',
    },
    {
      id: 'r2',
      title: 'R² and adj R²',
      body: '0.911 and 0.733. The gap shows the penalty for extra predictors on tiny n.',
    },
    {
      id: 'f',
      title: 'F-test',
      body: 'F = 5.13, p ≈ 0.30. Not significant. Only 1 df is left.',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start py-2">
      <div className="lg:col-span-4 space-y-5">
        <div className="space-y-2">
          <p className="text-base font-medium text-emerald-700">Interpreting Output</p>
          <h2 className="text-4xl font-bold text-slate-900 leading-tight">Reading the Output</h2>
          <p className="text-base text-slate-600">
            Click a metric below to spotlight it in the table.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
          {cards.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSpotlight13(c.id)}
              className={`w-full text-left py-3.5 px-3 transition-colors cursor-pointer ${
                spotlight13 === c.id ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className={`text-lg font-semibold ${spotlight13 === c.id ? 'text-emerald-700' : 'text-slate-900'}`}>
                {c.title}
              </div>
              <p className="text-base text-slate-600 mt-0.5 leading-snug">{c.body}</p>
            </button>
          ))}
        </div>

        <DiscussionReveal
          question="Why can R² be high while nothing is significant?"
          answer="Tiny sample size (n = 4, df = 1) makes standard errors huge and critical t = ±12.71."
        />
      </div>

      <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 font-mono text-base tabular-nums space-y-6">
        <div className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">
          OLS Regression Results
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border transition-colors ${
              spotlight13 === 'r2' ? 'border-emerald-700 bg-emerald-50 text-emerald-950' : 'border-slate-200 text-slate-700'
            }`}
          >
            <div>R-squared: <span className="font-bold">{olsWithIntercept.rSquared.toFixed(3)}</span></div>
            <div className="mt-1">Adj. R-squared: <span className="font-bold">{olsWithIntercept.adjRSquared.toFixed(3)}</span></div>
          </div>

          <div
            className={`p-4 rounded-lg border transition-colors ${
              spotlight13 === 'f' ? 'border-emerald-700 bg-emerald-50 text-emerald-950' : 'border-slate-200 text-slate-700'
            }`}
          >
            <div>F-statistic: <span className="font-bold">{olsWithIntercept.fStat.toFixed(2)}</span></div>
            <div className="mt-1">Prob (F-stat): <span className="font-bold">{olsWithIntercept.fPValue.toFixed(2)}</span></div>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="border-b border-slate-200 text-slate-500 text-sm">
            <tr>
              <th className="py-2.5">term</th>
              <th className="py-2.5 text-right">coef</th>
              <th className="py-2.5 text-right">std err</th>
              <th className="py-2.5 text-right">t</th>
              <th className="py-2.5 text-right">P&gt;|t|</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[
              { name: 'const', idx: 0 },
              { name: 'Hours', idx: 1 },
              { name: 'Quizzes', idx: 2 },
            ].map((row) => (
              <tr key={row.name}>
                <td className="py-3 text-slate-900 font-medium">{row.name}</td>
                <td
                  className={`py-3 text-right ${
                    spotlight13 === 'coef' ? 'text-emerald-700 font-bold' : 'text-slate-800'
                  }`}
                >
                  {olsWithIntercept.beta[row.idx].toFixed(3)}
                </td>
                <td className="py-3 text-right text-slate-500">{olsWithIntercept.se[row.idx].toFixed(3)}</td>
                <td
                  className={`py-3 text-right ${
                    spotlight13 === 'tp' ? 'text-emerald-700 font-bold' : 'text-slate-800'
                  }`}
                >
                  {olsWithIntercept.tStats[row.idx].toFixed(2)}
                </td>
                <td
                  className={`py-3 text-right ${
                    spotlight13 === 'tp' ? 'text-emerald-700 font-bold' : 'text-slate-800'
                  }`}
                >
                  {olsWithIntercept.pValues[row.idx].toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
