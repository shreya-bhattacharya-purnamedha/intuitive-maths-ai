'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface JacobianVisualizerProps {
  id?: string;
  interactive?: boolean;
  showJacobianMatrix?: boolean;
  showTransformedCircle?: boolean;
  showGridLines?: boolean;
  width?: number;
  height?: number;
  className?: string;
  initialTransform?: 'rotation' | 'scaling' | 'shear' | 'nonlinear' | 'neural';
}

// Transformation definitions
const transformations: Record<string, {
  name: string;
  description: string;
  // The transformation function: (x, y) => [u, v]
  fn: (x: number, y: number) => [number, number];
  // Jacobian: [[∂u/∂x, ∂u/∂y], [∂v/∂x, ∂v/∂y]]
  jacobian: (x: number, y: number) => [[number, number], [number, number]];
  analogy: string;
}> = {
  rotation: {
    name: 'Rotation (45°)',
    description: 'Rotates points around the origin',
    fn: (x, y) => {
      const angle = Math.PI / 4;
      return [
        x * Math.cos(angle) - y * Math.sin(angle),
        x * Math.sin(angle) + y * Math.cos(angle)
      ];
    },
    jacobian: () => {
      const angle = Math.PI / 4;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return [[c, -s], [s, c]];
    },
    analogy: 'Like spinning a steering wheel—every point rotates the same amount.'
  },
  scaling: {
    name: 'Non-uniform Scaling',
    description: 'Stretches x by 2, y by 0.5',
    fn: (x, y) => [2 * x, 0.5 * y],
    jacobian: () => [[2, 0], [0, 0.5]],
    analogy: 'Like pulling taffy—stretch one way, squish another.'
  },
  shear: {
    name: 'Shear',
    description: 'Slides x based on y position',
    fn: (x, y) => [x + 0.5 * y, y],
    jacobian: () => [[1, 0.5], [0, 1]],
    analogy: 'Like pushing a deck of cards sideways—bottom stays, top slides.'
  },
  nonlinear: {
    name: 'Nonlinear (Polar Warp)',
    description: 'Bends space—Jacobian varies by location!',
    fn: (x, y) => {
      const r = Math.sqrt(x * x + y * y) + 0.01;
      const scale = 1 + 0.3 * Math.sin(r * 2);
      return [x * scale, y * scale];
    },
    jacobian: (x, y) => {
      // Numerical approximation for the nonlinear case
      const h = 0.001;
      const fn = transformations.nonlinear.fn;
      const [u0, v0] = fn(x, y);
      const [u1, v1_] = fn(x + h, y);
      const [u2, v2] = fn(x, y + h);
      return [
        [(u1 - u0) / h, (u2 - u0) / h],
        [(v1_ - v0) / h, (v2 - v0) / h]
      ];
    },
    analogy: 'Like ripples in a pond—transformation depends on WHERE you are.'
  },
  neural: {
    name: 'Neural Layer (2→2)',
    description: 'Weights + ReLU activation',
    fn: (x, y) => {
      // Simple neural network: z = ReLU(Wx + b)
      // W = [[0.8, 0.3], [-0.4, 0.9]], b = [0, 0]
      const z1 = 0.8 * x + 0.3 * y;
      const z2 = -0.4 * x + 0.9 * y;
      return [Math.max(0, z1), Math.max(0, z2)];
    },
    jacobian: (x, y) => {
      const z1 = 0.8 * x + 0.3 * y;
      const z2 = -0.4 * x + 0.9 * y;
      // ReLU derivative: 1 if z > 0, else 0
      const d1 = z1 > 0 ? 1 : 0;
      const d2 = z2 > 0 ? 1 : 0;
      return [
        [d1 * 0.8, d1 * 0.3],
        [d2 * -0.4, d2 * 0.9]
      ];
    },
    analogy: 'Like a neural network layer—ReLU "turns off" some sensitivities!'
  }
};

