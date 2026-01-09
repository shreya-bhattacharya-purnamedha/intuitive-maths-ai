'use client';

import { useRef, useEffect, ReactNode, useCallback } from 'react';
import * as d3 from 'd3';

export interface Canvas2DProps {
  width?: number;
  height?: number;
  padding?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  showGrid?: boolean;
  showAxes?: boolean;
  showAxisLabels?: boolean;
  className?: string;
  children?: (context: Canvas2DContext) => ReactNode;
  onMount?: (context: Canvas2DContext) => void;
}

export interface Canvas2DContext {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
}

export function Canvas2D({
  width = 600,
  height = 400,
  padding = 40,
  xDomain = [-5, 5],
  yDomain = [-5, 5],
  showGrid = true,
  showAxes = true,
  showAxisLabels = true,
  className = '',
  children,
  onMount,
}: Canvas2DProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const contextRef = useRef<Canvas2DContext | null>(null);

  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  // Create scales
  const xScale = useCallback(
    () =>
      d3
        .scaleLinear()
        .domain(xDomain)
        .range([0, innerWidth]),
    [xDomain, innerWidth]
  );

  const yScale = useCallback(
    () =>
      d3
        .scaleLinear()
        .domain(yDomain)
        .range([innerHeight, 0]), // Flip Y axis for Cartesian coordinates
    [yDomain, innerHeight]
  );

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll('*').remove();

    // Create main group with padding offset
    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding}, ${padding})`);

    const xS = xScale();
    const yS = yScale();

    // Draw grid
    if (showGrid) {
      const gridGroup = mainGroup.append('g').attr('class', 'grid');

      // Vertical grid lines
      const xTicks = xS.ticks(10);
      gridGroup
        .selectAll('.grid-line-v')
        .data(xTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-line-v')
        .attr('x1', (d) => xS(d))
        .attr('y1', 0)
        .attr('x2', (d) => xS(d))
        .attr('y2', innerHeight)
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', (d) => (d === 0 ? 0 : 0.5))
        .attr('stroke-dasharray', '2,2');

      // Horizontal grid lines
      const yTicks = yS.ticks(10);
      gridGroup
        .selectAll('.grid-line-h')
        .data(yTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-line-h')
        .attr('x1', 0)
        .attr('y1', (d) => yS(d))
        .attr('x2', innerWidth)
        .attr('y2', (d) => yS(d))
        .attr('stroke', 'var(--viz-grid)')
        .attr('stroke-width', (d) => (d === 0 ? 0 : 0.5))
        .attr('stroke-dasharray', '2,2');
    }

    // Draw axes
    if (showAxes) {
      const axesGroup = mainGroup.append('g').attr('class', 'axes');

      // X axis
      axesGroup
        .append('line')
        .attr('x1', 0)
        .attr('y1', yS(0))
        .attr('x2', innerWidth)
        .attr('y2', yS(0))
        .attr('stroke', 'var(--viz-axis)')
        .attr('stroke-width', 1.5);

      // Y axis
      axesGroup
        .append('line')
        .attr('x1', xS(0))
        .attr('y1', 0)
        .attr('x2', xS(0))
        .attr('y2', innerHeight)
        .attr('stroke', 'var(--viz-axis)')
        .attr('stroke-width', 1.5);

      // Axis arrows
      const arrowSize = 8;

      // X arrow
      axesGroup
        .append('polygon')
        .attr(
          'points',
          `${innerWidth - arrowSize},${yS(0) - arrowSize / 2} ${innerWidth},${yS(0)} ${innerWidth - arrowSize},${yS(0) + arrowSize / 2}`
        )
        .attr('fill', 'var(--viz-axis)');

      // Y arrow
      axesGroup
        .append('polygon')
        .attr(
          'points',
          `${xS(0) - arrowSize / 2},${arrowSize} ${xS(0)},0 ${xS(0) + arrowSize / 2},${arrowSize}`
        )
        .attr('fill', 'var(--viz-axis)');

      // Axis labels
      if (showAxisLabels) {
        axesGroup
          .append('text')
          .attr('x', innerWidth - 5)
          .attr('y', yS(0) + 20)
          .attr('text-anchor', 'end')
          .attr('fill', 'var(--foreground)')
          .attr('font-size', '12px')
          .attr('opacity', 0.7)
          .text('x');

        axesGroup
          .append('text')
          .attr('x', xS(0) + 15)
          .attr('y', 12)
          .attr('text-anchor', 'start')
          .attr('fill', 'var(--foreground)')
          .attr('font-size', '12px')
          .attr('opacity', 0.7)
          .text('y');
      }
    }

    // Create context
    const context: Canvas2DContext = {
      svg,
      mainGroup,
      xScale: xS,
      yScale: yS,
      width,
      height,
      innerWidth,
      innerHeight,
    };

    contextRef.current = context;

    // Call onMount if provided
    if (onMount) {
      onMount(context);
    }
  }, [
    width,
    height,
    padding,
    xDomain,
    yDomain,
    showGrid,
    showAxes,
    showAxisLabels,
    innerWidth,
    innerHeight,
    xScale,
    yScale,
    onMount,
  ]);

  return (
    <div className={`viz-canvas inline-block ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
      {children && contextRef.current && children(contextRef.current)}
    </div>
  );
}
