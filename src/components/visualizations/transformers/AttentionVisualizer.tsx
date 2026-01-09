'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface AttentionVisualizerProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface SentenceExample {
  tokens: string[];
  attentionMatrix: number[][];
  description: string;
  highlight?: { from: number; to: number; explanation: string };
}

const examples: Record<string, SentenceExample> = {
  pronoun: {
    tokens: ['The', 'cat', 'sat', 'on', 'the', 'mat', 'because', 'it', 'was', 'tired'],
    attentionMatrix: [
      [0.8, 0.1, 0.02, 0.02, 0.02, 0.02, 0.01, 0.01, 0.0, 0.0],
      [0.1, 0.7, 0.05, 0.02, 0.03, 0.05, 0.02, 0.02, 0.01, 0.0],
      [0.05, 0.3, 0.4, 0.1, 0.05, 0.05, 0.02, 0.02, 0.01, 0.0],
      [0.02, 0.1, 0.2, 0.5, 0.1, 0.05, 0.02, 0.01, 0.0, 0.0],
      [0.02, 0.05, 0.05, 0.1, 0.6, 0.1, 0.05, 0.02, 0.01, 0.0],
      [0.02, 0.05, 0.1, 0.1, 0.2, 0.4, 0.08, 0.03, 0.02, 0.0],
      [0.02, 0.1, 0.1, 0.05, 0.05, 0.1, 0.5, 0.05, 0.02, 0.01],
      [0.05, 0.6, 0.05, 0.02, 0.02, 0.08, 0.05, 0.1, 0.02, 0.01], // "it" attends strongly to "cat"
      [0.02, 0.15, 0.05, 0.02, 0.02, 0.05, 0.05, 0.2, 0.4, 0.04],
      [0.02, 0.2, 0.05, 0.02, 0.02, 0.05, 0.05, 0.15, 0.15, 0.29],
    ],
    description: 'Pronoun resolution: What does "it" refer to?',
    highlight: { from: 7, to: 1, explanation: '"it" strongly attends to "cat" — resolving the pronoun!' },
  },
  subject: {
    tokens: ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'],
    attentionMatrix: [
      [0.7, 0.1, 0.1, 0.05, 0.02, 0.01, 0.01, 0.01, 0.0],
      [0.1, 0.5, 0.2, 0.15, 0.02, 0.01, 0.01, 0.01, 0.0],
      [0.1, 0.2, 0.4, 0.2, 0.05, 0.02, 0.02, 0.01, 0.0],
      [0.15, 0.2, 0.2, 0.3, 0.1, 0.02, 0.02, 0.01, 0.0],
      [0.1, 0.1, 0.1, 0.4, 0.2, 0.05, 0.02, 0.02, 0.01], // "jumps" attends to "fox"
      [0.02, 0.02, 0.02, 0.1, 0.3, 0.4, 0.08, 0.04, 0.02],
      [0.02, 0.02, 0.02, 0.02, 0.05, 0.1, 0.6, 0.1, 0.07],
      [0.02, 0.02, 0.02, 0.02, 0.05, 0.05, 0.15, 0.5, 0.17],
      [0.02, 0.02, 0.02, 0.05, 0.1, 0.1, 0.15, 0.25, 0.29],
    ],
    description: 'Subject-verb agreement: Who jumps?',
    highlight: { from: 4, to: 3, explanation: '"jumps" attends to "fox" — finding its subject!' },
  },
  modifier: {
    tokens: ['I', 'saw', 'the', 'man', 'with', 'the', 'telescope'],
    attentionMatrix: [
      [0.8, 0.1, 0.05, 0.02, 0.01, 0.01, 0.01],
      [0.2, 0.5, 0.1, 0.15, 0.02, 0.02, 0.01],
      [0.05, 0.1, 0.6, 0.15, 0.05, 0.03, 0.02],
      [0.05, 0.15, 0.2, 0.4, 0.1, 0.05, 0.05],
      [0.05, 0.2, 0.1, 0.3, 0.2, 0.1, 0.05], // "with" ambiguously attends
      [0.02, 0.05, 0.1, 0.1, 0.15, 0.5, 0.08],
      [0.02, 0.15, 0.05, 0.2, 0.2, 0.15, 0.23], // "telescope" attends to both "saw" and "man"
    ],
    description: 'Ambiguity: Did I use the telescope, or did the man have one?',
    highlight: { from: 6, to: 1, explanation: 'Attention can be ambiguous — "telescope" attends to multiple words' },
  },
};

