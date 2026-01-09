'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface LossLandscapeProps {
  id?: string;
  interactive?: boolean;
  showContours?: boolean;
  showGradientArrow?: boolean;
  showPath?: boolean;
  showHiker?: boolean;
  width?: number;
  height?: number;
  className?: string;
  initialLandscape?: 'bowl' | 'valley' | 'localMinima' | 'saddle' | 'ravine';
}

// Loss function definitions
const landscapes: Record<string, {
  name: string;
  description: string;
  fn: (x: number, y: number) => number;
  gradX: (x: number, y: number) => number;
  gradY: (x: number, y: number) => number;
  minima: [number, number][];
  startPoint: [number, number];
  insight: string;
}> = {
  bowl: {
    name: 'Simple Bowl',
    description: 'One global minimum - the ideal case',
    fn: (x, y) => x * x + y * y,
    gradX: (x, _y) => 2 * x,
    gradY: (_x, y) => 2 * y,
    minima: [[0, 0]],
    startPoint: [2, 2],
    insight: 'With a simple bowl, gradient descent always finds the bottom. Real loss landscapes are rarely this nice!'
  },
  valley: {
    name: 'Elongated Valley',
    description: 'Steep walls, gentle slope along valley floor',
    fn: (x, y) => 0.1 * x * x + 10 * y * y,
    gradX: (x, _y) => 0.2 * x,
    gradY: (_x, y) => 20 * y,
    minima: [[0, 0]],
    startPoint: [2.5, 0.8],
    insight: 'The gradient points mostly across the valley, not along it. This causes zig-zagging - a common problem in neural network training!'
  },
  localMinima: {
    name: 'Multiple Minima',
    description: 'Several valleys - easy to get trapped!',
    fn: (x, y) => {
      // Create multiple bumps
      const global = 0.5 * (x * x + y * y);
      const local1 = -2 * Math.exp(-((x - 1.5) ** 2 + (y - 1.5) ** 2) / 0.5);
      const local2 = -1.5 * Math.exp(-((x + 1) ** 2 + (y - 1) ** 2) / 0.3);
      const local3 = -2.5 * Math.exp(-((x + 0.5) ** 2 + (y + 1.5) ** 2) / 0.4);
      return global + local1 + local2 + local3 + 3;
    },
    gradX: (x, y) => {
      const h = 0.001;
      const fn = landscapes.localMinima.fn;
      return (fn(x + h, y) - fn(x - h, y)) / (2 * h);
    },
    gradY: (x, y) => {
      const h = 0.001;
      const fn = landscapes.localMinima.fn;
      return (fn(x, y + h) - fn(x, y - h)) / (2 * h);
    },
    minima: [[-0.5, -1.5], [1.5, 1.5], [-1, 1]],
    startPoint: [2, -1],
    insight: 'The hiker found A minimum, but is it THE minimum? Local minima are a huge challenge in deep learning.'
  },
  saddle: {
    name: 'Saddle Point',
    description: 'Flat in one direction, curved in another',
    fn: (x, y) => x * x - y * y + 0.5,
    gradX: (x, _y) => 2 * x,
    gradY: (_x, y) => -2 * y,
    minima: [],
    startPoint: [0.1, 2],
    insight: 'Saddle points look like minima from some directions! The gradient is zero but it\'s not a minimum. Very common in high dimensions.'
  },
  ravine: {
    name: 'Rosenbrock Ravine',
    description: 'The classic optimization challenge',
    fn: (x, y) => (1 - x) ** 2 + 100 * (y - x * x) ** 2,
    gradX: (x, y) => -2 * (1 - x) - 400 * x * (y - x * x),
    gradY: (x, y) => 200 * (y - x * x),
    minima: [[1, 1]],
    startPoint: [-1.5, 2],
    insight: 'The famous "banana function". Easy to find the valley, hard to navigate along it to the minimum at (1,1).'
  }
};

