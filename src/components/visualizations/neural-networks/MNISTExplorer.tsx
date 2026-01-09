'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface MNISTExplorerProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface DigitPoint {
  x: number;
  y: number;
  digit: number;
  pixelData: number[][];
}

// Cluster centers for each digit (simulating t-SNE output)
// Arranged to reflect actual digit similarities:
// - 3, 5, 8 cluster together (curved shapes with loops)
// - 1, 7 are neighbors (vertical strokes)
// - 4, 9 are close (angular with vertical components)
// - 0 is isolated (distinctive round shape)
// - 6 near 0 and 5 (round top, curved)
// - 2 bridges curved and angular groups
const clusterCenters: Record<number, { x: number; y: number }> = {
  0: { x: -38, y: 30 },      // Isolated - distinctive round shape
  1: { x: 38, y: 28 },       // Near 7 - vertical strokes
  7: { x: 32, y: 22 },       // Near 1 - similar vertical stroke
  4: { x: 35, y: -5 },       // Near 9 - angular shapes
  9: { x: 28, y: -10 },      // Near 4 - similar structure
  3: { x: -8, y: -12 },      // OVERLAPS with 5, 8 - curved shapes
  5: { x: -10, y: -8 },      // OVERLAPS with 3, 8 - curved shapes
  8: { x: -6, y: -10 },      // OVERLAPS with 3, 5 - curved loops
  6: { x: -28, y: 8 },       // Near 0, 5 - round top
  2: { x: 10, y: -28 },      // Between groups - has curves and angles
};

// Generate a simple pixel representation of a digit
function generateDigitPixels(digit: number, variation: number): number[][] {
  const size = 8;
  const pixels: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

  // Simple patterns for each digit with some variation
  const patterns: Record<number, (r: number, c: number, v: number) => number> = {
    0: (r, c, v) => {
      const isEdge = r === 1 || r === 6 || c === 1 || c === 6;
      const isCorner = (r <= 2 || r >= 5) && (c <= 2 || c >= 5);
      return (isEdge && !isCorner) || ((r === 2 || r === 5) && c >= 2 && c <= 5) ? 0.8 + v * 0.2 : 0;
    },
    1: (r, c, v) => {
      return c === 4 || (c === 3 && r <= 2) ? 0.9 + v * 0.1 : 0;
    },
    2: (r, c, v) => {
      if (r === 1 && c >= 2 && c <= 5) return 0.8 + v * 0.2;
      if (r === 2 && c === 5) return 0.8;
      if (r === 3 && c >= 3 && c <= 5) return 0.9;
      if (r === 4 && c === 2) return 0.8;
      if (r === 5 && c >= 2 && c <= 3) return 0.8;
      if (r === 6 && c >= 2 && c <= 5) return 0.9 + v * 0.1;
      return 0;
    },
    3: (r, c, v) => {
      if ((r === 1 || r === 4 || r === 6) && c >= 2 && c <= 5) return 0.8 + v * 0.2;
      if (c === 5 && r >= 1 && r <= 6) return 0.9;
      return 0;
    },
    4: (r, c, v) => {
      if (c === 5 && r >= 1 && r <= 6) return 0.9 + v * 0.1;
      if (c === 2 && r >= 1 && r <= 4) return 0.8;
      if (r === 4 && c >= 2 && c <= 5) return 0.9;
      return 0;
    },
    5: (r, c, v) => {
      if (r === 1 && c >= 2 && c <= 5) return 0.8 + v * 0.2;
      if (r === 2 && c === 2) return 0.8;
      if (r === 3 && c >= 2 && c <= 5) return 0.9;
      if (r === 4 && c === 5) return 0.8;
      if (r === 5 && c === 5) return 0.8;
      if (r === 6 && c >= 2 && c <= 5) return 0.9 + v * 0.1;
      return 0;
    },
    6: (r, c, v) => {
      if (c === 2 && r >= 1 && r <= 6) return 0.9;
      if ((r === 1 || r === 4 || r === 6) && c >= 2 && c <= 5) return 0.8 + v * 0.2;
      if (c === 5 && r >= 4 && r <= 6) return 0.8;
      return 0;
    },
    7: (r, c, v) => {
      if (r === 1 && c >= 2 && c <= 5) return 0.9 + v * 0.1;
      if (c === 5 && r >= 1 && r <= 3) return 0.8;
      if (c === 4 && r >= 3 && r <= 5) return 0.8 + v * 0.2;
      if (c === 3 && r >= 5 && r <= 6) return 0.9;
      return 0;
    },
    8: (r, c, v) => {
      if ((r === 1 || r === 4 || r === 6) && c >= 2 && c <= 5) return 0.8 + v * 0.2;
      if ((c === 2 || c === 5) && r >= 1 && r <= 6) return 0.9;
      return 0;
    },
    9: (r, c, v) => {
      if (c === 5 && r >= 1 && r <= 6) return 0.9;
      if ((r === 1 || r === 4) && c >= 2 && c <= 5) return 0.8 + v * 0.2;
      if (c === 2 && r >= 1 && r <= 4) return 0.8;
      return 0;
    },
  };

  const pattern = patterns[digit];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const baseValue = pattern(r, c, variation);
      // Add some noise for variation
      const noise = (Math.random() - 0.5) * 0.15 * variation;
      pixels[r][c] = Math.max(0, Math.min(1, baseValue + noise));
    }
  }

  return pixels;
}

