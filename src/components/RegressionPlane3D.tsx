import React, { useEffect, useRef, useState } from 'react';
import { DataPoint } from '../utils/olsMath';

interface RegressionPlane3DProps {
  beta: [number, number, number]; // [b0, b1, b2]
  points: DataPoint[];
  height?: number;
  autoRotate?: boolean;
  showResiduals?: boolean;
  sliceX2?: number | null;
  predictedPoint?: { x1: number; x2: number; y: number } | null;
  mode?: 'multiple' | 'simple';
  interactive?: boolean;
  caption?: string;
}

export const RegressionPlane3D: React.FC<RegressionPlane3DProps> = ({
  beta,
  points,
  height = 460,
  autoRotate = false,
  showResiduals = true,
  sliceX2 = null,
  predictedPoint = null,
  mode = 'multiple',
  interactive = true,
  caption,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [yaw, setYaw] = useState(0.68);
  const [pitch, setPitch] = useState(0.42);
  const draggingRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const animatedBetaRef = useRef<[number, number, number]>([...beta]);
  const targetBetaRef = useRef<[number, number, number]>([...beta]);
  targetBetaRef.current = [...beta];

  const yawRef = useRef(yaw);
  const pitchRef = useRef(pitch);
  yawRef.current = yaw;
  pitchRef.current = pitch;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let currentYaw = yawRef.current;

    const render = () => {
      const ab = animatedBetaRef.current;
      const tb = targetBetaRef.current;
      ab[0] += (tb[0] - ab[0]) * 0.14;
      ab[1] += (tb[1] - ab[1]) * 0.14;
      ab[2] += (tb[2] - ab[2]) * 0.14;

      if (autoRotate && !draggingRef.current.active) {
        currentYaw += 0.0028;
        yawRef.current = currentYaw;
      } else {
        currentYaw = yawRef.current;
      }
      const currentPitch = pitchRef.current;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(320, rect.width);
      const h = height;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.54;
      const scale = Math.min(w, h) * 0.145;

      const project = (x1: number, x2: number, y: number) => {
        const nx = x1 - 2.5;
        const nz = x2 - 2.5;
        const ny = (y - 8) * 0.31;

        const cosY = Math.cos(currentYaw);
        const sinY = Math.sin(currentYaw);
        const rx = nx * cosY - nz * sinY;
        const rz = nx * sinY + nz * cosY;

        const cosP = Math.cos(currentPitch);
        const sinP = Math.sin(currentPitch);
        const ry = ny * cosP - rz * sinP;
        const depth = ny * sinP + rz * cosP;

        const perspective = 1 / (1 + depth * 0.055);
        return {
          x: cx + rx * scale * perspective,
          y: cy - ry * scale * perspective,
          depth,
        };
      };

      // Neutral base grid (y = 0 floor)
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const p1 = project(i, 0, 0);
        const p2 = project(i, 5, 0);
        ctx.strokeStyle = i === 0 ? 'rgba(15,23,42,0.35)' : 'rgba(148,163,184,0.28)';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const q1 = project(0, i, 0);
        const q2 = project(5, i, 0);
        ctx.strokeStyle = i === 0 ? 'rgba(15,23,42,0.35)' : 'rgba(148,163,184,0.28)';
        ctx.beginPath();
        ctx.moveTo(q1.x, q1.y);
        ctx.lineTo(q2.x, q2.y);
        ctx.stroke();
      }

      // Vertical y axis
      const yBase = project(0, 0, 0);
      const yTop = project(0, 0, 16);
      ctx.strokeStyle = 'rgba(15,23,42,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(yBase.x, yBase.y);
      ctx.lineTo(yTop.x, yTop.y);
      ctx.stroke();

      // Axis labels (TV readable 14px)
      ctx.font = '600 14px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#334155';
      const x1End = project(5.45, 0, 0);
      ctx.fillText('x₁ Hours', x1End.x - 32, x1End.y + 6);

      if (mode === 'multiple') {
        const x2End = project(0, 5.45, 0);
        ctx.fillText('x₂ Quizzes', x2End.x - 36, x2End.y + 6);
      }

      ctx.fillStyle = '#0F172A';
      ctx.fillText('y Score', yTop.x - 28, yTop.y - 10);

      const evalY = (x1: number, x2: number) =>
        mode === 'simple' ? ab[0] + ab[1] * x1 : ab[0] + ab[1] * x1 + ab[2] * x2;

      if (mode === 'multiple') {
        // Neutral plane mesh with subtle emerald tint
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

            ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.22)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(c1.x, c1.y);
            ctx.lineTo(c2.x, c2.y);
            ctx.lineTo(c3.x, c3.y);
            ctx.lineTo(c4.x, c4.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }

        // Sharp single accent for fixed x2 partial-slope slice
        if (sliceX2 !== null) {
          const s1 = project(0, sliceX2, evalY(0, sliceX2));
          const s2 = project(5, sliceX2, evalY(5, sliceX2));
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.stroke();

          ctx.fillStyle = '#047857';
          ctx.font = '600 14px "IBM Plex Mono", monospace';
          ctx.fillText(`x₂=${sliceX2} fixed (β₁=${ab[1].toFixed(1)})`, s2.x - 65, s2.y - 12);
        }
      } else {
        const l1 = project(0, 2.5, evalY(0, 2.5));
        const l2 = project(5, 2.5, evalY(5, 2.5));
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(l1.x, l1.y);
        ctx.lineTo(l2.x, l2.y);
        ctx.stroke();
      }

      // Data points & residuals
      const sorted = points
        .map((pt) => {
          const px2 = mode === 'simple' ? 2.5 : pt.x2;
          const yHat = evalY(pt.x1, px2);
          const pActual = project(pt.x1, px2, pt.y);
          const pHat = project(pt.x1, px2, yHat);
          return { pt, yHat, pActual, pHat };
        })
        .sort((a, b) => b.pActual.depth - a.pActual.depth);

      for (const item of sorted) {
        const { pt, yHat, pActual, pHat } = item;
        if (showResiduals) {
          ctx.strokeStyle = '#64748B';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(pActual.x, pActual.y);
          ctx.lineTo(pHat.x, pHat.y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(pHat.x, pHat.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(pActual.x, pActual.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = '500 13px "IBM Plex Mono", monospace';
        const resid = pt.y - yHat;
        const sign = resid >= 0 ? '+' : '';
        ctx.fillText(
          `#${pt.id} (${pt.x1},${pt.x2},${pt.y})${showResiduals ? ` e=${sign}${resid.toFixed(1)}` : ''}`,
          pActual.x + 11,
          pActual.y - 6
        );
      }

      // Predicted point in sharp accent
      if (predictedPoint) {
        const pp = project(predictedPoint.x1, predictedPoint.x2, predictedPoint.y);
        const ppBase = project(predictedPoint.x1, predictedPoint.x2, 0);
        ctx.strokeStyle = 'rgba(5, 150, 105, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ppBase.x, ppBase.y);
        ctx.lineTo(pp.x, pp.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#047857';
        ctx.font = '600 15px "IBM Plex Mono", monospace';
        ctx.fillText(`ŷ = ${predictedPoint.y.toFixed(2)}`, pp.x + 12, pp.y + 5);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [points, height, autoRotate, showResiduals, sliceX2, predictedPoint, mode]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    draggingRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !draggingRef.current.active) return;
    const dx = e.clientX - draggingRef.current.lastX;
    const dy = e.clientY - draggingRef.current.lastY;
    draggingRef.current.lastX = e.clientX;
    draggingRef.current.lastY = e.clientY;
    setYaw((prev) => prev + dx * 0.008);
    setPitch((prev) => Math.max(0.08, Math.min(1.25, prev + dy * 0.006)));
  };

  const handlePointerUp = () => {
    draggingRef.current.active = false;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`w-full block select-none touch-none ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
        aria-label="Interactive 3D multiple regression plane visualization"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-white text-sm text-slate-600">
        <span>{caption || 'Drag canvas to orbit 3D plane'}</span>
        <div className="flex items-center gap-4 font-mono tabular-nums text-sm">
          <span className="text-slate-900">● Observed y</span>
          {showResiduals && <span className="text-slate-600">┆ Residual e</span>}
          <span className="text-emerald-700 font-semibold">● Fitted ŷ</span>
        </div>
      </div>
    </div>
  );
};
