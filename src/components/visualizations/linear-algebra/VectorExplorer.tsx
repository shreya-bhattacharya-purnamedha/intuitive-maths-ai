'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '@/lib/stores/progressStore';
import { useVisualizationStore } from '@/lib/stores/visualizationStore';

interface VectorExplorerProps {
  id?: string;
  initialVector?: [number, number];
  interactive?: boolean;
  showGhostVectors?: boolean;
  showMagnitudeRuler?: boolean;
  showAngleArc?: boolean;
  showComponents?: boolean;
  showDotProduct?: [number, number];
  showProjection?: boolean;
  buildUpMode?: boolean;
  width?: number;
  height?: number;
  className?: string;
  controlMode?: 'drag' | 'sliders' | 'both';
}

interface NarrationStep {
  text: string;
  duration: number;
}

const narrationSteps: NarrationStep[] = [
  { text: "Imagine you're holding a treasure map...", duration: 2000 },
  { text: "It says: Walk 3 steps East →", duration: 2500 },
  { text: "Then 2 steps North ↑", duration: 2500 },
  { text: "That journey IS the vector [3, 2]", duration: 2500 },
  { text: "Now here's the key insight...", duration: 2000 },
  { text: "Start from ANY point, walk the same path...", duration: 2500 },
  { text: "It's the SAME vector! Vectors are movements, not locations.", duration: 3500 },
];

