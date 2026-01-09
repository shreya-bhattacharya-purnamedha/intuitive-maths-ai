'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface DimensionalityReducerProps {
  id?: string;
  interactive?: boolean;
  showProjectionLine?: boolean;
  showProjectedPoints?: boolean;
  showVariance?: boolean;
  showShadowMetaphor?: boolean;
  width?: number;
  height?: number;
  className?: string;
  dataset?: 'clusters' | 'spread' | 'diagonal' | 'custom';
  customPoints?: [number, number][];
}

// Generate sample datasets
function generateDataset(type: string): [number, number][] {
  switch (type) {
    case 'clusters':
      // Two clusters that are separable along one axis
      return [
        ...Array.from({ length: 15 }, () => [
          -2 + Math.random() * 1.5 - 0.75,
          1 + Math.random() * 1.5 - 0.75,
        ] as [number, number]),
        ...Array.from({ length: 15 }, () => [
          2 + Math.random() * 1.5 - 0.75,
          -1 + Math.random() * 1.5 - 0.75,
        ] as [number, number]),
      ];
    case 'spread':
      // Points spread in a specific direction (high variance along one axis)
      return Array.from({ length: 30 }, (_, i) => {
        const t = (i / 30) * 6 - 3;
        return [
          t + Math.random() * 0.5 - 0.25,
          t * 0.3 + Math.random() * 0.8 - 0.4,
        ] as [number, number];
      });
    case 'diagonal':
      // Diagonal spread - PCA will find the diagonal
      return Array.from({ length: 30 }, () => {
        const t = Math.random() * 6 - 3;
        return [
          t + Math.random() * 0.4 - 0.2,
          t + Math.random() * 0.4 - 0.2,
        ] as [number, number];
      });
    default:
      // Random spread
      return Array.from({ length: 30 }, () => [
        Math.random() * 6 - 3,
        Math.random() * 6 - 3,
      ] as [number, number]);
  }
}

