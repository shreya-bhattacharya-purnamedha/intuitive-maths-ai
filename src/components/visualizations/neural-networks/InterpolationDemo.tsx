'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface InterpolationDemoProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

// Generate a morphable shape based on parameters
function generateMorphedShape(
  t: number,  // interpolation: 0 to 1
  startParams: { sides: number; innerRadius: number; rotation: number },
  endParams: { sides: number; innerRadius: number; rotation: number }
): { path: string; fill: string } {
  // Interpolate parameters
  const sides = Math.round(startParams.sides + (endParams.sides - startParams.sides) * t);
  const innerRadius = startParams.innerRadius + (endParams.innerRadius - startParams.innerRadius) * t;
  const rotation = startParams.rotation + (endParams.rotation - startParams.rotation) * t;
  const outerRadius = 40;

  // Generate star/polygon path
  let path = '';
  const points = sides * 2;

  for (let i = 0; i < points; i++) {
    const angle = (i * Math.PI) / sides + (rotation * Math.PI) / 180;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    path += (i === 0 ? 'M' : 'L') + `${x},${y}`;
  }
  path += 'Z';

  // Interpolate color
  const startColor = d3.rgb('#ff6b6b');
  const endColor = d3.rgb('#4ecdc4');
  const color = d3.interpolateRgb(startColor.toString(), endColor.toString())(t);

  return { path, fill: color };
}

// Generate a digit-like pattern that morphs
function generateMorphedDigit(t: number): number[][] {
  const size = 7;
  const pixels: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

  // Morph from "1" to "0"
  // 1 pattern: vertical line on right
  // 0 pattern: oval/circle

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Pattern for "1" (t=0)
      const is1 = (c === 4 || c === 5) && r >= 1 && r <= 5 ? 0.9 : 0;

      // Pattern for "0" (t=1)
      const centerR = 3, centerC = 3;
      const distR = Math.abs(r - centerR);
      const distC = Math.abs(c - centerC);
      const isEdge = (distR >= 2 || distC >= 2) && distR <= 3 && distC <= 2.5;
      const is0 = isEdge ? 0.9 : 0;

      // Interpolate
      pixels[r][c] = is1 * (1 - t) + is0 * t;
    }
  }

  return pixels;
}

// Preset interpolation pairs
const presets = [
  {
    name: 'Triangle → Star',
    start: { sides: 3, innerRadius: 35, rotation: -90 },
    end: { sides: 6, innerRadius: 15, rotation: 0 },
  },
  {
    name: 'Square → Circle',
    start: { sides: 4, innerRadius: 38, rotation: 45 },
    end: { sides: 32, innerRadius: 39, rotation: 0 },
  },
  {
    name: 'Pentagon → Star',
    start: { sides: 5, innerRadius: 38, rotation: -90 },
    end: { sides: 5, innerRadius: 15, rotation: -90 },
  },
];

