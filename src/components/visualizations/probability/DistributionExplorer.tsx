'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface DistributionExplorerProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
  initialDistribution?: 'normal' | 'uniform' | 'exponential' | 'bimodal';
}

// Distribution functions
const distributions = {
  normal: {
    name: 'Normal (Gaussian)',
    description: 'The classic "bell curve" - most values cluster around the mean',
    pdf: (x: number, mean: number, std: number) => {
      const z = (x - mean) / std;
      return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    },
    sample: (mean: number, std: number) => {
      // Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    },
    defaultParams: { mean: 0, std: 1 },
    paramLabels: { mean: 'Mean (μ)', std: 'Std Dev (σ)' },
    insight: 'The normal distribution emerges from the sum of many independent random events (Central Limit Theorem).',
  },
  uniform: {
    name: 'Uniform',
    description: 'Every value in the range is equally likely',
    pdf: (x: number, min: number, max: number) => {
      if (x >= min && x <= max) return 1 / (max - min);
      return 0;
    },
    sample: (min: number, max: number) => min + Math.random() * (max - min),
    defaultParams: { min: -2, max: 2 },
    paramLabels: { min: 'Minimum', max: 'Maximum' },
    insight: 'Uniform distributions represent "maximum ignorance" - you have no reason to favor any outcome.',
  },
  exponential: {
    name: 'Exponential',
    description: 'Models waiting times - things that "decay" over time',
    pdf: (x: number, rate: number) => {
      if (x < 0) return 0;
      return rate * Math.exp(-rate * x);
    },
    sample: (rate: number) => -Math.log(Math.random()) / rate,
    defaultParams: { rate: 1 },
    paramLabels: { rate: 'Rate (λ)' },
    insight: 'The exponential distribution is "memoryless" - how long you\'ve waited doesn\'t affect how much longer you\'ll wait.',
  },
  bimodal: {
    name: 'Bimodal (Mixture)',
    description: 'Two distinct peaks - common when mixing two populations',
    pdf: (x: number, mean1: number, mean2: number, std: number) => {
      const z1 = (x - mean1) / std;
      const z2 = (x - mean2) / std;
      const g1 = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z1 * z1);
      const g2 = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z2 * z2);
      return 0.5 * g1 + 0.5 * g2;
    },
    sample: (mean1: number, mean2: number, std: number) => {
      const mean = Math.random() < 0.5 ? mean1 : mean2;
      const u1 = Math.random();
      const u2 = Math.random();
      return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    },
    defaultParams: { mean1: -1.5, mean2: 1.5, std: 0.5 },
    paramLabels: { mean1: 'Peak 1', mean2: 'Peak 2', std: 'Spread' },
    insight: 'Bimodal distributions often indicate two distinct subgroups in your data (e.g., heights of mixed male/female population).',
  },
};

