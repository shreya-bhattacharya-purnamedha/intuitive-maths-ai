'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface BackpropFlowProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface Node {
  id: string;
  layer: number;
  index: number;
  value: number;
  gradient: number;
  label: string;
  role: string;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
  gradient: number;
}

type Phase = 'idle' | 'forward' | 'loss' | 'backward' | 'update';

export function BackpropFlow({
  id = 'backprop-flow',
  interactive = true,
  width = 700,
  height = 500,
  className = '',
}: BackpropFlowProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [blameMode, setBlameMode] = useState(true); // Corporate metaphor vs math
  const animationRef = useRef<number | null>(null);

  const { markInteractionComplete } = useProgressStore();

  // Network structure: 2 inputs -> 2 hidden -> 1 output
  const [weights, setWeights] = useState({
    w1: 0.5, w2: 0.3,   // input1 to hidden
    w3: 0.4, w4: 0.6,   // input2 to hidden
    w5: 0.7, w6: 0.2,   // hidden to output
  });

  const [inputs] = useState([1.0, 0.5]);
  const target = 1.0;

  // Compute forward pass values
  const forwardPass = useMemo(() => {
    const h1_raw = inputs[0] * weights.w1 + inputs[1] * weights.w3;
    const h2_raw = inputs[0] * weights.w2 + inputs[1] * weights.w4;

    // ReLU activation
    const h1 = Math.max(0, h1_raw);
    const h2 = Math.max(0, h2_raw);

    const output = h1 * weights.w5 + h2 * weights.w6;
    const loss = 0.5 * (output - target) ** 2;

    return { h1_raw, h2_raw, h1, h2, output, loss };
  }, [inputs, weights, target]);

  // Compute backward pass gradients
  const backwardPass = useMemo(() => {
    const { h1, h2, output, h1_raw, h2_raw } = forwardPass;

    // dLoss/dOutput
    const dL_dOut = output - target;

    // dLoss/dH1 and dLoss/dH2 (through output)
    const dL_dH1 = dL_dOut * weights.w5 * (h1_raw > 0 ? 1 : 0);
    const dL_dH2 = dL_dOut * weights.w6 * (h2_raw > 0 ? 1 : 0);

    // Gradients for weights
    const dL_dW5 = dL_dOut * h1;
    const dL_dW6 = dL_dOut * h2;
    const dL_dW1 = dL_dH1 * inputs[0];
    const dL_dW2 = dL_dH2 * inputs[0];
    const dL_dW3 = dL_dH1 * inputs[1];
    const dL_dW4 = dL_dH2 * inputs[1];

    return {
      dL_dOut,
      dL_dH1,
      dL_dH2,
      dL_dW1, dL_dW2, dL_dW3, dL_dW4, dL_dW5, dL_dW6
    };
  }, [forwardPass, weights, inputs]);

  // Build nodes
  const nodes: Node[] = useMemo(() => [
    // Input layer (layer 0)
    { id: 'i1', layer: 0, index: 0, value: inputs[0], gradient: 0, label: 'x₁', role: 'Supplier A' },
    { id: 'i2', layer: 0, index: 1, value: inputs[1], gradient: 0, label: 'x₂', role: 'Supplier B' },
    // Hidden layer (layer 1)
    { id: 'h1', layer: 1, index: 0, value: forwardPass.h1, gradient: backwardPass.dL_dH1, label: 'h₁', role: 'Worker 1' },
    { id: 'h2', layer: 1, index: 1, value: forwardPass.h2, gradient: backwardPass.dL_dH2, label: 'h₂', role: 'Worker 2' },
    // Output layer (layer 2)
    { id: 'o1', layer: 2, index: 0, value: forwardPass.output, gradient: backwardPass.dL_dOut, label: 'ŷ', role: 'Manager' },
    // Target (layer 3)
    { id: 't1', layer: 3, index: 0, value: target, gradient: 0, label: 'y', role: 'CEO Goal' },
  ], [inputs, forwardPass, backwardPass, target]);

  // Build edges
  const edges: Edge[] = useMemo(() => [
    { source: 'i1', target: 'h1', weight: weights.w1, gradient: backwardPass.dL_dW1 },
    { source: 'i1', target: 'h2', weight: weights.w2, gradient: backwardPass.dL_dW2 },
    { source: 'i2', target: 'h1', weight: weights.w3, gradient: backwardPass.dL_dW3 },
    { source: 'i2', target: 'h2', weight: weights.w4, gradient: backwardPass.dL_dW4 },
    { source: 'h1', target: 'o1', weight: weights.w5, gradient: backwardPass.dL_dW5 },
    { source: 'h2', target: 'o1', weight: weights.w6, gradient: backwardPass.dL_dW6 },
  ], [weights, backwardPass]);

  // Node positions
  const getNodePos = useCallback((node: Node) => {
    const layerX = [80, 250, 420, 580];
    const layerHeights = [2, 2, 1, 1];
    const spacing = 120;
    const centerY = height / 2;

    const nodesInLayer = layerHeights[node.layer];
    const startY = centerY - ((nodesInLayer - 1) * spacing) / 2;

    return {
      x: layerX[node.layer],
      y: startY + node.index * spacing
    };
  }, [height]);

  // Phase descriptions
  const phaseInfo: Record<Phase, { title: string; description: string; blameDesc: string }> = {
    idle: {
      title: 'Ready to Learn',
      description: 'Click "Forward Pass" to send data through the network',
      blameDesc: 'The company is ready for a new project. Click to start!'
    },
    forward: {
      title: 'Forward Pass',
      description: 'Data flows through: input → hidden → output. Each neuron computes a weighted sum.',
      blameDesc: 'Orders flow down the hierarchy: CEO → Manager → Workers → Suppliers'
    },
    loss: {
      title: 'Loss Calculation',
      description: `Output: ${forwardPass.output.toFixed(3)}, Target: ${target}, Loss: ${forwardPass.loss.toFixed(4)}`,
      blameDesc: `The CEO reviews results: Got ${forwardPass.output.toFixed(2)} but wanted ${target}. Someone's getting blamed!`
    },
    backward: {
      title: 'Backward Pass (Backpropagation)',
      description: 'Gradients flow backward via chain rule: ∂L/∂w = ∂L/∂out × ∂out/∂w',
      blameDesc: 'Blame flows upward! Each person passes blame proportional to their contribution.'
    },
    update: {
      title: 'Weight Update',
      description: 'Weights adjusted: w_new = w_old - η × gradient',
      blameDesc: 'Everyone adjusts their behavior based on how much blame they received!'
    }
  };

  // Run animation
  const runPhase = useCallback((newPhase: Phase) => {
    setPhase(newPhase);
    setCurrentStep(0);
    markInteractionComplete(id);
  }, [id, markInteractionComplete]);

  const runFullAnimation = useCallback(() => {
    setIsAnimating(true);
    const phases: Phase[] = ['forward', 'loss', 'backward', 'update'];
    let i = 0;

    const nextPhase = () => {
      if (i < phases.length) {
        runPhase(phases[i]);
        i++;
        animationRef.current = window.setTimeout(nextPhase, 2000) as unknown as number;
      } else {
        setIsAnimating(false);
        setPhase('idle');
      }
    };

    nextPhase();
  }, [runPhase]);

  // Apply weight update
  const applyUpdate = useCallback(() => {
    const lr = 0.1;
    setWeights(prev => ({
      w1: prev.w1 - lr * backwardPass.dL_dW1,
      w2: prev.w2 - lr * backwardPass.dL_dW2,
      w3: prev.w3 - lr * backwardPass.dL_dW3,
      w4: prev.w4 - lr * backwardPass.dL_dW4,
      w5: prev.w5 - lr * backwardPass.dL_dW5,
      w6: prev.w6 - lr * backwardPass.dL_dW6,
    }));
    setPhase('idle');
    markInteractionComplete(id);
  }, [backwardPass, id, markInteractionComplete]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Draw visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Gradient definitions
    const defs = svg.append('defs');

    // Forward flow gradient (green)
    const forwardGrad = defs.append('linearGradient')
      .attr('id', 'forwardGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    forwardGrad.append('stop').attr('offset', '0%').attr('stop-color', 'var(--success)');
    forwardGrad.append('stop').attr('offset', '100%').attr('stop-color', 'var(--viz-highlight)');

    // Backward flow gradient (red)
    const backwardGrad = defs.append('linearGradient')
      .attr('id', 'backwardGrad')
      .attr('x1', '100%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '0%');
    backwardGrad.append('stop').attr('offset', '0%').attr('stop-color', 'var(--error)');
    backwardGrad.append('stop').attr('offset', '100%').attr('stop-color', 'var(--warning)');

    // Arrow markers
    defs.append('marker')
      .attr('id', 'arrowForward')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'var(--success)');

    defs.append('marker')
      .attr('id', 'arrowBackward')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', -15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', 'var(--error)');

    const mainGroup = svg.append('g');

    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)!;
      const targetNode = nodes.find(n => n.id === edge.target)!;
      const sourcePos = getNodePos(sourceNode);
      const targetPos = getNodePos(targetNode);

      // Edge line
      const edgeGroup = mainGroup.append('g').attr('class', `edge-${edge.source}-${edge.target}`);

      edgeGroup.append('line')
        .attr('x1', sourcePos.x + 25)
        .attr('y1', sourcePos.y)
        .attr('x2', targetPos.x - 25)
        .attr('y2', targetPos.y)
        .attr('stroke', phase === 'backward' ? 'url(#backwardGrad)' :
                        phase === 'forward' ? 'url(#forwardGrad)' : 'var(--viz-grid)')
        .attr('stroke-width', Math.abs(edge.weight) * 4 + 1)
        .attr('opacity', phase === 'idle' ? 0.3 : 0.8)
        .attr('marker-end', phase === 'forward' ? 'url(#arrowForward)' : undefined)
        .attr('marker-start', phase === 'backward' ? 'url(#arrowBackward)' : undefined);

      // Weight label
      const midX = (sourcePos.x + targetPos.x) / 2;
      const midY = (sourcePos.y + targetPos.y) / 2;

      edgeGroup.append('rect')
        .attr('x', midX - 20)
        .attr('y', midY - 10)
        .attr('width', 40)
        .attr('height', 20)
        .attr('fill', 'var(--surface)')
        .attr('rx', 4);

      edgeGroup.append('text')
        .attr('x', midX)
        .attr('y', midY + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', phase === 'backward' ? 'var(--error)' : 'var(--foreground)')
        .text(phase === 'backward' ? `∇${edge.gradient.toFixed(2)}` : `w=${edge.weight.toFixed(2)}`);
    });

    // Draw nodes
    nodes.forEach(node => {
      const pos = getNodePos(node);
      const nodeGroup = mainGroup.append('g')
        .attr('class', `node-${node.id}`)
        .attr('transform', `translate(${pos.x}, ${pos.y})`);

      // Determine node color based on phase
      let nodeColor = 'var(--surface-elevated)';
      let strokeColor = 'var(--viz-grid)';

      if (phase === 'forward' && node.layer <= 2) {
        nodeColor = 'var(--success)';
        strokeColor = 'var(--success)';
      } else if (phase === 'backward' && node.layer >= 1 && node.layer <= 2) {
        nodeColor = 'var(--error)';
        strokeColor = 'var(--error)';
      } else if (phase === 'loss' && node.layer >= 2) {
        nodeColor = 'var(--warning)';
        strokeColor = 'var(--warning)';
      }

      // Node circle
      nodeGroup.append('circle')
        .attr('r', 25)
        .attr('fill', nodeColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', 2)
        .attr('opacity', 0.9);

      // Node value
      nodeGroup.append('text')
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', phase !== 'idle' ? 'white' : 'var(--foreground)')
        .text(node.value.toFixed(2));

      // Node label (below)
      nodeGroup.append('text')
        .attr('y', 45)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', 'var(--foreground)')
        .text(blameMode ? node.role : node.label);

      // Gradient value (during backward)
      if (phase === 'backward' && node.gradient !== 0) {
        nodeGroup.append('text')
          .attr('y', -35)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', 'var(--error)')
          .attr('font-weight', 'bold')
          .text(blameMode ? `Blame: ${(Math.abs(node.gradient) * 100).toFixed(0)}%` : `∇: ${node.gradient.toFixed(3)}`);
      }
    });

    // Loss indicator
    if (phase === 'loss' || phase === 'backward') {
      const lossGroup = mainGroup.append('g')
        .attr('transform', `translate(${500}, ${height / 2 - 60})`);

      lossGroup.append('rect')
        .attr('x', -50)
        .attr('y', -25)
        .attr('width', 100)
        .attr('height', 50)
        .attr('fill', 'var(--error)')
        .attr('opacity', 0.2)
        .attr('rx', 8);

      lossGroup.append('text')
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', 'var(--error)')
        .text(blameMode ? 'CEO ANGRY!' : 'Loss');

      lossGroup.append('text')
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', 'var(--error)')
        .text(forwardPass.loss.toFixed(4));
    }

    // Layer labels
    const layerLabels = blameMode
      ? ['Suppliers', 'Workers', 'Manager', 'CEO Goal']
      : ['Input Layer', 'Hidden Layer', 'Output Layer', 'Target'];

    [80, 250, 420, 580].forEach((x, i) => {
      mainGroup.append('text')
        .attr('x', x)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'var(--foreground)')
        .attr('opacity', 0.6)
        .text(layerLabels[i]);
    });

  }, [nodes, edges, phase, getNodePos, forwardPass, blameMode, height]);

  const info = phaseInfo[phase];

  return (
    <div className={`backprop-flow ${className}`}>
      {/* Phase Info Panel */}
      <div className={`mb-4 p-4 rounded-xl ${
        phase === 'forward' ? 'bg-[var(--success)]/20 border border-[var(--success)]/30' :
        phase === 'backward' ? 'bg-[var(--error)]/20 border border-[var(--error)]/30' :
        phase === 'loss' ? 'bg-[var(--warning)]/20 border border-[var(--warning)]/30' :
        phase === 'update' ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/30' :
        'bg-[var(--surface-elevated)]'
      }`}>
        <h4 className={`font-bold ${
          phase === 'forward' ? 'text-[var(--success)]' :
          phase === 'backward' ? 'text-[var(--error)]' :
          phase === 'loss' ? 'text-[var(--warning)]' :
          phase === 'update' ? 'text-[var(--primary)]' :
          'text-[var(--foreground)]'
        }`}>
          {info.title}
        </h4>
        <p className="text-sm text-[var(--foreground)]/80 mt-1">
          {blameMode ? info.blameDesc : info.description}
        </p>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)] rounded-xl"
      />

      {/* Controls */}
      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between bg-[var(--surface-elevated)] rounded-xl p-4">
            <span className="text-sm font-medium text-[var(--foreground)]/70">View Mode:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setBlameMode(true)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  blameMode
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)]'
                }`}
              >
                🏢 Corporate Blame
              </button>
              <button
                onClick={() => setBlameMode(false)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !blameMode
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)]'
                }`}
              >
                📐 Mathematical
              </button>
            </div>
          </div>

          {/* Step-by-Step Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Step through the learning process:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => runPhase('forward')}
                disabled={isAnimating}
                className="px-4 py-2 bg-[var(--success)] hover:bg-[var(--success)]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                1. Forward →
              </button>
              <button
                onClick={() => runPhase('loss')}
                disabled={isAnimating}
                className="px-4 py-2 bg-[var(--warning)] hover:bg-[var(--warning)]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                2. Calculate Loss
              </button>
              <button
                onClick={() => runPhase('backward')}
                disabled={isAnimating}
                className="px-4 py-2 bg-[var(--error)] hover:bg-[var(--error)]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                3. ← Backward
              </button>
              <button
                onClick={applyUpdate}
                disabled={isAnimating || phase !== 'backward'}
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                4. Update Weights
              </button>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={runFullAnimation}
                disabled={isAnimating}
                className="flex-1 py-2 px-4 bg-[var(--viz-highlight)] hover:bg-[var(--viz-highlight)]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ▶ Auto-Run Full Cycle
              </button>
              <button
                onClick={() => {
                  setPhase('idle');
                  setIsAnimating(false);
                  if (animationRef.current) clearTimeout(animationRef.current);
                }}
                className="py-2 px-4 bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)] rounded-lg text-sm font-medium transition-colors"
              >
                Reset View
              </button>
            </div>
          </div>

          {/* Math Details (collapsible) */}
          <details className="bg-[var(--surface-elevated)] rounded-xl">
            <summary className="p-4 cursor-pointer font-medium text-[var(--primary)] hover:bg-[var(--viz-grid)]/30 rounded-xl">
              📊 Show Gradient Calculations
            </summary>
            <div className="px-4 pb-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-bold text-[var(--foreground)]/70 mb-2">Forward Values:</p>
                  <div className="font-mono text-xs space-y-1 bg-[var(--surface)] p-2 rounded">
                    <p>h₁ = ReLU({inputs[0]} × {weights.w1.toFixed(2)} + {inputs[1]} × {weights.w3.toFixed(2)}) = {forwardPass.h1.toFixed(3)}</p>
                    <p>h₂ = ReLU({inputs[0]} × {weights.w2.toFixed(2)} + {inputs[1]} × {weights.w4.toFixed(2)}) = {forwardPass.h2.toFixed(3)}</p>
                    <p>ŷ = {forwardPass.h1.toFixed(2)} × {weights.w5.toFixed(2)} + {forwardPass.h2.toFixed(2)} × {weights.w6.toFixed(2)} = {forwardPass.output.toFixed(3)}</p>
                    <p>Loss = ½(ŷ - y)² = {forwardPass.loss.toFixed(4)}</p>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)]/70 mb-2">Gradients (Chain Rule):</p>
                  <div className="font-mono text-xs space-y-1 bg-[var(--surface)] p-2 rounded">
                    <p>∂L/∂ŷ = ŷ - y = {backwardPass.dL_dOut.toFixed(3)}</p>
                    <p>∂L/∂w₅ = ∂L/∂ŷ × h₁ = {backwardPass.dL_dW5.toFixed(3)}</p>
                    <p>∂L/∂w₆ = ∂L/∂ŷ × h₂ = {backwardPass.dL_dW6.toFixed(3)}</p>
                    <p>∂L/∂h₁ = ∂L/∂ŷ × w₅ = {backwardPass.dL_dH1.toFixed(3)}</p>
                    <p>∂L/∂w₁ = ∂L/∂h₁ × x₁ = {backwardPass.dL_dW1.toFixed(3)}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--foreground)]/50 mt-2">
                Notice how gradients flow backward through the chain rule: ∂L/∂w = ∂L/∂out × ∂out/∂hidden × ∂hidden/∂w
              </p>
            </div>
          </details>

          {/* Current Loss Display */}
          <div className="flex items-center justify-between bg-[var(--surface-elevated)] rounded-xl p-4">
            <div>
              <span className="text-sm text-[var(--foreground)]/70">Current Loss: </span>
              <span className={`font-mono font-bold ${
                forwardPass.loss < 0.01 ? 'text-[var(--success)]' :
                forwardPass.loss < 0.1 ? 'text-[var(--warning)]' :
                'text-[var(--error)]'
              }`}>
                {forwardPass.loss.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-sm text-[var(--foreground)]/70">Output: </span>
              <span className="font-mono">{forwardPass.output.toFixed(3)}</span>
              <span className="text-sm text-[var(--foreground)]/50"> (target: {target})</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[var(--success)]"></span>
              <span className="text-[var(--foreground)]/70">Forward flow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[var(--error)]"></span>
              <span className="text-[var(--foreground)]/70">Backward flow (gradients)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[var(--warning)]"></span>
              <span className="text-[var(--foreground)]/70">Loss calculation</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
