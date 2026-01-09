'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '@/lib/stores/progressStore';

interface NeuronBuilderProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface Input {
  name: string;
  value: number;
  weight: number;
  color: string;
}

const defaultInputs: Input[] = [
  { name: 'Price', value: 3, weight: -2, color: 'var(--error)' },
  { name: 'Reviews', value: 4.5, weight: 3, color: 'var(--success)' },
  { name: 'Distance', value: 2, weight: -1, color: 'var(--viz-vector-secondary)' },
];

type ActivationFunction = 'relu' | 'sigmoid' | 'tanh' | 'linear';

const activationFunctions: Record<ActivationFunction, {
  fn: (x: number) => number;
  name: string;
  description: string;
}> = {
  linear: {
    fn: (x) => x,
    name: 'Linear',
    description: 'Output equals input (no transformation)',
  },
  relu: {
    fn: (x) => Math.max(0, x),
    name: 'ReLU',
    description: 'Zero if negative, otherwise pass through',
  },
  sigmoid: {
    fn: (x) => 1 / (1 + Math.exp(-x)),
    name: 'Sigmoid',
    description: 'Squashes to range (0, 1)',
  },
  tanh: {
    fn: (x) => Math.tanh(x),
    name: 'Tanh',
    description: 'Squashes to range (-1, 1)',
  },
};

