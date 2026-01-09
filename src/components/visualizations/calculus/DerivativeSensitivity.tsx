'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface DerivativeSensitivityProps {
  id?: string;
  interactive?: boolean;
  showTangentLine?: boolean;
  showSensitivityMeter?: boolean;
  showNudgeAnimation?: boolean;
  width?: number;
  height?: number;
  className?: string;
  initialFunction?: 'quadratic' | 'sine' | 'cubic' | 'relu' | 'sigmoid';
}

// Function definitions
const functions: Record<string, {
  fn: (x: number) => number;
  derivative: (x: number) => number;
  name: string;
  description: string;
  domain: [number, number];
}> = {
  quadratic: {
    fn: (x) => x * x,
    derivative: (x) => 2 * x,
    name: 'x²',
    description: 'Parabola - sensitivity increases as you move from center',
    domain: [-3, 3],
  },
  sine: {
    fn: (x) => Math.sin(x),
    derivative: (x) => Math.cos(x),
    name: 'sin(x)',
    description: 'Wave - sensitivity varies cyclically',
    domain: [-Math.PI * 1.5, Math.PI * 1.5],
  },
  cubic: {
    fn: (x) => x * x * x / 3,
    derivative: (x) => x * x,
    name: 'x³/3',
    description: 'Cubic - always positive sensitivity (except at origin)',
    domain: [-2.5, 2.5],
  },
  relu: {
    fn: (x) => Math.max(0, x),
    derivative: (x) => x > 0 ? 1 : 0,
    name: 'ReLU',
    description: 'Neural network activation - binary sensitivity!',
    domain: [-3, 3],
  },
  sigmoid: {
    fn: (x) => 1 / (1 + Math.exp(-x)),
    derivative: (x) => {
      const s = 1 / (1 + Math.exp(-x));
      return s * (1 - s);
    },
    name: 'Sigmoid',
    description: 'S-curve - max sensitivity at center, vanishes at edges',
    domain: [-6, 6],
  },
};

