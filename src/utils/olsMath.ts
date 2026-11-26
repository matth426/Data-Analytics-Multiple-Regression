export interface DataPoint {
  id: number;
  x1: number; // Hours
  x2: number; // Quizzes
  y: number;  // Score
}

export const DEFAULT_DATASET: DataPoint[] = [
  { id: 1, x1: 1, x2: 1, y: 4 },
  { id: 2, x1: 2, x2: 3, y: 11 },
  { id: 3, x1: 3, x2: 2, y: 10 },
  { id: 4, x1: 4, x2: 4, y: 13 },
];

export interface OLSResult {
  n: number;
  k: number;
  dfModel: number;
  dfResid: number;
  X: number[][];
  y: number[];
  XtX: number[][];
  Xty: number[];
  detXtX: number;
  adjXtX: number[][]; // Integer/scaled adjugate when 3x3
  XtXInv: number[][];
  beta: number[];
  yHat: number[];
  residuals: number[];
  yBar: number;
  sse: number;
  sst: number;
  ssr: number;
  rSquared: number;
  adjRSquared: number;
  sSquared: number;
  se: number[];
  hc3Se: number[];
  tStats: number[];
  pValues: number[];
  hc3TStats: number[];
  hc3PValues: number[];
  fStat: number;
  fPValue: number;
  r12: number;
  vif1: number;
  vif2: number;
}

export function invertMatrix(mat: number[][]): { inv: number[][]; det: number } {
  const n = mat.length;
  // Compute determinant for 2x2 or 3x3 explicitly for numerical precision
  let det = 1;
  if (n === 2) {
    det = mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];
  } else if (n === 3) {
    det =
      mat[0][0] * (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]) -
      mat[0][1] * (mat[1][0] * mat[2][2] - mat[1][2] * mat[2][0]) +
      mat[0][2] * (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0]);
  }

  // Gauss-Jordan elimination
  const aug = mat.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
        maxRow = k;
      }
    }
    [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

    const pivot = aug[i][i];
    if (Math.abs(pivot) < 1e-12) {
      throw new Error('Matrix is singular');
    }

    for (let j = 0; j < 2 * n; j++) {
      aug[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = aug[k][i];
        for (let j = 0; j < 2 * n; j++) {
          aug[k][j] -= factor * aug[i][j];
        }
      }
    }
  }

  const inv = aug.map((row) => row.slice(n));
  return { inv, det };
}

function logGamma(z: number): number {
  const g = 7;
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) {
    x += p[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 100;
  const EPS = 3e-7;
  const FPMIN = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

export function regIncompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(a, b, x)) / a;
  }
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

export function tTestTwoTailedP(t: number, df: number): number {
  if (df <= 0 || !Number.isFinite(t)) return 1;
  if (df === 1) {
    return 1 - (2 / Math.PI) * Math.atan(Math.abs(t));
  }
  const x = df / (df + t * t);
  return regIncompleteBeta(df / 2, 0.5, x);
}

export function fTestPValue(f: number, df1: number, df2: number): number {
  if (df1 <= 0 || df2 <= 0 || f <= 0 || !Number.isFinite(f)) return 1;
  const x = df2 / (df2 + df1 * f);
  return regIncompleteBeta(df2 / 2, df1 / 2, x);
}

export function chiSqPValue(x: number, df: number): number {
  if (x <= 0 || df <= 0) return 1;
  // Gamma regularized upper incomplete approximation via series/continued fraction for df=2
  if (df === 2) {
    return Math.exp(-x / 2);
  }
  // General Wilson-Hilferty approximation for chi-sq
  const z = (Math.pow(x / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df));
  return 0.5 * (1 - erf(z / Math.SQRT2));
}

function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
  return sign * y;
}

export function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const vx = xs[i] - mx;
    const vy = ys[i] - my;
    num += vx * vy;
    dx += vx * vx;
    dy += vy * vy;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