export function NeuronBuilder({
  id = 'neuron-builder',
  interactive = true,
  width = 700,
  height = 400,
  className = '',
}: NeuronBuilderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const activationSvgRef = useRef<SVGSVGElement>(null);

  const [inputs, setInputs] = useState<Input[]>(defaultInputs);
  const [bias, setBias] = useState(-5);
  const [activation, setActivation] = useState<ActivationFunction>('relu');
  const [showVotingMetaphor, setShowVotingMetaphor] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'inputs' | 'weighted' | 'sum' | 'activation' | 'output'>('output');
  const [isAnimating, setIsAnimating] = useState(false);

  const { markInteractionComplete } = useProgressStore();

  // Calculate neuron output
  const calculation = useMemo(() => {
    const weightedInputs = inputs.map(inp => inp.value * inp.weight);
    const weightedSum = weightedInputs.reduce((a, b) => a + b, 0);
    const preActivation = weightedSum + bias;
    const activationFn = activationFunctions[activation].fn;
    const output = activationFn(preActivation);
    const fires = output > 0.5;

    return {
      weightedInputs,
      weightedSum,
      preActivation,
      output,
      fires,
    };
  }, [inputs, bias, activation]);

  // Draw main neuron diagram
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Layout positions
    const inputX = 60;
    const neuronX = innerWidth / 2;
    const outputX = innerWidth - 60;
    const neuronRadius = 50;

    // Draw inputs
    const inputSpacing = innerHeight / (inputs.length + 1);

    inputs.forEach((inp, i) => {
      const y = inputSpacing * (i + 1);

      // Input circle
      mainGroup.append('circle')
        .attr('cx', inputX)
        .attr('cy', y)
        .attr('r', 25)
        .attr('fill', 'var(--surface-elevated)')
        .attr('stroke', inp.color)
        .attr('stroke-width', 2);

      // Input label
      mainGroup.append('text')
        .attr('x', inputX)
        .attr('y', y - 35)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(inp.name);

      // Input value
      mainGroup.append('text')
        .attr('x', inputX)
        .attr('y', y + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', inp.color)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(inp.value.toFixed(1));

      // Connection line to neuron
      const neuronY = innerHeight / 2;
      const lineWidth = Math.abs(inp.weight) * 2 + 1;

      mainGroup.append('line')
        .attr('x1', inputX + 25)
        .attr('y1', y)
        .attr('x2', neuronX - neuronRadius)
        .attr('y2', neuronY)
        .attr('stroke', inp.weight > 0 ? 'var(--success)' : 'var(--error)')
        .attr('stroke-width', lineWidth)
        .attr('opacity', 0.6);

      // Weight label on connection
      const midX = (inputX + 25 + neuronX - neuronRadius) / 2;
      const midY = (y + neuronY) / 2;

      mainGroup.append('rect')
        .attr('x', midX - 20)
        .attr('y', midY - 10)
        .attr('width', 40)
        .attr('height', 20)
        .attr('fill', 'var(--surface)')
        .attr('rx', 4);

      mainGroup.append('text')
        .attr('x', midX)
        .attr('y', midY + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', inp.weight > 0 ? 'var(--success)' : 'var(--error)')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(`×${inp.weight > 0 ? '+' : ''}${inp.weight}`);

      // Show weighted value (if in voting metaphor mode)
      if (showVotingMetaphor) {
        const weighted = inp.value * inp.weight;
        mainGroup.append('text')
          .attr('x', midX)
          .attr('y', midY + 20)
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--foreground)')
          .attr('font-size', '10px')
          .attr('opacity', 0.7)
          .text(`= ${weighted > 0 ? '+' : ''}${weighted.toFixed(1)}`);
      }
    });

    // Draw main neuron
    const neuronY = innerHeight / 2;

    // Neuron glow if firing
    if (calculation.fires) {
      mainGroup.append('circle')
        .attr('cx', neuronX)
        .attr('cy', neuronY)
        .attr('r', neuronRadius + 10)
        .attr('fill', 'var(--primary)')
        .attr('opacity', 0.3);
    }

    // Neuron body
    mainGroup.append('circle')
      .attr('cx', neuronX)
      .attr('cy', neuronY)
      .attr('r', neuronRadius)
      .attr('fill', calculation.fires ? 'var(--primary)' : 'var(--surface-elevated)')
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 3);

    // Sigma symbol
    mainGroup.append('text')
      .attr('x', neuronX)
      .attr('y', neuronY - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', calculation.fires ? 'white' : 'var(--foreground)')
      .attr('font-size', '24px')
      .text('Σ');

    // Pre-activation value
    mainGroup.append('text')
      .attr('x', neuronX)
      .attr('y', neuronY + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', calculation.fires ? 'white' : 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(calculation.preActivation.toFixed(1));

    // Bias annotation
    mainGroup.append('text')
      .attr('x', neuronX)
      .attr('y', neuronY + neuronRadius + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .attr('opacity', 0.7)
      .text(`bias: ${bias > 0 ? '+' : ''}${bias}`);

    // Output connection
    mainGroup.append('line')
      .attr('x1', neuronX + neuronRadius)
      .attr('y1', neuronY)
      .attr('x2', outputX - 25)
      .attr('y2', neuronY)
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 3)
      .attr('opacity', 0.6);

    // Activation function box
    const actX = (neuronX + neuronRadius + outputX - 25) / 2;
    mainGroup.append('rect')
      .attr('x', actX - 30)
      .attr('y', neuronY - 15)
      .attr('width', 60)
      .attr('height', 30)
      .attr('fill', 'var(--surface)')
      .attr('stroke', 'var(--viz-grid)')
      .attr('rx', 4);

    mainGroup.append('text')
      .attr('x', actX)
      .attr('y', neuronY + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--primary)')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(activationFunctions[activation].name);

    // Output circle
    mainGroup.append('circle')
      .attr('cx', outputX)
      .attr('cy', neuronY)
      .attr('r', 25)
      .attr('fill', calculation.fires ? 'var(--success)' : 'var(--surface-elevated)')
      .attr('stroke', calculation.fires ? 'var(--success)' : 'var(--viz-grid)')
      .attr('stroke-width', 2);

    // Output value
    mainGroup.append('text')
      .attr('x', outputX)
      .attr('y', neuronY + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', calculation.fires ? 'white' : 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(calculation.output.toFixed(2));

    // Output label
    mainGroup.append('text')
      .attr('x', outputX)
      .attr('y', neuronY + 45)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(calculation.fires ? 'GO!' : 'No');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(showVotingMetaphor ? 'Restaurant Decision Neuron' : 'Single Neuron');

  }, [inputs, bias, activation, calculation, showVotingMetaphor, width, height]);

  // Draw activation function graph
  useEffect(() => {
    if (!activationSvgRef.current) return;

    const svg = d3.select(activationSvgRef.current);
    svg.selectAll('*').remove();

    const w = 200;
    const h = 120;
    const padding = 20;

    const xScale = d3.scaleLinear().domain([-6, 6]).range([padding, w - padding]);
    const yScale = d3.scaleLinear().domain([-1.5, 1.5]).range([h - padding, padding]);

    // Grid
    svg.append('line')
      .attr('x1', padding)
      .attr('x2', w - padding)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', 'var(--viz-grid)')
      .attr('stroke-width', 1);

    svg.append('line')
      .attr('x1', xScale(0))
      .attr('x2', xScale(0))
      .attr('y1', padding)
      .attr('y2', h - padding)
      .attr('stroke', 'var(--viz-grid)')
      .attr('stroke-width', 1);

    // Activation function curve
    const activationFn = activationFunctions[activation].fn;
    const line = d3.line<number>()
      .x(d => xScale(d))
      .y(d => yScale(activationFn(d)));

    const xValues = d3.range(-6, 6.1, 0.1);

    svg.append('path')
      .datum(xValues)
      .attr('fill', 'none')
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Current input point
    const inputVal = calculation.preActivation;
    const outputVal = calculation.output;
    const clampedInput = Math.max(-6, Math.min(6, inputVal));

    svg.append('circle')
      .attr('cx', xScale(clampedInput))
      .attr('cy', yScale(outputVal))
      .attr('r', 6)
      .attr('fill', 'var(--success)')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Dotted lines to axes
    svg.append('line')
      .attr('x1', xScale(clampedInput))
      .attr('y1', yScale(outputVal))
      .attr('x2', xScale(clampedInput))
      .attr('y2', yScale(0))
      .attr('stroke', 'var(--success)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5);

    svg.append('line')
      .attr('x1', xScale(clampedInput))
      .attr('y1', yScale(outputVal))
      .attr('x2', xScale(0))
      .attr('y2', yScale(outputVal))
      .attr('stroke', 'var(--success)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5);

    // Labels
    svg.append('text')
      .attr('x', w / 2)
      .attr('y', h - 3)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '10px')
      .text('Input (pre-activation)');

  }, [activation, calculation]);

  const updateInput = useCallback((index: number, field: 'value' | 'weight', newValue: number) => {
    setInputs(prev => prev.map((inp, i) =>
      i === index ? { ...inp, [field]: newValue } : inp
    ));
    markInteractionComplete(id);
  }, [id, markInteractionComplete]);

  const runAnimation = useCallback(() => {
    setIsAnimating(true);
    setAnimationPhase('inputs');

    const phases: typeof animationPhase[] = ['inputs', 'weighted', 'sum', 'activation', 'output'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex >= phases.length) {
        clearInterval(interval);
        setIsAnimating(false);
        setAnimationPhase('output');
      } else {
        setAnimationPhase(phases[currentIndex]);
      }
    }, 800);
  }, []);

  return (
    <div className={`neuron-builder ${className}`}>
      {/* Main Neuron Diagram */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {/* Controls */}
      {interactive && (
        <div className="mt-4 space-y-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowVotingMetaphor(!showVotingMetaphor)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showVotingMetaphor
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface-elevated)] hover:bg-[var(--viz-grid)]'
              }`}
            >
              Restaurant Metaphor
            </button>
            <button
              onClick={runAnimation}
              disabled={isAnimating}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--surface-elevated)] hover:bg-[var(--viz-grid)] disabled:opacity-50 transition-colors"
            >
              {isAnimating ? 'Animating...' : 'Animate Flow'}
            </button>
          </div>

          {/* Input Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Adjust inputs and weights:
            </div>
            <div className="space-y-4">
              {inputs.map((inp, i) => (
                <div key={inp.name} className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs" style={{ color: inp.color }}>
                        {inp.name} (value)
                      </label>
                      <span className="font-mono text-xs text-[var(--foreground)]">
                        {inp.value.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={inp.value}
                      onChange={(e) => updateInput(i, 'value', parseFloat(e.target.value))}
                      className="viz-slider"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-[var(--foreground)]/60">
                        Weight
                      </label>
                      <span className={`font-mono text-xs ${inp.weight > 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                        {inp.weight > 0 ? '+' : ''}{inp.weight.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="0.1"
                      value={inp.weight}
                      onChange={(e) => updateInput(i, 'weight', parseFloat(e.target.value))}
                      className="viz-slider"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bias and Activation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--foreground)]/70">
                  Bias (threshold)
                </label>
                <span className="font-mono text-sm text-[var(--primary)]">
                  {bias > 0 ? '+' : ''}{bias.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={bias}
                onChange={(e) => {
                  setBias(parseFloat(e.target.value));
                  markInteractionComplete(id);
                }}
                className="viz-slider"
              />
              <p className="text-xs text-[var(--foreground)]/50 mt-2">
                How &quot;hungry&quot; you need to be before saying yes
              </p>
            </div>

            <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
              <div className="text-sm font-medium text-[var(--foreground)]/70 mb-2">
                Activation Function
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(activationFunctions) as ActivationFunction[]).map((act) => (
                  <button
                    key={act}
                    onClick={() => {
                      setActivation(act);
                      markInteractionComplete(id);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      activation === act
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)]'
                    }`}
                  >
                    {activationFunctions[act].name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--foreground)]/50 mt-2">
                {activationFunctions[activation].description}
              </p>
            </div>
          </div>

          {/* Activation Function Graph */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-start gap-4">
              <svg
                ref={activationSvgRef}
                width={200}
                height={120}
                className="bg-[var(--surface)] rounded-lg"
              />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[var(--foreground)] mb-2">
                  {activationFunctions[activation].name} Activation
                </h4>
                <div className="space-y-1 text-xs text-[var(--foreground)]/70">
                  <p>Pre-activation (Σ + bias): <span className="font-mono text-[var(--foreground)]">{calculation.preActivation.toFixed(2)}</span></p>
                  <p>After activation: <span className="font-mono text-[var(--success)]">{calculation.output.toFixed(2)}</span></p>
                  <p className="pt-2 text-[var(--primary)] font-medium">
                    {calculation.fires ? '✓ Neuron FIRES!' : '○ Neuron stays quiet'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <details className="bg-[var(--surface-elevated)] rounded-xl">
            <summary className="p-4 cursor-pointer font-medium text-[var(--primary)] hover:bg-[var(--viz-grid)]/30 rounded-xl">
              🧮 Show Full Calculation
            </summary>
            <div className="px-4 pb-4">
              <div className="bg-[var(--surface)] p-4 rounded-lg font-mono text-sm space-y-2">
                <p className="text-[var(--foreground)]/70">Step 1: Weighted inputs</p>
                {inputs.map((inp, i) => (
                  <p key={inp.name} className="pl-4">
                    {inp.name}: {inp.value.toFixed(1)} × {inp.weight > 0 ? '+' : ''}{inp.weight} =
                    <span className={calculation.weightedInputs[i] > 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}>
                      {' '}{calculation.weightedInputs[i] > 0 ? '+' : ''}{calculation.weightedInputs[i].toFixed(1)}
                    </span>
                  </p>
                ))}
                <p className="pt-2 border-t border-[var(--viz-grid)] text-[var(--foreground)]/70">
                  Step 2: Sum + bias
                </p>
                <p className="pl-4">
                  ({calculation.weightedInputs.map(w => w > 0 ? `+${w.toFixed(1)}` : w.toFixed(1)).join(' ')}) + ({bias > 0 ? '+' : ''}{bias}) =
                  <span className="text-[var(--primary)] font-bold"> {calculation.preActivation.toFixed(1)}</span>
                </p>
                <p className="pt-2 border-t border-[var(--viz-grid)] text-[var(--foreground)]/70">
                  Step 3: Apply {activationFunctions[activation].name}
                </p>
                <p className="pl-4 text-[var(--success)] font-bold">
                  {activationFunctions[activation].name}({calculation.preActivation.toFixed(1)}) = {calculation.output.toFixed(2)}
                </p>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
