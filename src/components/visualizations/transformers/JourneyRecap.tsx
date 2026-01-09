'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface JourneyRecapProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface Chapter {
  id: number;
  title: string;
  part: number;
  partName: string;
  insight: string;
  color: string;
}

const chapters: Chapter[] = [
  { id: 1, title: 'Vectors', part: 1, partName: 'Linear Algebra', insight: 'Data is arrows in space', color: '#6366f1' },
  { id: 2, title: 'Matrices', part: 1, partName: 'Linear Algebra', insight: 'Transformations warp space', color: '#6366f1' },
  { id: 3, title: 'Dimensionality', part: 1, partName: 'Linear Algebra', insight: 'Compression preserves meaning', color: '#6366f1' },
  { id: 4, title: 'Derivatives', part: 2, partName: 'Calculus', insight: 'Sensitivity to change', color: '#22c55e' },
  { id: 5, title: 'Gradient Descent', part: 2, partName: 'Calculus', insight: 'Learning is rolling downhill', color: '#22c55e' },
  { id: 6, title: 'Backpropagation', part: 2, partName: 'Calculus', insight: 'Blame flows backward', color: '#22c55e' },
  { id: 7, title: 'Probability', part: 3, partName: 'Probability', insight: 'Quantified uncertainty', color: '#f59e0b' },
  { id: 8, title: 'Bayes', part: 3, partName: 'Probability', insight: 'Update beliefs with evidence', color: '#f59e0b' },
  { id: 9, title: 'Neurons', part: 4, partName: 'Neural Networks', insight: 'Weighted votes decide', color: '#ec4899' },
  { id: 10, title: 'Manifolds', part: 4, partName: 'Neural Networks', insight: 'Unfold the crumpled paper', color: '#ec4899' },
  { id: 11, title: 'Generative', part: 4, partName: 'Neural Networks', insight: 'Learn the space of possibilities', color: '#ec4899' },
  { id: 12, title: 'Attention', part: 5, partName: 'Transformers', insight: 'Dynamic information routing', color: '#8b5cf6' },
];

