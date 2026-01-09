'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface TransformerBlockProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

type BlockComponent = 'input' | 'embedding' | 'positional' | 'attention' | 'add1' | 'ffn' | 'add2' | 'output';

const componentInfo: Record<BlockComponent, { title: string; description: string; color: string }> = {
  input: {
    title: 'Input Tokens',
    description: 'Raw tokens from the text, e.g., ["The", "cat", "sat"]. Each token is an integer ID from a vocabulary.',
    color: '#6366f1',
  },
  embedding: {
    title: 'Token Embedding',
    description: 'Converts each token ID to a dense vector (e.g., 512 dimensions). This vector captures the meaning of the word.',
    color: '#8b5cf6',
  },
  positional: {
    title: 'Positional Encoding',
    description: 'Adds position information using sine/cosine waves. Without this, the model wouldn\'t know word order!',
    color: '#a855f7',
  },
  attention: {
    title: 'Multi-Head Self-Attention',
    description: 'The magic layer! Each token looks at all other tokens and decides what\'s relevant. Multiple "heads" look for different patterns.',
    color: '#ec4899',
  },
  add1: {
    title: 'Add & Normalize',
    description: 'Residual connection: adds the input back to the output. This helps gradients flow and lets the model learn "what to add" rather than "what to output".',
    color: '#f43f5e',
  },
  ffn: {
    title: 'Feed-Forward Network',
    description: 'A simple 2-layer neural network applied to each token independently. Expands then contracts: 512 → 2048 → 512.',
    color: '#f97316',
  },
  add2: {
    title: 'Add & Normalize',
    description: 'Another residual connection after the feed-forward layer. Same principle: add the input back.',
    color: '#eab308',
  },
  output: {
    title: 'Output Vectors',
    description: 'Refined token representations. Can be passed to another transformer layer, or to a final prediction head.',
    color: '#22c55e',
  },
};

