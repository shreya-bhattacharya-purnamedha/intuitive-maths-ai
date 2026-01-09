'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface QueryKeyValueProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export function QueryKeyValue({
  id = 'query-key-value',
  interactive = true,
  width = 700,
  height = 500,
  className = '',
}: QueryKeyValueProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { markInteractionComplete } = useProgressStore();

  const steps = [
    { title: 'Tokens', description: 'Start with token embeddings' },
    { title: 'Create Q, K, V', description: 'Each token creates Query, Key, and Value vectors' },
    { title: 'Compute Scores', description: 'Query asks: "Who should I attend to?"' },
    { title: 'Softmax', description: 'Convert scores to probabilities (sum to 1)' },
    { title: 'Weighted Sum', description: 'Combine Values weighted by attention' },
  ];

  // Draw the visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 50, right: 30, bottom: 80, left: 30 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const mainGroup = svg.append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Token data
    const tokens = ['The', 'cat', 'sat'];
    const tokenSpacing = innerWidth / (tokens.length + 1);

    // Colors
    const queryColor = '#f472b6';  // pink
    const keyColor = '#60a5fa';    // blue
    const valueColor = '#4ade80';  // green

    // Step 0 & 1: Draw tokens and their Q/K/V projections
    tokens.forEach((token, idx) => {
      const x = tokenSpacing * (idx + 1);
      const tokenY = 30;

      // Token box
      mainGroup.append('rect')
        .attr('x', x - 35)
        .attr('y', tokenY - 15)
        .attr('width', 70)
        .attr('height', 30)
        .attr('fill', 'var(--surface-elevated)')
        .attr('stroke', 'var(--primary)')
        .attr('stroke-width', 2)
        .attr('rx', 6);

      mainGroup.append('text')
        .attr('x', x)
        .attr('y', tokenY + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(token);

      // Q, K, V vectors (shown from step 1)
      if (activeStep >= 1) {
        const qkvY = tokenY + 60;
        const boxSize = 50;
        const boxGap = 8;

        // Query
        mainGroup.append('rect')
          .attr('x', x - boxSize * 1.5 - boxGap)
          .attr('y', qkvY)
          .attr('width', boxSize)
          .attr('height', 25)
          .attr('fill', `${queryColor}33`)
          .attr('stroke', queryColor)
          .attr('stroke-width', 1.5)
          .attr('rx', 4);

        mainGroup.append('text')
          .attr('x', x - boxSize - boxGap)
          .attr('y', qkvY + 16)
          .attr('text-anchor', 'middle')
          .attr('fill', queryColor)
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text('Q');

        // Key
        mainGroup.append('rect')
          .attr('x', x - boxSize / 2)
          .attr('y', qkvY)
          .attr('width', boxSize)
          .attr('height', 25)
          .attr('fill', `${keyColor}33`)
          .attr('stroke', keyColor)
          .attr('stroke-width', 1.5)
          .attr('rx', 4);

        mainGroup.append('text')
          .attr('x', x)
          .attr('y', qkvY + 16)
          .attr('text-anchor', 'middle')
          .attr('fill', keyColor)
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text('K');

        // Value
        mainGroup.append('rect')
          .attr('x', x + boxSize / 2 + boxGap)
          .attr('y', qkvY)
          .attr('width', boxSize)
          .attr('height', 25)
          .attr('fill', `${valueColor}33`)
          .attr('stroke', valueColor)
          .attr('stroke-width', 1.5)
          .attr('rx', 4);

        mainGroup.append('text')
          .attr('x', x + boxSize + boxGap)
          .attr('y', qkvY + 16)
          .attr('text-anchor', 'middle')
          .attr('fill', valueColor)
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text('V');

        // Arrows from token to Q/K/V
        mainGroup.append('line')
          .attr('x1', x)
          .attr('y1', tokenY + 15)
          .attr('x2', x)
          .attr('y2', qkvY - 5)
          .attr('stroke', 'var(--foreground)')
          .attr('stroke-width', 1)
          .attr('opacity', 0.4);
      }
    });

    // Step 2: Show attention score computation
    if (activeStep >= 2) {
      const scoreY = 160;

      // Focus on first token's Query attending to all Keys
      const queryX = tokenSpacing;

      // Draw Query highlight
      mainGroup.append('text')
        .attr('x', queryX)
        .attr('y', scoreY - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', queryColor)
        .attr('font-size', '10px')
        .text('"The" asks:');

      // Draw attention lines to each Key
      tokens.forEach((_, keyIdx) => {
        const keyX = tokenSpacing * (keyIdx + 1);
        const score = [0.7, 0.2, 0.1][keyIdx]; // example scores

        mainGroup.append('line')
          .attr('x1', queryX)
          .attr('y1', scoreY)
          .attr('x2', keyX)
          .attr('y2', scoreY + 30)
          .attr('stroke', keyColor)
          .attr('stroke-width', score * 5)
          .attr('opacity', 0.6);

        // Score value
        mainGroup.append('text')
          .attr('x', (queryX + keyX) / 2 + (keyIdx - 1) * 15)
          .attr('y', scoreY + 18)
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--foreground)')
          .attr('font-size', '10px')
          .text(`${(score * 10).toFixed(1)}`);
      });

      // Formula
      mainGroup.append('text')
        .attr('x', innerWidth - 80)
        .attr('y', scoreY + 10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '10px')
        .attr('opacity', 0.7)
        .text('score = Q · K');
    }

    // Step 3: Softmax
    if (activeStep >= 3) {
      const softmaxY = 230;

      mainGroup.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', softmaxY)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '11px')
        .text('Softmax → Probabilities');

      // Show probabilities
      const probs = [0.65, 0.25, 0.10];
      tokens.forEach((token, idx) => {
        const x = tokenSpacing * (idx + 1);

        mainGroup.append('rect')
          .attr('x', x - 25)
          .attr('y', softmaxY + 10)
          .attr('width', 50)
          .attr('height', 22)
          .attr('fill', 'var(--primary)')
          .attr('opacity', probs[idx])
          .attr('rx', 4);

        mainGroup.append('text')
          .attr('x', x)
          .attr('y', softmaxY + 25)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(`${(probs[idx] * 100).toFixed(0)}%`);
      });
    }

    // Step 4: Weighted sum of Values
    if (activeStep >= 4) {
      const outputY = innerHeight - 10;

      // Show weighted combination
      mainGroup.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', outputY - 30)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '11px')
        .text('Output = 65%·V₁ + 25%·V₂ + 10%·V₃');

      // Output vector
      mainGroup.append('rect')
        .attr('x', innerWidth / 2 - 60)
        .attr('y', outputY - 10)
        .attr('width', 120)
        .attr('height', 30)
        .attr('fill', 'var(--primary)')
        .attr('rx', 6);

      mainGroup.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', outputY + 10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('New "The" vector');

      // Draw lines from Values to output
      tokens.forEach((_, idx) => {
        const valueX = tokenSpacing * (idx + 1);
        const weight = [0.65, 0.25, 0.10][idx];

        mainGroup.append('line')
          .attr('x1', valueX)
          .attr('y1', outputY - 70)
          .attr('x2', innerWidth / 2)
          .attr('y2', outputY - 15)
          .attr('stroke', valueColor)
          .attr('stroke-width', weight * 6)
          .attr('opacity', 0.6);
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
      .text('Query-Key-Value Attention Mechanism');

    // Step indicator
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--primary)')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(`Step ${activeStep + 1}: ${steps[activeStep].title}`);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .attr('opacity', 0.7)
      .text(steps[activeStep].description);

  }, [activeStep, width, height]);

  // Animation
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (activeStep < steps.length - 1) {
        setActiveStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isPlaying, activeStep, steps.length]);

  const resetToDefaults = useCallback(() => {
    setActiveStep(0);
    setIsPlaying(false);
  }, []);

  return (
    <div className={`query-key-value ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Step Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]/70">
                Step through the attention mechanism:
              </div>
              {activeStep > 0 && (
                <button
                  onClick={resetToDefaults}
                  className="px-2 py-1 text-xs rounded-md bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)] text-[var(--foreground)]/70 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="px-3 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--viz-grid)] disabled:opacity-30"
              >
                ← Prev
              </button>
              <div className="flex-1 flex gap-1">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveStep(idx);
                      markInteractionComplete(id);
                    }}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      idx <= activeStep ? 'bg-[var(--primary)]' : 'bg-[var(--viz-grid)]'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  setActiveStep(Math.min(steps.length - 1, activeStep + 1));
                  markInteractionComplete(id);
                }}
                disabled={activeStep === steps.length - 1}
                className="px-3 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--viz-grid)] disabled:opacity-30"
              >
                Next →
              </button>
            </div>
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => {
                  setActiveStep(0);
                  setIsPlaying(true);
                  markInteractionComplete(id);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white hover:opacity-90 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play All Steps
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f472b6' }} />
                <span className="text-[var(--foreground)]/70">Query (Q) - &quot;What am I looking for?&quot;</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#60a5fa' }} />
                <span className="text-[var(--foreground)]/70">Key (K) - &quot;What do I contain?&quot;</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4ade80' }} />
                <span className="text-[var(--foreground)]/70">Value (V) - &quot;What information to pass&quot;</span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">The Library Analogy:</strong>{' '}
              Think of it like a library search. Your <strong>Query</strong> is your question
              (&quot;I need info about X&quot;). Each book&apos;s <strong>Key</strong> is its title/subject.
              You compare your Query to all Keys to find relevant books. Then you read the
              <strong> Values</strong> (actual content) of the matching books, weighted by relevance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
