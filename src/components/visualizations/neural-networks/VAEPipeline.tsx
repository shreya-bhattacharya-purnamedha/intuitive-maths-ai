'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface VAEPipelineProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

type PipelineStage = 'input' | 'encoder' | 'latent' | 'decoder' | 'output';

const stageDescriptions: Record<PipelineStage, { title: string; description: string }> = {
  input: {
    title: 'Input Image',
    description: 'A high-dimensional image (e.g., 784 pixels for 28×28 MNIST)',
  },
  encoder: {
    title: 'Encoder Network',
    description: 'Compresses the image into a small latent representation. Learns to extract essential features.',
  },
  latent: {
    title: 'Latent Space',
    description: 'A compact 2D representation. Similar images are nearby. This is where "concepts" live.',
  },
  decoder: {
    title: 'Decoder Network',
    description: 'Expands the latent code back to image space. Learns to reconstruct from features.',
  },
  output: {
    title: 'Reconstructed Image',
    description: 'The decoder\'s attempt to recreate the input. Slightly blurry because information was compressed.',
  },
};

// Generate a simple 7x7 digit pattern
function generateDigitPattern(digit: number, noise: number = 0): number[][] {
  const patterns: Record<number, number[][]> = {
    0: [
      [0, 0.3, 0.8, 0.8, 0.8, 0.3, 0],
      [0.3, 0.8, 0.3, 0, 0.3, 0.8, 0.3],
      [0.8, 0.3, 0, 0, 0, 0.3, 0.8],
      [0.8, 0.3, 0, 0, 0, 0.3, 0.8],
      [0.8, 0.3, 0, 0, 0, 0.3, 0.8],
      [0.3, 0.8, 0.3, 0, 0.3, 0.8, 0.3],
      [0, 0.3, 0.8, 0.8, 0.8, 0.3, 0],
    ],
    3: [
      [0.3, 0.8, 0.8, 0.8, 0.8, 0.3, 0],
      [0, 0, 0, 0, 0.3, 0.8, 0.3],
      [0, 0, 0, 0, 0.3, 0.8, 0.3],
      [0, 0.3, 0.8, 0.8, 0.8, 0.3, 0],
      [0, 0, 0, 0, 0.3, 0.8, 0.3],
      [0, 0, 0, 0, 0.3, 0.8, 0.3],
      [0.3, 0.8, 0.8, 0.8, 0.8, 0.3, 0],
    ],
    7: [
      [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
      [0, 0, 0, 0, 0.3, 0.8, 0.3],
      [0, 0, 0, 0.3, 0.8, 0.3, 0],
      [0, 0, 0.3, 0.8, 0.3, 0, 0],
      [0, 0.3, 0.8, 0.3, 0, 0, 0],
      [0, 0.3, 0.8, 0.3, 0, 0, 0],
      [0, 0.3, 0.8, 0.3, 0, 0, 0],
    ],
  };

  const pattern = patterns[digit] || patterns[0];

  // Add noise for reconstruction
  return pattern.map(row =>
    row.map(val => Math.max(0, Math.min(1, val + (Math.random() - 0.5) * noise)))
  );
}

export function VAEPipeline({
  id = 'vae-pipeline',
  interactive = true,
  width = 750,
  height = 380,
  className = '',
}: VAEPipelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeStage, setActiveStage] = useState<PipelineStage>('latent');
  const [selectedDigit, setSelectedDigit] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showFlow, setShowFlow] = useState(true);

  const { markInteractionComplete } = useProgressStore();

  // Draw the pipeline
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 60, right: 20, bottom: 60, left: 20 };
    const innerWidth = width - padding.left - padding.right;
    const stageWidth = innerWidth / 5;
    const centerY = height / 2;

    const mainGroup = svg.append('g')
      .attr('transform', `translate(${padding.left}, 0)`);

    // Define stages and their positions
    const stages: { id: PipelineStage; x: number; label: string }[] = [
      { id: 'input', x: stageWidth * 0.5, label: 'Input' },
      { id: 'encoder', x: stageWidth * 1.5, label: 'Encoder' },
      { id: 'latent', x: stageWidth * 2.5, label: 'Latent' },
      { id: 'decoder', x: stageWidth * 3.5, label: 'Decoder' },
      { id: 'output', x: stageWidth * 4.5, label: 'Output' },
    ];

    // Draw connecting arrows with flow animation
    const arrowColor = 'var(--primary)';
    stages.forEach((stage, i) => {
      if (i < stages.length - 1) {
        const nextStage = stages[i + 1];
        const startX = stage.x + 40;
        const endX = nextStage.x - 40;

        // Arrow line
        mainGroup.append('line')
          .attr('x1', startX)
          .attr('y1', centerY)
          .attr('x2', endX)
          .attr('y2', centerY)
          .attr('stroke', arrowColor)
          .attr('stroke-width', 2)
          .attr('opacity', 0.5);

        // Arrowhead
        mainGroup.append('polygon')
          .attr('points', `${endX - 8},-5 ${endX},0 ${endX - 8},5`)
          .attr('transform', `translate(0, ${centerY})`)
          .attr('fill', arrowColor)
          .attr('opacity', 0.5);

        // Flow particles
        if (showFlow) {
          for (let p = 0; p < 3; p++) {
            const particleDelay = p * 0.3;
            const particleProgress = ((animationProgress + particleDelay) % 1);
            const px = startX + (endX - startX) * particleProgress;

            mainGroup.append('circle')
              .attr('cx', px)
              .attr('cy', centerY)
              .attr('r', 4)
              .attr('fill', arrowColor)
              .attr('opacity', 0.8 * Math.sin(particleProgress * Math.PI));
          }
        }
      }
    });

    // Draw each stage
    stages.forEach((stage) => {
      const isActive = activeStage === stage.id;
      const stageGroup = mainGroup.append('g')
        .attr('transform', `translate(${stage.x}, ${centerY})`)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setActiveStage(stage.id);
          markInteractionComplete(id);
        });

      if (stage.id === 'input' || stage.id === 'output') {
        // Draw digit image
        const boxSize = 70;
        const pattern = generateDigitPattern(selectedDigit, stage.id === 'output' ? 0.15 : 0);
        const pixelSize = boxSize / 7;

        stageGroup.append('rect')
          .attr('x', -boxSize / 2)
          .attr('y', -boxSize / 2)
          .attr('width', boxSize)
          .attr('height', boxSize)
          .attr('fill', 'var(--surface)')
          .attr('stroke', isActive ? 'var(--primary)' : 'var(--viz-grid)')
          .attr('stroke-width', isActive ? 3 : 1)
          .attr('rx', 8);

        pattern.forEach((row, r) => {
          row.forEach((val, c) => {
            stageGroup.append('rect')
              .attr('x', -boxSize / 2 + c * pixelSize + 1)
              .attr('y', -boxSize / 2 + r * pixelSize + 1)
              .attr('width', pixelSize - 2)
              .attr('height', pixelSize - 2)
              .attr('fill', `rgba(100, 200, 255, ${val})`)
              .attr('rx', 1);
          });
        });

        // Dimension label
        stageGroup.append('text')
          .attr('y', boxSize / 2 + 15)
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--foreground)')
          .attr('font-size', '9px')
          .attr('opacity', 0.6)
          .text('784 dims');

      } else if (stage.id === 'encoder' || stage.id === 'decoder') {
        // Draw neural network box
        const boxWidth = 60;
        const boxHeight = 100;

        stageGroup.append('rect')
          .attr('x', -boxWidth / 2)
          .attr('y', -boxHeight / 2)
          .attr('width', boxWidth)
          .attr('height', boxHeight)
          .attr('fill', stage.id === 'encoder' ? 'rgba(255, 100, 100, 0.2)' : 'rgba(100, 255, 100, 0.2)')
          .attr('stroke', isActive ? 'var(--primary)' : 'var(--viz-grid)')
          .attr('stroke-width', isActive ? 3 : 1)
          .attr('rx', 8);

        // Draw network layers
        const layers = stage.id === 'encoder' ? [5, 4, 3] : [3, 4, 5];
        const layerSpacing = boxHeight / (layers.length + 1);

        layers.forEach((nodes, layerIdx) => {
          const y = -boxHeight / 2 + layerSpacing * (layerIdx + 1);
          const nodeSpacing = boxWidth / (nodes + 1);

          for (let n = 0; n < nodes; n++) {
            const x = -boxWidth / 2 + nodeSpacing * (n + 1);
            stageGroup.append('circle')
              .attr('cx', x)
              .attr('cy', y)
              .attr('r', 4)
              .attr('fill', stage.id === 'encoder' ? '#ff6666' : '#66ff66')
              .attr('opacity', 0.8);
          }
        });

        // Arrow showing compression/expansion
        const arrowY = boxHeight / 2 + 12;
        if (stage.id === 'encoder') {
          stageGroup.append('text')
            .attr('y', arrowY)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--foreground)')
            .attr('font-size', '12px')
            .text('→ compress →');
        } else {
          stageGroup.append('text')
            .attr('y', arrowY)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--foreground)')
            .attr('font-size', '12px')
            .text('← expand ←');
        }

      } else if (stage.id === 'latent') {
        // Draw latent space
        const boxSize = 80;

        stageGroup.append('rect')
          .attr('x', -boxSize / 2)
          .attr('y', -boxSize / 2)
          .attr('width', boxSize)
          .attr('height', boxSize)
          .attr('fill', 'rgba(150, 100, 255, 0.1)')
          .attr('stroke', isActive ? 'var(--primary)' : 'var(--viz-grid)')
          .attr('stroke-width', isActive ? 3 : 1)
          .attr('rx', 8);

        // Grid
        for (let i = 1; i < 4; i++) {
          const pos = -boxSize / 2 + (i * boxSize) / 4;
          stageGroup.append('line')
            .attr('x1', pos).attr('y1', -boxSize / 2)
            .attr('x2', pos).attr('y2', boxSize / 2)
            .attr('stroke', 'var(--viz-grid)')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.3);
          stageGroup.append('line')
            .attr('x1', -boxSize / 2).attr('y1', pos)
            .attr('x2', boxSize / 2).attr('y2', pos)
            .attr('stroke', 'var(--viz-grid)')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.3);
        }

        // Latent point (position varies by digit)
        const latentPositions: Record<number, { x: number; y: number }> = {
          0: { x: -15, y: 20 },
          3: { x: 10, y: -10 },
          7: { x: 20, y: 15 },
        };
        const pos = latentPositions[selectedDigit] || { x: 0, y: 0 };

        stageGroup.append('circle')
          .attr('cx', pos.x)
          .attr('cy', pos.y)
          .attr('r', 10)
          .attr('fill', 'var(--primary)')
          .attr('stroke', 'white')
          .attr('stroke-width', 2);

        stageGroup.append('text')
          .attr('x', pos.x)
          .attr('y', pos.y + 4)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(selectedDigit);

        // Dimension label
        stageGroup.append('text')
          .attr('y', boxSize / 2 + 15)
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--primary)')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text('2 dims!');
      }

      // Stage label
      stageGroup.append('text')
        .attr('y', -55)
        .attr('text-anchor', 'middle')
        .attr('fill', isActive ? 'var(--primary)' : 'var(--foreground)')
        .attr('font-size', '12px')
        .attr('font-weight', isActive ? 'bold' : 'normal')
        .text(stage.label);
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Variational Autoencoder Pipeline');

    // Subtitle showing compression
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 42)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .attr('opacity', 0.6)
      .text('784 dimensions → 2 dimensions → 784 dimensions');

  }, [activeStage, selectedDigit, animationProgress, showFlow, width, height, id, markInteractionComplete]);

  // Animation loop
  useEffect(() => {
    if (!showFlow) return;

    const animate = () => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [showFlow]);

  const resetToDefaults = useCallback(() => {
    setActiveStage('latent');
    setSelectedDigit(3);
    setShowFlow(true);
  }, []);

  const isModified = activeStage !== 'latent' || selectedDigit !== 3 || !showFlow;

  return (
    <div className={`vae-pipeline ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Digit Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]/70">
                Select input digit:
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
              {[0, 3, 7].map((digit) => (
                <button
                  key={digit}
                  onClick={() => {
                    setSelectedDigit(digit);
                    markInteractionComplete(id);
                  }}
                  className={`w-12 h-12 rounded-lg text-xl font-bold transition-colors ${
                    selectedDigit === digit
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                  }`}
                >
                  {digit}
                </button>
              ))}
            </div>
          </div>

          {/* Stage Info */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <h4 className="font-bold text-[var(--primary)] mb-2">
              {stageDescriptions[activeStage].title}
            </h4>
            <p className="text-sm text-[var(--foreground)]/70">
              {stageDescriptions[activeStage].description}
            </p>
            <p className="text-xs text-[var(--foreground)]/50 mt-2 italic">
              Click on any stage in the diagram to learn more.
            </p>
          </div>

          {/* Flow Toggle */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showFlow}
                onChange={(e) => {
                  setShowFlow(e.target.checked);
                  markInteractionComplete(id);
                }}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-[var(--foreground)]">
                Animate data flow
              </span>
            </label>
          </div>

          {/* Key Insight */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">The Bottleneck:</strong>{' '}
              The magic happens in the middle! By forcing the network through a
              tiny 2D bottleneck, it must learn the <em>essence</em> of each digit.
              The latent space becomes a &quot;concept map&quot; where similar digits are neighbors.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
