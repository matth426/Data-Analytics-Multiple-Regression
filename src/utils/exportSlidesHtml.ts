import { SLIDES } from '../data/slides';

export function buildStandaloneSlidesHtml(): string {
  const slideSections = [
    // Slide 1
    `<section class="slide active" data-slide="1">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">IT365 — Data Analytics 1 · Lesson 8</div>
          <h1>Multiple Regression Analysis</h1>
          <p class="lead">Linear algebra by hand, then <code>sklearn</code> and <code>statsmodels</code>.</p>
          <p class="author">Mattheus Marcus Contreras</p>
          <p class="disclaimer">Disclaimer: AI was used to generate this interactive page; the lesson content and slides were created by Mattheus Marcus Contreras.</p>
        </div>
        <div class="col-right card">
          <div class="card-title">Fitted Multiple Regression Plane</div>
          <div class="code-box">ŷ = 2 + 1·Hours + 2·Quizzes</div>
          <p class="muted">Use <strong>← / →</strong> keys or the buttons below to step through all 17 slides.</p>
        </div>
      </div>
    </section>`,

    // Slide 2
    `<section class="slide" data-slide="2">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Lesson Roadmap</div>
          <h2>Learning Objectives</h2>
          <p class="muted">At the end of this lesson, students should be able to complete five core tasks.</p>
        </div>
        <div class="col-right list-box">
          <div class="list-row"><span class="num">01</span><span>Explain what multiple regression models.</span><code>ŷ = β₀ + β₁x₁ + … + βₖxₖ</code></div>
          <div class="list-row"><span class="num">02</span><span>Write the model in matrix form.</span><code>β̂ = (XᵀX)⁻¹ Xᵀy</code></div>
          <div class="list-row"><span class="num">03</span><span>Solve for β̂ by hand with linear algebra.</span><code>β̂ = [2, 1, 2]ᵀ</code></div>
          <div class="list-row"><span class="num">04</span><span>Fit the model in sklearn and statsmodels.</span><code>LinearRegression vs sm.OLS</code></div>
          <div class="list-row"><span class="num">05</span><span>Read R², adjusted R², t-tests, and p-values.</span><code>R² = 0.911 · Adj R² = 0.733</code></div>
        </div>
      </div>
    </section>`,

    // Slide 3
    `<section class="slide" data-slide="3">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Intuition First</div>
          <h2>Warm-Up: Predict before we Calculate</h2>
          <p class="muted">Exam score depends on hours studied.</p>
        </div>
        <div class="col-right stack">
          <div class="card">
            <p class="q">Q1: If we also know practice quizzes taken, should the hours coefficient change?</p>
            <details><summary>Reveal Answer</summary><p class="ans">Yes. Each coefficient is the effect of one variable while the others are held constant.</p><p class="muted">Simple Hours slope is +2.60 (stealing credit from Quizzes). Controlling for Quizzes isolates the partial slope of Hours (+1.00).</p></details>
          </div>
          <div class="card">
            <p class="q">Q2: Can one extra predictor ever hurt the model?</p>
            <details><summary>Reveal Answer</summary><p class="ans">Yes — extra predictors reduce degrees of freedom (n − k − 1) and can inflate coefficient variance.</p></details>
          </div>
        </div>
      </div>
    </section>`,

    // Slide 4
    `<section class="slide" data-slide="4">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Model Definition</div>
          <h2>What is Multiple Regression?</h2>
          <p class="muted">Predict one numeric <code>y</code> from two or more predictors <code>x</code>.</p>
          <div class="code-box">ŷ = β₀ + β₁·x₁ + β₂·x₂ + … + βₖ·xₖ</div>
        </div>
        <div class="col-right list-box">
          <div class="list-row"><strong>Simple</strong><span>One x. Fits a 1D line.</span></div>
          <div class="list-row"><strong>Multiple</strong><span>Many x. Fits a plane (k = 2) or hyperplane (k ≥ 3).</span></div>
          <div class="list-row"><strong class="accent">βⱼ (Partial Slope)</strong><span>Change in y per +1 in xⱼ, holding all other predictors fixed.</span></div>
        </div>
      </div>
    </section>`,

    // Slide 5
    `<section class="slide" data-slide="5">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Model Validity</div>
          <h2>Assumptions to Check</h2>
        </div>
        <div class="col-right stack">
          <div class="list-box">
            <div class="list-row"><strong>Linearity</strong><span>Linear relationship between each x and y</span></div>
            <div class="list-row"><strong>Independence</strong><span>Independent errors</span></div>
            <div class="list-row"><strong>Homoscedasticity</strong><span>Constant variance of residuals</span></div>
            <div class="list-row"><strong>Normality</strong><span>Normal residuals (matters for p-values)</span></div>
            <div class="list-row"><strong class="accent">No Multicollinearity</strong><span>No severe correlation between predictors</span></div>
          </div>
          <div class="card">
            <p class="q">Which assumption is new compared with simple regression?</p>
            <details><summary>Reveal Answer</summary><p class="ans">No severe multicollinearity between predictors (simple regression only has one x).</p></details>
          </div>
        </div>
      </div>
    </section>`,

    // Slide 6
    `<section class="slide" data-slide="6">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Linear Algebra</div>
          <h2>Matrix Form</h2>
          <p class="muted">Stack all <code>n</code> rows. Add a column of <code>1</code>s to <code>X</code> for the intercept.</p>
          <p class="mono">X: n×(k+1) · y: n×1 · β: (k+1)×1</p>
        </div>
        <div class="col-right stack">
          <div class="code-box">y = Xβ + ε
Normal equation: XᵀX β = Xᵀy
Solution: β̂ = (XᵀX)⁻¹ Xᵀy</div>
          <div class="card">
            <p class="q">Why must XᵀX be invertible?</p>
            <details><summary>Reveal Answer</summary><p class="ans">So β̂ = (XᵀX)⁻¹ Xᵀy has a unique solution (columns of X must be linearly independent and n ≥ k + 1).</p></details>
          </div>
        </div>
      </div>
    </section>`,

    // Slide 7
    `<section class="slide" data-slide="7">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Working Example</div>
          <h2>Practice Dataset</h2>
          <p class="mono">Score = β₀ + β₁·Hours + β₂·Quizzes</p>
          <p class="mono">n = 4, k = 2</p>
          <div class="card">
            <p class="q">What are the sizes of X and y? How many degrees of freedom are left?</p>
            <details><summary>Reveal Answer</summary><p class="ans">X is 4 × 3, y is 4 × 1, and df = 4 − 2 − 1 = 1.</p></details>
          </div>
        </div>
        <div class="col-right card">
          <table>
            <thead><tr><th>Student</th><th>x₁ Hours</th><th>x₂ Quizzes</th><th class="accent">y Score</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>1</td><td>1</td><td class="accent">4</td></tr>
              <tr><td>2</td><td>2</td><td>3</td><td class="accent">11</td></tr>
              <tr><td>3</td><td>3</td><td>2</td><td class="accent">10</td></tr>
              <tr><td>4</td><td>4</td><td>4</td><td class="accent">13</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>`,

    // Slide 8
    `<section class="slide" data-slide="8">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Manual Step 1</div>
          <h2>Build X, XᵀX, Xᵀy</h2>
          <div class="card">
            <p class="q">Check: What does the 29 in XᵀX count?</p>
            <details open><summary>Reveal Answer</summary><p class="ans">Σ(x₁ · x₂) = (1·1) + (2·3) + (3·2) + (4·4) = 29.</p></details>
          </div>
        </div>
        <div class="col-right">
          <div class="code-box">X = [1 1 1; 1 2 3; 1 3 2; 1 4 4]
y = [4, 11, 10, 13]ᵀ

XᵀX = [  4  10  10
        10  30  29
        10  29  30 ]

Xᵀy = [ 38, 108, 109 ]ᵀ</div>
        </div>
      </div>
    </section>`,

    // Slide 9
    `<section class="slide" data-slide="9">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Manual Step 2</div>
          <h2>Invert and Solve</h2>
          <p class="mono accent">ŷ = 2 + 1·Hours + 2·Quizzes</p>
          <p class="muted">Predict a student with 3 hours and 4 quizzes: 2 + 1(3) + 2(4) = <strong>13</strong>.</p>
        </div>
        <div class="col-right">
          <div class="code-box">det(XᵀX) = 36

(XᵀX)⁻¹ = 1/36 · [  59  −10  −10
                   −10   20  −16
                   −10  −16   20 ]

β̂ = (XᵀX)⁻¹ Xᵀy = [ 2, 1, 2 ]ᵀ</div>
        </div>
      </div>
    </section>`,

    // Slide 10
    `<section class="slide" data-slide="10">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Manual Step 3</div>
          <h2>Fit Quality</h2>
          <div class="list-box mono">
            <div class="list-row"><span>ŷ</span><span>5, 10, 9, 14</span></div>
            <div class="list-row"><span>e = y − ŷ</span><span>−1, 1, 1, −1</span></div>
            <div class="list-row"><span>SSE / SST / SSR</span><span>4 / 45 / 41</span></div>
            <div class="list-row"><span>R² / Adj R²</span><span class="accent">0.911 / 0.733</span></div>
            <div class="list-row"><span>s² = SSE/(n−k−1)</span><span>4 / 1 = 4</span></div>
          </div>
        </div>
        <div class="col-right stack">
          <div class="card">
            <div class="card-title">Standard Errors — What SE(βⱼ) Means</div>
            <p><code>SE(βⱼ) = √(s² · [(XᵀX)⁻¹]ⱼⱼ)</code> measures the expected sampling wobble of <code>β̂ⱼ</code>.</p>
            <p class="mono">SE(β₀) = 2.56 (baseline at 0,0) · SE(β₁) = √(4·20/36) = 1.49 · SE(β₂) = 1.49</p>
          </div>
          <div class="card">
            <div class="card-title">t-Test — What t-Values Are About</div>
            <p><code>t = β̂ⱼ / SE(βⱼ)</code> is a signal-to-noise ratio testing <code>H₀: βⱼ = 0</code>.</p>
            <p class="mono">t₀ = 0.78 (p = 0.58) · t₁ = 1/1.49 = 0.67 (p = 0.62) · t₂ = 1.34 (p = 0.41) on df = 1</p>
            <p class="muted">With df = 1, significance requires |t| &gt; 12.71, so none are significant.</p>
          </div>
        </div>
      </div>
    </section>`,

    // Slide 11
    `<section class="slide" data-slide="11">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Python Implementation</div>
          <h2>sklearn and NumPy</h2>
          <div class="card">
            <p class="q">sklearn adds the intercept for you. Does NumPy?</p>
            <details><summary>Reveal Answer</summary><p class="ans">No — you must add <code>np.ones(n)</code> manually in NumPy, otherwise the plane is forced through (0, 0, 0).</p></details>
          </div>
        </div>
        <div class="col-right">
          <div class="code-box">import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[1,1],[2,3],[3,2],[4,4]]); y = np.array([4,11,10,13])
Xd = np.column_stack([np.ones(4), X])
np.linalg.solve(Xd.T @ Xd, Xd.T @ y)  # [2. 1. 2.]

m = LinearRegression().fit(X, y)
m.intercept_, m.coef_  # 2.0, [1. 2.]
m.score(X, y)          # 0.9111</div>
        </div>
      </div>
    </section>`,

    // Slide 12
    `<section class="slide" data-slide="12">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Statistical Inference</div>
          <h2>statsmodels</h2>
          <div class="list-box">
            <div class="list-row"><strong>sklearn</strong><span>Built for prediction. Gives coefficients and R².</span></div>
            <div class="list-row"><strong class="accent">statsmodels</strong><span>Built for inference. Gives SE, t, p, F, and CIs.</span></div>
          </div>
        </div>
        <div class="col-right">
          <div class="code-box">import statsmodels.api as sm
Xc = sm.add_constant(X)  # adds the 1s column
res = sm.OLS(y, Xc).fit()
print(res.summary())
res.params, res.pvalues, res.rsquared_adj</div>
        </div>
      </div>
    </section>`,

    // Slide 13
    `<section class="slide" data-slide="13">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Interpreting Output</div>
          <h2>Reading the Output</h2>
          <div class="card">
            <p class="q">Why can R² be high while nothing is significant?</p>
            <details><summary>Reveal Answer</summary><p class="ans">Tiny sample size (n = 4, df = 1) inflates SEs and requires |t| &gt; 12.71.</p></details>
          </div>
        </div>
        <div class="col-right list-box">
          <div class="list-row"><strong>Coefficients</strong><span>const 2, Hours 1, Quizzes 2. Matches our hand result.</span></div>
          <div class="list-row"><strong>t and p</strong><span>Hours: t = 0.67, p ≈ 0.62. Quizzes: t = 1.34, p ≈ 0.41. Neither is significant.</span></div>
          <div class="list-row"><strong class="accent">R² and adj R²</strong><span>0.911 and 0.733. The gap shows the penalty for extra predictors on tiny n.</span></div>
          <div class="list-row"><strong>F-test</strong><span>F = 5.13, p ≈ 0.30. Not significant. Only 1 df is left.</span></div>
        </div>
      </div>
    </section>`,

    // Slide 14
    `<section class="slide" data-slide="14">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Predictor Overlap</div>
          <h2>Multicollinearity</h2>
          <div class="card">
            <p class="q">Rule of thumb: VIF &gt; 5 concern, &gt; 10 severe. Is 2.78 a problem?</p>
            <details><summary>Reveal Answer</summary><p class="ans">Not severe — 2.78 is below 5 (moderate correlation).</p></details>
          </div>
        </div>
        <div class="col-right stack">
          <div class="list-box">
            <div class="list-row"><strong>What it is</strong><span>Two or more predictors are strongly correlated with each other.</span></div>
            <div class="list-row"><strong>Why it hurts</strong><span>Standard errors inflate. Coefficients wobble and can flip sign. Predictions stay fine.</span></div>
            <div class="list-row"><strong>Fixes</strong><span>Drop or combine predictors, use PCA, or ridge regression.</span></div>
          </div>
          <div class="code-box">VIFⱼ = 1 / (1 − Rⱼ²)
Our data: r(Hours, Quizzes) = 0.80  →  VIF = 1 / (1 − 0.64) = 2.78</div>
        </div>
      </div>
    </section>`,

    // Slide 15
    `<section class="slide" data-slide="15">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Residual Spread</div>
          <h2>Homoscedasticity</h2>
          <p class="muted">"Same spread": prediction errors have constant variance across all fitted values <code>Var(ε) = σ²</code>.</p>
        </div>
        <div class="col-right list-box">
          <div class="list-row"><strong>Why it matters</strong><span>OLS uses one shared s² to compute all SE(βⱼ).</span></div>
          <div class="list-row"><strong>Even band (Homoscedastic)</strong><span>Constant residual spread across ŷ; classical SEs are valid.</span></div>
          <div class="list-row"><strong class="accent">Funnel (Heteroscedastic)</strong><span>β̂ stays unbiased, but SE, t, and p-values become unreliable.</span></div>
        </div>
      </div>
    </section>`,

    // Slide 16
    `<section class="slide" data-slide="16">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Automated Checks</div>
          <h2>Diagnostics in Python</h2>
          <p class="muted">Our data (n = 4): residuals −1, 1, 1, −1 have equal size; no test has power at n = 4.</p>
          <p class="muted">If heteroscedasticity fails: transform y (log), use WLS, or report robust SE (<code>HC3</code>).</p>
        </div>
        <div class="col-right">
          <div class="code-box">from statsmodels.stats.outliers_influence import variance_inflation_factor as vif
from statsmodels.stats.diagnostic import het_breuschpagan

[vif(Xc, i) for i in (1, 2)]  # [2.78, 2.78]
lm, lm_p, f, f_p = het_breuschpagan(res.resid, Xc)  # p &lt; 0.05: heteroscedastic
plt.scatter(res.fittedvalues, res.resid); plt.axhline(0)
sm.OLS(y, Xc).fit(cov_type="HC3")  # robust SE fix</div>
        </div>
      </div>
    </section>`,

    // Slide 17
    `<section class="slide" data-slide="17">
      <div class="grid-30-70">
        <div class="col-left">
          <div class="eyebrow">Summary &amp; Exercise</div>
          <h2>Pitfalls and Recap</h2>
          <div class="list-box mono">
            <div class="list-row"><span>β̂ = (XᵀX)⁻¹ Xᵀy</span></div>
            <div class="list-row"><span>sklearn predicts, statsmodels explains</span></div>
          </div>
        </div>
        <div class="col-right stack">
          <div class="list-box">
            <div class="list-row"><strong>Multicollinearity</strong><span>Correlated x values inflate SE. Check VIF.</span></div>
            <div class="list-row"><strong>Overfitting</strong><span>n = 4 with 3 parameters leaves 1 df. Use Adj R² and more data.</span></div>
            <div class="list-row"><strong>Causation</strong><span>Coefficients show association, not cause.</span></div>
          </div>
          <div class="card">
            <p class="q">Exercise: Change y₄ from 13 to 14 and recompute β̂.</p>
            <details><summary>Check Solution</summary><p class="ans">Xᵀy = [39, 112, 113]ᵀ  →  β̂ = [1.417, 1.167, 2.167]ᵀ  (R² = 0.957, Adj R² = 0.872)</p></details>
          </div>
        </div>
      </div>
    </section>`,
  ];

  const total = SLIDES.length;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IT365 Lesson 8: Multiple Regression Analysis</title>
  <style>
    :root { --accent: #047857; --ink: #0f172a; --muted: #475569; --line: #e2e8f0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "IBM Plex Sans", system-ui, -apple-system, sans-serif; background: #fff; color: var(--ink); line-height: 1.5; }
    code, .mono { font-family: "IBM Plex Mono", ui-monospace, monospace; }
    .stage { min-height: calc(100vh - 64px); max-width: 1200px; margin: 0 auto; padding: 48px 32px; display: flex; align-items: center; }
    .slide { display: none; width: 100%; }
    .slide.active { display: block; animation: fadeIn .18s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
    .grid-30-70 { display: grid; grid-template-columns: 4fr 6fr; gap: 48px; align-items: start; }
    @media (max-width: 900px) { .grid-30-70 { grid-template-columns: 1fr; gap: 28px; } }
    .eyebrow { color: var(--accent); font-weight: 600; font-size: 16px; margin-bottom: 8px; }
    h1 { font-size: 52px; line-height: 1.08; margin: 0 0 16px; }
    h2 { font-size: 38px; line-height: 1.15; margin: 0 0 14px; }
    .lead { font-size: 20px; color: var(--muted); margin: 0 0 18px; }
    .author { font-size: 17px; font-weight: 600; margin: 0 0 6px; }
    .disclaimer { font-size: 14px; color: var(--muted); margin: 0; }
    .muted { color: var(--muted); font-size: 17px; }
    .accent { color: var(--accent); font-weight: 700; }
    .stack { display: flex; flex-direction: column; gap: 18px; }
    .card { border: 1px solid var(--line); border-radius: 12px; padding: 22px; background: #fff; }
    .card-title { font-size: 19px; font-weight: 600; margin-bottom: 10px; }
    .code-box { background: #0f172a; color: #f8fafc; border-radius: 12px; padding: 20px 22px; font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 16px; white-space: pre-wrap; line-height: 1.6; }
    .list-box { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    .list-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding: 14px 6px; border-bottom: 1px solid var(--line); font-size: 17px; }
    .list-row:last-child { border-bottom: none; }
    .num { color: var(--accent); font-family: "IBM Plex Mono", monospace; font-weight: 700; margin-right: 12px; }
    table { width: 100%; border-collapse: collapse; font-family: "IBM Plex Mono", monospace; font-size: 18px; }
    th, td { text-align: left; padding: 14px 16px; border-bottom: 1px solid var(--line); }
    th { background: #f8fafc; color: var(--muted); font-size: 15px; }
    .q { font-weight: 600; font-size: 18px; margin: 0 0 10px; }
    .ans { color: var(--accent); font-weight: 600; font-size: 17px; margin: 10px 0 6px; }
    summary { cursor: pointer; font-size: 15px; font-weight: 600; color: var(--ink); }
    footer { height: 64px; border-top: 1px solid var(--line); padding: 0 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .controls { display: flex; gap: 10px; align-items: center; }
    button { border: 1px solid var(--line); background: #fff; color: var(--ink); padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    button:disabled { opacity: 0.4; cursor: default; }
    .foot-note { font-size: 12px; color: var(--muted); }
    @media print { footer, summary { display: none; } .slide { display: block !important; page-break-after: always; padding: 24px 0; } .stage { min-height: auto; display: block; } details { display: block; } }
  </style>
</head>
<body>
  <main class="stage">${slideSections.join('\n')}</main>
  <footer>
    <div class="controls">
      <span id="counter" class="mono">01 / ${total}</span>
      <button type="button" onclick="window.print()">Print / Save PDF</button>
    </div>
    <span class="foot-note">AI-generated page · Content &amp; slides by Mattheus Marcus Contreras</span>
    <div class="controls">
      <button id="prevBtn" type="button" onclick="go(-1)">Previous</button>
      <button id="nextBtn" class="primary" type="button" onclick="go(1)">Next</button>
    </div>
  </footer>
  <script>
    let idx = 1;
    const total = ${total};
    const slides = Array.from(document.querySelectorAll('.slide'));
    function show(n) {
      idx = Math.max(1, Math.min(total, n));
      slides.forEach((s, i) => s.classList.toggle('active', i + 1 === idx));
      document.getElementById('counter').textContent = String(idx).padStart(2, '0') + ' / ' + total;
      document.getElementById('prevBtn').disabled = idx === 1;
      document.getElementById('nextBtn').disabled = idx === total;
    }
    function go(d) { show(idx + d); }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') go(1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1);
    });
    show(1);
  </script>
</body>
</html>`;
}

export function downloadStandaloneSlidesHtml(): void {
  const html = buildStandaloneSlidesHtml();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'IT365_Lesson8_Multiple_Regression.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