export function DimensionalityReducer({
  id = 'dimensionality-reducer',
  interactive = true,
  showProjectionLine = true,
  showProjectedPoints = true,
  showVariance = true,
  showShadowMetaphor = false,
  width = 500,
  height = 500,
  className = '',
  dataset = 'clusters',
  customPoints,
}: DimensionalityReducerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [angle, setAngle] = useState(45); // Projection angle in degrees
  const [points] = useState<[number, number][]>(() =>
    customPoints || generateDataset(dataset)
  );

  const { markInteractionComplete } = useProgressStore();

  const padding = 50;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  // Scales
  const xScale = d3.scaleLinear().domain([-4, 4]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([-4, 4]).range([innerHeight, 0]);

  // Calculate projection direction from angle
  const projectionDir = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    return [Math.cos(rad), Math.sin(rad)];
  }, [angle]);

  // Project a point onto the projection line
  const projectPoint = useCallback((point: [number, number]): number => {
    // Dot product with unit direction vector
    return point[0] * projectionDir[0] + point[1] * projectionDir[1];
  }, [projectionDir]);

  // Calculate variance of projected points
  const projectedVariance = useMemo(() => {
    const projections = points.map(projectPoint);
    const mean = projections.reduce((a, b) => a + b, 0) / projections.length;
    const variance = projections.reduce((sum, p) => sum + (p - mean) ** 2, 0) / projections.length;
    return variance;
  }, [points, projectPoint]);

  // Calculate total variance for comparison
  const totalVariance = useMemo(() => {
    const meanX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const meanY = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    const variance = points.reduce((sum, p) =>
      sum + (p[0] - meanX) ** 2 + (p[1] - meanY) ** 2, 0
    ) / points.length;
    return variance;
  }, [points]);

  // Variance preservation percentage
  const variancePreserved = useMemo(() => {
    return Math.min(100, (projectedVariance / totalVariance) * 100);
  }, [projectedVariance, totalVariance]);

  // Find optimal angle (PCA first principal component)
  const optimalAngle = useMemo(() => {
    // Calculate covariance matrix
    const meanX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const meanY = points.reduce((sum, p) => sum + p[1], 0) / points.length;

    let cov_xx = 0, cov_xy = 0, cov_yy = 0;
    points.forEach(p => {
      const dx = p[0] - meanX;
      const dy = p[1] - meanY;
      cov_xx += dx * dx;
      cov_xy += dx * dy;
      cov_yy += dy * dy;
    });
    cov_xx /= points.length;
    cov_xy /= points.length;
    cov_yy /= points.length;

    // Find principal eigenvector direction
    // For 2x2 matrix, use analytical solution
    const theta = 0.5 * Math.atan2(2 * cov_xy, cov_xx - cov_yy);
    return (theta * 180) / Math.PI;
  }, [points]);

  // Draw the visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding}, ${padding})`);

    // Draw grid
    const gridGroup = mainGroup.append('g').attr('class', 'grid');
    for (let i = -4; i <= 4; i++) {
      gridGroup
        .append('line')
        .attr('x1', xScale(i))
        .attr('y1', 0)
        .attr('x2', xScale(i))
        .attr('y2', innerHeight)
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', i === 0 ? 1.5 : 0.5)
        .attr('opacity', 0.3);

      gridGroup
        .append('line')
        .attr('x1', 0)
        .attr('y1', yScale(i))
        .attr('x2', innerWidth)
        .attr('y2', yScale(i))
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', i === 0 ? 1.5 : 0.5)
        .attr('opacity', 0.3);
    }

    // Draw shadow/wall metaphor
    if (showShadowMetaphor) {
      // Draw "light source" indicator
      const lightX = xScale(-3.5);
      const lightY = yScale(3.5);

      mainGroup
        .append('circle')
        .attr('cx', lightX)
        .attr('cy', lightY)
        .attr('r', 15)
        .attr('fill', 'var(--viz-highlight)')
        .attr('opacity', 0.8);

      mainGroup
        .append('text')
        .attr('x', lightX)
        .attr('y', lightY - 25)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--viz-highlight)')
        .attr('font-size', '12px')
        .text('Light');
    }

    // Draw projection line
    if (showProjectionLine) {
      const lineLength = 5;
      const x1 = -lineLength * projectionDir[0];
      const y1 = -lineLength * projectionDir[1];
      const x2 = lineLength * projectionDir[0];
      const y2 = lineLength * projectionDir[1];

      // Projection line (the "wall")
      mainGroup
        .append('line')
        .attr('x1', xScale(x1))
        .attr('y1', yScale(y1))
        .attr('x2', xScale(x2))
        .attr('y2', yScale(y2))
        .attr('stroke', 'var(--viz-vector-secondary)')
        .attr('stroke-width', 4)
        .attr('opacity', 0.8);

      // Label
      mainGroup
        .append('text')
        .attr('x', xScale(x2) + 10)
        .attr('y', yScale(y2))
        .attr('fill', 'var(--viz-vector-secondary)')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Projection line');
    }

    // Draw projection rays and projected points
    if (showProjectedPoints) {
      const projectionGroup = mainGroup.append('g').attr('class', 'projections');

      points.forEach((point, i) => {
        const proj = projectPoint(point);
        const projX = proj * projectionDir[0];
        const projY = proj * projectionDir[1];

        // Draw ray from point to projection
        projectionGroup
          .append('line')
          .attr('x1', xScale(point[0]))
          .attr('y1', yScale(point[1]))
          .attr('x2', xScale(projX))
          .attr('y2', yScale(projY))
          .attr('stroke', 'var(--viz-ghost)')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
          .attr('opacity', 0.5);

        // Draw projected point (shadow)
        projectionGroup
          .append('circle')
          .attr('cx', xScale(projX))
          .attr('cy', yScale(projY))
          .attr('r', 5)
          .attr('fill', 'var(--viz-vector-secondary)')
          .attr('opacity', 0.8);
      });
    }

    // Draw original points
    const pointsGroup = mainGroup.append('g').attr('class', 'points');
    points.forEach((point, i) => {
      pointsGroup
        .append('circle')
        .attr('cx', xScale(point[0]))
        .attr('cy', yScale(point[1]))
        .attr('r', 6)
        .attr('fill', 'var(--viz-vector-primary)')
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5);
    });

    // Draw origin
    mainGroup
      .append('circle')
      .attr('cx', xScale(0))
      .attr('cy', yScale(0))
      .attr('r', 4)
      .attr('fill', 'var(--foreground)');

  }, [points, angle, projectionDir, showProjectionLine, showProjectedPoints, showShadowMetaphor, projectPoint, xScale, yScale, innerWidth, innerHeight]);

  // Handle angle change
  const handleAngleChange = useCallback((newAngle: number) => {
    setAngle(newAngle);
    markInteractionComplete(id);
  }, [id, markInteractionComplete]);

  // Snap to optimal angle
  const snapToOptimal = useCallback(() => {
    setAngle(optimalAngle);
    markInteractionComplete(id);
  }, [optimalAngle, id, markInteractionComplete]);

  return (
    <div className={`dimensionality-reducer ${className}`}>
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
          {/* Angle Slider */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--foreground)]/80">
                Projection Angle
              </label>
              <span className="font-mono text-sm font-bold text-[var(--viz-vector-secondary)]">
                {angle.toFixed(0)}°
              </span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              step="1"
              value={angle}
              onChange={(e) => handleAngleChange(parseFloat(e.target.value))}
              className="viz-slider viz-slider-y"
            />
            <div className="flex justify-between text-xs text-[var(--foreground)]/40 mt-1">
              <span>-90°</span>
              <span>0° (Horizontal)</span>
              <span>+90°</span>
            </div>

            <button
              onClick={snapToOptimal}
              className="mt-3 w-full py-2 px-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Find Optimal Angle (PCA)
            </button>
          </div>

          {/* Variance Display */}
          {showVariance && (
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]/80">
                  Information Preserved
                </span>
                <span className={`font-mono text-sm font-bold ${
                  variancePreserved > 80 ? 'text-[var(--success)]' :
                  variancePreserved > 50 ? 'text-[var(--warning)]' :
                  'text-[var(--error)]'
                }`}>
                  {variancePreserved.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-[var(--viz-grid)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    variancePreserved > 80 ? 'bg-[var(--success)]' :
                    variancePreserved > 50 ? 'bg-[var(--warning)]' :
                    'bg-[var(--error)]'
                  }`}
                  style={{ width: `${variancePreserved}%` }}
                />
              </div>

              <p className="text-xs text-[var(--foreground)]/50 mt-2">
                {variancePreserved > 80
                  ? "Excellent! This projection preserves most of the data's structure."
                  : variancePreserved > 50
                  ? "Some information is being lost. Try adjusting the angle."
                  : "Poor projection! The data is being squished. Find a better angle."}
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--viz-vector-primary)]"></span>
              <span className="text-[var(--foreground)]/70">Original points (2D)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--viz-vector-secondary)]"></span>
              <span className="text-[var(--foreground)]/70">Projected points (1D)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