// Generate points for visualization
function generateMNISTPoints(pointsPerDigit: number = 15): DigitPoint[] {
  const points: DigitPoint[] = [];

  for (let digit = 0; digit <= 9; digit++) {
    const center = clusterCenters[digit];

    for (let i = 0; i < pointsPerDigit; i++) {
      // Add some scatter around the cluster center
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 8 + Math.random() * 4;
      const variation = Math.random();

      points.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
        digit,
        pixelData: generateDigitPixels(digit, variation),
      });
    }
  }

  return points;
}

// Color scale for digits
const digitColors = [
  '#e41a1c', // 0 - red
  '#377eb8', // 1 - blue
  '#4daf4a', // 2 - green
  '#984ea3', // 3 - purple
  '#ff7f00', // 4 - orange
  '#ffff33', // 5 - yellow
  '#a65628', // 6 - brown
  '#f781bf', // 7 - pink
  '#999999', // 8 - gray
  '#17becf', // 9 - cyan
];

export function MNISTExplorer({
  id = 'mnist-explorer',
  interactive = true,
  width = 650,
  height = 450,
  className = '',
}: MNISTExplorerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [points] = useState<DigitPoint[]>(() => generateMNISTPoints(20));
  const [hoveredPoint, setHoveredPoint] = useState<DigitPoint | null>(null);
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showConnections, setShowConnections] = useState(false);

  const { markInteractionComplete } = useProgressStore();

  // Filter points based on selection
  const visiblePoints = useMemo(() => {
    if (selectedDigit === null) return points;
    return points.filter(p => p.digit === selectedDigit);
  }, [points, selectedDigit]);

  // Draw visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 40, right: 150, bottom: 40, left: 40 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Scales
    const xScale = d3.scaleLinear().domain([-50, 50]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([-45, 45]).range([innerHeight, 0]);

    // Draw connections between nearby same-digit points
    if (showConnections) {
      visiblePoints.forEach((p1, i) => {
        visiblePoints.forEach((p2, j) => {
          if (i < j && p1.digit === p2.digit) {
            const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            if (dist < 12) {
              mainGroup.append('line')
                .attr('x1', xScale(p1.x))
                .attr('y1', yScale(p1.y))
                .attr('x2', xScale(p2.x))
                .attr('y2', yScale(p2.y))
                .attr('stroke', digitColors[p1.digit])
                .attr('stroke-width', 0.5)
                .attr('opacity', 0.3);
            }
          }
        });
      });
    }

    // Draw points
    visiblePoints.forEach((p) => {
      const isHighlighted = selectedDigit === null || p.digit === selectedDigit;
      const isHovered = hoveredPoint === p;

      mainGroup.append('circle')
        .attr('cx', xScale(p.x))
        .attr('cy', yScale(p.y))
        .attr('r', isHovered ? 8 : 5)
        .attr('fill', digitColors[p.digit])
        .attr('stroke', isHovered ? 'white' : 'none')
        .attr('stroke-width', 2)
        .attr('opacity', isHighlighted ? 0.8 : 0.2)
        .attr('cursor', 'pointer')
        .on('mouseenter', function() {
          setHoveredPoint(p);
        })
        .on('mouseleave', function() {
          setHoveredPoint(null);
        });
    });

    // Draw cluster labels
    if (showLabels && selectedDigit === null) {
      Object.entries(clusterCenters).forEach(([digit, center]) => {
        mainGroup.append('text')
          .attr('x', xScale(center.x))
          .attr('y', yScale(center.y))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '20px')
          .attr('font-weight', 'bold')
          .attr('opacity', 0.9)
          .attr('pointer-events', 'none')
          .attr('text-shadow', '0 0 10px rgba(0,0,0,0.8)')
          .style('text-shadow', `0 0 8px ${digitColors[parseInt(digit)]}, 0 0 15px rgba(0,0,0,0.8)`)
          .text(digit);
      });
    }

    // Title
    svg.append('text')
      .attr('x', width / 2 - 50)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('MNIST Digits - 2D Manifold Projection (t-SNE style)');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 130}, ${padding.top})`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Digit Classes');

    for (let digit = 0; digit <= 9; digit++) {
      const y = 20 + digit * 22;
      const isSelected = selectedDigit === digit;

      legend.append('rect')
        .attr('x', 0)
        .attr('y', y - 8)
        .attr('width', 80)
        .attr('height', 18)
        .attr('fill', isSelected ? digitColors[digit] : 'transparent')
        .attr('stroke', digitColors[digit])
        .attr('stroke-width', 1)
        .attr('rx', 4)
        .attr('cursor', 'pointer')
        .attr('opacity', selectedDigit === null || isSelected ? 1 : 0.3)
        .on('click', function() {
          setSelectedDigit(isSelected ? null : digit);
          markInteractionComplete(id);
        });

      legend.append('circle')
        .attr('cx', 15)
        .attr('cy', y)
        .attr('r', 5)
        .attr('fill', digitColors[digit])
        .attr('pointer-events', 'none');

      legend.append('text')
        .attr('x', 28)
        .attr('y', y + 4)
        .attr('fill', isSelected ? 'white' : 'var(--foreground)')
        .attr('font-size', '12px')
        .attr('pointer-events', 'none')
        .text(`Digit ${digit}`);
    }

  }, [visiblePoints, hoveredPoint, selectedDigit, showLabels, showConnections, width, height, id, markInteractionComplete]);

  // Render the hovered digit
  const renderDigitPreview = () => {
    if (!hoveredPoint) return null;

    const pixelSize = 10;
    const pixels = hoveredPoint.pixelData;

    return (
      <div className="absolute top-4 right-4 bg-[var(--surface)] border border-[var(--viz-grid)] rounded-lg p-3 shadow-lg">
        <div className="text-center mb-2">
          <span className="text-2xl font-bold" style={{ color: digitColors[hoveredPoint.digit] }}>
            {hoveredPoint.digit}
          </span>
        </div>
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(8, ${pixelSize}px)`,
          }}
        >
          {pixels.map((row, r) =>
            row.map((value, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: `rgba(255, 255, 255, ${value})`,
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`mnist-explorer relative ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {hoveredPoint && renderDigitPreview()}

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => {
                    setShowLabels(e.target.checked);
                    markInteractionComplete(id);
                  }}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-[var(--foreground)]">Show cluster labels</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showConnections}
                  onChange={(e) => {
                    setShowConnections(e.target.checked);
                    markInteractionComplete(id);
                  }}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-[var(--foreground)]">Show neighbor connections</span>
              </label>
              {selectedDigit !== null && (
                <button
                  onClick={() => setSelectedDigit(null)}
                  className="px-3 py-1 text-sm rounded-lg bg-[var(--primary)] text-white hover:opacity-90"
                >
                  Show all digits
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">What you&apos;re seeing:</strong>{' '}
              Each point represents a handwritten digit image (originally 28×28 = 784 dimensions).
              Using t-SNE, we project this high-dimensional data to 2D while preserving neighborhood
              relationships. Notice how <strong>similar digits cluster together</strong>—the 784-dimensional
              manifold of digit images has been &quot;unfolded&quot; into this 2D view.
            </p>
            <p className="text-sm text-[var(--foreground)]/60 mt-2">
              <em>Hover over points to see the digit. Click legend items to filter.</em>
            </p>
          </div>

          {/* Observations */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <h4 className="font-bold text-[var(--foreground)] mb-3">Observations to explore:</h4>
            <ul className="text-sm text-[var(--foreground)]/70 space-y-2">
              <li>• <strong>1s and 7s</strong> are neighbors—they share similar strokes</li>
              <li>• <strong>3s, 5s, and 8s</strong> have overlapping regions—curved shapes</li>
              <li>• <strong>4s and 9s</strong> can look similar (both have vertical strokes)</li>
              <li>• <strong>0s</strong> are isolated—their round shape is distinctive</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
