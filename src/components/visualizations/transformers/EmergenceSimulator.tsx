'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface EmergenceSimulatorProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  carrying: boolean;
}

interface Particle {
  x: number;
  y: number;
  clustered: boolean;
}

export function EmergenceSimulator({
  id = 'emergence-simulator',
  interactive = true,
  width = 700,
  height = 450,
  className = '',
}: EmergenceSimulatorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [agentCount, setAgentCount] = useState(15);
  const [speed, setSpeed] = useState(1);
  const [step, setStep] = useState(0);
  const agentsRef = useRef<Agent[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const { markInteractionComplete } = useProgressStore();

  // Initialize simulation
  const initSimulation = useCallback(() => {
    const padding = 50;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    // Create agents (termites)
    agentsRef.current = Array.from({ length: agentCount }, () => ({
      x: padding + Math.random() * innerWidth,
      y: padding + Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      carrying: false,
    }));

    // Create particles (wood chips) - scattered randomly
    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: padding + Math.random() * innerWidth,
      y: padding + Math.random() * innerHeight,
      clustered: false,
    }));

    setStep(0);
  }, [agentCount, width, height]);

  // Initialize on mount
  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  // Simulation step
  const simulationStep = useCallback(() => {
    const padding = 50;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    const pickupRadius = 15;
    const dropRadius = 20;

    agentsRef.current.forEach(agent => {
      // Random walk with momentum
      agent.vx += (Math.random() - 0.5) * 0.5;
      agent.vy += (Math.random() - 0.5) * 0.5;

      // Limit speed
      const speed = Math.sqrt(agent.vx ** 2 + agent.vy ** 2);
      if (speed > 2) {
        agent.vx = (agent.vx / speed) * 2;
        agent.vy = (agent.vy / speed) * 2;
      }

      agent.x += agent.vx;
      agent.y += agent.vy;

      // Bounce off walls
      if (agent.x < padding || agent.x > width - padding) {
        agent.vx *= -1;
        agent.x = Math.max(padding, Math.min(width - padding, agent.x));
      }
      if (agent.y < padding || agent.y > height - padding) {
        agent.vy *= -1;
        agent.y = Math.max(padding, Math.min(height - padding, agent.y));
      }

      // Simple termite rules:
      // 1. If not carrying and find isolated particle, pick it up
      // 2. If carrying and find cluster, drop it

      if (!agent.carrying) {
        // Look for isolated particle to pick up
        for (const particle of particlesRef.current) {
          const dist = Math.sqrt((agent.x - particle.x) ** 2 + (agent.y - particle.y) ** 2);
          if (dist < pickupRadius) {
            // Count nearby particles
            const nearbyCount = particlesRef.current.filter(p =>
              p !== particle &&
              Math.sqrt((p.x - particle.x) ** 2 + (p.y - particle.y) ** 2) < 25
            ).length;

            // Pick up if isolated (few neighbors)
            if (nearbyCount < 2) {
              agent.carrying = true;
              particle.x = -100; // Move off screen
              particle.y = -100;
              break;
            }
          }
        }
      } else {
        // Look for cluster to drop particle
        let maxNearby = 0;
        let dropX = agent.x;
        let dropY = agent.y;

        for (const particle of particlesRef.current) {
          if (particle.x < 0) continue; // Skip picked up particles

          const dist = Math.sqrt((agent.x - particle.x) ** 2 + (agent.y - particle.y) ** 2);
          if (dist < dropRadius) {
            const nearbyCount = particlesRef.current.filter(p =>
              p.x > 0 &&
              Math.sqrt((p.x - particle.x) ** 2 + (p.y - particle.y) ** 2) < 30
            ).length;

            if (nearbyCount > maxNearby) {
              maxNearby = nearbyCount;
              dropX = particle.x + (Math.random() - 0.5) * 15;
              dropY = particle.y + (Math.random() - 0.5) * 15;
            }
          }
        }

        // Drop if found cluster
        if (maxNearby >= 2) {
          agent.carrying = false;
          // Find a particle that was picked up and place it
          const pickedUp = particlesRef.current.find(p => p.x < 0);
          if (pickedUp) {
            pickedUp.x = Math.max(padding, Math.min(width - padding, dropX));
            pickedUp.y = Math.max(padding, Math.min(height - padding, dropY));
          }
        }
      }
    });

    // Update cluster status
    particlesRef.current.forEach(particle => {
      if (particle.x < 0) return;
      const nearbyCount = particlesRef.current.filter(p =>
        p !== particle &&
        p.x > 0 &&
        Math.sqrt((p.x - particle.x) ** 2 + (p.y - particle.y) ** 2) < 25
      ).length;
      particle.clustered = nearbyCount >= 3;
    });

    setStep(s => s + 1);
  }, [width, height]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      for (let i = 0; i < speed; i++) {
        simulationStep();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, speed, simulationStep]);

  // Draw visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = 50;

    // Background
    svg.append('rect')
      .attr('x', padding)
      .attr('y', padding)
      .attr('width', width - padding * 2)
      .attr('height', height - padding * 2)
      .attr('fill', 'var(--surface)')
      .attr('stroke', 'var(--viz-grid)')
      .attr('stroke-width', 1)
      .attr('rx', 8);

    // Draw particles
    particlesRef.current.forEach(particle => {
      if (particle.x < 0) return;

      svg.append('circle')
        .attr('cx', particle.x)
        .attr('cy', particle.y)
        .attr('r', 5)
        .attr('fill', particle.clustered ? '#f59e0b' : '#a3a3a3')
        .attr('opacity', particle.clustered ? 1 : 0.6);
    });

    // Draw agents
    agentsRef.current.forEach(agent => {
      // Agent body
      svg.append('circle')
        .attr('cx', agent.x)
        .attr('cy', agent.y)
        .attr('r', 6)
        .attr('fill', agent.carrying ? '#22c55e' : '#6366f1');

      // Direction indicator
      const angle = Math.atan2(agent.vy, agent.vx);
      svg.append('line')
        .attr('x1', agent.x)
        .attr('y1', agent.y)
        .attr('x2', agent.x + Math.cos(angle) * 10)
        .attr('y2', agent.y + Math.sin(angle) * 10)
        .attr('stroke', agent.carrying ? '#22c55e' : '#6366f1')
        .attr('stroke-width', 2);

      // Carrying indicator
      if (agent.carrying) {
        svg.append('circle')
          .attr('cx', agent.x + Math.cos(angle) * 8)
          .attr('cy', agent.y + Math.sin(angle) * 8)
          .attr('r', 3)
          .attr('fill', '#f59e0b');
      }
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Emergence: Simple Agents, Complex Patterns');

    // Stats
    const clusteredCount = particlesRef.current.filter(p => p.x > 0 && p.clustered).length;
    const totalVisible = particlesRef.current.filter(p => p.x > 0).length;

    svg.append('text')
      .attr('x', padding + 10)
      .attr('y', height - 15)
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '11px')
      .attr('opacity', 0.7)
      .text(`Step: ${step} | Clustered: ${clusteredCount}/${totalVisible}`);

    // Legend
    const legendX = width - padding - 120;
    const legendY = height - 40;

    svg.append('circle').attr('cx', legendX).attr('cy', legendY).attr('r', 5).attr('fill', '#6366f1');
    svg.append('text').attr('x', legendX + 12).attr('y', legendY + 4).attr('fill', 'var(--foreground)').attr('font-size', '10px').text('Agent');

    svg.append('circle').attr('cx', legendX).attr('cy', legendY + 15).attr('r', 5).attr('fill', '#22c55e');
    svg.append('text').attr('x', legendX + 12).attr('y', legendY + 19).attr('fill', 'var(--foreground)').attr('font-size', '10px').text('Carrying');

    svg.append('circle').attr('cx', legendX + 70).attr('cy', legendY).attr('r', 4).attr('fill', '#a3a3a3');
    svg.append('text').attr('x', legendX + 82).attr('y', legendY + 4).attr('fill', 'var(--foreground)').attr('font-size', '10px').text('Particle');

    svg.append('circle').attr('cx', legendX + 70).attr('cy', legendY + 15).attr('r', 4).attr('fill', '#f59e0b');
    svg.append('text').attr('x', legendX + 82).attr('y', legendY + 19).attr('fill', 'var(--foreground)').attr('font-size', '10px').text('Clustered');

  }, [step, width, height]);

  const handleReset = () => {
    setIsRunning(false);
    initSimulation();
  };

  return (
    <div className={`emergence-simulator ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="viz-canvas bg-[var(--surface)]"
      />

      {interactive && (
        <div className="mt-4 space-y-4">
          {/* Simulation Controls */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]">
                Simulation Controls
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsRunning(!isRunning);
                    markInteractionComplete(id);
                  }}
                  className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    isRunning
                      ? 'bg-red-500 text-white'
                      : 'bg-[var(--primary)] text-white'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Start
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm rounded-lg bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)]"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--foreground)]/60 mb-1">
                  Agents: {agentCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={agentCount}
                  onChange={(e) => {
                    setAgentCount(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--foreground)]/60 mb-1">
                  Speed: {speed}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)] mb-2">
              The Simple Rules:
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-[var(--foreground)]/70">
              <div className="flex items-start gap-2">
                <span className="text-[var(--primary)]">1.</span>
                <span>Wander randomly</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--primary)]">2.</span>
                <span>If empty-handed and find lonely particle → pick up</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--primary)]">3.</span>
                <span>If carrying and find cluster → drop nearby</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--primary)]">4.</span>
                <span>No planning, no coordination, no memory</span>
              </div>
            </div>
          </div>

          {/* Insight */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">The Magic:</strong>{' '}
              No agent knows the &quot;plan.&quot; Each follows 3 dumb rules. Yet clusters emerge!
              This is exactly how neural networks work: billions of simple operations,
              following simple rules (gradient descent), producing intelligence.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