export function InterpolationDemo({
  id = 'interpolation-demo',
  interactive = true,
  width = 700,
  height = 320,
  className = '',
}: InterpolationDemoProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [interpolation, setInterpolation] = useState(0.5);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDigitMode, setShowDigitMode] = useState(false);

  const { markInteractionComplete } = useProgressStore();

  // Draw the interpolation visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 50, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const mainGroup = svg.append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    if (!showDigitMode) {
      // Shape interpolation mode
      const preset = presets[selectedPreset];

      // Draw start shape
      const startShape = generateMorphedShape(0, preset.start, preset.end);
      mainGroup.append('g')
        .attr('transform', `translate(60, ${innerHeight / 2})`)
        .append('path')
        .attr('d', startShape.path)
        .attr('fill', startShape.fill)
        .attr('opacity', 0.8)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      mainGroup.append('text')
        .attr('x', 60)
        .attr('y', innerHeight / 2 + 60)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '11px')
        .text('Start (t=0)');

      // Draw interpolation steps
      const steps = 5;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = 140 + (innerWidth - 280) * (i / steps);
        const shape = generateMorphedShape(t, preset.start, preset.end);

        const isCurrentStep = Math.abs(t - interpolation) < 0.15;

        mainGroup.append('g')
          .attr('transform', `translate(${x}, ${innerHeight / 2})`)
          .append('path')
          .attr('d', shape.path)
          .attr('fill', shape.fill)
          .attr('opacity', isCurrentStep ? 1 : 0.3)
          .attr('stroke', isCurrentStep ? 'white' : 'transparent')
          .attr('stroke-width', isCurrentStep ? 3 : 0)
          .attr('transform', `scale(${isCurrentStep ? 1.1 : 0.7})`);
      }

      // Draw end shape
      const endShape = generateMorphedShape(1, preset.start, preset.end);
      mainGroup.append('g')
        .attr('transform', `translate(${innerWidth - 60}, ${innerHeight / 2})`)
        .append('path')
        .attr('d', endShape.path)
        .attr('fill', endShape.fill)
        .attr('opacity', 0.8)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      mainGroup.append('text')
        .attr('x', innerWidth - 60)
        .attr('y', innerHeight / 2 + 60)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '11px')
        .text('End (t=1)');

      // Current interpolated shape (larger, center-bottom)
      const currentShape = generateMorphedShape(interpolation, preset.start, preset.end);
      mainGroup.append('g')
        .attr('transform', `translate(${innerWidth / 2}, ${innerHeight - 20})`)
        .append('path')
        .attr('d', currentShape.path)
        .attr('fill', currentShape.fill)
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .attr('transform', 'scale(1.3)');

    } else {
      // Digit interpolation mode
      const pixelSize = 20;
      const digitWidth = 7 * pixelSize;

      // Draw start digit (1)
      const startPixels = generateMorphedDigit(0);
      const startGroup = mainGroup.append('g')
        .attr('transform', `translate(${40}, ${innerHeight / 2 - digitWidth / 2})`);

      startPixels.forEach((row, r) => {
        row.forEach((val, c) => {
          startGroup.append('rect')
            .attr('x', c * pixelSize)
            .attr('y', r * pixelSize)
            .attr('width', pixelSize - 2)
            .attr('height', pixelSize - 2)
            .attr('fill', `rgba(100, 200, 255, ${val})`)
            .attr('rx', 2);
        });
      });

      mainGroup.append('text')
        .attr('x', 40 + digitWidth / 2)
        .attr('y', innerHeight / 2 + digitWidth / 2 + 25)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text('"1"');

      // Draw interpolated digits
      const interpSteps = [0.25, 0.5, 0.75];
      interpSteps.forEach((t, i) => {
        const x = 180 + i * 130;
        const pixels = generateMorphedDigit(t);
        const isHighlighted = Math.abs(t - interpolation) < 0.2;
        const group = mainGroup.append('g')
          .attr('transform', `translate(${x}, ${innerHeight / 2 - digitWidth / 2}) scale(${isHighlighted ? 1 : 0.7})`);

        pixels.forEach((row, r) => {
          row.forEach((val, c) => {
            group.append('rect')
              .attr('x', c * pixelSize)
              .attr('y', r * pixelSize)
              .attr('width', pixelSize - 2)
              .attr('height', pixelSize - 2)
              .attr('fill', `rgba(100, 200, 255, ${val})`)
              .attr('opacity', isHighlighted ? 1 : 0.4)
              .attr('rx', 2);
          });
        });
      });

      // Draw end digit (0)
      const endPixels = generateMorphedDigit(1);
      const endGroup = mainGroup.append('g')
        .attr('transform', `translate(${innerWidth - 40 - digitWidth}, ${innerHeight / 2 - digitWidth / 2})`);

      endPixels.forEach((row, r) => {
        row.forEach((val, c) => {
          endGroup.append('rect')
            .attr('x', c * pixelSize)
            .attr('y', r * pixelSize)
            .attr('width', pixelSize - 2)
            .attr('height', pixelSize - 2)
            .attr('fill', `rgba(100, 200, 255, ${val})`)
            .attr('rx', 2);
        });
      });

      mainGroup.append('text')
        .attr('x', innerWidth - 40 - digitWidth / 2)
        .attr('y', innerHeight / 2 + digitWidth / 2 + 25)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text('"0"');
    }

    // Interpolation slider track visualization
    const trackY = innerHeight + 25;
    mainGroup.append('line')
      .attr('x1', 40)
      .attr('y1', trackY)
      .attr('x2', innerWidth - 40)
      .attr('y2', trackY)
      .attr('stroke', 'var(--viz-grid)')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round');

    // Current position indicator
    const indicatorX = 40 + (innerWidth - 80) * interpolation;
    mainGroup.append('circle')
      .attr('cx', indicatorX)
      .attr('cy', trackY)
      .attr('r', 8)
      .attr('fill', 'var(--primary)')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Labels
    mainGroup.append('text')
      .attr('x', 40)
      .attr('y', trackY + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '10px')
      .text('0');

    mainGroup.append('text')
      .attr('x', innerWidth - 40)
      .attr('y', trackY + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '10px')
      .text('1');

    mainGroup.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', trackY + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--primary)')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(`t = ${interpolation.toFixed(2)}`);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Latent Space Interpolation');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 42)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .attr('opacity', 0.6)
      .text('Smooth transitions between concepts');

  }, [interpolation, selectedPreset, showDigitMode, width, height]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setInterpolation(prev => {
        const next = prev + 0.01;
        if (next > 1) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    };

    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const resetToDefaults = useCallback(() => {
    setInterpolation(0.5);
    setSelectedPreset(0);
    setShowDigitMode(false);
    setIsPlaying(false);
  }, []);

  const isModified = interpolation !== 0.5 || selectedPreset !== 0 || showDigitMode;

  return (
    <div className={`interpolation-demo ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Interpolation Slider */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--foreground)]/70">
                Interpolation (t)
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg text-[var(--primary)] font-bold">
                  {interpolation.toFixed(2)}
                </span>
                {isModified && (
                  <button
                    onClick={resetToDefaults}
                    className="px-2 py-1 text-xs rounded-md bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)] text-[var(--foreground)]/70 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={interpolation}
              onChange={(e) => {
                setInterpolation(parseFloat(e.target.value));
                markInteractionComplete(id);
              }}
              className="viz-slider"
            />
            <div className="flex justify-center mt-3">
              <button
                onClick={() => {
                  setInterpolation(0);
                  setIsPlaying(true);
                  markInteractionComplete(id);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white hover:opacity-90 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Animation
              </button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Interpolation mode:
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDigitMode(false);
                  markInteractionComplete(id);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !showDigitMode
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                }`}
              >
                Shapes
              </button>
              <button
                onClick={() => {
                  setShowDigitMode(true);
                  markInteractionComplete(id);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  showDigitMode
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                }`}
              >
                Digits (1 → 0)
              </button>
            </div>
          </div>

          {/* Shape Presets (only when not in digit mode) */}
          {!showDigitMode && (
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
                Shape transformation:
              </div>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedPreset(i);
                      markInteractionComplete(id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedPreset === i
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">Why This Matters:</strong>{' '}
              In a well-trained latent space, walking from point A to point B produces
              smooth, meaningful transitions. A &quot;1&quot; doesn&apos;t jump to &quot;0&quot;—it gradually
              morphs through hybrid forms. This is how AI &quot;imagines&quot; new things:
              by walking through concept space.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
