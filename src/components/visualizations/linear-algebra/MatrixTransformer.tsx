'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '@/lib/stores/progressStore';

interface MatrixTransformerProps {
  id?: string;
  initialMatrix?: [[number, number], [number, number]];
  interactive?: boolean;
  showGrid?: boolean;
  showBasisVectors?: boolean;
  showUnitSquare?: boolean;
  showDeterminant?: boolean;
  animateOnChange?: boolean;
  width?: number;
  height?: number;
  className?: string;
  presets?: { name: string; matrix: [[number, number], [number, number]]; description: string }[];
}

const defaultPresets: { name: string; matrix: [[number, number], [number, number]]; description: string }[] = [
  { name: 'Identity', matrix: [[1, 0], [0, 1]], description: 'No change - everything stays the same' },
  { name: 'Scale 2x', matrix: [[2, 0], [0, 2]], description: 'Doubles everything - area becomes 4x' },
  { name: 'Horizontal Stretch', matrix: [[2, 0], [0, 1]], description: 'Stretches only horizontally' },
  { name: 'Rotate 90°', matrix: [[0, -1], [1, 0]], description: 'Rotates counterclockwise by 90 degrees' },
  { name: 'Shear', matrix: [[1, 1], [0, 1]], description: 'Slants the space - area preserved!' },
  { name: 'Reflection', matrix: [[-1, 0], [0, 1]], description: 'Flips across the Y-axis' },
  { name: 'Collapse', matrix: [[1, 2], [0.5, 1]], description: 'Squishes to a line - determinant = 0!' },
];