export function JourneyRecap({
  id = 'journey-recap',
  interactive = true,
  width = 700,
  height = 500,
  className = '',
}: JourneyRecapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredChapter, setHoveredChapter] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { markInteractionComplete } = useProgressStore();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 60, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const mainGroup = svg.append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Create spiral path for journey
    const spiralPoints: [number, number][] = [];
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    const maxRadius = Math.min(innerWidth, innerHeight) / 2 - 30;

    chapters.forEach((_, idx) => {
      const progress = idx / (chapters.length - 1);
      const angle = progress * Math.PI * 3 - Math.PI / 2; // 1.5 rotations
      const radius = 40 + progress * (maxRadius - 40);
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      spiralPoints.push([x, y]);
    });

    // Draw journey path
    const line = d3.line<[number, number]>()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Full path (faded)
    mainGroup.append('path')
      .datum(spiralPoints)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'var(--viz-grid)')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,5');

    // Animated path
    if (isAnimating || animationProgress > 0) {
      const visiblePoints = spiralPoints.slice(0, Math.floor(animationProgress * chapters.length) + 1);
      if (visiblePoints.length > 1) {
        mainGroup.append('path')
          .datum(visiblePoints)
          .attr('d', line)
          .attr('fill', 'none')
          .attr('stroke', 'var(--primary)')
          .attr('stroke-width', 3);
      }
    }

    // Draw chapter nodes
    chapters.forEach((chapter, idx) => {
      const [x, y] = spiralPoints[idx];
      const isHovered = hoveredChapter === idx;
      const isReached = animationProgress * chapters.length >= idx;

      // Node circle
      mainGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', isHovered ? 22 : 18)
        .attr('fill', isReached || !isAnimating ? chapter.color : 'var(--surface-elevated)')
        .attr('stroke', chapter.color)
        .attr('stroke-width', 2)
        .attr('opacity', isReached || !isAnimating ? 1 : 0.4)
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setHoveredChapter(idx))
        .on('mouseleave', () => setHoveredChapter(null))
        .on('click', () => markInteractionComplete(id));

      // Chapter number
      mainGroup.append('text')
        .attr('x', x)
        .attr('y', y + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', isReached || !isAnimating ? 'white' : 'var(--foreground)')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none')
        .text(chapter.id);

      // Hover info
      if (isHovered) {
        const infoWidth = 160;
        const infoHeight = 55;
        let infoX = x + 30;
        let infoY = y - 25;

        // Keep info box within bounds
        if (infoX + infoWidth > innerWidth) {
          infoX = x - infoWidth - 30;
        }
        if (infoY + infoHeight > innerHeight) {
          infoY = innerHeight - infoHeight;
        }
        if (infoY < 0) {
          infoY = 0;
        }

        mainGroup.append('rect')
          .attr('x', infoX)
          .attr('y', infoY)
          .attr('width', infoWidth)
          .attr('height', infoHeight)
          .attr('fill', 'var(--surface-elevated)')
          .attr('stroke', chapter.color)
          .attr('stroke-width', 2)
          .attr('rx', 8);

        mainGroup.append('text')
          .attr('x', infoX + 10)
          .attr('y', infoY + 18)
          .attr('fill', chapter.color)
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(`Ch ${chapter.id}: ${chapter.title}`);

        mainGroup.append('text')
          .attr('x', infoX + 10)
          .attr('y', infoY + 34)
          .attr('fill', 'var(--foreground)')
          .attr('font-size', '10px')
          .attr('opacity', 0.6)
          .text(chapter.partName);

        mainGroup.append('text')
          .attr('x', infoX + 10)
          .attr('y', infoY + 48)
          .attr('fill', 'var(--foreground)')
          .attr('font-size', '10px')
          .text(chapter.insight);
      }
    });

    // Start point label
    svg.append('text')
      .attr('x', padding.left + centerX)
      .attr('y', padding.top + centerY)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '10px')
      .attr('opacity', 0.5)
      .text('Start');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Your Learning Journey');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .attr('opacity', 0.6)
      .text('Hover over chapters to see key insights');

    // Part legend
    const parts = [
      { name: 'Linear Algebra', color: '#6366f1' },
      { name: 'Calculus', color: '#22c55e' },
      { name: 'Probability', color: '#f59e0b' },
      { name: 'Neural Networks', color: '#ec4899' },
      { name: 'Transformers', color: '#8b5cf6' },
    ];

    parts.forEach((part, idx) => {
      const legendX = 50 + idx * 130;
      const legendY = height - 25;

      svg.append('circle')
        .attr('cx', legendX)
        .attr('cy', legendY)
        .attr('r', 6)
        .attr('fill', part.color);

      svg.append('text')
        .attr('x', legendX + 12)
        .attr('y', legendY + 4)
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '10px')
        .text(part.name);
    });

  }, [hoveredChapter, animationProgress, isAnimating, width, height, id, markInteractionComplete]);

  // Animation
  useEffect(() => {
    if (!isAnimating) return;

    const animate = () => {
      setAnimationProgress(prev => {
        const next = prev + 0.02;
        if (next >= 1) {
          setIsAnimating(false);
          return 1;
        }
        return next;
      });
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const playAnimation = () => {
    setAnimationProgress(0);
    setIsAnimating(true);
    markInteractionComplete(id);
  };

  return (
    <div className={`journey-recap ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">
                  Replay Your Journey
                </div>
                <div className="text-xs text-[var(--foreground)]/60">
                  Watch the path of mathematical intuition unfold
                </div>
              </div>
              <button
                onClick={playAnimation}
                disabled={isAnimating}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Journey
              </button>
            </div>
          </div>

          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">The Path:</strong>{' '}
              From vectors to attention, each concept builds on the last. You didn&apos;t just
              learn 12 topics—you built a unified mental model of how machines learn.
              Every chapter was a necessary step in this spiral of understanding.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