export function VectorExplorer({
  id = 'vector-explorer',
  initialVector = [3, 2],
  interactive = true,
  showGhostVectors = false,
  showMagnitudeRuler = false,
  showAngleArc = false,
  showComponents = true,
  showDotProduct,
  showProjection = false,
  buildUpMode = false,
  width = 500,
  height = 400,
  className = '',
  controlMode = 'sliders',
}: VectorExplorerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [vector, setVector] = useState<[number, number]>(initialVector);
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [showNarration, setShowNarration] = useState(buildUpMode);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'east' | 'north' | 'complete'>('idle');

  const { markInteractionComplete, hasViewedNarration, markNarrationViewed } = useProgressStore();
  const { setVector: setSharedVector } = useVisualizationStore();

  const padding = 50;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  // Scales
  const xScale = d3.scaleLinear().domain([-5, 5]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([-5, 5]).range([innerHeight, 0]);

  // Derived values
  const magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
  const angle = Math.atan2(vector[1], vector[0]) * (180 / Math.PI);

  // Ghost vector positions
  const ghostOrigins: [number, number][] = [
    [-3, -2],
    [1, -3],
    [-2, 2],
  ];

  // Handle narration progression
  useEffect(() => {
    if (!showNarration || !buildUpMode) return;

    const timer = setTimeout(() => {
      if (narrationIndex < narrationSteps.length - 1) {
        setNarrationIndex((prev) => prev + 1);

        // Trigger animations based on narration
        if (narrationIndex === 0) setAnimationPhase('east');
        if (narrationIndex === 1) setAnimationPhase('north');
        if (narrationIndex === 2) setAnimationPhase('complete');
      } else {
        // Narration complete
        markNarrationViewed(id);
        setShowNarration(false);
      }
    }, narrationSteps[narrationIndex].duration);

    return () => clearTimeout(timer);
  }, [narrationIndex, showNarration, buildUpMode, id, markNarrationViewed]);

  // Check if we should skip narration
  useEffect(() => {
    if (buildUpMode && hasViewedNarration(id)) {
      setShowNarration(false);
      setAnimationPhase('complete');
    }
  }, [buildUpMode, id, hasViewedNarration]);

  // Draw the visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding}, ${padding})`);

    // Draw grid
    const gridGroup = mainGroup.append('g').attr('class', 'grid');

    for (let i = -5; i <= 5; i++) {
      // Vertical lines
      gridGroup
        .append('line')
        .attr('x1', xScale(i))
        .attr('y1', 0)
        .attr('x2', xScale(i))
        .attr('y2', innerHeight)
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', i === 0 ? 0 : 0.5)
        .attr('stroke-dasharray', i === 0 ? '' : '2,2');

      // Horizontal lines
      gridGroup
        .append('line')
        .attr('x1', 0)
        .attr('y1', yScale(i))
        .attr('x2', innerWidth)
        .attr('y2', yScale(i))
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', i === 0 ? 0 : 0.5)
        .attr('stroke-dasharray', i === 0 ? '' : '2,2');
    }

    // Draw axes
    const axesGroup = mainGroup.append('g').attr('class', 'axes');

    // X axis
    axesGroup
      .append('line')
      .attr('x1', 0)
      .attr('y1', yScale(0))
      .attr('x2', innerWidth)
      .attr('y2', yScale(0))
      .attr('stroke', 'var(--viz-axis)')
      .attr('stroke-width', 2);

    // Y axis
    axesGroup
      .append('line')
      .attr('x1', xScale(0))
      .attr('y1', 0)
      .attr('x2', xScale(0))
      .attr('y2', innerHeight)
      .attr('stroke', 'var(--viz-axis)')
      .attr('stroke-width', 2);

    // Axis labels
    axesGroup
      .append('text')
      .attr('x', innerWidth - 10)
      .attr('y', yScale(0) + 25)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('opacity', 0.6)
      .text('East');

    axesGroup
      .append('text')
      .attr('x', xScale(0) + 10)
      .attr('y', 20)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('opacity', 0.6)
      .text('North');

    // Draw ghost vectors if enabled
    if (showGhostVectors && animationPhase === 'complete') {
      const ghostGroup = mainGroup.append('g').attr('class', 'ghost-vectors');

      ghostOrigins.forEach((origin, i) => {
        const ghostArrow = ghostGroup.append('g').attr('opacity', 0);

        // Ghost arrow line
        ghostArrow
          .append('line')
          .attr('x1', xScale(origin[0]))
          .attr('y1', yScale(origin[1]))
          .attr('x2', xScale(origin[0] + vector[0]))
          .attr('y2', yScale(origin[1] + vector[1]))
          .attr('stroke', 'var(--viz-ghost)')
          .attr('stroke-width', 3)
          .attr('stroke-linecap', 'round');

        // Ghost arrowhead
        const endX = xScale(origin[0] + vector[0]);
        const endY = yScale(origin[1] + vector[1]);
        const startX = xScale(origin[0]);
        const startY = yScale(origin[1]);
        const arrowAngle = Math.atan2(endY - startY, endX - startX);
        const arrowSize = 10;

        ghostArrow
          .append('polygon')
          .attr(
            'points',
            `${endX},${endY} ${endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6)},${endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6)} ${endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6)},${endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6)}`
          )
          .attr('fill', 'var(--viz-ghost)');

        // Fade in with delay
        ghostArrow
          .transition()
          .delay(i * 300)
          .duration(500)
          .attr('opacity', 1);
      });
    }

    // Draw component lines if enabled
    if (showComponents && animationPhase !== 'idle') {
      const componentsGroup = mainGroup.append('g').attr('class', 'components');

      // X component (horizontal)
      if (animationPhase === 'east' || animationPhase === 'north' || animationPhase === 'complete') {
        componentsGroup
          .append('line')
          .attr('x1', xScale(0))
          .attr('y1', yScale(0))
          .attr('x2', xScale(0))
          .attr('y2', yScale(0))
          .attr('stroke', 'var(--viz-vector-primary)')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.5)
          .transition()
          .duration(800)
          .attr('x2', xScale(vector[0]));
      }

      // Y component (vertical)
      if (animationPhase === 'north' || animationPhase === 'complete') {
        componentsGroup
          .append('line')
          .attr('x1', xScale(vector[0]))
          .attr('y1', yScale(0))
          .attr('x2', xScale(vector[0]))
          .attr('y2', yScale(0))
          .attr('stroke', 'var(--viz-vector-secondary)')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.5)
          .transition()
          .delay(animationPhase === 'north' ? 0 : 800)
          .duration(800)
          .attr('y2', yScale(vector[1]));
      }
    }

    // Draw main vector
    if (animationPhase === 'complete' || !buildUpMode) {
      const vectorGroup = mainGroup.append('g').attr('class', 'main-vector');

      const startX = xScale(0);
      const startY = yScale(0);
      const endX = xScale(vector[0]);
      const endY = yScale(vector[1]);

      // Vector line with animation
      const vectorLine = vectorGroup
        .append('line')
        .attr('x1', startX)
        .attr('y1', startY)
        .attr('x2', startX)
        .attr('y2', startY)
        .attr('stroke', 'var(--viz-vector-primary)')
        .attr('stroke-width', 4)
        .attr('stroke-linecap', 'round');

      if (buildUpMode && animationPhase === 'complete') {
        vectorLine
          .transition()
          .duration(600)
          .attr('x2', endX)
          .attr('y2', endY);
      } else {
        vectorLine.attr('x2', endX).attr('y2', endY);
      }

      // Arrowhead
      const arrowAngle = Math.atan2(endY - startY, endX - startX);
      const arrowSize = 14;

      const arrowhead = vectorGroup
        .append('polygon')
        .attr('fill', 'var(--viz-vector-primary)')
        .attr('opacity', buildUpMode && animationPhase === 'complete' ? 0 : 1);

      if (buildUpMode && animationPhase === 'complete') {
        arrowhead
          .transition()
          .delay(600)
          .duration(300)
          .attr('opacity', 1)
          .attr(
            'points',
            `${endX},${endY} ${endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6)},${endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6)} ${endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6)},${endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6)}`
          );
      } else {
        arrowhead.attr(
          'points',
          `${endX},${endY} ${endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6)},${endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6)} ${endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6)},${endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6)}`
        );
      }

      // Vector label
      vectorGroup
        .append('text')
        .attr('x', endX + 15)
        .attr('y', endY - 10)
        .attr('fill', 'var(--viz-vector-primary)')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('opacity', buildUpMode && animationPhase === 'complete' ? 0 : 1)
        .text(`[${vector[0]}, ${vector[1]}]`)
        .transition()
        .delay(buildUpMode ? 900 : 0)
        .duration(300)
        .attr('opacity', 1);

      // Show vector tip indicator (no drag - use sliders instead)
      if (interactive && (!buildUpMode || animationPhase === 'complete')) {
        vectorGroup
          .append('circle')
          .attr('class', 'vector-tip')
          .attr('cx', endX)
          .attr('cy', endY)
          .attr('r', 8)
          .attr('fill', 'var(--viz-vector-primary)')
          .attr('stroke', 'white')
          .attr('stroke-width', 2);
      }
    }

    // Draw magnitude ruler if enabled
    if (showMagnitudeRuler && animationPhase === 'complete') {
      const rulerGroup = mainGroup.append('g').attr('class', 'magnitude-ruler');

      const rulerX = xScale(0) + 10;
      const rulerY1 = yScale(0);
      const rulerY2 = yScale(0) - magnitude * (innerHeight / 10);

      rulerGroup
        .append('line')
        .attr('x1', rulerX)
        .attr('y1', rulerY1)
        .attr('x2', rulerX)
        .attr('y2', rulerY2)
        .attr('stroke', 'var(--viz-highlight)')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round');

      rulerGroup
        .append('text')
        .attr('x', rulerX + 10)
        .attr('y', (rulerY1 + rulerY2) / 2)
        .attr('fill', 'var(--viz-highlight)')
        .attr('font-size', '12px')
        .text(`|v| = ${magnitude.toFixed(2)}`);
    }

    // Draw angle arc if enabled
    if (showAngleArc && animationPhase === 'complete') {
      const arcGroup = mainGroup.append('g').attr('class', 'angle-arc');
      const arcRadius = 40;

      const arc = d3.arc()
        .innerRadius(arcRadius - 2)
        .outerRadius(arcRadius)
        .startAngle(-Math.PI / 2)
        .endAngle(-Math.PI / 2 + (angle * Math.PI) / 180);

      arcGroup
        .append('path')
        .attr('transform', `translate(${xScale(0)}, ${yScale(0)})`)
        .attr('d', arc as never)
        .attr('fill', 'var(--viz-highlight)');

      arcGroup
        .append('text')
        .attr('x', xScale(0) + arcRadius + 15)
        .attr('y', yScale(0) - 10)
        .attr('fill', 'var(--viz-highlight)')
        .attr('font-size', '12px')
        .text(`θ = ${angle.toFixed(1)}°`);
    }

    // Draw dot product visualization if enabled
    if (showDotProduct && animationPhase === 'complete') {
      const dotGroup = mainGroup.append('g').attr('class', 'dot-product');

      const bEndX = xScale(showDotProduct[0]);
      const bEndY = yScale(showDotProduct[1]);

      // Second vector
      dotGroup
        .append('line')
        .attr('x1', xScale(0))
        .attr('y1', yScale(0))
        .attr('x2', bEndX)
        .attr('y2', bEndY)
        .attr('stroke', 'var(--viz-vector-secondary)')
        .attr('stroke-width', 3);

      // Arrowhead for second vector
      const bAngle = Math.atan2(bEndY - yScale(0), bEndX - xScale(0));
      const arrowSize = 12;

      dotGroup
        .append('polygon')
        .attr(
          'points',
          `${bEndX},${bEndY} ${bEndX - arrowSize * Math.cos(bAngle - Math.PI / 6)},${bEndY - arrowSize * Math.sin(bAngle - Math.PI / 6)} ${bEndX - arrowSize * Math.cos(bAngle + Math.PI / 6)},${bEndY - arrowSize * Math.sin(bAngle + Math.PI / 6)}`
        )
        .attr('fill', 'var(--viz-vector-secondary)');

      // Label
      dotGroup
        .append('text')
        .attr('x', bEndX + 10)
        .attr('y', bEndY + 5)
        .attr('fill', 'var(--viz-vector-secondary)')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(`[${showDotProduct[0]}, ${showDotProduct[1]}]`);

      // Calculate and show dot product
      const dotProduct = vector[0] * showDotProduct[0] + vector[1] * showDotProduct[1];

      dotGroup
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight - 10)
        .attr('fill', 'var(--viz-highlight)')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(`Dot Product: ${dotProduct.toFixed(2)}`);
    }
  }, [
    vector,
    showGhostVectors,
    showMagnitudeRuler,
    showAngleArc,
    showComponents,
    showDotProduct,
    showProjection,
    buildUpMode,
    animationPhase,
    interactive,
    width,
    height,
    id,
    xScale,
    yScale,
    innerWidth,
    innerHeight,
    padding,
    magnitude,
    angle,
    markInteractionComplete,
    setSharedVector,
    ghostOrigins,
  ]);

  // Skip narration button
  const skipNarration = useCallback(() => {
    setShowNarration(false);
    setAnimationPhase('complete');
    markNarrationViewed(id);
  }, [id, markNarrationViewed]);

  return (
    <div className={`relative ${className}`}>
      {/* Narration overlay */}
      <AnimatePresence>
        {showNarration && buildUpMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-end justify-center pb-4 pointer-events-none"
          >
            <motion.div
              key={narrationIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[var(--surface-elevated)] px-6 py-4 rounded-xl shadow-xl max-w-md text-center pointer-events-auto"
            >
              <p className="text-[var(--foreground)] text-lg font-medium">
                {narrationSteps[narrationIndex].text}
              </p>
              <button
                onClick={skipNarration}
                className="mt-3 text-sm text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"
              >
                Skip intro →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {/* Controls and Info panel */}
      {interactive && (!buildUpMode || animationPhase === 'complete') && (
        <div className="mt-4 space-y-4">
          {/* Slider Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--foreground)]/80">
                  X (East-West)
                </label>
                <span className="font-mono text-sm font-bold text-[var(--viz-vector-primary)]">
                  {vector[0].toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={vector[0]}
                onChange={(e) => {
                  const newX = parseFloat(e.target.value);
                  const newVector: [number, number] = [newX, vector[1]];
                  setVector(newVector);
                  setSharedVector(id, newVector);
                  markInteractionComplete(id);
                }}
                className="viz-slider viz-slider-x"
              />
              <div className="flex justify-between text-xs text-[var(--foreground)]/40">
                <span>-5 (West)</span>
                <span>0</span>
                <span>+5 (East)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--foreground)]/80">
                  Y (North-South)
                </label>
                <span className="font-mono text-sm font-bold text-[var(--viz-vector-secondary)]">
                  {vector[1].toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={vector[1]}
                onChange={(e) => {
                  const newY = parseFloat(e.target.value);
                  const newVector: [number, number] = [vector[0], newY];
                  setVector(newVector);
                  setSharedVector(id, newVector);
                  markInteractionComplete(id);
                }}
                className="viz-slider viz-slider-y"
              />
              <div className="flex justify-between text-xs text-[var(--foreground)]/40">
                <span>-5 (South)</span>
                <span>0</span>
                <span>+5 (North)</span>
              </div>
            </div>

            {/* Reset button */}
            <button
              onClick={() => {
                setVector(initialVector);
                setSharedVector(id, initialVector);
              }}
              className="w-full py-2 px-4 bg-[var(--surface)] hover:bg-[var(--viz-grid)] rounded-lg text-sm font-medium transition-colors"
            >
              Reset to [{initialVector[0]}, {initialVector[1]}]
            </button>
          </div>

          {/* Info display */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="bg-[var(--surface-elevated)] px-4 py-2 rounded-lg">
              <span className="text-[var(--foreground)]/60">Vector:</span>{' '}
              <span className="font-mono font-bold text-[var(--viz-vector-primary)]">
                [{vector[0].toFixed(1)}, {vector[1].toFixed(1)}]
              </span>
            </div>
            <div className="bg-[var(--surface-elevated)] px-4 py-2 rounded-lg">
              <span className="text-[var(--foreground)]/60">Magnitude:</span>{' '}
              <span className="font-mono font-bold">{magnitude.toFixed(2)}</span>
            </div>
            <div className="bg-[var(--surface-elevated)] px-4 py-2 rounded-lg">
              <span className="text-[var(--foreground)]/60">Angle:</span>{' '}
              <span className="font-mono font-bold">{angle.toFixed(1)}°</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