export function computeOLS(data: DataPoint[], includeIntercept = true): OLSResult {
  const n = data.length;
  const k = 2;
  const X = data.map((d) => (includeIntercept ? [1, d.x1, d.x2] : [d.x1, d.x2]));
  const p = X[0].length;
  const y = data.map((d) => d.y);

  const XtX: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  const Xty: number[] = Array(p).fill(0);

  for (let i = 0; i < n; i++) {
    for (let r = 0; r < p; r++) {
      Xty[r] += X[i][r] * y[i];
      for (let c = 0; c < p; c++) {
        XtX[r][c] += X[i][r] * X[i][c];
      }
    }
  }

  const { inv: XtXInv, det: detXtX } = invertMatrix(XtX);
  const adjXtX = XtXInv.map((row) => row.map((v) => Math.round(v * detXtX * 1e6) / 1e6));

  const beta = Array(p).fill(0);
  for (let r = 0; r < p; r++) {
    for (let c = 0; c < p; c++) {
      beta[r] += XtXInv[r][c] * Xty[c];
    }
  }

  const yHat = X.map((row) => row.reduce((sum, val, idx) => sum + val * beta[idx], 0));
  const residuals = y.map((val, i) => val - yHat[i]);
  const yBar = y.reduce((a, b) => a + b, 0) / n;

  const sse = residuals.reduce((s, e) => s + e * e, 0);
  const sst = includeIntercept
    ? y.reduce((s, val) => s + (val - yBar) ** 2, 0)
    : y.reduce((s, val) => s + val ** 2, 0);
  const ssr = Math.max(0, sst - sse);

  const dfModel = k;
  const dfResid = n - p;
  const rSquared = sst === 0 ? 1 : 1 - sse / sst;
  const adjRSquared =
    dfResid <= 0 || sst === 0
      ? 0
      : 1 - (sse / dfResid) / (sst / (includeIntercept ? n - 1 : n));
  const sSquared = dfResid > 0 ? sse / dfResid : 0;

  const se = XtXInv.map((row, j) => Math.sqrt(Math.max(0, sSquared * row[j])));
  const tStats = beta.map((b, j) => (se[j] > 0 ? b / se[j] : 0));
  const pValues = tStats.map((t) => tTestTwoTailedP(t, dfResid));

  // HC3 White/MacKinnon robust standard errors
  const h = X.map((xi) => {
    let val = 0;
    for (let r = 0; r < p; r++) {
      for (let c = 0; c < p; c++) {
        val += xi[r] * XtXInv[r][c] * xi[c];
      }
    }
    return Math.min(0.99, val);
  });

  const meat: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  for (let i = 0; i < n; i++) {
    const w = (residuals[i] / (1 - h[i])) ** 2;
    for (let r = 0; r < p; r++) {
      for (let c = 0; c < p; c++) {
        meat[r][c] += w * X[i][r] * X[i][c];
      }
    }
  }
  const temp: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  for (let r = 0; r < p; r++) {
    for (let c = 0; c < p; c++) {
      for (let m = 0; m < p; m++) {
        temp[r][c] += XtXInv[r][m] * meat[m][c];
      }
    }
  }
  const hc3Cov: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  for (let r = 0; r < p; r++) {
    for (let c = 0; c < p; c++) {
      for (let m = 0; m < p; m++) {
        hc3Cov[r][c] += temp[r][m] * XtXInv[m][c];
      }
    }
  }
  const hc3Se = hc3Cov.map((row, j) => Math.sqrt(Math.max(0, row[j])));
  const hc3TStats = beta.map((b, j) => (hc3Se[j] > 0 ? b / hc3Se[j] : 0));
  const hc3PValues = hc3TStats.map((t) => tTestTwoTailedP(t, dfResid));

  const fStat = dfResid > 0 && sse > 0 ? (ssr / dfModel) / (sse / dfResid) : 0;
  const fPValue = fTestPValue(fStat, dfModel, dfResid);

  const r12 = pearsonCorrelation(
    data.map((d) => d.x1),
    data.map((d) => d.x2)
  );
  const vif = 1 / Math.max(1e-6, 1 - r12 * r12);

  return {
    n,
    k,
    dfModel,
    dfResid,
    X,
    y,
    XtX,
    Xty,
    detXtX,
    adjXtX,
    XtXInv,
    beta,
    yHat,
    residuals,
    yBar,
    sse,
    sst,
    ssr,
    rSquared,
    adjRSquared,
    sSquared,
    se,
    hc3Se,
    tStats,
    pValues,
    hc3TStats,
    hc3PValues,
    fStat,
    fPValue,
    r12,
    vif1: vif,
    vif2: vif,
  };
}

export function computeBreuschPagan(data: DataPoint[], residuals: number[]): { lm: number; pValue: number } {
  const n = data.length;
  const e2 = residuals.map((r) => r * r);
  const auxData = data.map((d, i) => ({ ...d, y: e2[i] }));
  const auxOls = computeOLS(auxData, true);
  const lm = n * auxOls.rSquared;
  const pValue = chiSqPValue(lm, 2);
  return { lm, pValue };
}

export function generateSyntheticDiagnosticsData(heteroscedastic: boolean): DataPoint[] {
  // Deterministic pseudo-random realistic n=40 dataset for diagnostics demo
  const points: DataPoint[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const randNorm = () => {
    const u1 = Math.max(1e-6, rand());
    const u2 = rand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  for (let i = 0; i < 40; i++) {
    const x1 = 1 + (i / 39) * 9 + (rand() - 0.5) * 1.2;
    const x2 = 0.6 * x1 + 1.5 + randNorm() * 1.3;
    const baseY = 12 + 4.5 * x1 + 3.2 * x2;
    const spread = heteroscedastic ? 0.6 + 0.14 * (baseY - 20) : 3.2;
    const y = baseY + randNorm() * spread;
    points.push({
      id: i + 1,
      x1: Number(x1.toFixed(2)),
      x2: Number(x2.toFixed(2)),
      y: Number(y.toFixed(2)),
    });
  }
  return points;
}
