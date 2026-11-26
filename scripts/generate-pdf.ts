import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { computeOLS, DEFAULT_DATASET } from '../src/utils/olsMath';

const W = 960;
const H = 540;

const C = {
  bg: '#FFFFFF',
  ink: '#0F172A',
  muted: '#475569',
  subtle: '#94A3B8',
  line: '#E2E8F0',
  softBg: '#F8FAFC',
  darkBg: '#0F172A',
  darkText: '#F8FAFC',
  accent: '#047857',
  accentBright: '#059669',
  accentSoft: '#ECFDF5',
};

const FONT_PATHS = {
  sans: fs.existsSync('/tmp/IBMPlexSans-Regular.ttf')
    ? '/tmp/IBMPlexSans-Regular.ttf'
    : '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  sansSemi: fs.existsSync('/tmp/IBMPlexSans-SemiBold.ttf')
    ? '/tmp/IBMPlexSans-SemiBold.ttf'
    : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  sansBold: fs.existsSync('/tmp/IBMPlexSans-Bold.ttf')
    ? '/tmp/IBMPlexSans-Bold.ttf'
    : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  mono: fs.existsSync('/tmp/IBMPlexMono-Regular.ttf')
    ? '/tmp/IBMPlexMono-Regular.ttf'
    : '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
  monoBold: fs.existsSync('/tmp/IBMPlexMono-SemiBold.ttf')
    ? '/tmp/IBMPlexMono-SemiBold.ttf'
    : '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',
  mathFallback: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  mathMonoFallback: '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
};

// Helper: draw clean text using DejaVuSans when string contains math superscripts/Greek, else IBM Plex Sans
function setFontForText(
  doc: PDFKit.PDFDocument,
  text: string,
  style: 'sans' | 'sansSemi' | 'sansBold' | 'mono' | 'monoBold'
) {
  const hasSpecialMath = /[βŷᵀ₀₁₂ⱼ⁻¹²√Σ≈±→ε̂]/.test(text);
  if (hasSpecialMath) {
    if (style === 'mono' || style === 'monoBold') {
      // DejaVuSansMono lacks β/Σ/ε; DejaVuSans has ALL math symbols cleanly
      doc.font(FONT_PATHS.mathFallback);
    } else {
      doc.font(FONT_PATHS.mathFallback);
    }
  } else {
    doc.font(FONT_PATHS[style]);
  }
}

function txt(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  opts: {
    size?: number;
    color?: string;
    style?: 'sans' | 'sansSemi' | 'sansBold' | 'mono' | 'monoBold';
    width?: number;
    align?: 'left' | 'center' | 'right';
    lineGap?: number;
  } = {}
) {
  const { size = 14, color = C.ink, style = 'sans', width, align = 'left', lineGap = 3 } = opts;
  setFontForText(doc, text, style);
  doc.fontSize(size).fillColor(color);
  if (width !== undefined) {
    doc.text(text, x, y, { width, align, lineGap });
  } else {
    doc.text(text, x, y, { lineGap });
  }
}

function card(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { fill?: string; stroke?: string; radius?: number } = {}
) {
  const { fill = C.bg, stroke = C.line, radius = 10 } = opts;
  doc.save();
  doc.roundedRect(x, y, w, h, radius);
  if (fill) {
    doc.fillColor(fill).fill();
    doc.roundedRect(x, y, w, h, radius);
  }
  if (stroke) {
    doc.lineWidth(1).strokeColor(stroke).stroke();
  }
  doc.restore();
}

function slideChrome(
  doc: PDFKit.PDFDocument,
  slideNum: number,
  total: number,
  kicker: string,
  title: string
) {
  // Subtle top metadata
  if (slideNum > 1) {
    txt(doc, `IT365 — Data Analytics 1  ·  Lesson 8  ·  Slide ${String(slideNum).padStart(2, '0')} / ${total}`, 52, 28, {
      size: 11,
      color: C.muted,
      style: 'sans',
    });
    // Left column header
    txt(doc, kicker, 52, 64, { size: 13, color: C.accent, style: 'sansSemi' });
    txt(doc, title, 52, 86, { size: 28, color: C.ink, style: 'sansBold', width: 295, lineGap: 2 });
  }

  // Quiet bottom progress line & attribution
  doc.save();
  doc.rect(0, H - 3, W, 3).fill(C.line);
  doc.rect(0, H - 3, (W * slideNum) / total, 3).fill(C.accent);
  doc.restore();

  if (slideNum > 1) {
    txt(doc, 'AI-generated PDF · Content & slides by Mattheus Marcus Contreras', 52, H - 22, {
      size: 9.5,
      color: C.subtle,
    });
    txt(doc, `${String(slideNum).padStart(2, '0')} / ${total}`, W - 105, H - 22, {
      size: 10,
      color: C.muted,
      style: 'mono',
      width: 53,
      align: 'right',
    });
  }
}