export function MatrixTransformer({
  id = 'matrix-transformer',
  initialMatrix = [[1, 0], [0, 1]],
  interactive = true,
  showGrid = true,
  showBasisVectors = true,
  showUnitSquare = true,
  showDeterminant = true,
  animateOnChange = true,
  width = 500,
  height = 500,
  className = '',
  presets = defaultPresets,
}: MatrixTransformerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [matrix, setMatrix] = useState<[[number, number], [number, number]]>(initialMatrix);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTransformed, setShowTransformed] = useState(true);
  const animationRef = useRef<number | null>(null);

  const { markInteractionComplete } = useProgressStore();

  const padding = 50;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  // Scales - centered at origin
  const xScale = d3.scaleLinear().domain([-4, 4]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([-4, 4]).range([innerHeight, 0]);

  // Calculate determinant
  const determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  // Transform a point by the matrix
  const transformPoint = useCallback((x: number, y: number, t: number = 1): [number, number] => {
    // Interpolate between identity and target matrix
    const m00 = 1 + t * (matrix[0][0] - 1);
    const m01 = t * matrix[0][1];
    const m10 = t * matrix[1][0];
    const m11 = 1 + t * (matrix[1][1] - 1);

    return [
      m00 * x + m01 * y,
      m10 * x + m11 * y,
    ];
  }, [matrix]);

  // Draw the visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Definitions for arrowheads
    const defs = svg.append('defs');

    // Blue arrowhead for i-hat
    defs.append('marker')
      .attr('id', 'arrow-i')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', 'var(--viz-vector-primary)');

    // Green arrowhead for j-hat
    defs.append('marker')
      .attr('id', 'arrow-j')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', 'var(--viz-vector-secondary)');

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding}, ${padding})`);

    // Animation parameter
    const t = showTransformed ? 1 : 0;

    // Draw original grid (faded)
    if (showGrid) {
      const originalGridGroup = mainGroup.append('g').attr('class', 'original-grid');

      for (let i = -4; i <= 4; i++) {
        // Vertical lines
        originalGridGroup
          .append('line')
          .attr('x1', xScale(i))
          .attr('y1', yScale(-4))
          .attr('x2', xScale(i))
          .attr('y2', yScale(4))
          .attr('stroke', 'var(--viz-grid)')
          .attr('stroke-width', i === 0 ? 1.5 : 0.5)
          .attr('opacity', 0.3);

        // Horizontal lines
        originalGridGroup
          .append('line')
          .attr('x1', xScale(-4))
          .attr('y1', yScale(i))
          .attr('x2', xScale(4))
          .attr('y2', yScale(i))
          .attr('stroke', 'var(--viz-grid)')
          .attr('stroke-width', i === 0 ? 1.5 : 0.5)
          .attr('opacity', 0.3);
      }
    }

    // Draw transformed grid
    if (showGrid) {
      const gridGroup = mainGroup.append('g').attr('class', 'transformed-grid');

      // Vertical lines (lines of constant x)
      for (let i = -4; i <= 4; i++) {
        const points: [number, number][] = [];
        for (let j = -4; j <= 4; j += 0.5) {
          const [tx, ty] = transformPoint(i, j, t);
          points.push([xScale(tx), yScale(ty)]);
        }

        const line = d3.line<[number, number]>()
          .x(d => d[0])
          .y(d => d[1])
          .curve(d3.curveLinear);

        gridGroup
          .append('path')
          .attr('d', line(points))
          .attr('stroke', i === 0 ? 'var(--viz-axis)' : 'var(--primary)')
          .attr('stroke-width', i === 0 ? 2 : 1)
          .attr('fill', 'none')
          .attr('opacity', i === 0 ? 0.8 : 0.4);
      }

      // Horizontal lines (lines of constant y)
      for (let i = -4; i <= 4; i++) {
        const points: [number, number][] = [];
        for (let j = -4; j <= 4; j += 0.5) {
          const [tx, ty] = transformPoint(j, i, t);
          points.push([xScale(tx), yScale(ty)]);
        }

        const line = d3.line<[number, number]>()
          .x(d => d[0])
          .y(d => d[1])
          .curve(d3.curveLinear);

        gridGroup
          .append('path')
          .attr('d', line(points))
          .attr('stroke', i === 0 ? 'var(--viz-axis)' : 'var(--primary)')
          .attr('stroke-width', i === 0 ? 2 : 1)
          .attr('fill', 'none')
          .attr('opacity', i === 0 ? 0.8 : 0.4);
      }
    }

    // Draw unit square
    if (showUnitSquare) {
      const squareGroup = mainGroup.append('g').attr('class', 'unit-square');

      // Original square (faded)
      squareGroup
        .append('rect')
        .attr('x', xScale(0))
        .attr('y', yScale(1))
        .attr('width', xScale(1) - xScale(0))
        .attr('height', yScale(0) - yScale(1))
        .attr('fill', 'var(--viz-highlight)')
        .attr('opacity', 0.1)
        .attr('stroke', 'var(--viz-highlight)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4');

      // Transformed square
      const corners = [
        [0, 0], [1, 0], [1, 1], [0, 1]
      ].map(([x, y]) => {
        const [tx, ty] = transformPoint(x, y, t);
        return [xScale(tx), yScale(ty)];
      });

      squareGroup
        .append('polygon')
        .attr('points', corners.map(c => c.join(',')).join(' '))
        .attr('fill', 'var(--viz-highlight)')
        .attr('opacity', 0.3)
        .attr('stroke', 'var(--viz-highlight)')
        .attr('stroke-width', 2);
    }

    // Draw basis vectors
    if (showBasisVectors) {
      const basisGroup = mainGroup.append('g').attr('class', 'basis-vectors');

      // i-hat (1, 0) -> transforms to first column of matrix
      const [iEndX, iEndY] = transformPoint(1, 0, t);
      basisGroup
        .append('line')
        .attr('x1', xScale(0))
        .attr('y1', yScale(0))
        .attr('x2', xScale(iEndX))
        .attr('y2', yScale(iEndY))
        .attr('stroke', 'var(--viz-vector-primary)')
        .attr('stroke-width', 4)
        .attr('marker-end', 'url(#arrow-i)');

      // i-hat label
      basisGroup
        .append('text')
        .attr('x', xScale(iEndX) + 10)
        .attr('y', yScale(iEndY) - 5)
        .attr('fill', 'var(--viz-vector-primary)')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(`î [${iEndX.toFixed(1)}, ${iEndY.toFixed(1)}]`);

      // j-hat (0, 1) -> transforms to second column of matrix
      const [jEndX, jEndY] = transformPoint(0, 1, t);
      basisGroup
        .append('line')
        .attr('x1', xScale(0))
        .attr('y1', yScale(0))
        .attr('x2', xScale(jEndX))
        .attr('y2', yScale(jEndY))
        .attr('stroke', 'var(--viz-vector-secondary)')
        .attr('stroke-width', 4)
        .attr('marker-end', 'url(#arrow-j)');

      // j-hat label
      basisGroup
        .append('text')
        .attr('x', xScale(jEndX) + 10)
        .attr('y', yScale(jEndY) + 15)
        .attr('fill', 'var(--viz-vector-secondary)')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(`ĵ [${jEndX.toFixed(1)}, ${jEndY.toFixed(1)}]`);
    }

    // Draw origin point
    mainGroup
      .append('circle')
      .attr('cx', xScale(0))
      .attr('cy', yScale(0))
      .attr('r', 5)
      .attr('fill', 'var(--foreground)');

  }, [matrix, showGrid, showBasisVectors, showUnitSquare, showTransformed, transformPoint, xScale, yScale, innerWidth, innerHeight]);

  // Animate to a new matrix
  const animateToMatrix = useCallback((newMatrix: [[number, number], [number, number]]) => {
    if (!animateOnChange) {
      setMatrix(newMatrix);
      return;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsAnimating(true);
    const startMatrix = matrix;
    const startTime = performance.now();
    const duration = 500;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      const interpolatedMatrix: [[number, number], [number, number]] = [
        [
          startMatrix[0][0] + (newMatrix[0][0] - startMatrix[0][0]) * eased,
          startMatrix[0][1] + (newMatrix[0][1] - startMatrix[0][1]) * eased,
        ],
        [
          startMatrix[1][0] + (newMatrix[1][0] - startMatrix[1][0]) * eased,
          startMatrix[1][1] + (newMatrix[1][1] - startMatrix[1][1]) * eased,
        ],
      ];

      setMatrix(interpolatedMatrix);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        markInteractionComplete(id);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [matrix, animateOnChange, id, markInteractionComplete]);

  // Handle preset selection
  const handlePresetChange = useCallback((preset: typeof presets[0]) => {
    animateToMatrix(preset.matrix);
  }, [animateToMatrix]);

  // Handle individual matrix value change
  const handleMatrixChange = useCallback((row: number, col: number, value: number) => {
    const newMatrix: [[number, number], [number, number]] = [
      [...matrix[0]] as [number, number],
      [...matrix[1]] as [number, number],
    ];
    newMatrix[row][col] = value;
    setMatrix(newMatrix);
    markInteractionComplete(id);
  }, [matrix, id, markInteractionComplete]);

  return (
    <div className={`matrix-transformer ${className}`}>
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
          {/* Matrix Input */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-sm font-medium text-[var(--foreground)]/70">Matrix</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl text-[var(--foreground)]/30">[</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={matrix[0][0]}
                    onChange={(e) => handleMatrixChange(0, 0, parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-[var(--surface)] rounded text-center font-mono text-[var(--viz-vector-primary)] border border-[var(--viz-grid)] focus:border-[var(--primary)] focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={matrix[0][1]}
                    onChange={(e) => handleMatrixChange(0, 1, parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-[var(--surface)] rounded text-center font-mono text-[var(--viz-vector-secondary)] border border-[var(--viz-grid)] focus:border-[var(--primary)] focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={matrix[1][0]}
                    onChange={(e) => handleMatrixChange(1, 0, parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-[var(--surface)] rounded text-center font-mono text-[var(--viz-vector-primary)] border border-[var(--viz-grid)] focus:border-[var(--primary)] focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={matrix[1][1]}
                    onChange={(e) => handleMatrixChange(1, 1, parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-[var(--surface)] rounded text-center font-mono text-[var(--viz-vector-secondary)] border border-[var(--viz-grid)] focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
                <span className="text-2xl text-[var(--foreground)]/30">]</span>
              </div>
            </div>

            <div className="text-xs text-[var(--foreground)]/50">
              <span className="text-[var(--viz-vector-primary)]">Blue column</span> = where î lands |
              <span className="text-[var(--viz-vector-secondary)]"> Green column</span> = where ĵ lands
            </div>
          </div>

          {/* Presets */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">Try these transformations:</div>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetChange(preset)}
                  disabled={isAnimating}
                  className="px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--primary)]/20 border border-[var(--viz-grid)] hover:border-[var(--primary)] rounded-lg text-sm transition-colors disabled:opacity-50"
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Determinant Display */}
          {showDeterminant && (
            <div className="flex flex-wrap gap-3 text-sm">
              <div className={`px-4 py-2 rounded-lg ${Math.abs(determinant) < 0.01 ? 'bg-red-500/20 text-red-400' : 'bg-[var(--surface-elevated)]'}`}>
                <span className="text-[var(--foreground)]/60">Determinant:</span>{' '}
                <span className="font-mono font-bold">{determinant.toFixed(2)}</span>
                {Math.abs(determinant) < 0.01 && (
                  <span className="ml-2 text-red-400">(Space collapsed!)</span>
                )}
              </div>
              <div className="bg-[var(--surface-elevated)] px-4 py-2 rounded-lg">
                <span className="text-[var(--foreground)]/60">Area scale:</span>{' '}
                <span className="font-mono font-bold">{Math.abs(determinant).toFixed(2)}x</span>
              </div>
              {determinant < 0 && (
                <div className="bg-purple-500/20 px-4 py-2 rounded-lg text-purple-400">
                  Orientation flipped!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