export function JacobianVisualizer({
  id = 'jacobian-visualizer',
  interactive = true,
  showJacobianMatrix = true,
  showTransformedCircle = true,
  showGridLines = true,
  width = 800,
  height = 400,
  className = '',
  initialTransform = 'scaling',
}: JacobianVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentTransform, setCurrentTransform] = useState(initialTransform);
  const [inputPoint, setInputPoint] = useState<[number, number]>([1.5, 1]);

  const { markInteractionComplete } = useProgressStore();

  const padding = 40;
  const panelWidth = (width - padding * 3) / 2;
  const panelHeight = height - padding * 2;

  const transformDef = transformations[currentTransform];

  // Scales for input space
  const xScaleIn = useMemo(() =>
    d3.scaleLinear().domain([-3, 3]).range([0, panelWidth]),
    [panelWidth]
  );
  const yScaleIn = useMemo(() =>
    d3.scaleLinear().domain([-3, 3]).range([panelHeight, 0]),
    [panelHeight]
  );

  // Scales for output space
  const xScaleOut = useMemo(() =>
    d3.scaleLinear().domain([-3, 3]).range([0, panelWidth]),
    [panelWidth]
  );
  const yScaleOut = useMemo(() =>
    d3.scaleLinear().domain([-3, 3]).range([panelHeight, 0]),
    [panelHeight]
  );

  // Compute transformed point and Jacobian
  const outputPoint = useMemo(() =>
    transformDef.fn(inputPoint[0], inputPoint[1]),
    [inputPoint, transformDef]
  );

  const jacobian = useMemo(() =>
    transformDef.jacobian(inputPoint[0], inputPoint[1]),
    [inputPoint, transformDef]
  );

  // Compute determinant (tells us area scaling)
  const determinant = useMemo(() =>
    jacobian[0][0] * jacobian[1][1] - jacobian[0][1] * jacobian[1][0],
    [jacobian]
  );

  // Generate points on a small circle for visualization
  const circleRadius = 0.4;
  const circlePoints = useMemo(() => {
    const points: [number, number][] = [];
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * 2 * Math.PI;
      points.push([
        inputPoint[0] + circleRadius * Math.cos(angle),
        inputPoint[1] + circleRadius * Math.sin(angle)
      ]);
    }
    return points;
  }, [inputPoint]);

  // Transform the circle points
  const transformedCirclePoints = useMemo(() =>
    circlePoints.map(p => transformDef.fn(p[0], p[1])),
    [circlePoints, transformDef]
  );

  // Draw the visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // INPUT SPACE (left panel)
    const inputGroup = svg
      .append('g')
      .attr('transform', `translate(${padding}, ${padding})`);

    // Panel background
    inputGroup
      .append('rect')
      .attr('width', panelWidth)
      .attr('height', panelHeight)
      .attr('fill', 'var(--surface)')
      .attr('rx', 8);

    // Grid lines
    if (showGridLines) {
      const gridGroup = inputGroup.append('g').attr('class', 'grid');
      for (let i = -3; i <= 3; i++) {
        gridGroup
          .append('line')
          .attr('x1', xScaleIn(i))
          .attr('y1', 0)
          .attr('x2', xScaleIn(i))
          .attr('y2', panelHeight)
          .attr('stroke', 'var(--viz-grid)')
          .attr('stroke-width', i === 0 ? 1.5 : 0.5)
          .attr('opacity', i === 0 ? 0.6 : 0.3);

        gridGroup
          .append('line')
          .attr('x1', 0)
          .attr('y1', yScaleIn(i))
          .attr('x2', panelWidth)
          .attr('y2', yScaleIn(i))
          .attr('stroke', 'var(--viz-grid)')
          .attr('stroke-width', i === 0 ? 1.5 : 0.5)
          .attr('opacity', i === 0 ? 0.6 : 0.3);
      }
    }

    // Draw the input circle (neighborhood)
    if (showTransformedCircle) {
      const circlePath = d3.line<[number, number]>()
        .x(d => xScaleIn(d[0]))
        .y(d => yScaleIn(d[1]))
        .curve(d3.curveLinearClosed);

      inputGroup
        .append('path')
        .datum(circlePoints)
        .attr('d', circlePath)
        .attr('fill', 'var(--viz-vector-primary)')
        .attr('fill-opacity', 0.2)
        .attr('stroke', 'var(--viz-vector-primary)')
        .attr('stroke-width', 2);
    }

    // Draw input point
    inputGroup
      .append('circle')
      .attr('cx', xScaleIn(inputPoint[0]))
      .attr('cy', yScaleIn(inputPoint[1]))
      .attr('r', 8)
      .attr('fill', 'var(--viz-highlight)')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('cursor', interactive ? 'grab' : 'default');

    // Input label
    inputGroup
      .append('text')
      .attr('x', panelWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('INPUT SPACE');

    inputGroup
      .append('text')
      .attr('x', xScaleIn(inputPoint[0]))
      .attr('y', yScaleIn(inputPoint[1]) - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--viz-highlight)')
      .attr('font-size', '11px')
      .text(`(${inputPoint[0].toFixed(1)}, ${inputPoint[1].toFixed(1)})`);

    // ARROW between panels
    const arrowX = padding + panelWidth + padding / 2;
    const arrowY = padding + panelHeight / 2;

    svg.append('path')
      .attr('d', `M ${arrowX - 15} ${arrowY} L ${arrowX + 15} ${arrowY} L ${arrowX + 10} ${arrowY - 5} M ${arrowX + 15} ${arrowY} L ${arrowX + 10} ${arrowY + 5}`)
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 3)
      .attr('fill', 'none');

    svg.append('text')
      .attr('x', arrowX)
      .attr('y', arrowY - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--primary)')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('f(x,y)');

    // OUTPUT SPACE (right panel)
    const outputGroup = svg
      .append('g')
      .attr('transform', `translate(${padding * 2 + panelWidth}, ${padding})`);

    // Panel background
    outputGroup
      .append('rect')
      .attr('width', panelWidth)
      .attr('height', panelHeight)
      .attr('fill', 'var(--surface)')
      .attr('rx', 8);

    // Grid lines
    if (showGridLines) {
      const gridGroup = outputGroup.append('g').attr('class', 'grid');
      for (let i = -3; i <= 3; i++) {
        gridGroup
          .append('line')
          .attr('x1', xScaleOut(i))
          .attr('y1', 0)
          .attr('x2', xScaleOut(i))
          .attr('y2', panelHeight)
          .attr('stroke', 'var(--viz-grid)')
          .attr('stroke-width', i === 0 ? 1.5 : 0.5)
          .attr('opacity', i === 0 ? 0.6 : 0.3);

        gridGroup
          .append('line')
          .attr('x1', 0)
          .attr('y1', yScaleOut(i))
          .attr('x2', panelWidth)
          .attr('y2', yScaleOut(i))
          .attr('stroke', 'var(--viz-grid)')
          .attr('stroke-width', i === 0 ? 1.5 : 0.5)
          .attr('opacity', i === 0 ? 0.6 : 0.3);
      }
    }

    // Draw the transformed shape (ellipse-ish)
    if (showTransformedCircle) {
      const transformedPath = d3.line<[number, number]>()
        .x(d => xScaleOut(d[0]))
        .y(d => yScaleOut(d[1]))
        .curve(d3.curveLinearClosed);

      outputGroup
        .append('path')
        .datum(transformedCirclePoints)
        .attr('d', transformedPath)
        .attr('fill', 'var(--viz-vector-result)')
        .attr('fill-opacity', 0.2)
        .attr('stroke', 'var(--viz-vector-result)')
        .attr('stroke-width', 2);
    }

    // Draw output point
    outputGroup
      .append('circle')
      .attr('cx', xScaleOut(outputPoint[0]))
      .attr('cy', yScaleOut(outputPoint[1]))
      .attr('r', 8)
      .attr('fill', 'var(--viz-vector-result)')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Output label
    outputGroup
      .append('text')
      .attr('x', panelWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('OUTPUT SPACE');

    outputGroup
      .append('text')
      .attr('x', xScaleOut(outputPoint[0]))
      .attr('y', yScaleOut(outputPoint[1]) - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--viz-vector-result)')
      .attr('font-size', '11px')
      .text(`(${outputPoint[0].toFixed(2)}, ${outputPoint[1].toFixed(2)})`);

    // Add drag behavior to input point
    if (interactive) {
      const inputCircle = inputGroup.select('circle');

      const drag = d3.drag<SVGCircleElement, unknown>()
        .on('start', function() {
          d3.select(this).attr('cursor', 'grabbing');
        })
        .on('drag', function(event) {
          // Get mouse position relative to the SVG
          const svgNode = svgRef.current;
          if (!svgNode) return;

          const point = svgNode.createSVGPoint();
          point.x = event.sourceEvent.clientX;
          point.y = event.sourceEvent.clientY;
          const svgPoint = point.matrixTransform(svgNode.getScreenCTM()?.inverse());

          // Convert to input space coordinates (accounting for padding)
          const x = xScaleIn.invert(svgPoint.x - padding);
          const y = yScaleIn.invert(svgPoint.y - padding);

          const clampedX = Math.max(-2.5, Math.min(2.5, x));
          const clampedY = Math.max(-2.5, Math.min(2.5, y));
          setInputPoint([clampedX, clampedY]);
          markInteractionComplete(id);
        })
        .on('end', function() {
          d3.select(this).attr('cursor', 'grab');
        });

      inputCircle.call(drag as any);
    }

  }, [inputPoint, outputPoint, circlePoints, transformedCirclePoints, currentTransform, showGridLines, showTransformedCircle, interactive, id, markInteractionComplete, xScaleIn, yScaleIn, xScaleOut, yScaleOut, panelWidth, panelHeight, padding]);

  // Handle transform change
  const handleTransformChange = useCallback((transform: string) => {
    setCurrentTransform(transform as keyof typeof transformations);
    setInputPoint([1.5, 1]); // Reset to default position
    markInteractionComplete(id);
  }, [id, markInteractionComplete]);

  return (
    <div className={`jacobian-visualizer ${className}`}>
      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas"
      />

      {/* Controls */}
      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Transform Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Choose a transformation:
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(transformations).map(([key, transform]) => (
                <button
                  key={key}
                  onClick={() => handleTransformChange(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentTransform === key
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)]'
                  }`}
                >
                  {transform.name}
                </button>
              ))}
            </div>
            <p className="text-sm text-[var(--foreground)]/60 mt-3 italic">
              &quot;{transformDef.analogy}&quot;
            </p>
          </div>

          {/* Input Point Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Move the input point:
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-[var(--foreground)]/60">X position</label>
                  <span className="font-mono text-sm font-bold text-[var(--viz-vector-primary)]">
                    {inputPoint[0].toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.1"
                  value={inputPoint[0]}
                  onChange={(e) => {
                    setInputPoint([parseFloat(e.target.value), inputPoint[1]]);
                    markInteractionComplete(id);
                  }}
                  className="viz-slider viz-slider-x"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-[var(--foreground)]/60">Y position</label>
                  <span className="font-mono text-sm font-bold text-[var(--viz-vector-secondary)]">
                    {inputPoint[1].toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.1"
                  value={inputPoint[1]}
                  onChange={(e) => {
                    setInputPoint([inputPoint[0], parseFloat(e.target.value)]);
                    markInteractionComplete(id);
                  }}
                  className="viz-slider viz-slider-y"
                />
              </div>
            </div>
          </div>

          {/* Jacobian Matrix Display */}
          {showJacobianMatrix && (
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[var(--foreground)]/80">
                  The Jacobian Matrix
                </span>
                <span className={`text-xs font-mono px-2 py-1 rounded ${
                  Math.abs(determinant) > 1 ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                  Math.abs(determinant) < 0.5 ? 'bg-[var(--warning)]/20 text-[var(--warning)]' :
                  'bg-[var(--viz-grid)] text-[var(--foreground)]/70'
                }`}>
                  det = {determinant.toFixed(2)}
                </span>
              </div>

              {/* Matrix visualization */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-[var(--foreground)]/50 mb-1">Jacobian J =</div>
                </div>
                <div className="flex items-center">
                  <div className="text-3xl text-[var(--foreground)]/30 mr-1">[</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="text-center">
                      <div className="font-mono font-bold text-[var(--viz-vector-primary)]">
                        {jacobian[0][0].toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[var(--foreground)]/40">∂u/∂x</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono font-bold text-[var(--viz-vector-secondary)]">
                        {jacobian[0][1].toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[var(--foreground)]/40">∂u/∂y</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono font-bold text-[var(--viz-vector-primary)]">
                        {jacobian[1][0].toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[var(--foreground)]/40">∂v/∂x</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono font-bold text-[var(--viz-vector-secondary)]">
                        {jacobian[1][1].toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[var(--foreground)]/40">∂v/∂y</div>
                    </div>
                  </div>
                  <div className="text-3xl text-[var(--foreground)]/30 ml-1">]</div>
                </div>
              </div>

              {/* Interpretation */}
              <div className="mt-4 p-3 bg-[var(--surface)] rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[var(--viz-vector-primary)] font-medium">First row:</span>
                    <span className="text-[var(--foreground)]/60"> How output u responds to x, y</span>
                  </div>
                  <div>
                    <span className="text-[var(--viz-vector-secondary)] font-medium">Second row:</span>
                    <span className="text-[var(--foreground)]/60"> How output v responds to x, y</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--viz-grid)]">
                  <span className="text-[var(--foreground)]/60">Determinant = </span>
                  <span className="font-mono">{determinant.toFixed(2)}</span>
                  <span className="text-[var(--foreground)]/60"> → </span>
                  {Math.abs(determinant) > 1 ? (
                    <span className="text-[var(--success)]">Area expands by {Math.abs(determinant).toFixed(1)}×</span>
                  ) : Math.abs(determinant) < 0.01 ? (
                    <span className="text-[var(--error)]">Area collapses! (Information lost)</span>
                  ) : (
                    <span className="text-[var(--warning)]">Area shrinks to {(Math.abs(determinant) * 100).toFixed(0)}%</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[var(--viz-vector-primary)] opacity-50"></span>
              <span className="text-[var(--foreground)]/70">Input neighborhood (circle)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[var(--viz-vector-result)] opacity-50"></span>
              <span className="text-[var(--foreground)]/70">Output neighborhood (transformed)</span>
            </div>
          </div>

          {/* Tip */}
          <p className="text-xs text-[var(--foreground)]/50 text-center">
            Use the sliders above (or drag the yellow point) to move around input space and watch the Jacobian change
          </p>
        </div>
      )}
    </div>
  );
}
