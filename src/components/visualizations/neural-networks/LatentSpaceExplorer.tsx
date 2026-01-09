'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface LatentSpaceExplorerProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

type GenerativeModel = 'faces' | 'digits' | 'shapes';

// Generate a simple face based on latent coordinates
function generateFace(z1: number, z2: number): {
  eyeSize: number;
  mouthWidth: number;
  mouthCurve: number;
  faceWidth: number;
  eyeDistance: number;
  noseSize: number;
} {
  // z1 controls: eye size, face width (happy/round features)
  // z2 controls: mouth curve, expression (happy/sad)
  return {
    eyeSize: 3 + z1 * 2,           // 1 to 5
    mouthWidth: 12 + z1 * 6,       // 6 to 18
    mouthCurve: z2 * 8,            // -8 to 8 (frown to smile)
    faceWidth: 28 + z1 * 8,        // 20 to 36
    eyeDistance: 8 + z1 * 4,       // 4 to 12
    noseSize: 2 + Math.abs(z1) * 1.5,
  };
}

// Generate a digit-like pattern based on latent coordinates
function generateDigit(z1: number, z2: number): number[][] {
  const size = 7;
  const pixels: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

  // z1: curviness (0 = angular like 1,4,7, 1 = curved like 0,8,9)
  // z2: openness (0 = closed like 0,8, 1 = open like 1,7)
  const curviness = (z1 + 1) / 2; // 0 to 1
  const openness = (z2 + 1) / 2;  // 0 to 1

  // Generate a blend of digit-like features
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let value = 0;

      // Vertical stroke (more prominent when openness is high)
      if (c >= 3 && c <= 4) {
        value += openness * 0.8;
      }

      // Top curve (more prominent when curviness is high)
      if (r <= 2 && curviness > 0.3) {
        const distFromCenter = Math.abs(c - 3);
        if (distFromCenter <= 2) {
          value += curviness * (1 - distFromCenter / 3) * 0.7;
        }
      }

      // Bottom curve
      if (r >= 4 && curviness > 0.3) {
        const distFromCenter = Math.abs(c - 3);
        if (distFromCenter <= 2) {
          value += curviness * (1 - distFromCenter / 3) * 0.6;
        }
      }

      // Side strokes (when not too open)
      if ((1 - openness) > 0.4) {
        if ((c <= 1 || c >= 5) && r >= 1 && r <= 5) {
          value += (1 - openness) * 0.5;
        }
      }

      // Middle bar (blend)
      if (r === 3 && c >= 1 && c <= 5) {
        value += curviness * openness * 0.6;
      }

      pixels[r][c] = Math.min(1, value);
    }
  }

  return pixels;
}

// Generate shape based on latent coordinates
function generateShape(z1: number, z2: number): {
  type: 'blend';
  circleness: number;  // 0 = square, 1 = circle
  pointiness: number;  // 0 = smooth, 1 = pointed (star-like)
  size: number;
  rotation: number;
} {
  return {
    type: 'blend',
    circleness: (z1 + 1) / 2,     // 0 to 1
    pointiness: (z2 + 1) / 2,     // 0 to 1
    size: 25 + (z1 + z2) * 5,     // size varies
    rotation: z2 * 30,            // rotation in degrees
  };
}

