'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface ThreePillarsProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

type Pillar = 'representation' | 'optimization' | 'generalization' | null;

const pillarInfo: Record<Exclude<Pillar, null>, {
  title: string;
  chapters: string[];
  essence: string;
  color: string;
  icon: string;
}> = {
  representation: {
    title: 'Representation',
    chapters: ['Vectors', 'Matrices', 'Dimensionality', 'Embeddings'],
    essence: 'Turn messy reality into clean geometry. Words become arrows, images become points, ideas become coordinates.',
    color: '#6366f1',
    icon: '📐',
  },
  optimization: {
    title: 'Optimization',
    chapters: ['Derivatives', 'Gradient Descent', 'Backpropagation', 'Loss Landscapes'],
    essence: 'Find the best settings by rolling downhill. Every AI is just finding the bottom of a mathematical valley.',
    color: '#22c55e',
    icon: '⛰️',
  },
  generalization: {
    title: 'Generalization',
    chapters: ['Probability', 'Bayes', 'Manifolds', 'Attention'],
    essence: 'Learn patterns, not examples. The magic is in recognizing the deep structure behind the training data.',
    color: '#f59e0b',
    icon: '🔮',
  },
};

export function ThreePillars({
  id = 'three-pillars',
  interactive = true,
  width = 700,
  height = 400,
  className = '',
}: ThreePillarsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedPillar, setSelectedPillar] = useState<Pillar>(null);
  const [showConnections, setShowConnections] = useState(false);

  const { markInteractionComplete } = useProgressStore();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const pillarWidth = 140;
    const pillarHeight = 180;
    const spacing = 180;

    // Draw connections if enabled
    if (showConnections) {
      const pillars = ['representation', 'optimization', 'generalization'];
      const positions = [
        { x: centerX - spacing, y: centerY },
        { x: centerX, y: centerY },
        { x: centerX + spacing, y: centerY },
      ];

      // Draw triangular connections
      svg.append('path')
        .attr('d', `M ${positions[0].x} ${positions[0].y - 40}
                    L ${positions[1].x} ${positions[1].y - 40}
                    L ${positions[2].x} ${positions[2].y - 40}
                    Z`)
        .attr('fill', 'none')
        .attr('stroke', 'var(--primary)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.5);

      // Center point - "Intelligence"
      svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY - 80)
        .attr('r', 30)
        .attr('fill', 'var(--primary)')
        .attr('opacity', 0.2);

      svg.append('text')
        .attr('x', centerX)
        .attr('y', centerY - 76)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--primary)')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('Intelligence');

      // Connection lines to center
      positions.forEach((pos, idx) => {
        svg.append('line')
          .attr('x1', pos.x)
          .attr('y1', pos.y - pillarHeight / 2)
          .attr('x2', centerX)
          .attr('y2', centerY - 55)
          .attr('stroke', pillarInfo[pillars[idx] as Exclude<Pillar, null>].color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.4);
      });
    }

    // Draw pillars
    const pillarKeys: Exclude<Pillar, null>[] = ['representation', 'optimization', 'generalization'];
    pillarKeys.forEach((key, idx) => {
      const info = pillarInfo[key];
      const x = centerX + (idx - 1) * spacing;
      const y = centerY;
      const isSelected = selectedPillar === key;

      // Pillar shadow
      svg.append('rect')
        .attr('x', x - pillarWidth / 2 + 4)
        .attr('y', y - pillarHeight / 2 + 4)
        .attr('width', pillarWidth)
        .attr('height', pillarHeight)
        .attr('fill', 'var(--foreground)')
        .attr('opacity', 0.1)
        .attr('rx', 12);

      // Pillar body
      svg.append('rect')
        .attr('x', x - pillarWidth / 2)
        .attr('y', y - pillarHeight / 2)
        .attr('width', pillarWidth)
        .attr('height', pillarHeight)
        .attr('fill', isSelected ? info.color : 'var(--surface-elevated)')
        .attr('stroke', info.color)
        .attr('stroke-width', isSelected ? 3 : 2)
        .attr('rx', 12)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setSelectedPillar(selectedPillar === key ? null : key);
          markInteractionComplete(id);
        })
        .on('mouseenter', function() {
          d3.select(this).attr('stroke-width', 3);
        })
        .on('mouseleave', function() {
          if (!isSelected) d3.select(this).attr('stroke-width', 2);
        });

      // Icon
      svg.append('text')
        .attr('x', x)
        .attr('y', y - pillarHeight / 2 + 35)
        .attr('text-anchor', 'middle')
        .attr('font-size', '28px')
        .attr('pointer-events', 'none')
        .text(info.icon);

      // Title
      svg.append('text')
        .attr('x', x)
        .attr('y', y - pillarHeight / 2 + 65)
        .attr('text-anchor', 'middle')
        .attr('fill', isSelected ? 'white' : info.color)
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none')
        .text(info.title);

      // Chapter list
      info.chapters.forEach((chapter, cidx) => {
        svg.append('text')
          .attr('x', x)
          .attr('y', y - pillarHeight / 2 + 90 + cidx * 18)
          .attr('text-anchor', 'middle')
          .attr('fill', isSelected ? 'rgba(255,255,255,0.8)' : 'var(--foreground)')
          .attr('font-size', '10px')
          .attr('opacity', isSelected ? 1 : 0.6)
          .attr('pointer-events', 'none')
          .text(chapter);
      });
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('The Three Pillars of AI');

    // Subtitle
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .attr('opacity', 0.6)
      .text('Click a pillar to explore');

    // Footer - selected pillar essence
    if (selectedPillar) {
      const info = pillarInfo[selectedPillar];

      svg.append('rect')
        .attr('x', 30)
        .attr('y', height - 55)
        .attr('width', width - 60)
        .attr('height', 45)
        .attr('fill', `${info.color}15`)
        .attr('stroke', info.color)
        .attr('stroke-width', 1)
        .attr('rx', 8);

      // Wrap text
      const words = info.essence.split(' ');
      let line = '';
      let lineNum = 0;
      const maxWidth = 80;

      words.forEach((word) => {
        const testLine = line + word + ' ';
        if (testLine.length > maxWidth && line.length > 0) {
          svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 38 + lineNum * 14)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--foreground)')
            .attr('font-size', '11px')
            .text(line.trim());
          line = word + ' ';
          lineNum++;
        } else {
          line = testLine;
        }
      });
      if (line.trim()) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height - 38 + lineNum * 14)
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--foreground)')
          .attr('font-size', '11px')
          .text(line.trim());
      }
    }

  }, [selectedPillar, showConnections, width, height, id, markInteractionComplete]);

  const resetToDefaults = useCallback(() => {
    setSelectedPillar(null);
    setShowConnections(false);
  }, []);

  return (
    <div className={`three-pillars ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showConnections}
                  onChange={(e) => {
                    setShowConnections(e.target.checked);
                    markInteractionComplete(id);
                  }}
                  className="w-4 h-4 rounded"
                />
                <div>
                  <span className="text-sm text-[var(--foreground)]">
                    Show how pillars combine into intelligence
                  </span>
                </div>
              </label>
              {(selectedPillar || showConnections) && (
                <button
                  onClick={resetToDefaults}
                  className="px-2 py-1 text-xs rounded-md bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)] text-[var(--foreground)]/70 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Insight */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">The Unity:</strong>{' '}
              These aren&apos;t separate topics—they&apos;re three views of one phenomenon.
              Representation gives optimization something to search. Optimization finds
              patterns that generalize. Generalization justifies the representation.
              Intelligence emerges where all three meet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
