'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/lib/stores/progressStore';

interface ManifoldExplorerProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  t: number; // parameter along the manifold
  color: string;
}

// Generate Swiss Roll data
function generateSwissRoll(n: number = 200): Point3D[] {
  const points: Point3D[] = [];
  const colorScale = d3.scaleSequential(d3.interpolateRainbow);

  for (let i = 0; i < n; i++) {
    const t = 1.5 * Math.PI * (1 + 2 * Math.random());
    const height = 21 * Math.random();

    points.push({
      x: t * Math.cos(t),
      y: height,
      z: t * Math.sin(t),
      t: t,
      color: colorScale(t / (4.5 * Math.PI)),
    });
  }

  return points;
}

// Generate S-curve data
function generateSCurve(n: number = 200): Point3D[] {
  const points: Point3D[] = [];
  const colorScale = d3.scaleSequential(d3.interpolateViridis);

  for (let i = 0; i < n; i++) {
    const t = 3 * Math.PI * (Math.random() - 0.5);
    const height = 2 * Math.random();

    points.push({
      x: Math.sin(t),
      y: height,
      z: Math.sign(t) * (Math.cos(t) - 1),
      t: (t + 1.5 * Math.PI) / (3 * Math.PI),
      color: colorScale((t + 1.5 * Math.PI) / (3 * Math.PI)),
    });
  }

  return points;
}

type DatasetType = 'swiss-roll' | 's-curve';