export function LossLandscape({
  id = 'loss-landscape',
  interactive = true,
  showContours = true,
  showGradientArrow = true,
  showPath = true,
  showHiker = true,
  width = 600,
  height = 500,
  className = '',
  initialLandscape = 'bowl',
}: LossLandscapeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentLandscape, setCurrentLandscape] = useState(initialLandscape);
  const [position, setPosition] = useState<[number, number]>(landscapes[initialLandscape].startPoint);
  const [path, setPath] = useState<[number, number][]>([landscapes[initialLandscape].startPoint]);
  const [lossHistory, setLossHistory] = useState<number[]>([landscapes[initialLandscape].fn(...landscapes[initialLandscape].startPoint)]);
  const [learningRate, setLearningRate] = useState(0.1);
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [isDiverging, setIsDiverging] = useState(false);
  const animationRef = useRef<number | null>(null);

  const { markInteractionComplete } = useProgressStore();

  const padding = 50;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2 - 60; // Extra space for loss display

  const landscape = landscapes[currentLandscape];

  // Scales
  const xScale = useMemo(() =>
    d3.scaleLinear().domain([-3, 3]).range([0, innerWidth]),
    [innerWidth]
  );
  const yScale = useMemo(() =>
    d3.scaleLinear().domain([-3, 3]).range([innerHeight, 0]),
    [innerHeight]
  );

  // Current loss value
  const currentLoss = useMemo(() =>
    landscape.fn(position[0], position[1]),
    [position, landscape]
  );

  // Current gradient
  const gradient = useMemo(() => [
    landscape.gradX(position[0], position[1]),
    landscape.gradY(position[0], position[1])
  ], [position, landscape]);

  const gradientMagnitude = Math.sqrt(gradient[0] ** 2 + gradient[1] ** 2);

  // Generate contour data
  const contourData = useMemo(() => {
    const n = 50;
    const values: number[] = [];
    const xStep = 6 / n;
    const yStep = 6 / n;

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const x = -3 + i * xStep;
        const y = -3 + j * yStep;
        values.push(landscape.fn(x, y));
      }
    }

    return { values, n };
  }, [landscape]);

  // Take one gradient descent step
  const takeStep = useCallback(() => {
    setPosition(prev => {
      const gx = landscape.gradX(prev[0], prev[1]);
      const gy = landscape.gradY(prev[0], prev[1]);

      // Gradient descent: move opposite to gradient
      let newX = prev[0] - learningRate * gx;
      let newY = prev[1] - learningRate * gy;

      // Clamp to bounds
      newX = Math.max(-2.9, Math.min(2.9, newX));
      newY = Math.max(-2.9, Math.min(2.9, newY));

      const newPos: [number, number] = [newX, newY];
      const newLoss = landscape.fn(newX, newY);

      // Track loss history
      setLossHistory(prevHistory => {
        const updated = [...prevHistory, newLoss];
        // Check if diverging (loss increasing for several steps)
        if (updated.length >= 3) {
          const recent = updated.slice(-3);
          const isGettingWorse = recent[2] > recent[1] && recent[1] > recent[0];
          setIsDiverging(isGettingWorse || newLoss > 100);
        }
        return updated.slice(-50); // Keep last 50 values
      });

      setPath(prevPath => [...prevPath, newPos]);
      setStepCount(prev => prev + 1);

      return newPos;
    });
    markInteractionComplete(id);
  }, [landscape, learningRate, id, markInteractionComplete]);

  // Auto-run animation
  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        takeStep();
        // Stop if gradient is very small (converged) or diverged too much
        if (gradientMagnitude > 0.01 && stepCount < 500 && currentLoss < 1000) {
          animationRef.current = requestAnimationFrame(() => {
            // Slower animation (200ms) so bouncing is visible
            setTimeout(animate, 200);
          });
        } else {
          setIsRunning(false);
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, takeStep, gradientMagnitude, stepCount, currentLoss]);

  // Draw the visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding}, ${padding})`);

    // Draw contours
    if (showContours) {
      const { values, n } = contourData;

      // Create contour generator
      const contours = d3.contours()
        .size([n, n])
        .thresholds(20);

      const contourPaths = contours(values);

      // Color scale for contours
      const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([d3.min(values) || 0, d3.max(values) || 10]);

      // Transform contour coordinates to SVG coordinates
      const transform = (coords: number[][]) => {
        return coords.map(ring =>
          ring.map(point => [
            (point[0] / n) * innerWidth,
            innerHeight - (point[1] / n) * innerHeight
          ])
        );
      };

      // Draw filled contours
      mainGroup.selectAll('path.contour')
        .data(contourPaths)
        .enter()
        .append('path')
        .attr('class', 'contour')
        .attr('d', d => {
          const transformed = {
            ...d,
            coordinates: d.coordinates.map(polygon =>
              transform(polygon as number[][])
            )
          };
          return d3.geoPath()(transformed as any);
        })
        .attr('fill', d => colorScale(d.value))
        .attr('stroke', 'var(--foreground)')
        .attr('stroke-width', 0.3)
        .attr('stroke-opacity', 0.3)
        .attr('fill-opacity', 0.8);
    }

    // Draw grid
    const gridGroup = mainGroup.append('g').attr('class', 'grid');
    [-2, -1, 0, 1, 2].forEach(val => {
      gridGroup
        .append('line')
        .attr('x1', xScale(val))
        .attr('y1', 0)
        .attr('x2', xScale(val))
        .attr('y2', innerHeight)
        .attr('stroke', 'var(--foreground)')
        .attr('stroke-width', val === 0 ? 1 : 0.5)
        .attr('opacity', val === 0 ? 0.5 : 0.2);

      gridGroup
        .append('line')
        .attr('x1', 0)
        .attr('y1', yScale(val))
        .attr('x2', innerWidth)
        .attr('y2', yScale(val))
        .attr('stroke', 'var(--foreground)')
        .attr('stroke-width', val === 0 ? 1 : 0.5)
        .attr('opacity', val === 0 ? 0.5 : 0.2);
    });

    // Draw path (breadcrumbs)
    if (showPath && path.length > 1) {
      const pathLine = d3.line<[number, number]>()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]));

      mainGroup
        .append('path')
        .datum(path)
        .attr('d', pathLine)
        .attr('fill', 'none')
        .attr('stroke', 'var(--viz-highlight)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,2')
        .attr('opacity', 0.8);

      // Draw breadcrumb dots
      path.forEach((point, i) => {
        if (i > 0 && i < path.length - 1) {
          mainGroup
            .append('circle')
            .attr('cx', xScale(point[0]))
            .attr('cy', yScale(point[1]))
            .attr('r', 3)
            .attr('fill', 'var(--viz-highlight)')
            .attr('opacity', 0.6);
        }
      });
    }

    // Draw gradient arrow
    if (showGradientArrow && gradientMagnitude > 0.01) {
      const arrowScale = 0.3; // Scale down gradient for visualization
      const arrowX = -gradient[0] * arrowScale;
      const arrowY = -gradient[1] * arrowScale;

      // Clamp arrow length
      const maxLen = 1;
      const len = Math.sqrt(arrowX * arrowX + arrowY * arrowY);
      const scale = len > maxLen ? maxLen / len : 1;

      mainGroup
        .append('line')
        .attr('x1', xScale(position[0]))
        .attr('y1', yScale(position[1]))
        .attr('x2', xScale(position[0] + arrowX * scale))
        .attr('y2', yScale(position[1] + arrowY * scale))
        .attr('stroke', 'var(--viz-vector-secondary)')
        .attr('stroke-width', 3)
        .attr('marker-end', 'url(#arrow)');

      // Arrow marker definition
      svg.append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', 'var(--viz-vector-secondary)');
    }

    // Draw minima markers
    landscape.minima.forEach(min => {
      mainGroup
        .append('circle')
        .attr('cx', xScale(min[0]))
        .attr('cy', yScale(min[1]))
        .attr('r', 8)
        .attr('fill', 'none')
        .attr('stroke', 'var(--success)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,3');

      mainGroup
        .append('text')
        .attr('x', xScale(min[0]))
        .attr('y', yScale(min[1]) - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--success)')
        .attr('font-size', '10px')
        .text('min');
    });

    // Draw hiker (current position)
    if (showHiker) {
      // Outer glow
      mainGroup
        .append('circle')
        .attr('cx', xScale(position[0]))
        .attr('cy', yScale(position[1]))
        .attr('r', 14)
        .attr('fill', 'var(--viz-highlight)')
        .attr('opacity', 0.3);

      // Main point
      mainGroup
        .append('circle')
        .attr('cx', xScale(position[0]))
        .attr('cy', yScale(position[1]))
        .attr('r', 10)
        .attr('fill', 'var(--viz-highlight)')
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      // Hiker emoji or icon
      mainGroup
        .append('text')
        .attr('x', xScale(position[0]))
        .attr('y', yScale(position[1]) + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('🥾');
    }

    // Loss display
    const lossDisplay = svg.append('g')
      .attr('transform', `translate(${padding}, ${height - 45})`);

    lossDisplay
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', 35)
      .attr('fill', 'var(--surface-elevated)')
      .attr('rx', 8);

    lossDisplay
      .append('text')
      .attr('x', 15)
      .attr('y', 22)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '13px')
      .text(`Loss: `);

    lossDisplay
      .append('text')
      .attr('x', 55)
      .attr('y', 22)
      .attr('fill', 'var(--viz-highlight)')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .text(currentLoss.toFixed(4));

    lossDisplay
      .append('text')
      .attr('x', 150)
      .attr('y', 22)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '13px')
      .text(`Position: (${position[0].toFixed(2)}, ${position[1].toFixed(2)})`);

    lossDisplay
      .append('text')
      .attr('x', innerWidth - 80)
      .attr('y', 22)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '13px')
      .text(`Steps: ${stepCount}`);

  }, [position, path, gradient, gradientMagnitude, currentLoss, stepCount, contourData, showContours, showGradientArrow, showPath, showHiker, landscape, xScale, yScale, innerWidth, innerHeight, width, height, padding]);

  // Reset to start
  const resetHiker = useCallback(() => {
    setIsRunning(false);
    setPosition(landscape.startPoint);
    setPath([landscape.startPoint]);
    setLossHistory([landscape.fn(...landscape.startPoint)]);
    setStepCount(0);
    setIsDiverging(false);
    markInteractionComplete(id);
  }, [landscape, id, markInteractionComplete]);

  // Change landscape
  const handleLandscapeChange = useCallback((newLandscape: string) => {
    setIsRunning(false);
    setCurrentLandscape(newLandscape as keyof typeof landscapes);
    const ls = landscapes[newLandscape];
    setPosition(ls.startPoint);
    setPath([ls.startPoint]);
    setLossHistory([ls.fn(...ls.startPoint)]);
    setStepCount(0);
    setIsDiverging(false);
    markInteractionComplete(id);
  }, [id, markInteractionComplete]);

  return (
    <div className={`loss-landscape ${className}`}>
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
          {/* Landscape Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Choose a loss landscape:
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(landscapes).map(([key, ls]) => (
                <button
                  key={key}
                  onClick={() => handleLandscapeChange(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentLandscape === key
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)]'
                  }`}
                >
                  {ls.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--foreground)]/50 mt-2">
              {landscape.description}
            </p>
          </div>

          {/* Learning Rate & Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--foreground)]/80">
                Learning Rate (Step Size)
              </label>
              <span className={`font-mono text-sm font-bold ${
                learningRate > 0.5 ? 'text-[var(--error)]' :
                learningRate > 0.2 ? 'text-[var(--warning)]' :
                'text-[var(--success)]'
              }`}>
                {learningRate < 0.01 ? learningRate.toFixed(3) : learningRate.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.001"
              max="1"
              step="0.001"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              className="viz-slider"
            />
            <div className="flex justify-between text-xs text-[var(--foreground)]/40 mt-1">
              <span>0.001 (very slow, stable)</span>
              <span>1.0 (fast but risky)</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={takeStep}
                disabled={isRunning}
                className="flex-1 py-2 px-4 bg-[var(--viz-vector-secondary)] hover:bg-[var(--viz-vector-secondary)]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Take One Step
              </button>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 py-2 px-4 ${
                  isRunning
                    ? 'bg-[var(--error)] hover:bg-[var(--error)]/80'
                    : 'bg-[var(--success)] hover:bg-[var(--success)]/80'
                } text-white rounded-lg text-sm font-medium transition-colors`}
              >
                {isRunning ? 'Stop' : 'Auto-Run'}
              </button>
              <button
                onClick={resetHiker}
                className="py-2 px-4 bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)] rounded-lg text-sm font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Divergence Warning */}
          {isDiverging && (
            <div className="bg-[var(--error)]/20 border-2 border-[var(--error)] rounded-xl p-4 animate-pulse">
              <p className="text-sm font-bold text-[var(--error)] flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                DIVERGING! Loss is increasing instead of decreasing!
              </p>
              <p className="text-xs text-[var(--foreground)]/70 mt-1">
                The learning rate is too high. The hiker is &quot;bouncing&quot; over the valley instead of descending into it.
                Try reducing the learning rate.
              </p>
            </div>
          )}

          {/* Loss History Chart */}
          {lossHistory.length > 1 && (
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]/70">
                  Loss Over Time
                </span>
                <span className={`text-xs font-mono px-2 py-1 rounded ${
                  isDiverging ? 'bg-[var(--error)]/20 text-[var(--error)]' :
                  currentLoss < lossHistory[0] * 0.1 ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                  'bg-[var(--surface)] text-[var(--foreground)]/60'
                }`}>
                  {isDiverging ? '📈 EXPLODING!' : currentLoss < 0.01 ? '✓ Converged!' : `Loss: ${currentLoss.toFixed(2)}`}
                </span>
              </div>
              <div className="h-24 w-full bg-[var(--surface)] rounded-lg overflow-hidden relative">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 200 80"
                  preserveAspectRatio="none"
                >
                  {/* Background grid lines */}
                  <line x1="0" y1="20" x2="200" y2="20" stroke="var(--viz-grid)" strokeWidth="0.5" opacity="0.3" />
                  <line x1="0" y1="40" x2="200" y2="40" stroke="var(--viz-grid)" strokeWidth="0.5" opacity="0.3" />
                  <line x1="0" y1="60" x2="200" y2="60" stroke="var(--viz-grid)" strokeWidth="0.5" opacity="0.3" />

                  {/* Draw the loss curve */}
                  {lossHistory.length > 1 && (() => {
                    const maxLoss = Math.max(...lossHistory);
                    const minLoss = Math.min(...lossHistory);
                    const range = maxLoss - minLoss || 1;

                    const points = lossHistory.map((loss, i) => {
                      const x = (i / Math.max(lossHistory.length - 1, 1)) * 190 + 5;
                      const y = 75 - ((loss - minLoss) / range) * 65;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <polyline
                        fill="none"
                        stroke={isDiverging ? 'var(--error)' : 'var(--viz-highlight)'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                    );
                  })()}

                  {/* Highlight increasing segments in red */}
                  {lossHistory.length > 1 && (() => {
                    const maxLoss = Math.max(...lossHistory);
                    const minLoss = Math.min(...lossHistory);
                    const range = maxLoss - minLoss || 1;

                    return lossHistory.map((loss, i) => {
                      if (i === 0) return null;
                      const prevLoss = lossHistory[i - 1];
                      if (loss > prevLoss * 1.001) { // Small threshold to avoid floating point noise
                        const x1 = ((i - 1) / Math.max(lossHistory.length - 1, 1)) * 190 + 5;
                        const x2 = (i / Math.max(lossHistory.length - 1, 1)) * 190 + 5;
                        const y1 = 75 - ((prevLoss - minLoss) / range) * 65;
                        const y2 = 75 - ((loss - minLoss) / range) * 65;
                        return (
                          <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="var(--error)"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        );
                      }
                      return null;
                    });
                  })()}

                  {/* Current point marker */}
                  {lossHistory.length > 1 && (() => {
                    const maxLoss = Math.max(...lossHistory);
                    const minLoss = Math.min(...lossHistory);
                    const range = maxLoss - minLoss || 1;
                    const lastLoss = lossHistory[lossHistory.length - 1];
                    const x = 195;
                    const y = 75 - ((lastLoss - minLoss) / range) * 65;
                    return (
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill={isDiverging ? 'var(--error)' : 'var(--viz-highlight)'}
                      />
                    );
                  })()}
                </svg>
                {/* Labels */}
                <div className="absolute top-1 left-2 text-[10px] text-[var(--foreground)]/50 font-mono">
                  {Math.max(...lossHistory).toFixed(1)}
                </div>
                <div className="absolute bottom-1 left-2 text-[10px] text-[var(--foreground)]/50 font-mono">
                  {Math.min(...lossHistory).toFixed(1)}
                </div>
                <div className="absolute bottom-1 right-2 text-[10px] text-[var(--foreground)]/40">
                  Step {lossHistory.length - 1}
                </div>
              </div>
              <p className="text-xs text-[var(--foreground)]/50 mt-2 text-center">
                {isDiverging
                  ? '🔴 Red segments show where loss INCREASED (bad!) - learning rate too high!'
                  : lossHistory.some((l, i) => i > 0 && l > lossHistory[i-1])
                  ? '⚡ Some bouncing detected (red segments). Consider lowering the learning rate.'
                  : '✓ Loss is decreasing smoothly. Good learning rate!'}
              </p>
            </div>
          )}

          {/* Insight Panel */}
          {stepCount > 10 && !isDiverging && (
            <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
              <p className="text-sm text-[var(--foreground)]/80">
                <strong className="text-[var(--primary)]">Insight:</strong> {landscape.insight}
              </p>
            </div>
          )}

          {/* Gradient Info */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-2">
              Current Gradient (which way is downhill?)
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-[var(--foreground)]/50">∂Loss/∂x</div>
                <div className="font-mono font-bold text-[var(--viz-vector-primary)]">
                  {gradient[0].toFixed(3)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--foreground)]/50">∂Loss/∂y</div>
                <div className="font-mono font-bold text-[var(--viz-vector-secondary)]">
                  {gradient[1].toFixed(3)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--foreground)]/50">|Gradient|</div>
                <div className={`font-mono font-bold ${
                  gradientMagnitude < 0.1 ? 'text-[var(--success)]' :
                  gradientMagnitude < 1 ? 'text-[var(--warning)]' :
                  'text-[var(--error)]'
                }`}>
                  {gradientMagnitude.toFixed(3)}
                </div>
              </div>
            </div>
            <p className="text-xs text-[var(--foreground)]/50 mt-2 text-center">
              {gradientMagnitude < 0.1
                ? '✓ Gradient is small - we may have found a minimum (or saddle point)!'
                : gradientMagnitude < 1
                ? '→ Still descending... keep going!'
                : '⚡ Steep slope here - watch the learning rate!'}
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥾</span>
              <span className="text-[var(--foreground)]/70">Hiker (current position)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[var(--viz-highlight)]"></span>
              <span className="text-[var(--foreground)]/70">Path taken</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-dashed border-[var(--success)]"></span>
              <span className="text-[var(--foreground)]/70">Known minimum</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