export function DistributionExplorer({
  id = 'distribution-explorer',
  interactive = true,
  width = 650,
  height = 400,
  className = '',
  initialDistribution = 'normal',
}: DistributionExplorerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentDist, setCurrentDist] = useState<keyof typeof distributions>(initialDistribution);
  const [params, setParams] = useState<Record<string, number>>(distributions[initialDistribution].defaultParams);
  const [samples, setSamples] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPDF, setShowPDF] = useState(true);
  const [showHistogram, setShowHistogram] = useState(true);
  const [highlightRange, setHighlightRange] = useState<[number, number] | null>(null);
  const animationRef = useRef<number | null>(null);

  const { markInteractionComplete } = useProgressStore();

  const padding = { top: 40, right: 30, bottom: 50, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const dist = distributions[currentDist];

  // X domain based on distribution
  const xDomain = useMemo((): [number, number] => {
    if (currentDist === 'exponential') return [0, 6];
    if (currentDist === 'uniform') return [params.min - 1, params.max + 1];
    return [-5, 5];
  }, [currentDist, params]);

  // Scales
  const xScale = useMemo(() =>
    d3.scaleLinear().domain(xDomain).range([0, innerWidth]),
    [innerWidth, xDomain]
  );

  // Calculate PDF values
  const pdfData = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const step = (xDomain[1] - xDomain[0]) / 200;
    for (let x = xDomain[0]; x <= xDomain[1]; x += step) {
      let y: number;
      if (currentDist === 'normal') {
        y = dist.pdf(x, params.mean, params.std);
      } else if (currentDist === 'uniform') {
        y = dist.pdf(x, params.min, params.max);
      } else if (currentDist === 'exponential') {
        y = dist.pdf(x, params.rate);
      } else if (currentDist === 'bimodal') {
        y = dist.pdf(x, params.mean1, params.mean2, params.std);
      } else {
        y = 0;
      }
      points.push({ x, y });
    }
    return points;
  }, [currentDist, params, dist, xDomain]);

  // Y scale based on PDF max
  const yMax = useMemo(() => Math.max(...pdfData.map(d => d.y)) * 1.2, [pdfData]);
  const yScale = useMemo(() =>
    d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]),
    [innerHeight, yMax]
  );

  // Histogram bins
  const histogramData = useMemo(() => {
    if (samples.length === 0) return [];
    const binGenerator = d3.bin()
      .domain(xDomain)
      .thresholds(30);
    return binGenerator(samples);
  }, [samples, xDomain]);

  // Calculate probability for highlighted range
  const highlightedProb = useMemo(() => {
    if (!highlightRange) return null;
    const [a, b] = highlightRange;
    const inRange = samples.filter(s => s >= a && s <= b).length;
    return samples.length > 0 ? inRange / samples.length : 0;
  }, [highlightRange, samples]);

  // Generate a sample
  const generateSample = useCallback(() => {
    let sample: number;
    if (currentDist === 'normal') {
      sample = dist.sample(params.mean, params.std);
    } else if (currentDist === 'uniform') {
      sample = dist.sample(params.min, params.max);
    } else if (currentDist === 'exponential') {
      sample = dist.sample(params.rate);
    } else if (currentDist === 'bimodal') {
      sample = dist.sample(params.mean1, params.mean2, params.std);
    } else {
      sample = 0;
    }
    return sample;
  }, [currentDist, params, dist]);

  // Add samples
  const addSamples = useCallback((count: number) => {
    const newSamples: number[] = [];
    for (let i = 0; i < count; i++) {
      newSamples.push(generateSample());
    }
    setSamples(prev => [...prev, ...newSamples].slice(-500)); // Keep last 500
    markInteractionComplete(id);
  }, [generateSample, id, markInteractionComplete]);

  // Animate sampling
  const startSampling = useCallback(() => {
    setIsAnimating(true);
    let count = 0;
    const animate = () => {
      addSamples(5);
      count += 5;
      if (count < 200) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [addSamples]);

  const stopSampling = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  // Reset when distribution changes
  useEffect(() => {
    setSamples([]);
    setParams(distributions[currentDist].defaultParams);
    setHighlightRange(null);
  }, [currentDist]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Draw visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Highlighted area
    if (highlightRange && showPDF) {
      const [a, b] = highlightRange;
      const areaData = pdfData.filter(d => d.x >= a && d.x <= b);

      const areaGenerator = d3.area<{ x: number; y: number }>()
        .x(d => xScale(d.x))
        .y0(innerHeight)
        .y1(d => yScale(d.y));

      mainGroup.append('path')
        .datum(areaData)
        .attr('d', areaGenerator)
        .attr('fill', 'var(--primary)')
        .attr('opacity', 0.3);
    }

    // Histogram
    if (showHistogram && histogramData.length > 0) {
      const maxBinCount = Math.max(...histogramData.map(d => d.length));
      const histYScale = d3.scaleLinear()
        .domain([0, maxBinCount])
        .range([innerHeight, 0]);

      mainGroup.selectAll('.bar')
        .data(histogramData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.x0 || 0) + 1)
        .attr('width', d => Math.max(0, xScale(d.x1 || 0) - xScale(d.x0 || 0) - 2))
        .attr('y', d => histYScale(d.length))
        .attr('height', d => innerHeight - histYScale(d.length))
        .attr('fill', 'var(--viz-highlight)')
        .attr('opacity', 0.5);
    }

    // PDF curve
    if (showPDF) {
      const lineGenerator = d3.line<{ x: number; y: number }>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);

      mainGroup.append('path')
        .datum(pdfData)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', 'var(--primary)')
        .attr('stroke-width', 3);
    }

    // X axis
    const xAxis = d3.axisBottom(xScale).ticks(10);
    mainGroup.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr('color', 'var(--foreground)')
      .selectAll('text')
      .attr('fill', 'var(--foreground)');

    // Y axis
    const yAxis = d3.axisLeft(yScale).ticks(5);
    mainGroup.append('g')
      .call(yAxis)
      .attr('color', 'var(--foreground)')
      .selectAll('text')
      .attr('fill', 'var(--foreground)');

    // Axis labels
    mainGroup.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '12px')
      .text('Value (x)');

    mainGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '12px')
      .text('Probability Density');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(`${dist.name} Distribution`);

  }, [pdfData, histogramData, xScale, yScale, innerWidth, innerHeight, width, padding, showPDF, showHistogram, highlightRange, dist.name]);

  return (
    <div className={`distribution-explorer ${className}`}>
      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {/* Controls */}
      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Distribution Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Choose a distribution:
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(distributions).map(([key, d]) => (
                <button
                  key={key}
                  onClick={() => setCurrentDist(key as keyof typeof distributions)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentDist === key
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)]'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--foreground)]/50 mt-2">
              {dist.description}
            </p>
          </div>

          {/* Parameters */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Parameters:
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(params).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-[var(--foreground)]/60">
                      {dist.paramLabels[key] || key}
                    </label>
                    <span className="font-mono text-xs text-[var(--primary)]">
                      {value.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={key.includes('rate') ? 0.1 : key.includes('std') ? 0.1 : -3}
                    max={key.includes('rate') ? 3 : key.includes('std') ? 2 : 3}
                    step="0.1"
                    value={value}
                    onChange={(e) => {
                      setParams(prev => ({ ...prev, [key]: parseFloat(e.target.value) }));
                      markInteractionComplete(id);
                    }}
                    className="viz-slider"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sampling Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--foreground)]/70">
                Sample from the distribution:
              </span>
              <span className="text-xs font-mono text-[var(--foreground)]/50">
                n = {samples.length}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addSamples(1)}
                className="px-3 py-2 bg-[var(--viz-vector-secondary)] hover:bg-[var(--viz-vector-secondary)]/80 text-white rounded-lg text-sm font-medium transition-colors"
              >
                +1 Sample
              </button>
              <button
                onClick={() => addSamples(10)}
                className="px-3 py-2 bg-[var(--viz-vector-secondary)] hover:bg-[var(--viz-vector-secondary)]/80 text-white rounded-lg text-sm font-medium transition-colors"
              >
                +10
              </button>
              <button
                onClick={() => addSamples(100)}
                className="px-3 py-2 bg-[var(--viz-vector-secondary)] hover:bg-[var(--viz-vector-secondary)]/80 text-white rounded-lg text-sm font-medium transition-colors"
              >
                +100
              </button>
              <button
                onClick={isAnimating ? stopSampling : startSampling}
                className={`px-3 py-2 ${
                  isAnimating
                    ? 'bg-[var(--error)] hover:bg-[var(--error)]/80'
                    : 'bg-[var(--success)] hover:bg-[var(--success)]/80'
                } text-white rounded-lg text-sm font-medium transition-colors`}
              >
                {isAnimating ? 'Stop' : 'Auto-Sample'}
              </button>
              <button
                onClick={() => setSamples([])}
                className="px-3 py-2 bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)] rounded-lg text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPDF}
                  onChange={(e) => setShowPDF(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-[var(--foreground)]/80">Show PDF curve</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHistogram}
                  onChange={(e) => setShowHistogram(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-[var(--foreground)]/80">Show histogram</span>
              </label>
            </div>
          </div>

          {/* Probability Calculator */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Calculate P(a ≤ X ≤ b):
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--foreground)]/60">a =</label>
                <input
                  type="number"
                  step="0.1"
                  value={highlightRange?.[0] ?? -1}
                  onChange={(e) => {
                    const a = parseFloat(e.target.value);
                    setHighlightRange([a, highlightRange?.[1] ?? 1]);
                  }}
                  className="w-16 px-2 py-1 bg-[var(--surface)] border border-[var(--viz-grid)] rounded text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--foreground)]/60">b =</label>
                <input
                  type="number"
                  step="0.1"
                  value={highlightRange?.[1] ?? 1}
                  onChange={(e) => {
                    const b = parseFloat(e.target.value);
                    setHighlightRange([highlightRange?.[0] ?? -1, b]);
                  }}
                  className="w-16 px-2 py-1 bg-[var(--surface)] border border-[var(--viz-grid)] rounded text-sm"
                />
              </div>
              {highlightedProb !== null && samples.length > 0 && (
                <div className="ml-4 px-3 py-1 bg-[var(--primary)]/20 rounded-lg">
                  <span className="text-sm font-mono text-[var(--primary)]">
                    P ≈ {(highlightedProb * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-[var(--foreground)]/50 ml-2">
                    ({Math.round(highlightedProb * samples.length)} of {samples.length})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Insight */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">Insight:</strong> {dist.insight}
            </p>
          </div>

          {/* Statistics */}
          {samples.length > 0 && (
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <div className="text-sm font-medium text-[var(--foreground)]/70 mb-2">
                Sample Statistics:
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xs text-[var(--foreground)]/50">Mean</div>
                  <div className="font-mono text-sm text-[var(--primary)]">
                    {(samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--foreground)]/50">Std Dev</div>
                  <div className="font-mono text-sm text-[var(--primary)]">
                    {Math.sqrt(
                      samples.reduce((sum, x) => {
                        const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
                        return sum + (x - mean) ** 2;
                      }, 0) / samples.length
                    ).toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--foreground)]/50">Min</div>
                  <div className="font-mono text-sm">{Math.min(...samples).toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--foreground)]/50">Max</div>
                  <div className="font-mono text-sm">{Math.max(...samples).toFixed(3)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