function draw3DPlane(
  doc: PDFKit.PDFDocument,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  beta: [number, number, number],
  opts: {
    showResiduals?: boolean;
    sliceX2?: number | null;
    predicted?: { x1: number; x2: number; y: number } | null;
    caption?: string;
  } = {}
) {
  const { showResiduals = true, sliceX2 = null, predicted = null, caption } = opts;
  card(doc, boxX, boxY, boxW, boxH, { fill: C.bg, stroke: C.line, radius: 10 });

  const plotH = caption ? boxH - 36 : boxH;
  const cx = boxX + boxW * 0.50;
  const cy = boxY + plotH * 0.56;
  const scale = Math.min(boxW * 0.135, plotH * 0.165);
  const yaw = 0.68;
  const pitch = 0.42;

  const project = (x1: number, x2: number, y: number) => {
    const nx = x1 - 2.5;
    const nz = x2 - 2.5;
    const ny = (y - 7.5) * 0.30;

    const rx = nx * Math.cos(yaw) - nz * Math.sin(yaw);
    const rz = nx * Math.sin(yaw) + nz * Math.cos(yaw);
    const ry = ny * Math.cos(pitch) - rz * Math.sin(pitch);
    const depth = ny * Math.sin(pitch) + rz * Math.cos(pitch);
    const p = 1 / (1 + depth * 0.055);
    return { x: cx + rx * scale * p, y: cy - ry * scale * p, depth };
  };

  doc.save();
  // Base grid
  for (let i = 0; i <= 5; i++) {
    const p1 = project(i, 0, 0);
    const p2 = project(i, 5, 0);
    doc.lineWidth(i === 0 ? 1.2 : 0.7).strokeColor(i === 0 ? '#94A3B8' : '#E2E8F0');
    doc.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y).stroke();

    const q1 = project(0, i, 0);
    const q2 = project(5, i, 0);
    doc.moveTo(q1.x, q1.y).lineTo(q2.x, q2.y).stroke();
  }

  // y-axis
  const y0 = project(0, 0, 0);
  const yTopProj = project(0, 0, 14.0);
  const yTopY = Math.max(boxY + 24, yTopProj.y);
  doc.lineWidth(1.2).strokeColor('#64748B').moveTo(y0.x, y0.y).lineTo(yTopProj.x, yTopY).stroke();

  const x1End = project(5.2, 0, 0);
  const x2End = project(0, 5.2, 0);
  txt(doc, 'x₁ Hours', x1End.x - 16, x1End.y + 4, { size: 9.5, color: C.muted });
  txt(doc, 'x₂ Quizzes', x2End.x - 32, Math.min(boxY + plotH - 16, x2End.y + 3), { size: 9.5, color: C.muted });
  txt(doc, 'y Score', yTopProj.x - 20, yTopY - 15, { size: 10, color: C.ink, style: 'sansSemi' });

  const evalY = (x1: number, x2: number) => beta[0] + beta[1] * x1 + beta[2] * x2;

  // Plane grid
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps; j++) {
      const x1a = (i / steps) * 5;
      const x1b = ((i + 1) / steps) * 5;
      const x2a = (j / steps) * 5;
      const x2b = ((j + 1) / steps) * 5;
      const c1 = project(x1a, x2a, evalY(x1a, x2a));
      const c2 = project(x1b, x2a, evalY(x1b, x2a));
      const c3 = project(x1b, x2b, evalY(x1b, x2b));
      const c4 = project(x1a, x2b, evalY(x1a, x2b));
      doc
        .polygon([c1.x, c1.y], [c2.x, c2.y], [c3.x, c3.y], [c4.x, c4.y])
        .fillOpacity(0.05)
        .fillColor(C.ink)
        .fill();
      doc
        .polygon([c1.x, c1.y], [c2.x, c2.y], [c3.x, c3.y], [c4.x, c4.y])
        .lineWidth(0.6)
        .strokeOpacity(0.25)
        .strokeColor(C.ink)
        .stroke();
    }
  }
  doc.fillOpacity(1).strokeOpacity(1);

  if (sliceX2 !== null) {
    const s1 = project(0, sliceX2, evalY(0, sliceX2));
    const s2 = project(5, sliceX2, evalY(5, sliceX2));
    doc.lineWidth(2.6).strokeColor(C.accentBright).moveTo(s1.x, s1.y).lineTo(s2.x, s2.y).stroke();
    txt(doc, `x₂=${sliceX2} fixed (β₁=${beta[1].toFixed(1)})`, s1.x - 16, s1.y + 6, {
      size: 10,
      color: C.accent,
    });
  }

  const labelOffsets: Record<number, [number, number]> = {
    1: [7, -4],
    2: [-70, -10],
    3: [10, 3],
    4: [6, -26],
  };

  for (const pt of DEFAULT_DATASET) {
    const yHat = evalY(pt.x1, pt.x2);
    const pa = project(pt.x1, pt.x2, pt.y);
    const ph = project(pt.x1, pt.x2, yHat);
    if (showResiduals) {
      doc
        .lineWidth(1.3)
        .strokeColor('#64748B')
        .dash(3, { space: 2 })
        .moveTo(pa.x, pa.y)
        .lineTo(ph.x, ph.y)
        .stroke()
        .undash();
      doc.circle(ph.x, ph.y, 3).fillColor(C.accentBright).fill();
    }
    doc.circle(pa.x, pa.y, 4.5).fillColor(C.ink).fill();
    doc.circle(pa.x, pa.y, 4.5).lineWidth(1.2).strokeColor('#FFFFFF').stroke();
    const [dx, dy] = labelOffsets[pt.id] ?? [7, -6];
    txt(doc, `#${pt.id} (${pt.x1},${pt.x2},${pt.y})`, pa.x + dx, pa.y + dy, {
      size: 9,
      color: C.ink,
    });
  }

  if (predicted) {
    const pp = project(predicted.x1, predicted.x2, predicted.y);
    const pb = project(predicted.x1, predicted.x2, 0);
    doc
      .lineWidth(1.2)
      .strokeColor(C.accentBright)
      .dash(3, { space: 2 })
      .moveTo(pb.x, pb.y)
      .lineTo(pp.x, pp.y)
      .stroke()
      .undash();
    doc.circle(pp.x, pp.y, 5.5).fillColor(C.accentBright).fill();
    doc.circle(pp.x, pp.y, 5.5).lineWidth(1.5).strokeColor('#FFFFFF').stroke();
    doc.lineWidth(0.9).strokeColor(C.accentBright).moveTo(pp.x, pp.y - 6).lineTo(pp.x - 6, pp.y - 24).stroke();
    txt(doc, `ŷ = ${predicted.y.toFixed(1)}`, pp.x - 24, pp.y - 38, {
      size: 10.5,
      color: C.accent,
    });
  }

  if (caption) {
    doc.lineWidth(1).strokeColor(C.line).moveTo(boxX, boxY + boxH - 34).lineTo(boxX + boxW, boxY + boxH - 34).stroke();
    txt(doc, caption, boxX + 16, boxY + boxH - 24, { size: 10.5, color: C.muted, width: boxW - 32 });
  }
  doc.restore();
}