export function LatentSpaceExplorer({
  id = 'latent-space-explorer',
  interactive = true,
  width = 700,
  height = 400,
  className = '',
}: LatentSpaceExplorerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [model, setModel] = useState<GenerativeModel>('faces');
  const [z1, setZ1] = useState(0);
  const [z2, setZ2] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showInterpolation, setShowInterpolation] = useState(false);
  const [interpolationPoint, setInterpolationPoint] = useState<{ z1: number; z2: number } | null>(null);

  const { markInteractionComplete } = useProgressStore();

  // Draw the latent space and generated output
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 40, right: 20, bottom: 40, left: 20 };
    const latentSize = 280;
    const outputSize = 150;
    const gap = 80;

    // Latent space panel
    const latentGroup = svg.append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Background
    latentGroup.append('rect')
      .attr('width', latentSize)
      .attr('height', latentSize)
      .attr('fill', 'var(--surface)')
      .attr('stroke', 'var(--viz-grid)')
      .attr('stroke-width', 1)
      .attr('rx', 8);

    // Grid
    const gridLines = 5;
    for (let i = 1; i < gridLines; i++) {
      const pos = (i / gridLines) * latentSize;
      latentGroup.append('line')
        .attr('x1', pos).attr('y1', 0)
        .attr('x2', pos).attr('y2', latentSize)
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.5);
      latentGroup.append('line')
        .attr('x1', 0).attr('y1', pos)
        .attr('x2', latentSize).attr('y2', pos)
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.5);
    }

    // Axis labels
    latentGroup.append('text')
      .attr('x', latentSize / 2)
      .attr('y', latentSize + 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .text(model === 'faces' ? 'z₁ (Face Width / Eye Size)' : model === 'digits' ? 'z₁ (Curviness)' : 'z₁ (Circleness)');

    latentGroup.append('text')
      .attr('x', -latentSize / 2)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .attr('transform', 'rotate(-90)')
      .text(model === 'faces' ? 'z₂ (Expression)' : model === 'digits' ? 'z₂ (Openness)' : 'z₂ (Pointiness)');

    // Sample grid of generated outputs in latent space
    const sampleCount = 5;
    for (let i = 0; i < sampleCount; i++) {
      for (let j = 0; j < sampleCount; j++) {
        const sampleZ1 = -1 + (2 * i) / (sampleCount - 1);
        const sampleZ2 = 1 - (2 * j) / (sampleCount - 1);
        const x = (i / (sampleCount - 1)) * latentSize;
        const y = (j / (sampleCount - 1)) * latentSize;

        if (model === 'faces') {
          const face = generateFace(sampleZ1, sampleZ2);
          const faceGroup = latentGroup.append('g')
            .attr('transform', `translate(${x}, ${y})`);

          // Mini face
          faceGroup.append('ellipse')
            .attr('rx', face.faceWidth / 4)
            .attr('ry', face.faceWidth / 3.5)
            .attr('fill', '#ffd699')
            .attr('stroke', '#cc9933')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.7);

          // Eyes
          faceGroup.append('circle')
            .attr('cx', -face.eyeDistance / 3)
            .attr('cy', -3)
            .attr('r', face.eyeSize / 3)
            .attr('fill', '#333');
          faceGroup.append('circle')
            .attr('cx', face.eyeDistance / 3)
            .attr('cy', -3)
            .attr('r', face.eyeSize / 3)
            .attr('fill', '#333');

          // Mouth
          const mouthPath = `M ${-face.mouthWidth / 4} 4 Q 0 ${4 + face.mouthCurve / 2} ${face.mouthWidth / 4} 4`;
          faceGroup.append('path')
            .attr('d', mouthPath)
            .attr('fill', 'none')
            .attr('stroke', '#333')
            .attr('stroke-width', 1);
        } else if (model === 'digits') {
          const pixels = generateDigit(sampleZ1, sampleZ2);
          const pixelSize = 3;
          const digitGroup = latentGroup.append('g')
            .attr('transform', `translate(${x - 10}, ${y - 10})`);

          pixels.forEach((row, r) => {
            row.forEach((val, c) => {
              if (val > 0.1) {
                digitGroup.append('rect')
                  .attr('x', c * pixelSize)
                  .attr('y', r * pixelSize)
                  .attr('width', pixelSize - 0.5)
                  .attr('height', pixelSize - 0.5)
                  .attr('fill', `rgba(100, 200, 255, ${val * 0.8})`)
                  .attr('rx', 0.5);
              }
            });
          });
        } else {
          const shape = generateShape(sampleZ1, sampleZ2);
          const shapeGroup = latentGroup.append('g')
            .attr('transform', `translate(${x}, ${y}) rotate(${shape.rotation / 3})`);

          // Blend between square and circle with optional points
          const points = 4 + Math.floor(shape.pointiness * 4); // 4 to 8 points
          const innerRadius = shape.size / 5 * (1 - shape.pointiness * 0.5);
          const outerRadius = shape.size / 4;

          if (shape.pointiness > 0.3) {
            // Star-like shape
            let pathD = '';
            for (let p = 0; p < points * 2; p++) {
              const angle = (p * Math.PI) / points - Math.PI / 2;
              const radius = p % 2 === 0 ? outerRadius : innerRadius;
              const px = Math.cos(angle) * radius;
              const py = Math.sin(angle) * radius;
              pathD += (p === 0 ? 'M' : 'L') + `${px},${py}`;
            }
            pathD += 'Z';
            shapeGroup.append('path')
              .attr('d', pathD)
              .attr('fill', `rgba(150, 100, 255, 0.6)`)
              .attr('stroke', 'rgba(150, 100, 255, 0.9)')
              .attr('stroke-width', 0.5);
          } else {
            // Square to circle blend
            shapeGroup.append('rect')
              .attr('x', -shape.size / 4)
              .attr('y', -shape.size / 4)
              .attr('width', shape.size / 2)
              .attr('height', shape.size / 2)
              .attr('rx', shape.circleness * shape.size / 4)
              .attr('fill', `rgba(150, 100, 255, 0.6)`)
              .attr('stroke', 'rgba(150, 100, 255, 0.9)')
              .attr('stroke-width', 0.5);
          }
        }
      }
    }

    // Current position indicator
    const currentX = ((z1 + 1) / 2) * latentSize;
    const currentY = ((1 - z2) / 2) * latentSize;

    // Interpolation line
    if (showInterpolation && interpolationPoint) {
      const interpX = ((interpolationPoint.z1 + 1) / 2) * latentSize;
      const interpY = ((1 - interpolationPoint.z2) / 2) * latentSize;

      latentGroup.append('line')
        .attr('x1', currentX)
        .attr('y1', currentY)
        .attr('x2', interpX)
        .attr('y2', interpY)
        .attr('stroke', 'var(--primary)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      latentGroup.append('circle')
        .attr('cx', interpX)
        .attr('cy', interpY)
        .attr('r', 8)
        .attr('fill', 'var(--primary)')
        .attr('opacity', 0.5);
    }

    latentGroup.append('circle')
      .attr('cx', currentX)
      .attr('cy', currentY)
      .attr('r', 12)
      .attr('fill', 'var(--primary)')
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .attr('cursor', 'grab')
      .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

    // Make latent space interactive
    latentGroup.append('rect')
      .attr('width', latentSize)
      .attr('height', latentSize)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousedown', function(event) {
        setIsDragging(true);
        const [mx, my] = d3.pointer(event);
        setZ1((mx / latentSize) * 2 - 1);
        setZ2(1 - (my / latentSize) * 2);
        markInteractionComplete(id);
      })
      .on('mousemove', function(event) {
        if (isDragging) {
          const [mx, my] = d3.pointer(event);
          setZ1(Math.max(-1, Math.min(1, (mx / latentSize) * 2 - 1)));
          setZ2(Math.max(-1, Math.min(1, 1 - (my / latentSize) * 2)));
        }
      })
      .on('mouseup', () => setIsDragging(false))
      .on('mouseleave', () => setIsDragging(false));

    // Arrow pointing to output
    const arrowX = padding.left + latentSize + 20;
    svg.append('path')
      .attr('d', `M ${arrowX} ${padding.top + latentSize / 2} L ${arrowX + 40} ${padding.top + latentSize / 2}`)
      .attr('stroke', 'var(--foreground)')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 7)
      .attr('refX', 9)
      .attr('refY', 3.5)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3.5, 0 7')
      .attr('fill', 'var(--foreground)');

    svg.append('text')
      .attr('x', arrowX + 20)
      .attr('y', padding.top + latentSize / 2 - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '10px')
      .text('Decoder');

    // Output panel
    const outputX = padding.left + latentSize + gap;
    const outputGroup = svg.append('g')
      .attr('transform', `translate(${outputX}, ${padding.top + (latentSize - outputSize) / 2})`);

    outputGroup.append('rect')
      .attr('width', outputSize)
      .attr('height', outputSize)
      .attr('fill', 'var(--surface-elevated)')
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 2)
      .attr('rx', 12);

    outputGroup.append('text')
      .attr('x', outputSize / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Generated Output');

    // Draw the generated output
    const outputCenter = outputSize / 2;

    if (model === 'faces') {
      const face = generateFace(z1, z2);
      const faceGroup = outputGroup.append('g')
        .attr('transform', `translate(${outputCenter}, ${outputCenter})`);

      // Face outline
      faceGroup.append('ellipse')
        .attr('rx', face.faceWidth)
        .attr('ry', face.faceWidth * 1.1)
        .attr('fill', '#ffd699')
        .attr('stroke', '#cc9933')
        .attr('stroke-width', 2);

      // Eyes
      faceGroup.append('circle')
        .attr('cx', -face.eyeDistance)
        .attr('cy', -10)
        .attr('r', face.eyeSize)
        .attr('fill', 'white')
        .attr('stroke', '#333')
        .attr('stroke-width', 1);
      faceGroup.append('circle')
        .attr('cx', -face.eyeDistance)
        .attr('cy', -10)
        .attr('r', face.eyeSize * 0.5)
        .attr('fill', '#333');

      faceGroup.append('circle')
        .attr('cx', face.eyeDistance)
        .attr('cy', -10)
        .attr('r', face.eyeSize)
        .attr('fill', 'white')
        .attr('stroke', '#333')
        .attr('stroke-width', 1);
      faceGroup.append('circle')
        .attr('cx', face.eyeDistance)
        .attr('cy', -10)
        .attr('r', face.eyeSize * 0.5)
        .attr('fill', '#333');

      // Nose
      faceGroup.append('ellipse')
        .attr('cx', 0)
        .attr('cy', 5)
        .attr('rx', face.noseSize)
        .attr('ry', face.noseSize * 1.5)
        .attr('fill', '#e6c285');

      // Mouth
      const mouthPath = `M ${-face.mouthWidth} 25 Q 0 ${25 + face.mouthCurve} ${face.mouthWidth} 25`;
      faceGroup.append('path')
        .attr('d', mouthPath)
        .attr('fill', 'none')
        .attr('stroke', '#993333')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round');

    } else if (model === 'digits') {
      const pixels = generateDigit(z1, z2);
      const pixelSize = 16;
      const digitGroup = outputGroup.append('g')
        .attr('transform', `translate(${outputCenter - (7 * pixelSize) / 2}, ${outputCenter - (7 * pixelSize) / 2})`);

      pixels.forEach((row, r) => {
        row.forEach((val, c) => {
          digitGroup.append('rect')
            .attr('x', c * pixelSize)
            .attr('y', r * pixelSize)
            .attr('width', pixelSize - 1)
            .attr('height', pixelSize - 1)
            .attr('fill', `rgba(100, 200, 255, ${val})`)
            .attr('stroke', val > 0.1 ? 'rgba(100, 200, 255, 0.3)' : 'transparent')
            .attr('rx', 2);
        });
      });

    } else {
      const shape = generateShape(z1, z2);
      const shapeGroup = outputGroup.append('g')
        .attr('transform', `translate(${outputCenter}, ${outputCenter}) rotate(${shape.rotation})`);

      const points = 4 + Math.floor(shape.pointiness * 4);
      const innerRadius = shape.size * (1 - shape.pointiness * 0.6);
      const outerRadius = shape.size * 1.5;

      if (shape.pointiness > 0.3) {
        let pathD = '';
        for (let p = 0; p < points * 2; p++) {
          const angle = (p * Math.PI) / points - Math.PI / 2;
          const radius = p % 2 === 0 ? outerRadius : innerRadius;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          pathD += (p === 0 ? 'M' : 'L') + `${px},${py}`;
        }
        pathD += 'Z';
        shapeGroup.append('path')
          .attr('d', pathD)
          .attr('fill', 'var(--primary)')
          .attr('opacity', 0.7)
          .attr('stroke', 'var(--primary)')
          .attr('stroke-width', 2);
      } else {
        shapeGroup.append('rect')
          .attr('x', -shape.size)
          .attr('y', -shape.size)
          .attr('width', shape.size * 2)
          .attr('height', shape.size * 2)
          .attr('rx', shape.circleness * shape.size)
          .attr('fill', 'var(--primary)')
          .attr('opacity', 0.7)
          .attr('stroke', 'var(--primary)')
          .attr('stroke-width', 2);
      }
    }

    // Coordinates display
    outputGroup.append('text')
      .attr('x', outputSize / 2)
      .attr('y', outputSize + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .text(`z = [${z1.toFixed(2)}, ${z2.toFixed(2)}]`);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Latent Space Explorer - The Control Room');

  }, [model, z1, z2, isDragging, showInterpolation, interpolationPoint, width, height, id, markInteractionComplete]);

  const resetToDefaults = useCallback(() => {
    setZ1(0);
    setZ2(0);
    setShowInterpolation(false);
    setInterpolationPoint(null);
  }, []);

  const setRandomInterpolationPoint = useCallback(() => {
    setInterpolationPoint({
      z1: Math.random() * 2 - 1,
      z2: Math.random() * 2 - 1,
    });
    setShowInterpolation(true);
    markInteractionComplete(id);
  }, [id, markInteractionComplete]);

  const isModified = z1 !== 0 || z2 !== 0 || showInterpolation;

  return (
    <div className={`latent-space-explorer ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Model Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]/70">
                Choose what to generate:
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
              {(['faces', 'digits', 'shapes'] as GenerativeModel[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setModel(m);
                    markInteractionComplete(id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    model === m
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--foreground)]/60">
                    {model === 'faces' ? 'z₁ (Face Width)' : model === 'digits' ? 'z₁ (Curviness)' : 'z₁ (Circleness)'}
                  </label>
                  <span className="font-mono text-xs text-[var(--primary)]">
                    {z1.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={z1}
                  onChange={(e) => {
                    setZ1(parseFloat(e.target.value));
                    markInteractionComplete(id);
                  }}
                  className="viz-slider"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--foreground)]/60">
                    {model === 'faces' ? 'z₂ (Expression)' : model === 'digits' ? 'z₂ (Openness)' : 'z₂ (Pointiness)'}
                  </label>
                  <span className="font-mono text-xs text-[var(--primary)]">
                    {z2.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={z2}
                  onChange={(e) => {
                    setZ2(parseFloat(e.target.value));
                    markInteractionComplete(id);
                  }}
                  className="viz-slider"
                />
              </div>
            </div>
          </div>

          {/* Interpolation */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">
                  Interpolation Demo
                </div>
                <div className="text-xs text-[var(--foreground)]/60">
                  See how outputs smoothly blend between points
                </div>
              </div>
              <button
                onClick={setRandomInterpolationPoint}
                className="px-3 py-1.5 text-sm rounded-lg bg-[var(--primary)] text-white hover:opacity-90"
              >
                Set Target Point
              </button>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">The Control Room:</strong>{' '}
              Each point in the 2D latent space corresponds to a unique output.
              The sliders (z₁, z₂) are like &quot;concept dials&quot;—moving them smoothly
              morphs the output. This is how generative AI works: it learns a
              compressed representation where nearby points have similar meanings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
