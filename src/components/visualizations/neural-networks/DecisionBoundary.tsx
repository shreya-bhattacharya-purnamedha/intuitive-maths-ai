'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface DecisionBoundaryProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface Point {
  x: number;
  y: number;
  label: 0 | 1;
}

// Generate sample data
function generateData(): Point[] {
  const points: Point[] = [];

  // Class 0 (bottom-left cluster)
  for (let i = 0; i < 15; i++) {
    points.push({
      x: 1 + Math.random() * 3,
      y: 1 + Math.random() * 3,
      label: 0,
    });
  }

  // Class 1 (top-right cluster)
  for (let i = 0; i < 15; i++) {
    points.push({
      x: 4 + Math.random() * 3,
      y: 4 + Math.random() * 3,
      label: 1,
    });
  }

  return points;
}

export function DecisionBoundary({
  id = 'decision-boundary',
  interactive = true,
  width = 500,
  height = 400,
  className = '',
}: DecisionBoundaryProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [points] = useState<Point[]>(() => generateData());
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(1);
  const [bias, setBias] = useState(-5);
  const [isDragging, setIsDragging] = useState(false);

  const { markInteractionComplete } = useProgressStore();

  // Calculate accuracy
  const { accuracy, predictions } = useMemo(() => {
    let correct = 0;
    const preds: boolean[] = [];

    points.forEach(p => {
      const output = w1 * p.x + w2 * p.y + bias;
      const prediction = output > 0 ? 1 : 0;
      preds.push(prediction === p.label);
      if (prediction === p.label) correct++;
    });

    return {
      accuracy: correct / points.length,
      predictions: preds,
    };
  }, [points, w1, w2, bias]);

  // Draw visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 40, right: 40, bottom: 50, left: 50 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Scales
    const xScale = d3.scaleLinear().domain([0, 8]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 8]).range([innerHeight, 0]);

    // Grid
    for (let i = 0; i <= 8; i++) {
      mainGroup.append('line')
        .attr('x1', xScale(i))
        .attr('x2', xScale(i))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', 0.5);

      mainGroup.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(i))
        .attr('y2', yScale(i))
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', 0.5);
    }

    // Axis labels
    mainGroup.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '12px')
      .text('Feature 1 (x₁)');

    mainGroup.append('text')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '12px')
      .attr('transform', 'rotate(-90)')
      .text('Feature 2 (x₂)');

    // Decision boundary shading
    // w1*x + w2*y + bias = 0
    // y = (-w1*x - bias) / w2
    if (w2 !== 0) {
      const getY = (x: number) => (-w1 * x - bias) / w2;

      // Find intersection points with the plot area
      const linePoints: [number, number][] = [];

      // Check intersections with all four edges
      const y0 = getY(0);
      const y8 = getY(8);
      const x0 = (-bias) / w1; // when y = 0
      const x8 = (-w2 * 8 - bias) / w1; // when y = 8

      if (y0 >= 0 && y0 <= 8) linePoints.push([0, y0]);
      if (y8 >= 0 && y8 <= 8) linePoints.push([8, y8]);
      if (w1 !== 0) {
        if (x0 >= 0 && x0 <= 8) linePoints.push([x0, 0]);
        if (x8 >= 0 && x8 <= 8) linePoints.push([x8, 8]);
      }

      // Draw shaded regions
      if (linePoints.length >= 2) {
        // Sort points by x coordinate
        linePoints.sort((a, b) => a[0] - b[0]);

        // Draw the decision boundary line
        mainGroup.append('line')
          .attr('x1', xScale(linePoints[0][0]))
          .attr('y1', yScale(linePoints[0][1]))
          .attr('x2', xScale(linePoints[1][0]))
          .attr('y2', yScale(linePoints[1][1]))
          .attr('stroke', 'var(--primary)')
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '8,4');
      }
    } else if (w1 !== 0) {
      // Vertical line: w1*x + bias = 0 => x = -bias/w1
      const xIntercept = -bias / w1;
      if (xIntercept >= 0 && xIntercept <= 8) {
        mainGroup.append('line')
          .attr('x1', xScale(xIntercept))
          .attr('y1', 0)
          .attr('x2', xScale(xIntercept))
          .attr('y2', innerHeight)
          .attr('stroke', 'var(--primary)')
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '8,4');
      }
    }

    // Draw points
    points.forEach((p, i) => {
      const isCorrect = predictions[i];

      mainGroup.append('circle')
        .attr('cx', xScale(p.x))
        .attr('cy', yScale(p.y))
        .attr('r', 8)
        .attr('fill', p.label === 1 ? 'var(--primary)' : 'var(--viz-vector-secondary)')
        .attr('stroke', isCorrect ? 'var(--success)' : 'var(--error)')
        .attr('stroke-width', isCorrect ? 2 : 3)
        .attr('opacity', 0.8);

      // X mark for misclassified
      if (!isCorrect) {
        const x = xScale(p.x);
        const y = yScale(p.y);
        mainGroup.append('line')
          .attr('x1', x - 5)
          .attr('y1', y - 5)
          .attr('x2', x + 5)
          .attr('y2', y + 5)
          .attr('stroke', 'var(--error)')
          .attr('stroke-width', 2);
        mainGroup.append('line')
          .attr('x1', x + 5)
          .attr('y1', y - 5)
          .attr('x2', x - 5)
          .attr('y2', y + 5)
          .attr('stroke', 'var(--error)')
          .attr('stroke-width', 2);
      }
    });

    // Legend
    const legend = mainGroup.append('g')
      .attr('transform', `translate(${innerWidth - 100}, 10)`);

    legend.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', 'var(--primary)');
    legend.append('text')
      .attr('x', 12)
      .attr('y', 4)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .text('Class 1');

    legend.append('circle')
      .attr('cx', 0)
      .attr('cy', 20)
      .attr('r', 6)
      .attr('fill', 'var(--viz-vector-secondary)');
    legend.append('text')
      .attr('x', 12)
      .attr('y', 24)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .text('Class 0');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Single Neuron Decision Boundary');

  }, [points, predictions, w1, w2, bias, width, height]);

  const handleWeightChange = useCallback((setter: (v: number) => void, value: number) => {
    setter(value);
    markInteractionComplete(id);
  }, [id, markInteractionComplete]);

  const resetToDefaults = useCallback(() => {
    setW1(1);
    setW2(1);
    setBias(-5);
  }, []);

  const isModified = w1 !== 1 || w2 !== 1 || bias !== -5;

  return (
    <div className={`decision-boundary ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Accuracy Display */}
          <div className={`p-4 rounded-xl ${accuracy === 1 ? 'bg-[var(--success)]/20' : 'bg-[var(--surface-elevated)]'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--foreground)]/70">
                Classification Accuracy
              </span>
              <span className={`text-2xl font-bold ${accuracy === 1 ? 'text-[var(--success)]' : 'text-[var(--foreground)]'}`}>
                {(accuracy * 100).toFixed(0)}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-[var(--surface)] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${accuracy === 1 ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'}`}
                style={{ width: `${accuracy * 100}%` }}
              />
            </div>
            {accuracy === 1 && (
              <p className="text-sm text-[var(--success)] mt-2">
                Perfect separation achieved!
              </p>
            )}
          </div>

          {/* Weight Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]/70">
                Adjust the decision boundary:
              </div>
              {isModified && (
                <button
                  onClick={resetToDefaults}
                  className="px-2 py-1 text-xs rounded-md bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)] text-[var(--foreground)]/70 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--foreground)]/60">
                    Weight w₁
                  </label>
                  <span className="font-mono text-xs text-[var(--primary)]">
                    {w1.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={w1}
                  onChange={(e) => handleWeightChange(setW1, parseFloat(e.target.value))}
                  className="viz-slider"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--foreground)]/60">
                    Weight w₂
                  </label>
                  <span className="font-mono text-xs text-[var(--primary)]">
                    {w2.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={w2}
                  onChange={(e) => handleWeightChange(setW2, parseFloat(e.target.value))}
                  className="viz-slider"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--foreground)]/60">
                    Bias
                  </label>
                  <span className="font-mono text-xs text-[var(--primary)]">
                    {bias.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={bias}
                  onChange={(e) => handleWeightChange(setBias, parseFloat(e.target.value))}
                  className="viz-slider"
                />
              </div>
            </div>
          </div>

          {/* Equation Display */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-2">
              Decision Boundary Equation:
            </div>
            <p className="font-mono text-center text-lg text-[var(--primary)]">
              {w1.toFixed(1)}x₁ + {w2.toFixed(1)}x₂ + ({bias.toFixed(1)}) = 0
            </p>
            <p className="text-xs text-center text-[var(--foreground)]/50 mt-2">
              Points above the line → Class 1 | Points below → Class 0
            </p>
          </div>

          {/* Insight */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">Key Insight:</strong> A single neuron can only create a <strong>straight line</strong> to separate data. This is called a &quot;linear decision boundary.&quot; For more complex patterns, we need multiple neurons working together!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