export function DerivativeSensitivity({
  id = 'derivative-sensitivity',
  interactive = true,
  showTangentLine = true,
  showSensitivityMeter = true,
  showNudgeAnimation = false,
  width = 600,
  height = 400,
  className = '',
  initialFunction = 'quadratic',
}: DerivativeSensitivityProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentFunction, setCurrentFunction] = useState(initialFunction);
  const [xPosition, setXPosition] = useState(1);
  const [isNudging, setIsNudging] = useState(false);
  const [nudgeAmount, setNudgeAmount] = useState(0);

  const { markInteractionComplete } = useProgressStore();

  const padding = { top: 40, right: 40, bottom: 50, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const funcDef = functions[currentFunction];

  // Scales
  const xScale = useMemo(() =>
    d3.scaleLinear().domain(funcDef.domain).range([0, innerWidth]),
    [funcDef.domain, innerWidth]
  );

  const yDomain = useMemo(() => {
    // Calculate y range based on function
    const samples = d3.range(funcDef.domain[0], funcDef.domain[1], 0.1);
    const yValues = samples.map(funcDef.fn);
    const yMin = Math.min(...yValues, -0.5);
    const yMax = Math.max(...yValues, 0.5);
    const yPadding = (yMax - yMin) * 0.1;
    return [yMin - yPadding, yMax + yPadding];
  }, [funcDef]);

  const yScale = useMemo(() =>
    d3.scaleLinear().domain(yDomain).range([innerHeight, 0]),
    [yDomain, innerHeight]
  );

  // Current values
  const y = funcDef.fn(xPosition);
  const derivative = funcDef.derivative(xPosition);
  const sensitivity = Math.abs(derivative);

  // Nudged values
  const nudgedX = xPosition + nudgeAmount;
  const nudgedY = funcDef.fn(nudgedX);
  const deltaY = nudgedY - y;

  // Draw the visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Draw grid
    const gridGroup = mainGroup.append('g').attr('class', 'grid');

    // Vertical grid lines
    xScale.ticks(10).forEach(tick => {
      gridGroup
        .append('line')
        .attr('x1', xScale(tick))
        .attr('y1', 0)
        .attr('x2', xScale(tick))
        .attr('y2', innerHeight)
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', tick === 0 ? 1.5 : 0.5)
        .attr('opacity', tick === 0 ? 0.8 : 0.3);
    });

    // Horizontal grid lines
    yScale.ticks(8).forEach(tick => {
      gridGroup
        .append('line')
        .attr('x1', 0)
        .attr('y1', yScale(tick))
        .attr('x2', innerWidth)
        .attr('y2', yScale(tick))
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', tick === 0 ? 1.5 : 0.5)
        .attr('opacity', tick === 0 ? 0.8 : 0.3);
    });

    // Draw the function curve
    const line = d3.line<number>()
      .x(d => xScale(d))
      .y(d => yScale(funcDef.fn(d)))
      .curve(d3.curveMonotoneX);

    const xValues = d3.range(funcDef.domain[0], funcDef.domain[1], 0.05);

    mainGroup
      .append('path')
      .datum(xValues)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'var(--viz-vector-primary)')
      .attr('stroke-width', 3);

    // Draw tangent line at current position
    if (showTangentLine) {
      const tangentLength = 1.5;
      const x1 = xPosition - tangentLength;
      const x2 = xPosition + tangentLength;
      const y1 = y - tangentLength * derivative;
      const y2 = y + tangentLength * derivative;

      mainGroup
        .append('line')
        .attr('x1', xScale(x1))
        .attr('y1', yScale(y1))
        .attr('x2', xScale(x2))
        .attr('y2', yScale(y2))
        .attr('stroke', 'var(--viz-highlight)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6,4');

      // Slope label
      mainGroup
        .append('text')
        .attr('x', xScale(x2) + 5)
        .attr('y', yScale(y2) - 10)
        .attr('fill', 'var(--viz-highlight)')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(`slope = ${derivative.toFixed(2)}`);
    }

    // Draw nudge visualization
    if (showNudgeAnimation && nudgeAmount !== 0) {
      const predictedDeltaY = derivative * nudgeAmount;

      // Highlight the movement path with a thick line
      mainGroup
        .append('line')
        .attr('x1', xScale(xPosition))
        .attr('y1', yScale(y))
        .attr('x2', xScale(nudgedX))
        .attr('y2', yScale(nudgedY))
        .attr('stroke', 'var(--viz-vector-result)')
        .attr('stroke-width', 3)
        .attr('opacity', 0.6);

      // Horizontal bracket for Δx
      const bracketY = Math.max(yScale(y), yScale(nudgedY)) + 25;
      mainGroup
        .append('line')
        .attr('x1', xScale(xPosition))
        .attr('y1', bracketY - 5)
        .attr('x2', xScale(xPosition))
        .attr('y2', bracketY + 5)
        .attr('stroke', 'var(--viz-vector-secondary)')
        .attr('stroke-width', 2);
      mainGroup
        .append('line')
        .attr('x1', xScale(xPosition))
        .attr('y1', bracketY)
        .attr('x2', xScale(nudgedX))
        .attr('y2', bracketY)
        .attr('stroke', 'var(--viz-vector-secondary)')
        .attr('stroke-width', 2);
      mainGroup
        .append('line')
        .attr('x1', xScale(nudgedX))
        .attr('y1', bracketY - 5)
        .attr('x2', xScale(nudgedX))
        .attr('y2', bracketY + 5)
        .attr('stroke', 'var(--viz-vector-secondary)')
        .attr('stroke-width', 2);

      // Δx label
      mainGroup
        .append('text')
        .attr('x', xScale((xPosition + nudgedX) / 2))
        .attr('y', bracketY + 18)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--viz-vector-secondary)')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text(`Δx = ${nudgeAmount.toFixed(2)}`);

      // Vertical bracket for Δy
      const bracketX = xScale(nudgedX) + 15;
      mainGroup
        .append('line')
        .attr('x1', bracketX - 5)
        .attr('y1', yScale(y))
        .attr('x2', bracketX + 5)
        .attr('y2', yScale(y))
        .attr('stroke', 'var(--viz-vector-result)')
        .attr('stroke-width', 2);
      mainGroup
        .append('line')
        .attr('x1', bracketX)
        .attr('y1', yScale(y))
        .attr('x2', bracketX)
        .attr('y2', yScale(nudgedY))
        .attr('stroke', 'var(--viz-vector-result)')
        .attr('stroke-width', 2);
      mainGroup
        .append('line')
        .attr('x1', bracketX - 5)
        .attr('y1', yScale(nudgedY))
        .attr('x2', bracketX + 5)
        .attr('y2', yScale(nudgedY))
        .attr('stroke', 'var(--viz-vector-result)')
        .attr('stroke-width', 2);

      // Δy label
      mainGroup
        .append('text')
        .attr('x', bracketX + 12)
        .attr('y', yScale((y + nudgedY) / 2) + 4)
        .attr('fill', 'var(--viz-vector-result)')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text(`Δy = ${deltaY.toFixed(2)}`);

      // Nudged point (larger, pulsing effect via opacity)
      mainGroup
        .append('circle')
        .attr('cx', xScale(nudgedX))
        .attr('cy', yScale(nudgedY))
        .attr('r', 10)
        .attr('fill', 'var(--viz-vector-result)')
        .attr('opacity', 0.3);
      mainGroup
        .append('circle')
        .attr('cx', xScale(nudgedX))
        .attr('cy', yScale(nudgedY))
        .attr('r', 7)
        .attr('fill', 'var(--viz-vector-result)')
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      // The KEY insight box - show the formula
      const insightBoxWidth = 200;
      const insightBoxHeight = 55;
      const insightBoxX = innerWidth - insightBoxWidth - 10;
      const insightBoxY = 10;

      mainGroup
        .append('rect')
        .attr('x', insightBoxX)
        .attr('y', insightBoxY)
        .attr('width', insightBoxWidth)
        .attr('height', insightBoxHeight)
        .attr('rx', 8)
        .attr('fill', 'var(--surface-elevated)')
        .attr('stroke', 'var(--viz-highlight)')
        .attr('stroke-width', 2);

      mainGroup
        .append('text')
        .attr('x', insightBoxX + insightBoxWidth / 2)
        .attr('y', insightBoxY + 18)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--viz-highlight)')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('THE DERIVATIVE PREDICTS:');

      mainGroup
        .append('text')
        .attr('x', insightBoxX + insightBoxWidth / 2)
        .attr('y', insightBoxY + 38)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '12px')
        .text(`Δy ≈ ${derivative.toFixed(2)} × ${nudgeAmount.toFixed(2)} = ${predictedDeltaY.toFixed(2)}`);

      mainGroup
        .append('text')
        .attr('x', insightBoxX + insightBoxWidth / 2)
        .attr('y', insightBoxY + 52)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)/70')
        .attr('font-size', '10px')
        .text(`Actual: ${deltaY.toFixed(2)}`);
    }

    // Draw current point
    mainGroup
      .append('circle')
      .attr('cx', xScale(xPosition))
      .attr('cy', yScale(y))
      .attr('r', 8)
      .attr('fill', 'var(--viz-highlight)')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('cursor', interactive ? 'ew-resize' : 'default');

    // Point label
    mainGroup
      .append('text')
      .attr('x', xScale(xPosition))
      .attr('y', yScale(y) - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '12px')
      .text(`(${xPosition.toFixed(1)}, ${y.toFixed(2)})`);

    // Axis labels
    mainGroup
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .text('Input (x)');

    mainGroup
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .text('Output f(x)');

  }, [currentFunction, xPosition, nudgeAmount, showTangentLine, showNudgeAnimation, funcDef, xScale, yScale, y, derivative, nudgedX, nudgedY, deltaY, innerWidth, innerHeight, interactive, padding.left, padding.top]);

  // Handle position change
  const handlePositionChange = useCallback((newX: number) => {
    const clampedX = Math.max(funcDef.domain[0] + 0.1, Math.min(funcDef.domain[1] - 0.1, newX));
    setXPosition(clampedX);
    markInteractionComplete(id);
  }, [funcDef.domain, id, markInteractionComplete]);

  // Handle function change
  const handleFunctionChange = useCallback((func: string) => {
    setCurrentFunction(func as keyof typeof functions);
    // Reset position to middle of new domain
    const newDomain = functions[func].domain;
    setXPosition((newDomain[0] + newDomain[1]) / 2);
    setNudgeAmount(0);
    markInteractionComplete(id);
  }, [id, markInteractionComplete]);

  // Perform nudge with animation
  const doNudge = useCallback(() => {
    setIsNudging(true);
    setNudgeAmount(0);

    // Animate the nudge
    let start: number | null = null;
    const duration = 800; // ms
    const targetNudge = 0.5;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setNudgeAmount(eased * targetNudge);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Hold for 3 seconds then reset
        setTimeout(() => {
          setIsNudging(false);
          setNudgeAmount(0);
        }, 3000);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <div className={`derivative-sensitivity ${className}`}>
      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {/* Controls */}
      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Function Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">Choose a function:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(functions).map(([key, func]) => (
                <button
                  key={key}
                  onClick={() => handleFunctionChange(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentFunction === key
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)]'
                  }`}
                >
                  {func.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--foreground)]/50 mt-2">
              {funcDef.description}
            </p>
          </div>

          {/* Position Slider */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--foreground)]/80">
                Position (x)
              </label>
              <span className="font-mono text-sm font-bold text-[var(--viz-highlight)]">
                {xPosition.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={funcDef.domain[0] + 0.1}
              max={funcDef.domain[1] - 0.1}
              step="0.1"
              value={xPosition}
              onChange={(e) => handlePositionChange(parseFloat(e.target.value))}
              className="viz-slider"
            />

            {/* Nudge Button */}
            {showNudgeAnimation && (
              <div className="mt-3">
                <button
                  onClick={doNudge}
                  disabled={isNudging}
                  className="w-full py-2.5 px-4 bg-[var(--viz-vector-secondary)] hover:bg-[var(--viz-vector-secondary)]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isNudging ? 'Watch the prediction...' : '👆 Nudge x → See how derivative predicts Δy'}
                </button>
                <p className="text-xs text-[var(--foreground)]/50 mt-2 text-center">
                  The derivative tells you: "If x changes by Δx, then y changes by approximately derivative × Δx"
                </p>
              </div>
            )}
          </div>

          {/* Sensitivity Meter */}
          {showSensitivityMeter && (
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]/80">
                  Sensitivity (|derivative|)
                </span>
                <span className={`font-mono text-sm font-bold ${
                  sensitivity > 2 ? 'text-[var(--error)]' :
                  sensitivity > 1 ? 'text-[var(--warning)]' :
                  sensitivity > 0.1 ? 'text-[var(--success)]' :
                  'text-[var(--foreground)]/50'
                }`}>
                  {sensitivity.toFixed(2)}
                </span>
              </div>

              {/* Sensitivity bar */}
              <div className="w-full h-4 bg-[var(--viz-grid)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    sensitivity > 2 ? 'bg-[var(--error)]' :
                    sensitivity > 1 ? 'bg-[var(--warning)]' :
                    sensitivity > 0.1 ? 'bg-[var(--success)]' :
                    'bg-[var(--foreground)]/30'
                  }`}
                  style={{ width: `${Math.min(100, sensitivity * 25)}%` }}
                />
              </div>

              <p className="text-xs text-[var(--foreground)]/50 mt-2">
                {sensitivity > 2
                  ? '🔥 Very sensitive! Small input changes cause large output swings.'
                  : sensitivity > 1
                  ? '⚡ Moderate sensitivity. Output responds noticeably to input changes.'
                  : sensitivity > 0.1
                  ? '🎯 Low sensitivity. Output changes slowly here.'
                  : '😴 Near zero sensitivity. Output barely responds to input changes.'}
              </p>

              {/* Derivative value and interpretation */}
              <div className="mt-3 p-3 bg-[var(--surface)] rounded-lg">
                <div className="text-sm">
                  <span className="text-[var(--foreground)]/60">Derivative: </span>
                  <span className="font-mono font-bold">{derivative.toFixed(3)}</span>
                </div>
                <div className="text-xs text-[var(--foreground)]/50 mt-1">
                  {derivative > 0
                    ? `↗ Increasing: Move x right → f(x) goes up by ~${derivative.toFixed(2)} per unit`
                    : derivative < 0
                    ? `↘ Decreasing: Move x right → f(x) goes down by ~${Math.abs(derivative).toFixed(2)} per unit`
                    : '→ Flat: f(x) doesn\'t change here (local min/max)'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
