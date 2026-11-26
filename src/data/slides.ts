export type ChapterId = 'overview' | 'theory' | 'manual' | 'python' | 'diagnostics';

export interface SlideMeta {
  index: number; // 1-based (1..17)
  chapter: ChapterId;
  chapterLabel: string;
  title: string;
  subtitle: string;
  discussionPrompt: string;
  lectureNotes: string[];
}

export const CHAPTERS: { id: ChapterId; label: string; startSlide: number }[] = [
  { id: 'overview', label: 'Overview', startSlide: 1 },
  { id: 'theory', label: 'Theory & Matrix', startSlide: 4 },
  { id: 'manual', label: 'By Hand', startSlide: 7 },
  { id: 'python', label: 'Python', startSlide: 11 },
  { id: 'diagnostics', label: 'Diagnostics', startSlide: 14 },
];

export const SLIDES: SlideMeta[] = [
  {
    index: 1,
    chapter: 'overview',
    chapterLabel: 'Overview',
    title: 'Multiple Regression Analysis',
    subtitle: 'Linear algebra by hand, then sklearn and statsmodels',
    discussionPrompt: 'Ask students what happens when one predictor is not enough to explain an outcome.',
    lectureNotes: [
      'Course: IT365 - Data Analytics 1, Lesson 8 (Mattheus Marcus Contreras).',
      'Road map: We start with geometric intuition, solve a small 4-student dataset completely by hand using matrix algebra, verify it in Python, and finish with diagnostics.',
      'Drag the 3D regression plane on the right to preview how two predictors tilt a flat surface through data.',
    ],
  },
  {
    index: 2,
    chapter: 'overview',
    chapterLabel: 'Overview',
    title: 'Learning Objectives',
    subtitle: 'Five core skills you will master by the end of Lesson 8',
    discussionPrompt: 'Click any objective to jump directly to its interactive demonstration.',
    lectureNotes: [
      'Highlight the arc from theory (matrix form) to manual computation (exact β̂) to software fluency (sklearn vs statsmodels).',
      'Emphasize that understanding (XᵀX)⁻¹ by hand makes diagnostics like multicollinearity immediately obvious later.',
    ],
  },
  {
    index: 3,
    chapter: 'overview',
    chapterLabel: 'Overview',
    title: 'Warm-Up: Predict before we Calculate',
    subtitle: 'Building intuition around partial effects and model complexity',
    discussionPrompt: 'Let students vote before clicking Reveal Answer on each question.',
    lectureNotes: [
      'Q1 intuition: Students who study more often take more practice quizzes. In simple regression, Hours steals credit for Quizzes (omitted variable bias). Controlling for Quizzes isolates Hours alone.',
      'Q2 intuition: Adding noisy or redundant predictors eats degrees of freedom (n − k − 1) and inflates coefficient variance, even if training R² goes up.',
    ],
  },
  {
    index: 4,
    chapter: 'theory',
    chapterLabel: 'Theory & Matrix',
    title: 'What is Multiple Regression?',
    subtitle: 'Fitting a plane (or hyperplane) across k predictors simultaneously',
    discussionPrompt: 'Toggle "Hold x₂ constant" to demonstrate what "others fixed" looks like geometrically.',
    lectureNotes: [
      'Simple regression fits a 1D line in 2D space. Two predictors fit a flat 2D plane in 3D space.',
      'Every βⱼ is a partial slope: slice the plane parallel to the xⱼ axis while locking all other predictors.',
    ],
  },
  {
    index: 5,
    chapter: 'theory',
    chapterLabel: 'Theory & Matrix',
    title: 'Assumptions to Check',
    subtitle: 'LINE assumptions plus predictor independence',
    discussionPrompt: 'Which assumption is brand new compared with simple linear regression?',
    lectureNotes: [
      'Click each assumption in the interactive panel to inspect a clean vs. violated pattern.',
      'Answer: "No severe multicollinearity" is new because simple regression only has a single x variable.',
      'Remind students: Normal residuals matter primarily for finite-sample t/F p-values, not for unbiased β̂.',
    ],
  },
  {
    index: 6,
    chapter: 'theory',
    chapterLabel: 'Theory & Matrix',
    title: 'Matrix Form',
    subtitle: 'Stacking n observations into normal equations',
    discussionPrompt: 'Why must XᵀX be invertible for a unique OLS solution?',
    lectureNotes: [
      'Adding the column of 1s turns the intercept β₀ into just another weight in the vector β.',
      'Geometric insight: Setting gradient of SSE to 0 yields Xᵀ(y − Xβ̂) = 0 — residuals are orthogonal to every column of X.',
      'If two columns of X are exact multiples (or k+1 > n), det(XᵀX) = 0 and infinitely many planes tie for minimum SSE.',
    ],
  },
  {
    index: 7,
    chapter: 'manual',
    chapterLabel: 'By Hand',
    title: 'Practice Dataset',
    subtitle: '4 students, 2 predictors (Hours, Quizzes), and Exam Score',
    discussionPrompt: 'What are the sizes of X and y? How many degrees of freedom are left?',
    lectureNotes: [
      'With n = 4 observations and k = 2 predictors plus 1 intercept, we estimate 3 parameters.',
      'X is 4 × 3 (column of 1s, Hours, Quizzes). y is 4 × 1.',
      'Degrees of freedom left: n − k − 1 = 4 − 2 − 1 = 1 df. Warn students: 1 df means statistical power will be tiny!',
    ],
  },
  {
    index: 8,
    chapter: 'manual',
    chapterLabel: 'By Hand',
    title: 'Manual Step 1: Build X, XᵀX, Xᵀy',
    subtitle: 'Computing cross-products from the design matrix',
    discussionPrompt: 'Click the highlighted 29 cell (or press Animate) to trace Σ x₁·x₂.',
    lectureNotes: [
      'Notice the symmetry of XᵀX: diagonal entries are n, Σx₁², and Σx₂².',
      'Off-diagonal entries are sums and cross-products: Σx₁ = 10, Σx₂ = 10, and Σx₁x₂ = 1·1 + 2·3 + 3·2 + 4·4 = 29.',
      'Have students verify Xᵀy = [38, 108, 109]ᵀ row by row.',
    ],
  },
  {
    index: 9,
    chapter: 'manual',
    chapterLabel: 'By Hand',
    title: 'Manual Step 2: Invert and Solve',
    subtitle: 'Finding (XᵀX)⁻¹ and solving β̂ = (XᵀX)⁻¹ Xᵀy',
    discussionPrompt: 'Use the interactive predictor for Hours = 3, Quizzes = 4 to verify ŷ = 13.',
    lectureNotes: [
      'det(XᵀX) = 36 (nonzero, so the matrix is invertible).',
      'Multiplying (1/36) adj(XᵀX) by [38, 108, 109]ᵀ gives exact integers β̂ = [2, 1, 2]ᵀ!',
      'Interpretation: +1 hour studied adds +1 point (holding quizzes fixed); +1 quiz adds +2 points (holding hours fixed).',
    ],
  },
  {
    index: 10,
    chapter: 'manual',
    chapterLabel: 'By Hand',
    title: 'Manual Step 3: Fit Quality',
    subtitle: 'Variance decomposition, Adjusted R², standard errors, and t-tests',
    discussionPrompt: 'Compare R² = 0.911 vs Adjusted R² = 0.733 and inspect t = 0.67 on df = 1.',
    lectureNotes: [
      'SST = 45 splits into SSR = 41 (explained by the plane) and SSE = 4 (residual error).',
      'Because n = 4 and k = 2, df = 1 makes s² = 4/1 = 4, and SE(β₁) = √(4 · 20/36) = 1.49.',
      'With df = 1, the two-tailed 5% critical t value is ±12.71! So t = 0.67 is nowhere near statistical significance.',
    ],
  },
  {
    index: 11,
    chapter: 'python',
    chapterLabel: 'Python',
    title: 'sklearn and NumPy',
    subtitle: 'Automated intercept vs manual design matrix in Python',
    discussionPrompt: 'sklearn adds the intercept for you. Does NumPy?',
    lectureNotes: [
      'Step through each line of code to compare np.linalg.solve against LinearRegression().fit(X, y).',
      'Toggle the "Omit np.ones(4)" demo to show how forcing the plane through (0, 0, 0) distorts the slope.',
    ],
  },
  {
    index: 12,
    chapter: 'python',
    chapterLabel: 'Python',
    title: 'statsmodels',
    subtitle: 'Prediction workflows vs statistical inference workflows',
    discussionPrompt: 'Why do data scientists reach for statsmodels when they need p-values?',
    lectureNotes: [
      'Unlike sklearn, statsmodels requires sm.add_constant(X) explicitly just like NumPy.',
      'Remember the slogan: sklearn predicts (clean pipeline, ML metrics), statsmodels explains (SE, t, p, F, CIs, diagnostics).',
    ],
  },
  {
    index: 13,
    chapter: 'python',
    chapterLabel: 'Python',
    title: 'Reading the Output',
    subtitle: 'Connecting statsmodels OLS tables back to our hand calculations',
    discussionPrompt: 'Why can R² be high (0.911) while nothing is statistically significant?',
    lectureNotes: [
      'Click any of the four summary cards to spotlight that exact region of the OLS output table.',
      'High R² + non-significant t/F is the classic signature of fitting too many correlated predictors on a very small sample (1 df left).',
    ],
  },
  {
    index: 14,
    chapter: 'diagnostics',
    chapterLabel: 'Diagnostics',
    title: 'Multicollinearity',
    subtitle: 'When predictors overlap, coefficients wobble while predictions stay intact',
    discussionPrompt: 'Our data has r = 0.8 → VIF = 2.78. Is 2.78 a problem by standard rules of thumb?',
    lectureNotes: [
      'Drag the correlation slider r toward 0.98 and watch VIF explode and β̂₁, β̂₂ swing wildly or flip signs across samples.',
      'Crucial distinction: Predictions ŷ remain accurate inside the data cloud, but individual βⱼ interpretations break down.',
      'VIF = 2.78 is below the 5 (concern) and 10 (severe) thresholds, so multicollinearity alone is moderate here.',
    ],
  },
  {
    index: 15,
    chapter: 'diagnostics',
    chapterLabel: 'Diagnostics',
    title: 'Homoscedasticity',
    subtitle: 'Equal residual spread across fitted values',
    discussionPrompt: 'Morph between Even Band and Funnel and draw samples to compare β̂ vs SE.',
    lectureNotes: [
      'Constant variance Var(ε) = σ² is assumed by standard OLS SE formulas.',
      'Key theorem: Under heteroscedasticity, OLS β̂ stays unbiased on average, but classical SE, t, and p-values become misleading.',
    ],
  },
  {
    index: 16,
    chapter: 'diagnostics',
    chapterLabel: 'Diagnostics',
    title: 'Diagnostics in Python',
    subtitle: 'VIF, Breusch-Pagan test, residual scatter, and HC3 robust standard errors',
    discussionPrompt: 'Switch between our n=4 data and an n=40 sample to test Breusch-Pagan and HC3.',
    lectureNotes: [
      'Our n = 4 dataset has residuals [-1, 1, 1, -1] of identical magnitude — no hypothesis test has power at n = 4.',
      'On realistic data (n = 40), toggling heteroscedasticity drops Breusch-Pagan p below 0.05; switching to cov_type="HC3" corrects SEs without changing β̂.',
    ],
  },
  {
    index: 17,
    chapter: 'diagnostics',
    chapterLabel: 'Diagnostics',
    title: 'Pitfalls and Recap',
    subtitle: 'Key takeaways and live interactive exercise (y₄ = 14)',
    discussionPrompt: 'Exercise: Change y₄ from 13 to 14 and watch Xᵀy, β̂, and R² recompute live.',
    lectureNotes: [
      'Summarize the three pitfalls: Multicollinearity (check VIF), Overfitting (check Adj R² and df), Causation (regression shows association only).',
      'Toggle y₄ = 14 in the interactive exercise lab so the class can check their hand-worked numbers: β̂ becomes [17/12, 7/6, 13/6] ≈ [1.42, 1.17, 2.17] and R² jumps to 0.957.',
    ],
  },
];