export function ManifoldExplorer({
  id = 'manifold-explorer',
  interactive = true,
  width = 600,
  height = 400,
  className = '',
}: ManifoldExplorerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dataset, setDataset] = useState<DatasetType>('swiss-roll');
  const [unfoldAmount, setUnfoldAmount] = useState(0); // 0 = 3D, 1 = fully unfolded
  const [rotationAngle, setRotationAngle] = useState(30);
  const [showDistanceDemo, setShowDistanceDemo] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<[number, number] | null>(null);

  const { markInteractionComplete } = useProgressStore();

  // Generate data based on selected dataset
  const points = useMemo(() => {
    return dataset === 'swiss-roll' ? generateSwissRoll(150) : generateSCurve(150);
  }, [dataset]);

  // Find two points that are close in 3D but far on the manifold
  const demoPoints = useMemo(() => {
    if (!showDistanceDemo || points.length < 2) return null;

    // Find two points that are close in Euclidean space but far on the manifold
    let bestPair: [number, number] = [0, 1];
    let bestRatio = 0;

    for (let i = 0; i < Math.min(50, points.length); i++) {
      for (let j = i + 1; j < Math.min(50, points.length); j++) {
        const p1 = points[i];
        const p2 = points[j];

        // Euclidean distance in 3D
        const euclidean = Math.sqrt(
          (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2
        );

        // Manifold distance (using t parameter)
        const manifold = Math.abs(p1.t - p2.t) * 5;

        if (euclidean > 0.5 && euclidean < 8) {
          const ratio = manifold / euclidean;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestPair = [i, j];
          }
        }
      }
    }

    return bestPair;
  }, [points, showDistanceDemo]);

  // Draw visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Project 3D to 2D with rotation and unfolding
    const angleRad = (rotationAngle * Math.PI) / 180;

    const projectPoint = (p: Point3D): { x: number; y: number } => {
      // Interpolate between 3D projection and 2D unfolded
      const x3d = p.x * Math.cos(angleRad) - p.z * Math.sin(angleRad);
      const y3d = p.y;

      // Unfolded coordinates (using t parameter)
      const x2d = p.t * 3 - 15;
      const y2d = p.y;

      return {
        x: x3d * (1 - unfoldAmount) + x2d * unfoldAmount,
        y: y3d,
      };
    };

    // Calculate bounds
    const projected = points.map(projectPoint);
    const xExtent = d3.extent(projected, d => d.x) as [number, number];
    const yExtent = d3.extent(projected, d => d.y) as [number, number];

    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - 2, xExtent[1] + 2])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - 2, yExtent[1] + 2])
      .range([innerHeight, 0]);

    // Sort points by depth for proper rendering
    const sortedIndices = points
      .map((p, i) => ({ p, i }))
      .sort((a, b) => {
        const za = a.p.x * Math.sin(angleRad) + a.p.z * Math.cos(angleRad);
        const zb = b.p.x * Math.sin(angleRad) + b.p.z * Math.cos(angleRad);
        return za - zb;
      })
      .map(d => d.i);

    // Draw connecting lines for nearby points (to show manifold structure)
    if (unfoldAmount < 0.5) {
      const lineGroup = mainGroup.append('g').attr('opacity', 0.3);

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i];
          const p2 = points[j];
          const manifoldDist = Math.abs(p1.t - p2.t);

          if (manifoldDist < 0.5) {
            const proj1 = projectPoint(p1);
            const proj2 = projectPoint(p2);

            lineGroup.append('line')
              .attr('x1', xScale(proj1.x))
              .attr('y1', yScale(proj1.y))
              .attr('x2', xScale(proj2.x))
              .attr('y2', yScale(proj2.y))
              .attr('stroke', p1.color)
              .attr('stroke-width', 0.5);
          }
        }
      }
    }

    // Draw points
    sortedIndices.forEach(i => {
      const p = points[i];
      const proj = projectPoint(p);

      const isDemo = demoPoints && (i === demoPoints[0] || i === demoPoints[1]);

      mainGroup.append('circle')
        .attr('cx', xScale(proj.x))
        .attr('cy', yScale(proj.y))
        .attr('r', isDemo ? 8 : 4)
        .attr('fill', p.color)
        .attr('stroke', isDemo ? 'white' : 'none')
        .attr('stroke-width', isDemo ? 3 : 0)
        .attr('opacity', 0.8);
    });

    // Draw distance demo lines
    if (showDistanceDemo && demoPoints) {
      const p1 = points[demoPoints[0]];
      const p2 = points[demoPoints[1]];
      const proj1 = projectPoint(p1);
      const proj2 = projectPoint(p2);

      // Euclidean line (straight)
      mainGroup.append('line')
        .attr('x1', xScale(proj1.x))
        .attr('y1', yScale(proj1.y))
        .attr('x2', xScale(proj2.x))
        .attr('y2', yScale(proj2.y))
        .attr('stroke', 'var(--error)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      // Labels
      const midX = (xScale(proj1.x) + xScale(proj2.x)) / 2;
      const midY = (yScale(proj1.y) + yScale(proj2.y)) / 2;

      mainGroup.append('text')
        .attr('x', midX)
        .attr('y', midY - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--error)')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('Euclidean: Short!');
    }

    // Title
    const title = unfoldAmount < 0.3
      ? (dataset === 'swiss-roll' ? 'Swiss Roll (3D Manifold)' : 'S-Curve (3D Manifold)')
      : unfoldAmount > 0.7
      ? 'Unfolded (2D)'
      : 'Unfolding...';

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(title);

  }, [points, dataset, unfoldAmount, rotationAngle, showDistanceDemo, demoPoints, width, height]);

  const handleDatasetChange = useCallback((newDataset: DatasetType) => {
    setDataset(newDataset);
    setUnfoldAmount(0);
    markInteractionComplete(id);
  }, [id, markInteractionComplete]);

  const resetToDefaults = useCallback(() => {
    setUnfoldAmount(0);
    setRotationAngle(30);
    setShowDistanceDemo(false);
  }, []);

  const isModified = unfoldAmount !== 0 || rotationAngle !== 30 || showDistanceDemo;

  return (
    <div className={`manifold-explorer ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Dataset Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]/70">
                Choose manifold:
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
            <div className="flex gap-2">
              <button
                onClick={() => handleDatasetChange('swiss-roll')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dataset === 'swiss-roll'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                }`}
              >
                Swiss Roll
              </button>
              <button
                onClick={() => handleDatasetChange('s-curve')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dataset === 's-curve'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                }`}
              >
                S-Curve
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--foreground)]/60">
                    Unfold Amount
                  </label>
                  <span className="font-mono text-xs text-[var(--primary)]">
                    {(unfoldAmount * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={unfoldAmount}
                  onChange={(e) => {
                    setUnfoldAmount(parseFloat(e.target.value));
                    markInteractionComplete(id);
                  }}
                  className="viz-slider"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--foreground)]/60">
                    Rotation
                  </label>
                  <span className="font-mono text-xs text-[var(--primary)]">
                    {rotationAngle}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={rotationAngle}
                  onChange={(e) => {
                    setRotationAngle(parseFloat(e.target.value));
                    markInteractionComplete(id);
                  }}
                  className="viz-slider"
                />
              </div>
            </div>
          </div>

          {/* Distance Demo Toggle */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showDistanceDemo}
                onChange={(e) => {
                  setShowDistanceDemo(e.target.checked);
                  markInteractionComplete(id);
                }}
                className="w-4 h-4 rounded border-[var(--viz-grid)]"
              />
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">
                  Show Distance Paradox
                </div>
                <div className="text-xs text-[var(--foreground)]/60">
                  Two points close in 3D can be far apart on the manifold
                </div>
              </div>
            </label>
          </div>

          {/* Explanation */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">The Key Insight:</strong>{' '}
              {unfoldAmount < 0.3 ? (
                <>
                  The data looks like a crumpled 3D shape, but it actually lies on a <strong>2D surface</strong>.
                  Colors show the true &quot;position&quot; along the manifold—notice how nearby colors are
                  neighbors on the surface, even if they&apos;re far in 3D space.
                </>
              ) : unfoldAmount > 0.7 ? (
                <>
                  Unfolded! Now the <strong>true structure</strong> is revealed. Points that were
                  tangled in 3D are now laid out simply. This is what neural networks learn to do—
                  they &quot;unfold&quot; complex data into simpler representations.
                </>
              ) : (
                <>
                  Watch the manifold unfold... The neural network learns a transformation that
                  &quot;flattens&quot; the data while preserving meaningful relationships.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
