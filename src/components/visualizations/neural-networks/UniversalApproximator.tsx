'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface UniversalApproximatorProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

type TargetFunction = 'sine' | 'step' | 'gaussian' | 'complex';

const targetFunctions: Record<TargetFunction, {
  fn: (x: number) => number;
  name: string;
  description: string;
}> = {
  sine: {
    fn: (x) => Math.sin(x * 2),
    name: 'Sine Wave',
    description: 'A smooth periodic curve',
  },
  step: {
    fn: (x) => x > 0 ? 1 : -1,
    name: 'Step Function',
    description: 'An abrupt jump at x=0',
  },
  gaussian: {
    fn: (x) => Math.exp(-x * x),
    name: 'Gaussian Bell',
    description: 'A smooth bell curve',
  },
  complex: {
    fn: (x) => Math.sin(x * 3) * Math.exp(-x * x / 4) + 0.5 * Math.cos(x * 5),
    name: 'Complex Pattern',
    description: 'Multiple overlapping patterns',
  },
};

// ReLU function
function relu(x: number): number {
  return Math.max(0, x);
}

// Generate neurons that approximate the target using piecewise linear fitting
// This creates a proper approximation by fitting slopes at breakpoints
function generateNeurons(n: number, targetFn: (x: number) => number): Array<{ position: number; slope: number }> {
  if (n < 2) {
    return [{ position: -3, slope: 0 }];
  }

  const neurons: Array<{ position: number; slope: number }> = [];
  const xMin = -3;
  const xMax = 3;
  const step = (xMax - xMin) / n;

  // Sample target function at breakpoints
  const breakpoints: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= n; i++) {
    const x = xMin + i * step;
    breakpoints.push({ x, y: targetFn(x) });
  }

  // Calculate slope changes at each breakpoint
  // The first "neuron" sets the initial slope from the left
  const initialSlope = (breakpoints[1].y - breakpoints[0].y) / step;
  neurons.push({ position: xMin, slope: initialSlope });

  // Each subsequent neuron adds a slope change (second derivative approximation)
  for (let i = 1; i < breakpoints.length - 1; i++) {
    const slopeBefore = (breakpoints[i].y - breakpoints[i - 1].y) / step;
    const slopeAfter = (breakpoints[i + 1].y - breakpoints[i].y) / step;
    const slopeChange = slopeAfter - slopeBefore;

    if (Math.abs(slopeChange) > 0.001) {
      neurons.push({ position: breakpoints[i].x, slope: slopeChange });
    }
  }

  return neurons;
}

// Compute the approximation at point x given the neurons
function computeApproximation(x: number, neurons: Array<{ position: number; slope: number }>, targetFn: (x: number) => number): number {
  // Start with the value at the leftmost point
  const xMin = -3;
  let result = targetFn(xMin);

  // Add contribution from each neuron (ReLU creates a hinge)
  for (const neuron of neurons) {
    result += neuron.slope * relu(x - neuron.position);
  }

  // Subtract the cumulative effect that was added before xMin
  // This centers the approximation correctly
  let correction = 0;
  for (const neuron of neurons) {
    correction += neuron.slope * relu(xMin - neuron.position);
  }
  result -= correction;

  return result;
}