export function TransformerBlock({
  id = 'transformer-block',
  interactive = true,
  width = 700,
  height = 500,
  className = '',
}: TransformerBlockProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedComponent, setSelectedComponent] = useState<BlockComponent>('attention');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { markInteractionComplete } = useProgressStore();

  // Draw the transformer block diagram
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 40, right: 200, bottom: 40, left: 40 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const mainGroup = svg.append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Component positions (vertical stack)
    const components: { id: BlockComponent; y: number; height: number }[] = [
      { id: 'input', y: 0, height: 35 },
      { id: 'embedding', y: 45, height: 35 },
      { id: 'positional', y: 90, height: 35 },
      { id: 'attention', y: 145, height: 60 },
      { id: 'add1', y: 215, height: 30 },
      { id: 'ffn', y: 255, height: 50 },
      { id: 'add2', y: 315, height: 30 },
      { id: 'output', y: 360, height: 35 },
    ];

    const boxWidth = 280;
    const centerX = innerWidth / 2;

    // Draw flow particles during animation
    if (isAnimating) {
      const particleY = animationProgress * (innerHeight - 20) + 20;
      mainGroup.append('circle')
        .attr('cx', centerX)
        .attr('cy', particleY)
        .attr('r', 6)
        .attr('fill', 'var(--primary)')
        .attr('filter', 'drop-shadow(0 0 8px var(--primary))');
    }

    // Draw components
    components.forEach(({ id: compId, y, height: h }) => {
      const info = componentInfo[compId];
      const isSelected = selectedComponent === compId;
      const isAttention = compId === 'attention';
      const isAdd = compId === 'add1' || compId === 'add2';

      // Main box
      mainGroup.append('rect')
        .attr('x', centerX - boxWidth / 2)
        .attr('y', y)
        .attr('width', boxWidth)
        .attr('height', h)
        .attr('fill', isSelected ? info.color : `${info.color}33`)
        .attr('stroke', info.color)
        .attr('stroke-width', isSelected ? 3 : 1.5)
        .attr('rx', isAttention ? 12 : 6)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setSelectedComponent(compId);
          markInteractionComplete(id);
        })
        .on('mouseenter', function() {
          d3.select(this).attr('stroke-width', 3);
        })
        .on('mouseleave', function() {
          if (!isSelected) d3.select(this).attr('stroke-width', 1.5);
        });

      // Component label
      mainGroup.append('text')
        .attr('x', centerX)
        .attr('y', y + h / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', isSelected ? 'white' : 'var(--foreground)')
        .attr('font-size', isAttention ? '13px' : '11px')
        .attr('font-weight', isSelected || isAttention ? 'bold' : 'normal')
        .attr('pointer-events', 'none')
        .text(info.title);

      // Draw residual connections for Add & Norm
      if (isAdd) {
        const skipStartY = compId === 'add1' ? 135 : 245;
        const skipEndY = y + h / 2;

        // Curved skip connection on the right
        const skipX = centerX + boxWidth / 2 + 25;
        mainGroup.append('path')
          .attr('d', `M ${centerX + boxWidth / 2} ${skipStartY}
                      Q ${skipX} ${skipStartY} ${skipX} ${(skipStartY + skipEndY) / 2}
                      Q ${skipX} ${skipEndY} ${centerX + boxWidth / 2} ${skipEndY}`)
          .attr('fill', 'none')
          .attr('stroke', info.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4,4')
          .attr('opacity', 0.7);

        // Plus symbol
        mainGroup.append('text')
          .attr('x', skipX + 8)
          .attr('y', (skipStartY + skipEndY) / 2 + 4)
          .attr('fill', info.color)
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .text('+');
      }

      // Draw attention heads indicator
      if (isAttention) {
        const headCount = 8;
        const headWidth = (boxWidth - 40) / headCount;
        for (let i = 0; i < headCount; i++) {
          mainGroup.append('rect')
            .attr('x', centerX - boxWidth / 2 + 20 + i * headWidth)
            .attr('y', y + h - 15)
            .attr('width', headWidth - 4)
            .attr('height', 8)
            .attr('fill', isSelected ? 'rgba(255,255,255,0.3)' : `${info.color}66`)
            .attr('rx', 2);
        }
        mainGroup.append('text')
          .attr('x', centerX)
          .attr('y', y + h - 3)
          .attr('text-anchor', 'middle')
          .attr('fill', isSelected ? 'rgba(255,255,255,0.7)' : 'var(--foreground)')
          .attr('font-size', '8px')
          .attr('opacity', 0.7)
          .text('8 attention heads');
      }
    });

    // Draw arrows between components
    components.forEach(({ y, height: h }, idx) => {
      if (idx < components.length - 1) {
        const nextY = components[idx + 1].y;
        mainGroup.append('path')
          .attr('d', `M ${centerX} ${y + h + 2} L ${centerX} ${nextY - 2}`)
          .attr('stroke', 'var(--foreground)')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.4)
          .attr('marker-end', 'url(#arrow)');
      }
    });

    // Arrow marker definition
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('refX', 6)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L0,6 L6,3 z')
      .attr('fill', 'var(--foreground)')
      .attr('opacity', 0.4);

    // Info panel on the right
    const info = componentInfo[selectedComponent];
    const infoX = centerX + boxWidth / 2 + 50;
    const infoY = 80;

    mainGroup.append('rect')
      .attr('x', infoX)
      .attr('y', infoY)
      .attr('width', 180)
      .attr('height', 220)
      .attr('fill', 'var(--surface-elevated)')
      .attr('stroke', info.color)
      .attr('stroke-width', 2)
      .attr('rx', 8);

    mainGroup.append('text')
      .attr('x', infoX + 90)
      .attr('y', infoY + 25)
      .attr('text-anchor', 'middle')
      .attr('fill', info.color)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(info.title);

    // Wrap description text
    const words = info.description.split(' ');
    let line = '';
    let lineNum = 0;
    const maxWidth = 160;

    words.forEach((word) => {
      const testLine = line + word + ' ';
      if (testLine.length > 25 && line.length > 0) {
        mainGroup.append('text')
          .attr('x', infoX + 10)
          .attr('y', infoY + 50 + lineNum * 16)
          .attr('fill', 'var(--foreground)')
          .attr('font-size', '10px')
          .attr('opacity', 0.8)
          .text(line.trim());
        line = word + ' ';
        lineNum++;
      } else {
        line = testLine;
      }
    });
    if (line.trim()) {
      mainGroup.append('text')
        .attr('x', infoX + 10)
        .attr('y', infoY + 50 + lineNum * 16)
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '10px')
        .attr('opacity', 0.8)
        .text(line.trim());
    }

    // Title
    svg.append('text')
      .attr('x', padding.left + centerX)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Transformer Block Architecture');

  }, [selectedComponent, animationProgress, isAnimating, width, height, id, markInteractionComplete]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    const animate = () => {
      setAnimationProgress(prev => {
        const next = prev + 0.015;
        if (next > 1) {
          setIsAnimating(false);
          return 0;
        }
        return next;
      });
    };

    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const resetToDefaults = useCallback(() => {
    setSelectedComponent('attention');
    setIsAnimating(false);
    setAnimationProgress(0);
  }, []);

  return (
    <div className={`transformer-block ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Animation Control */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">
                  Data Flow Animation
                </div>
                <div className="text-xs text-[var(--foreground)]/60">
                  Watch data flow through the transformer
                </div>
              </div>
              <button
                onClick={() => {
                  setAnimationProgress(0);
                  setIsAnimating(true);
                  markInteractionComplete(id);
                }}
                disabled={isAnimating}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Animate
              </button>
            </div>
          </div>

          {/* Component Quick Select */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Click a component to learn more:
            </div>
            <div className="flex flex-wrap gap-2">
              {(['attention', 'ffn', 'positional', 'embedding'] as BlockComponent[]).map((comp) => (
                <button
                  key={comp}
                  onClick={() => {
                    setSelectedComponent(comp);
                    markInteractionComplete(id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedComponent === comp
                      ? 'text-white'
                      : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                  }`}
                  style={{
                    backgroundColor: selectedComponent === comp ? componentInfo[comp].color : undefined,
                  }}
                >
                  {componentInfo[comp].title}
                </button>
              ))}
            </div>
          </div>

          {/* Key Insight */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">The Architecture:</strong>{' '}
              A transformer block has two main parts: <strong>Self-Attention</strong> (tokens
              communicate) and <strong>Feed-Forward</strong> (tokens think independently).
              The residual connections (dashed lines) are crucial—they let gradients flow
              and help the model learn &quot;what to add&quot; rather than &quot;what to output.&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