export function AttentionVisualizer({
  id = 'attention-visualizer',
  interactive = true,
  width = 700,
  height = 420,
  className = '',
}: AttentionVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedExample, setSelectedExample] = useState<keyof typeof examples>('pronoun');
  const [focusedToken, setFocusedToken] = useState<number | null>(null);
  const [showAllConnections, setShowAllConnections] = useState(false);

  const { markInteractionComplete } = useProgressStore();

  const example = examples[selectedExample];

  // Draw the visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 60, right: 30, bottom: 60, left: 30 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const mainGroup = svg.append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    const tokens = example.tokens;
    const attention = example.attentionMatrix;
    const tokenWidth = innerWidth / tokens.length;
    const tokenY = innerHeight / 2;

    // Draw attention connections
    const connectionsGroup = mainGroup.append('g').attr('class', 'connections');

    tokens.forEach((_, fromIdx) => {
      tokens.forEach((_, toIdx) => {
        if (fromIdx === toIdx) return;

        const weight = attention[fromIdx][toIdx];
        const shouldShow = showAllConnections
          ? weight > 0.05
          : focusedToken !== null
            ? fromIdx === focusedToken && weight > 0.08
            : example.highlight && fromIdx === example.highlight.from && toIdx === example.highlight.to;

        if (!shouldShow) return;

        const fromX = tokenWidth * fromIdx + tokenWidth / 2;
        const toX = tokenWidth * toIdx + tokenWidth / 2;

        // Draw curved connection
        const midY = tokenY - Math.abs(fromIdx - toIdx) * 25 - 30;
        const path = `M ${fromX} ${tokenY - 15} Q ${(fromX + toX) / 2} ${midY} ${toX} ${tokenY - 15}`;

        const isHighlighted = example.highlight &&
          fromIdx === example.highlight.from &&
          toIdx === example.highlight.to;

        connectionsGroup.append('path')
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', isHighlighted ? 'var(--primary)' : 'var(--foreground)')
          .attr('stroke-width', Math.max(1, weight * 8))
          .attr('opacity', isHighlighted ? 0.9 : weight * 0.7)
          .attr('stroke-linecap', 'round');

        // Arrowhead at destination
        if (weight > 0.15 || isHighlighted) {
          connectionsGroup.append('circle')
            .attr('cx', toX)
            .attr('cy', tokenY - 18)
            .attr('r', 4)
            .attr('fill', isHighlighted ? 'var(--primary)' : 'var(--foreground)')
            .attr('opacity', isHighlighted ? 0.9 : weight);
        }
      });
    });

    // Draw tokens
    tokens.forEach((token, idx) => {
      const x = tokenWidth * idx + tokenWidth / 2;
      const isSource = example.highlight?.from === idx;
      const isTarget = example.highlight?.to === idx;
      const isFocused = focusedToken === idx;

      // Token background
      mainGroup.append('rect')
        .attr('x', x - 35)
        .attr('y', tokenY - 12)
        .attr('width', 70)
        .attr('height', 28)
        .attr('fill', isSource ? 'var(--primary)' : isTarget ? 'var(--secondary)' : 'var(--surface-elevated)')
        .attr('stroke', isFocused ? 'var(--primary)' : 'var(--viz-grid)')
        .attr('stroke-width', isFocused ? 2 : 1)
        .attr('rx', 6)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setFocusedToken(focusedToken === idx ? null : idx);
          markInteractionComplete(id);
        })
        .on('mouseenter', function() {
          d3.select(this).attr('stroke', 'var(--primary)').attr('stroke-width', 2);
        })
        .on('mouseleave', function() {
          if (focusedToken !== idx) {
            d3.select(this).attr('stroke', 'var(--viz-grid)').attr('stroke-width', 1);
          }
        });

      // Token text
      mainGroup.append('text')
        .attr('x', x)
        .attr('y', tokenY + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', isSource || isTarget ? 'white' : 'var(--foreground)')
        .attr('font-size', '13px')
        .attr('font-weight', isSource || isTarget ? 'bold' : 'normal')
        .attr('pointer-events', 'none')
        .text(token);

      // Index label
      mainGroup.append('text')
        .attr('x', x)
        .attr('y', tokenY + 35)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '10px')
        .attr('opacity', 0.5)
        .text(idx);
    });

    // Draw attention weights for focused token
    if (focusedToken !== null) {
      const weights = attention[focusedToken];
      tokens.forEach((_, toIdx) => {
        const x = tokenWidth * toIdx + tokenWidth / 2;
        const weight = weights[toIdx];

        mainGroup.append('text')
          .attr('x', x)
          .attr('y', tokenY + 55)
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--primary)')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text((weight * 100).toFixed(0) + '%');
      });
    }

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Self-Attention: How Tokens "Look At" Each Other');

    // Subtitle / Description
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .attr('opacity', 0.7)
      .text(example.description);

    // Highlight explanation
    if (example.highlight && focusedToken === null && !showAllConnections) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 15)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--primary)')
        .attr('font-size', '12px')
        .attr('font-style', 'italic')
        .text(example.highlight.explanation);
    }

  }, [example, focusedToken, showAllConnections, width, height, id, markInteractionComplete]);

  const resetToDefaults = useCallback(() => {
    setFocusedToken(null);
    setShowAllConnections(false);
  }, []);

  const isModified = focusedToken !== null || showAllConnections;

  return (
    <div className={`attention-visualizer ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Example Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]/70">
                Choose an example:
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
              {Object.entries(examples).map(([key, ex]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedExample(key as keyof typeof examples);
                    setFocusedToken(null);
                    markInteractionComplete(id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedExample === key
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                  }`}
                >
                  {ex.description.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllConnections}
                onChange={(e) => {
                  setShowAllConnections(e.target.checked);
                  markInteractionComplete(id);
                }}
                className="w-4 h-4 rounded"
              />
              <div>
                <span className="text-sm text-[var(--foreground)]">
                  Show all attention connections
                </span>
                <p className="text-xs text-[var(--foreground)]/60">
                  Click any token to see where it &quot;looks&quot;
                </p>
              </div>
            </label>
          </div>

          {/* Explanation */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">How to read this:</strong>{' '}
              Each token can &quot;attend&quot; to every other token. The curved lines show
              attention weights—thicker lines mean stronger attention. Click a token
              to see exactly where it looks and the percentage of attention it gives
              to each position.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