export function UniversalApproximator({
  id = 'universal-approximator',
  interactive = true,
  width = 600,
  height = 350,
  className = '',
}: UniversalApproximatorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [targetType, setTargetType] = useState<TargetFunction>('sine');
  const [neuronCount, setNeuronCount] = useState(5);
  const [showIndividual, setShowIndividual] = useState(true);
  const [showTarget, setShowTarget] = useState(true);

  const { markInteractionComplete } = useProgressStore();

  const targetFn = targetFunctions[targetType].fn;

  // Generate neurons for approximation
  const neurons = useMemo(() => {
    return generateNeurons(neuronCount, targetFn);
  }, [neuronCount, targetFn]);

  // Calculate approximation at a point
  const approximation = useCallback((x: number): number => {
    return computeApproximation(x, neurons, targetFn);
  }, [neurons, targetFn]);

  // Calculate error
  const error = useMemo(() => {
    const samples = d3.range(-3, 3.1, 0.1);
    const errors = samples.map(x => Math.abs(targetFn(x) - approximation(x)));
    return errors.reduce((a, b) => a + b, 0) / errors.length;
  }, [targetFn, approximation]);

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
    const xScale = d3.scaleLinear().domain([-3.5, 3.5]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([-2, 2]).range([innerHeight, 0]);

    // Grid
    mainGroup.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', 'var(--viz-grid)')
      .attr('stroke-width', 1);

    mainGroup.append('line')
      .attr('x1', xScale(0))
      .attr('x2', xScale(0))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'var(--viz-grid)')
      .attr('stroke-width', 1);

    // X values for plotting
    const xValues = d3.range(-3.5, 3.6, 0.05);

    // Draw breakpoint markers (where neurons create "hinges")
    if (showIndividual && neuronCount <= 30) {
      neurons.forEach((n) => {
        // Draw vertical line at each breakpoint
        mainGroup.append('line')
          .attr('x1', xScale(n.position))
          .attr('x2', xScale(n.position))
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', 'var(--primary)')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2,4')
          .attr('opacity', 0.3);

        // Draw a small circle at the breakpoint on the approximation
        const yVal = approximation(n.position);
        mainGroup.append('circle')
          .attr('cx', xScale(n.position))
          .attr('cy', yScale(yVal))
          .attr('r', 3)
          .attr('fill', 'var(--primary)')
          .attr('opacity', 0.6);
      });
    }

    // Draw target function
    if (showTarget) {
      const targetLine = d3.line<number>()
        .x(x => xScale(x))
        .y(x => yScale(targetFn(x)));

      mainGroup.append('path')
        .datum(xValues)
        .attr('fill', 'none')
        .attr('stroke', 'var(--foreground)')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '8,4')
        .attr('opacity', 0.5)
        .attr('d', targetLine);
    }

    // Draw approximation
    const approxLine = d3.line<number>()
      .x(x => xScale(x))
      .y(x => yScale(approximation(x)));

    mainGroup.append('path')
      .datum(xValues)
      .attr('fill', 'none')
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 2.5)
      .attr('d', approxLine);

    // Axis labels
    mainGroup.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '12px')
      .text('x');

    mainGroup.append('text')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '12px')
      .attr('transform', 'rotate(-90)')
      .text('f(x)');

    // Legend
    const legend = mainGroup.append('g')
      .attr('transform', `translate(${innerWidth - 120}, 10)`);

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', 'var(--foreground)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,2')
      .attr('opacity', 0.5);
    legend.append('text')
      .attr('x', 25)
      .attr('y', 4)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '10px')
      .text('Target');

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 18)
      .attr('y2', 18)
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 2);
    legend.append('text')
      .attr('x', 25)
      .attr('y', 22)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '10px')
      .text('Approximation');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(`Universal Approximation (${neuronCount} neurons)`);

  }, [targetFn, neurons, neuronCount, approximation, showIndividual, showTarget, width, height]);

  const resetToDefaults = useCallback(() => {
    setNeuronCount(5);
    setShowIndividual(true);
    setShowTarget(true);
  }, []);

  const isModified = neuronCount !== 5 || !showIndividual || !showTarget;

  return (
    <div className={`universal-approximator ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Target Function Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]/70">
                Target function to approximate:
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
            <div className="flex flex-wrap gap-2">
              {(Object.keys(targetFunctions) as TargetFunction[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setTargetType(key);
                    markInteractionComplete(id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    targetType === key
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                  }`}
                >
                  {targetFunctions[key].name}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--foreground)]/50 mt-2">
              {targetFunctions[targetType].description}
            </p>
          </div>

          {/* Neuron Count Control */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--foreground)]/70">
                Number of Neurons
              </label>
              <span className="font-mono text-lg text-[var(--primary)] font-bold">
                {neuronCount}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="100"
              step="1"
              value={neuronCount}
              onChange={(e) => {
                setNeuronCount(parseInt(e.target.value));
                markInteractionComplete(id);
              }}
              className="viz-slider"
            />
            <div className="flex justify-between text-xs text-[var(--foreground)]/50 mt-1">
              <span>2 (crude)</span>
              <span>100 (smooth)</span>
            </div>
          </div>

          {/* Options */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTarget}
                  onChange={(e) => setShowTarget(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-[var(--foreground)]">Show target (dashed)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showIndividual}
                  onChange={(e) => setShowIndividual(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-[var(--foreground)]">Show breakpoints (hinges)</span>
              </label>
            </div>
          </div>

          {/* Quality Indicator */}
          <div className={`rounded-xl p-4 ${error < 0.1 ? 'bg-[var(--success)]/20' : error < 0.3 ? 'bg-[var(--primary)]/20' : 'bg-[var(--surface-elevated)]'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--foreground)]/70">
                Approximation Quality
              </span>
              <span className={`font-bold ${error < 0.1 ? 'text-[var(--success)]' : error < 0.3 ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                {error < 0.1 ? 'Excellent' : error < 0.3 ? 'Good' : error < 0.5 ? 'Fair' : 'Poor'}
              </span>
            </div>
            <p className="text-xs text-[var(--foreground)]/50 mt-2">
              {neuronCount < 5
                ? 'Add more neurons for better approximation!'
                : neuronCount < 15
                ? 'Getting better! More neurons = smoother curves.'
                : neuronCount < 40
                ? 'Good approximation! The shape is becoming clear.'
                : 'Excellent! With enough neurons, we can approximate any continuous function.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