function generate() {
  const outDir = path.resolve(process.cwd(), 'public/assets');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'IT365_Lesson8_Multiple_Regression.pdf');

  const doc = new PDFDocument({
    size: [W, H],
    margin: 0,
    info: {
      Title: 'IT365 Lesson 8: Multiple Regression Analysis',
      Author: 'Mattheus Marcus Contreras',
      Subject: 'Multiple Regression Analysis — Linear Algebra, sklearn, statsmodels, Diagnostics',
    },
  });

  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const total = 17;
  const ols = computeOLS(DEFAULT_DATASET, true);

  // ================= SLIDE 1 =================
  slideChrome(doc, 1, total, '', '');
  txt(doc, 'IT365 — Data Analytics 1  ·  Lesson 8', 52, 82, { size: 15, color: C.accent, style: 'sansSemi' });
  txt(doc, 'Multiple\nRegression\nAnalysis', 52, 114, { size: 38, color: C.ink, style: 'sansBold', width: 340, lineGap: 0 });
  txt(doc, 'Linear algebra by hand, then sklearn and statsmodels.', 52, 272, { size: 16.5, color: C.muted, width: 325, lineGap: 4 });
  txt(doc, 'Mattheus Marcus Contreras', 52, 348, { size: 15, color: C.ink, style: 'sansSemi' });
  txt(
    doc,
    'Disclaimer: AI was used to generate this PDF and interactive web page; the lesson content and slides were created by Mattheus Marcus Contreras.',
    52,
    374,
    { size: 11, color: C.muted, width: 325, lineGap: 3 }
  );
  draw3DPlane(doc, 410, 56, 498, 420, [2, 1, 2], {
    showResiduals: true,
    caption: 'OLS Surface: ŷ = 2 + 1·Hours + 2·Quizzes',
  });

  // ================= SLIDE 2 =================
  doc.addPage();
  slideChrome(doc, 2, total, 'Lesson Roadmap', 'Learning Objectives');
  txt(doc, 'At the end of this lesson, students should be able to complete five core tasks.', 52, 175, {
    size: 15,
    color: C.muted,
    width: 280,
    lineGap: 4,
  });

  const objs = [
    ['01', 'Explain what multiple regression models', 'ŷ = β₀ + β₁x₁ + … + βₖxₖ'],
    ['02', 'Write the model in matrix form', 'β̂ = (XᵀX)⁻¹ Xᵀy'],
    ['03', 'Solve for β̂ by hand with linear algebra', 'β̂ = [2, 1, 2]ᵀ'],
    ['04', 'Fit the model in sklearn and statsmodels', 'LinearRegression vs sm.OLS'],
    ['05', 'Read R², adjusted R², t-tests, and p-values', 'R² = 0.911 · Adj R² = 0.733'],
  ];
  objs.forEach(([num, label, formula], i) => {
    const y = 78 + i * 78;
    doc.lineWidth(1).strokeColor(C.line).moveTo(380, y + 66).lineTo(908, y + 66).stroke();
    txt(doc, num, 384, y + 18, { size: 16, color: C.accent, style: 'monoBold' });
    txt(doc, label, 424, y + 16, { size: 16, color: C.ink, style: 'sansSemi', width: 290 });
    txt(doc, formula, 710, y + 19, { size: 12.5, color: C.muted, width: 196, align: 'right' });
  });

  // ================= SLIDE 3 =================
  doc.addPage();
  slideChrome(doc, 3, total, 'Intuition First', 'Warm-Up: Predict before we Calculate');
  txt(doc, 'Exam score depends on hours studied.', 52, 175, { size: 16, color: C.muted, width: 290 });

  card(doc, 52, 225, 300, 140);
  txt(doc, 'Q1: If we also know practice quizzes taken, should the hours coefficient change?', 68, 240, {
    size: 13.5,
    color: C.ink,
    style: 'sansSemi',
    width: 268,
  });
  txt(doc, 'Yes. Each coefficient is the effect of one variable while the others are held constant.', 68, 305, {
    size: 12.5,
    color: C.accent,
    width: 268,
  });

  card(doc, 52, 382, 300, 105);
  txt(doc, 'Q2: Can one extra predictor ever hurt the model?', 68, 396, {
    size: 13.5,
    color: C.ink,
    style: 'sansSemi',
    width: 268,
  });
  txt(doc, 'Yes — it costs degrees of freedom (n − k − 1) and can inflate standard errors.', 68, 438, {
    size: 12,
    color: C.accent,
    width: 268,
  });

  // Right SVG-style 2D plot: Simple vs Partial
  card(doc, 385, 76, 523, 412);
  txt(doc, 'Simple Slope (+2.60) vs. Partial Slope Controlling for Quizzes (+1.00)', 410, 98, {
    size: 15,
    color: C.ink,
    style: 'sansSemi',
  });
  const px0 = 445;
  const py0 = 420;
  const pw = 420;
  const ph = 260;
  const sx = (x: number) => px0 + ((x - 0.5) / 4) * pw;
  const sy = (y: number) => py0 - ((y - 2) / 14) * ph;
  doc.lineWidth(1.2).strokeColor('#94A3B8').moveTo(px0, py0).lineTo(px0 + pw, py0).stroke();
  doc.moveTo(px0, py0 - ph).lineTo(px0, py0).stroke();
  // Simple line
  doc.lineWidth(2.2).strokeColor(C.subtle).dash(5, { space: 4 }).moveTo(sx(0.8), sy(3 + 2.6 * 0.8)).lineTo(sx(4.2), sy(3 + 2.6 * 4.2)).stroke().undash();
  // Partial lines q=2, q=3
  [2, 3].forEach((q) => {
    doc.lineWidth(2.6).strokeColor(C.accentBright).moveTo(sx(0.8), sy(2 + 0.8 + 2 * q)).lineTo(sx(4.2), sy(2 + 4.2 + 2 * q)).stroke();
    txt(doc, `q=${q}`, sx(4.25), sy(2 + 4.2 + 2 * q) - 6, { size: 10.5, color: C.accent });
  });
  for (const pt of DEFAULT_DATASET) {
    doc.circle(sx(pt.x1), sy(pt.y), 5.5).fillColor(C.ink).fill();
    txt(doc, `(${pt.x1}h, Q=${pt.x2}, y=${pt.y})`, sx(pt.x1) + 8, sy(pt.y) - 6, { size: 10.5, color: C.ink });
  }
  txt(doc, 'Hours Studied (x₁)', px0 + pw / 2 - 55, py0 + 22, { size: 12, color: C.muted });
  txt(doc, 'Dashed = Simple (+2.60)  ·  Emerald = Holding Quizzes fixed (+1.00)', 410, 456, { size: 11.5, color: C.accent });

  // ================= SLIDE 4 =================
  doc.addPage();
  slideChrome(doc, 4, total, 'Model Definition', 'What is Multiple Regression?');
  txt(doc, 'Predict one numeric y from two or more predictors x.', 52, 175, { size: 15, color: C.muted, width: 295 });
  card(doc, 52, 222, 295, 54, { fill: C.softBg });
  txt(doc, 'ŷ = β₀ + β₁x₁ + β₂x₂ + … + βₖxₖ', 66, 240, { size: 13.5, color: C.ink });

  txt(doc, 'Simple: One x. Fits a line.', 52, 305, { size: 14, color: C.ink, width: 295 });
  txt(doc, 'Multiple: Many x. Fits a plane or hyperplane.', 52, 340, { size: 14, color: C.ink, width: 295 });
  txt(doc, 'βⱼ: Change in y per +1 in xⱼ, holding all others fixed.', 52, 385, { size: 14, color: C.accent, width: 295 });

  draw3DPlane(doc, 385, 76, 523, 412, [2, 1, 2], {
    showResiduals: true,
    sliceX2: 2,
    caption: 'Holding x₂ = 2 fixed isolates partial slope β₁ = 1.0 along the plane',
  });

  // ================= SLIDE 5 =================
  doc.addPage();
  slideChrome(doc, 5, total, 'Model Validity', 'Assumptions to Check');
  const assums = [
    'Linear relationship between each x and y',
    'Independent errors',
    'Constant variance of residuals',
    'Normal residuals (matters for p-values)',
    'No severe multicollinearity between predictors',
  ];
  assums.forEach((a, i) => {
    txt(doc, `•  ${a}`, 52, 175 + i * 38, {
      size: 13.5,
      color: i === 4 ? C.accent : C.ink,
      width: 300,
    });
  });

  card(doc, 52, 385, 300, 102);
  txt(doc, 'Which assumption is new vs. simple regression?', 66, 398, { size: 13, color: C.ink, style: 'sansSemi', width: 272 });
  txt(doc, 'No severe multicollinearity (simple regression has only one x).', 66, 440, { size: 12, color: C.accent, width: 272 });

  card(doc, 385, 76, 523, 412);
  txt(doc, 'Satisfied vs. Violated Diagnostics', 410, 98, { size: 16, color: C.ink, style: 'sansSemi' });
  // Good vs Bad mini plots (Linearity & Multicollinearity)
  card(doc, 410, 140, 228, 150, { fill: C.softBg });
  doc.circle(428, 161, 4).fillColor(C.accentBright).fill();
  txt(doc, 'Satisfied: Even Linear Band', 438, 154, { size: 11.5, color: C.accent, style: 'sansSemi' });
  doc.lineWidth(2).strokeColor(C.accentBright).moveTo(430, 260).lineTo(615, 192).stroke();
  [[445,252],[475,244],[505,228],[535,225],[565,208],[595,202]].forEach(([x,y]) => doc.circle(x,y,4).fillColor(C.ink).fill());

  card(doc, 656, 140, 228, 150, { fill: C.softBg });
  doc.polygon([674, 156], [679, 165], [669, 165]).fillColor(C.ink).fill();
  txt(doc, 'Violated: Non-Linear Curve', 684, 154, { size: 11.5, color: C.ink, style: 'sansSemi' });
  doc.lineWidth(1.5).strokeColor(C.subtle).dash(4,{space:3}).moveTo(676, 232).lineTo(864, 232).stroke().undash();
  [[682,262],[710,224],[740,196],[770,188],[800,198],[830,226],[856,264]].forEach(([x,y]) => doc.circle(x,y,4).fillColor(C.ink).fill());

  card(doc, 410, 310, 228, 150, { fill: C.softBg });
  doc.circle(428, 331, 4).fillColor(C.accentBright).fill();
  txt(doc, 'Satisfied: Independent x₁, x₂', 438, 324, { size: 11.5, color: C.accent });
  [[448,365],[472,425],[505,382],[532,434],[560,362],[592,410],[614,376]].forEach(([x,y]) => doc.circle(x,y,4).fillColor(C.accentBright).fill());

  card(doc, 656, 310, 228, 150, { fill: C.softBg });
  doc.polygon([674, 326], [679, 335], [669, 335]).fillColor(C.ink).fill();
  txt(doc, 'Violated: Severe Collinearity', 684, 324, { size: 11.5, color: C.ink, style: 'sansSemi' });
  doc.lineWidth(1.2).strokeColor(C.subtle).dash(3,{space:3}).moveTo(680, 442).lineTo(858, 354).stroke().undash();
  [[688,438],[716,424],[744,410],[772,396],[800,382],[828,368],[852,356]].forEach(([x,y]) => doc.circle(x,y,4).fillColor(C.ink).fill());

  // ================= SLIDE 6 =================
  doc.addPage();
  slideChrome(doc, 6, total, 'Linear Algebra', 'Matrix Form');
  txt(doc, 'Stack all n rows. Add a column of 1s to X for the intercept.', 52, 175, { size: 15, color: C.muted, width: 295 });
  txt(doc, 'X is n × (k+1)\ny is n × 1\nβ is (k+1) × 1', 52, 240, { size: 15, color: C.ink, width: 295, lineGap: 6 });

  card(doc, 52, 360, 300, 125);
  txt(doc, 'Why must XᵀX be invertible?', 68, 376, { size: 13.5, color: C.ink, style: 'sansSemi', width: 268 });
  txt(doc, 'So β̂ = (XᵀX)⁻¹ Xᵀy has a unique solution (linearly independent columns, n ≥ k + 1).', 68, 412, { size: 12, color: C.accent, width: 268 });

  card(doc, 385, 76, 523, 185, { fill: C.darkBg, stroke: C.darkBg });
  txt(doc, 'y = Xβ + ε\nNormal equation:  XᵀX β = Xᵀy\nSolution:         β̂ = (XᵀX)⁻¹ Xᵀy', 415, 112, {
    size: 20,
    color: C.darkText,
    width: 460,
    lineGap: 14,
  });

  card(doc, 385, 286, 523, 200);
  txt(doc, 'Calculus & Geometric Idea', 415, 310, { size: 17, color: C.accent, style: 'sansSemi' });
  txt(doc, '1. Choose β that minimizes SSE = Σ(y − ŷ)² = (y − Xβ)ᵀ(y − Xβ).', 415, 348, { size: 15, color: C.ink, width: 465 });
  txt(doc, '2. Setting the gradient to zero gives Xᵀ(y − Xβ̂) = 0.', 415, 388, { size: 15, color: C.ink, width: 465 });
  txt(doc, '3. Residual vector e = y − Xβ̂ is orthogonal to every column of X.', 415, 428, { size: 15, color: C.muted, width: 465 });

  // ================= SLIDE 7 =================
  doc.addPage();
  slideChrome(doc, 7, total, 'Working Example', 'Practice Dataset');
  txt(doc, 'Model: Score = β₀ + β₁·Hours + β₂·Quizzes\nn = 4, k = 2', 52, 175, { size: 14.5, color: C.ink, width: 295, lineGap: 6 });

  card(doc, 52, 275, 300, 145);
  txt(doc, 'What are the sizes of X and y? How many degrees of freedom are left?', 68, 292, {
    size: 13.5,
    color: C.ink,
    style: 'sansSemi',
    width: 268,
  });
  txt(doc, 'X is 4 × 3, y is 4 × 1, and df = n − k − 1 = 4 − 2 − 1 = 1.', 68, 355, {
    size: 13,
    color: C.accent,
    width: 268,
  });

  card(doc, 385, 76, 523, 330);
  const cols7 = ['Student', 'x₁ Hours', 'x₂ Quizzes', 'y Score'];
  const colX7 = [415, 535, 665, 800];
  doc.rect(385, 76, 523, 52).fill(C.softBg);
  cols7.forEach((h, i) => txt(doc, h, colX7[i], 94, { size: 14, color: i === 3 ? C.accent : C.muted, style: 'sansSemi' }));
  DEFAULT_DATASET.forEach((d, r) => {
    const ry = 148 + r * 62;
    doc.lineWidth(1).strokeColor(C.line).moveTo(385, ry - 14).lineTo(908, ry - 14).stroke();
    txt(doc, String(d.id), colX7[0], ry, { size: 17, color: C.muted });
    txt(doc, String(d.x1), colX7[1], ry, { size: 17, color: C.ink });
    txt(doc, String(d.x2), colX7[2], ry, { size: 17, color: C.ink });
    txt(doc, String(d.y), colX7[3], ry, { size: 17, color: C.accent, style: 'sansBold' });
  });

  // ================= SLIDE 8 =================
  doc.addPage();
  slideChrome(doc, 8, total, 'Manual Step 1', 'Build X, XᵀX, Xᵀy');
  txt(doc, 'Compute sums and cross-products from the 4×3 design matrix X.', 52, 175, { size: 15, color: C.muted, width: 295 });
  card(doc, 52, 260, 300, 150);
  txt(doc, 'Check: What does the 29 in XᵀX count?', 68, 278, { size: 14, color: C.ink, style: 'sansSemi', width: 268 });
  txt(doc, 'Σ(x₁ · x₂) = (1·1) + (2·3) + (3·2) + (4·4) = 1 + 6 + 6 + 16 = 29.', 68, 322, {
    size: 13.5,
    color: C.accent,
    width: 268,
  });

  card(doc, 385, 76, 523, 412, { fill: C.darkBg, stroke: C.darkBg });
  txt(
    doc,
    `X = [ 1  1  1;  1  2  3;  1  3  2;  1  4  4 ]
y = [ 4, 11, 10, 13 ]ᵀ

XᵀX = [  4   10   10
        10   30   29
        10   29   30 ]

Xᵀy = [ 38, 108, 109 ]ᵀ`,
    420,
    114,
    { size: 18, color: C.darkText, width: 460, lineGap: 10 }
  );

  // ================= SLIDE 9 =================
  doc.addPage();
  slideChrome(doc, 9, total, 'Manual Step 2', 'Invert and Solve');
  txt(doc, 'Fitted equation:\nŷ = 2 + 1·Hours + 2·Quizzes', 52, 175, { size: 16, color: C.accent, width: 295, lineGap: 8 });
  card(doc, 52, 275, 300, 130);
  txt(doc, 'Predict a student with 3 hours and 4 quizzes:', 68, 294, { size: 13.5, color: C.ink, style: 'sansSemi', width: 268 });
  txt(doc, 'ŷ = 2 + 1(3) + 2(4) = 13', 68, 344, { size: 17, color: C.accent });

  card(doc, 385, 76, 523, 160, { fill: C.darkBg, stroke: C.darkBg });
  txt(
    doc,
    `det(XᵀX) = 36
(XᵀX)⁻¹ = 1/36 · [  59  −10  −10;  −10  20  −16;  −10  −16  20 ]
β̂ = (XᵀX)⁻¹ Xᵀy = [ 2, 1, 2 ]ᵀ`,
    412,
    98,
    { size: 14.5, color: C.darkText, width: 475, lineGap: 10 }
  );
  draw3DPlane(doc, 385, 250, 523, 240, [2, 1, 2], {
    predicted: { x1: 3, x2: 4, y: 13 },
    caption: 'Predicted student (3 hrs, 4 quizzes) → Score ŷ = 13',
  });

  // ================= SLIDE 10 =================
  doc.addPage();
  slideChrome(doc, 10, total, 'Manual Step 3', 'Fit Quality');
  const metrics10 = [
    ['ŷ', '5, 10, 9, 14'],
    ['e = y − ŷ', '−1, 1, 1, −1'],
    ['SSE / SST / SSR', '4 / 45 / 41'],
    ['R² = 1 − 4/45', '0.911'],
    ['Adj R²', '0.733'],
    ['s² = SSE/(n−k−1)', '4 / 1 = 4'],
  ];
  metrics10.forEach(([k, v], i) => {
    const ry = 166 + i * 38;
    doc.lineWidth(0.8).strokeColor(C.line).moveTo(52, ry + 26).lineTo(345, ry + 26).stroke();
    txt(doc, k, 52, ry + 4, { size: 13, color: C.muted });
    txt(doc, v, 195, ry + 4, { size: 13.5, color: i === 4 ? C.accent : C.ink, width: 150, align: 'right' });
  });
  txt(doc, 'SE(βⱼ): expected sampling wobble in β̂ⱼ.\nt-value: signal-to-noise (β̂ⱼ / SE) testing H₀: βⱼ = 0.', 52, 418, {
    size: 12,
    color: C.muted,
    width: 295,
    lineGap: 5,
  });

  card(doc, 385, 76, 523, 412);
  // SSR vs SSE bar
  txt(doc, 'Explained SSR = 41 (91.1%)   ·   Residual SSE = 4 (8.9%)', 410, 98, { size: 13.5, color: C.accent });
  doc.rect(410, 124, 430, 22).fill(C.accent);
  doc.rect(840, 124, 42, 22).fill(C.line);

  // SE & t explanations + curve
  txt(doc, 'Standard Errors — What SE(βⱼ) Means', 410, 170, { size: 15, color: C.ink, style: 'sansSemi' });
  txt(
    doc,
    'SE(βⱼ) = √(s² · [(XᵀX)⁻¹]ⱼⱼ).  SE(β₀) = 2.56 (baseline uncertainty at 0,0);  SE(β₁) = √(4·20/36) = 1.49;  SE(β₂) = 1.49.',
    410,
    194,
    { size: 12.5, color: C.muted, width: 472, lineGap: 4 }
  );

  txt(doc, 't-Test — What t-Values Are About (df = 1)', 410, 246, { size: 15, color: C.ink, style: 'sansSemi' });
  txt(
    doc,
    't = β̂ⱼ / SE(βⱼ) measures how many SEs β̂ⱼ lies from 0 (H₀: βⱼ = 0). With df = 1, p < 0.05 requires |t| > 12.71. Since t₀ = 0.78 (p = 0.58), t₁ = 0.67 (p = 0.62), and t₂ = 1.34 (p = 0.41), none are significant.',
    410,
    270,
    { size: 12.5, color: C.muted, width: 472, lineGap: 4 }
  );

  // t-distribution curve
  const tBaseY = 454;
  const tMidX = 646;
  doc.lineWidth(1.2).strokeColor('#94A3B8').moveTo(430, tBaseY).lineTo(862, tBaseY).stroke();
  doc.save();
  doc.lineWidth(2).strokeColor(C.ink);
  for (let i = 0; i <= 80; i++) {
    const t = -4 + i * 0.1;
    const x = tMidX + t * 50;
    const y = tBaseY - (1 / (Math.PI * (1 + t * t))) * 280;
    if (i === 0) doc.moveTo(x, y);
    else doc.lineTo(x, y);
  }
  doc.stroke();
  const tx1 = tMidX + ols.tStats[1] * 50;
  doc.lineWidth(2.5).strokeColor(C.accentBright).moveTo(tx1, 360).lineTo(tx1, tBaseY).stroke();
  doc.circle(tx1, 360, 4.5).fillColor(C.accentBright).fill();
  txt(doc, 't₁ = 0.67 (p = 0.62)', tx1 + 8, 355, { size: 11.5, color: C.accent });
  doc.restore();

  // ================= SLIDE 11 =================
  doc.addPage();
  slideChrome(doc, 11, total, 'Python Implementation', 'sklearn and NumPy');
  card(doc, 52, 185, 300, 145);
  txt(doc, 'sklearn adds the intercept for you. Does NumPy?', 68, 204, { size: 14, color: C.ink, style: 'sansSemi', width: 268 });
  txt(doc, 'No. You must stack np.ones(n) manually, or NumPy forces the plane through (0, 0, 0).', 68, 256, {
    size: 12.5,
    color: C.accent,
    width: 268,
  });

  card(doc, 385, 76, 523, 412, { fill: C.darkBg, stroke: C.darkBg });
  txt(
    doc,
    `import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[1,1],[2,3],[3,2],[4,4]])
y = np.array([4,11,10,13])

Xd = np.column_stack([np.ones(4), X])
np.linalg.solve(Xd.T @ Xd, Xd.T @ y)  # [2. 1. 2.]

m = LinearRegression().fit(X, y)
m.intercept_, m.coef_  # 2.0, [1. 2.]
m.score(X, y)          # 0.9111`,
    415,
    112,
    { size: 14.5, color: C.darkText, width: 470, lineGap: 9 }
  );

  // ================= SLIDE 12 =================
  doc.addPage();
  slideChrome(doc, 12, total, 'Statistical Inference', 'statsmodels');
  txt(doc, 'sklearn\nBuilt for prediction. Gives coefficients and R².', 52, 185, { size: 14.5, color: C.ink, width: 295, lineGap: 5 });
  txt(doc, 'statsmodels\nBuilt for inference. Gives SE, t, p, F, and CIs.', 52, 275, { size: 14.5, color: C.accent, width: 295, lineGap: 5 });

  card(doc, 385, 76, 523, 170, { fill: C.darkBg, stroke: C.darkBg });
  txt(
    doc,
    `import statsmodels.api as sm
Xc = sm.add_constant(X)  # adds the 1s column
res = sm.OLS(y, Xc).fit()
print(res.summary())
res.params, res.pvalues, res.rsquared_adj`,
    415,
    102,
    { size: 14, color: C.darkText, width: 470, lineGap: 8 }
  );

  card(doc, 385, 268, 523, 220);
  txt(
    doc,
    `Dep. Variable: y        R-squared:       0.911
Model:         OLS      Adj. R-squared:  0.733
F-statistic:   5.125    Prob (F-stat):   0.299
---------------------------------------------------
              coef   std err       t     P>|t|
const       2.0000     2.560   0.781     0.578
Hours       1.0000     1.491   0.671     0.624
Quizzes     2.0000     1.491   1.342     0.408`,
    415,
    292,
    { size: 12.5, style: 'mono', color: C.ink, width: 475, lineGap: 6 }
  );

  // ================= SLIDE 13 =================
  doc.addPage();
  slideChrome(doc, 13, total, 'Interpreting Output', 'Reading the Output');
  card(doc, 52, 185, 300, 145);
  txt(doc, 'Why can R² be high while nothing is significant?', 68, 204, { size: 14, color: C.ink, style: 'sansSemi', width: 268 });
  txt(doc, 'Tiny sample size (n = 4, df = 1) inflates SEs and requires |t| > 12.71.', 68, 256, {
    size: 12.5,
    color: C.accent,
    width: 268,
  });

  const cards13 = [
    ['Coefficients', 'const 2, Hours 1, Quizzes 2. Matches our hand result.'],
    ['t and p', 'Hours: t = 0.67, p ≈ 0.62. Quizzes: t = 1.34, p ≈ 0.41. Neither is significant.'],
    ['R² and adj R²', '0.911 and 0.733. The gap shows the penalty for extra predictors on tiny n.'],
    ['F-test', 'F = 5.13, p ≈ 0.30. Not significant. Only 1 df is left.'],
  ];
  cards13.forEach(([heading, body], i) => {
    const ry = 82 + i * 102;
    card(doc, 385, ry, 523, 86);
    txt(doc, heading, 408, ry + 16, { size: 16, color: i === 2 ? C.accent : C.ink, style: 'sansSemi' });
    txt(doc, body, 408, ry + 44, { size: 14, color: C.muted, width: 480 });
  });

  // ================= SLIDE 14 =================
  doc.addPage();
  slideChrome(doc, 14, total, 'Predictor Overlap', 'Multicollinearity');
  txt(doc, 'VIFⱼ = 1 / (1 − Rⱼ²)\nOur data: r(Hours, Quizzes) = 0.80\nVIF = 1 / (1 − 0.64) = 2.78', 52, 175, {
    size: 13.5,
    color: C.accent,
    width: 295,
    lineGap: 7,
  });
  card(doc, 52, 290, 300, 125);
  txt(doc, 'Rule of thumb: VIF > 5 concern, > 10 severe. Is 2.78 a problem?', 68, 308, { size: 13, color: C.ink, style: 'sansSemi', width: 268 });
  txt(doc, 'Not severe — 2.78 is below 5 (moderate correlation).', 68, 360, { size: 12.5, color: C.accent, width: 268 });

  const mcItems = [
    ['What it is', 'Two or more predictors are strongly correlated with each other.'],
    ['Why it hurts', 'Standard errors inflate. Coefficients wobble and can flip sign. Predictions stay fine.'],
    ['Fixes', 'Drop or combine predictors, use PCA, or ridge regression.'],
  ];
  mcItems.forEach(([h, b], i) => {
    const ry = 82 + i * 136;
    card(doc, 385, ry, 523, 114);
    txt(doc, h, 410, ry + 20, { size: 17, color: C.ink, style: 'sansSemi' });
    txt(doc, b, 410, ry + 52, { size: 14.5, color: C.muted, width: 475, lineGap: 4 });
  });

  // ================= SLIDE 15 =================
  doc.addPage();
  slideChrome(doc, 15, total, 'Residual Spread', 'Homoscedasticity');
  txt(doc, '"Same spread": prediction errors have constant variance across all fitted values Var(ε) = σ².', 52, 175, {
    size: 14,
    color: C.muted,
    width: 295,
    lineGap: 5,
  });
  txt(doc, 'Why it matters: OLS uses one shared s² to compute every SE(βⱼ).', 52, 265, {
    size: 13.5,
    color: C.ink,
    width: 295,
    lineGap: 5,
  });
  txt(doc, 'Effect if violated: β̂ stays unbiased, but SE, t, and p become unreliable.', 52, 340, {
    size: 13.5,
    color: C.accent,
    width: 295,
    lineGap: 5,
  });

  // Even Band vs Funnel side-by-side vector plots
  card(doc, 385, 76, 523, 412);
  // Left subplot: Even band
  card(doc, 408, 100, 232, 235, { fill: C.softBg });
  txt(doc, 'Even Band: Homoscedastic', 422, 116, { size: 13, color: C.accent });
  doc.rect(424, 178, 196, 86).fillOpacity(0.06).fillColor(C.accentBright).fill().fillOpacity(1);
  doc.lineWidth(1.5).strokeColor(C.ink).moveTo(422, 221).lineTo(622, 221).stroke();
  [[438,196],[466,244],[494,202],[522,242],[550,198],[578,246],[606,204]].forEach(([x,y]) => {
    doc.circle(x, y, 4.5).fillColor(C.accentBright).fill();
  });

  // Right subplot: Funnel
  card(doc, 654, 100, 232, 235, { fill: C.softBg });
  txt(doc, 'Funnel: Heteroscedastic', 668, 116, { size: 13, color: C.ink });
  doc.polygon([668, 214], [868, 152], [868, 290], [668, 228]).fillOpacity(0.05).fillColor(C.ink).fill().fillOpacity(1);
  doc.lineWidth(1.5).strokeColor(C.ink).moveTo(668, 221).lineTo(868, 221).stroke();
  [[682,217],[710,227],[738,204],[766,242],[794,186],[822,262],[850,168],[856,278]].forEach(([x,y]) => {
    doc.circle(x, y, 4.5).fillColor(C.ink).fill();
  });

  txt(
    doc,
    'Even band means uniform uncertainty across ŷ. A funnel means errors grow with ŷ, so classical OLS standard errors understate uncertainty in high-variance regions.',
    410,
    365,
    { size: 13.5, color: C.muted, width: 476, lineGap: 5 }
  );

  // ================= SLIDE 16 =================
  doc.addPage();
  slideChrome(doc, 16, total, 'Automated Checks', 'Diagnostics in Python');
  txt(doc, 'Our data (n = 4):\nResiduals −1, 1, 1, −1 have equal size. With n = 4 no test has power, so use real data.', 52, 175, {
    size: 13.5,
    color: C.muted,
    width: 295,
    lineGap: 5,
  });
  txt(doc, 'If it fails:\nTransform y (log), use WLS, or report robust SE (HC3).', 52, 285, {
    size: 13.5,
    color: C.accent,
    width: 295,
    lineGap: 5,
  });

  card(doc, 385, 76, 523, 412, { fill: C.darkBg, stroke: C.darkBg });
  txt(
    doc,
    `from statsmodels.stats.outliers_influence import (
    variance_inflation_factor as vif,
)
from statsmodels.stats.diagnostic import het_breuschpagan

[vif(Xc, i) for i in (1, 2)]  # [2.78, 2.78]

lm, lm_p, f, f_p = het_breuschpagan(res.resid, Xc)
# p < 0.05 indicates heteroscedasticity

plt.scatter(res.fittedvalues, res.resid); plt.axhline(0)

sm.OLS(y, Xc).fit(cov_type="HC3")  # robust SE fix`,
    412,
    108,
    { size: 12.5, style: 'mono', color: C.darkText, width: 480, lineGap: 8 }
  );

  // ================= SLIDE 17 =================
  doc.addPage();
  slideChrome(doc, 17, total, 'Summary & Exercise', 'Pitfalls and Recap');
  txt(doc, '•  β̂ = (XᵀX)⁻¹ Xᵀy\n•  sklearn predicts, statsmodels explains', 52, 185, {
    size: 14,
    color: C.ink,
    width: 295,
    lineGap: 10,
  });

  card(doc, 52, 275, 300, 150);
  txt(doc, 'Exercise: change y₄ to 14 and recompute β̂.', 68, 294, { size: 14, color: C.ink, style: 'sansSemi', width: 268 });
  txt(doc, 'Xᵀy = [39, 112, 113]ᵀ\nβ̂ = [1.417, 1.167, 2.167]ᵀ\nR² = 0.957 · Adj R² = 0.872', 68, 344, {
    size: 12.5,
    color: C.accent,
    width: 268,
    lineGap: 4,
  });

  const pitfalls = [
    ['Multicollinearity', 'Correlated x values inflate SE. Check VIF (>5 concern, >10 severe).'],
    ['Overfitting', 'n = 4 with 3 parameters leaves 1 df. Use Adj R² and more data.'],
    ['Causation', 'Coefficients show association, not cause.'],
  ];
  pitfalls.forEach(([h, b], i) => {
    const ry = 82 + i * 136;
    card(doc, 385, ry, 523, 114);
    txt(doc, h, 410, ry + 20, { size: 17, color: i === 1 ? C.accent : C.ink, style: 'sansSemi' });
    txt(doc, b, 410, ry + 52, { size: 14.5, color: C.muted, width: 475, lineGap: 4 });
  });

  doc.end();
  stream.on('finish', () => {
    console.log(`Generated ${outPath}`);
  });
}

generate();
