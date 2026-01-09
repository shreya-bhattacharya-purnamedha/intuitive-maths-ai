'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { useProgressStore } from '@/lib/stores/progressStore';

interface BayesUpdaterProps {
  id?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface Scenario {
  name: string;
  description: string;
  prior: number;
  priorLabel: string;
  sensitivity: number; // P(positive | disease)
  specificity: number; // P(negative | no disease)
  evidenceLabel: string;
  hypothesisLabel: string;
  insight: string;
}

const scenarios: Record<string, Scenario> = {
  medical: {
    name: 'Medical Test',
    description: 'You test positive for a rare disease. Should you panic?',
    prior: 0.01, // 1% have the disease
    priorLabel: 'Disease prevalence',
    sensitivity: 0.95, // 95% true positive rate
    specificity: 0.90, // 90% true negative rate (10% false positive)
    evidenceLabel: 'Test result: Positive',
    hypothesisLabel: 'Has disease',
    insight: 'Even with a "95% accurate" test, a positive result for a rare disease often means you\'re probably fine! This is the base rate fallacy.',
  },
  spam: {
    name: 'Spam Filter',
    description: 'An email contains the word "FREE". Is it spam?',
    prior: 0.20, // 20% of emails are spam
    priorLabel: 'Spam rate',
    sensitivity: 0.80, // 80% of spam contains "FREE"
    specificity: 0.95, // 95% of legit emails don\'t have "FREE"
    evidenceLabel: 'Contains "FREE"',
    hypothesisLabel: 'Is spam',
    insight: 'Spam filters combine evidence from many words. Each word is a Bayesian update!',
  },
  rain: {
    name: 'Weather Forecast',
    description: 'Dark clouds appear. Will it rain?',
    prior: 0.30, // 30% base chance of rain today
    priorLabel: 'Base rain chance',
    sensitivity: 0.85, // 85% of rainy days have dark clouds
    specificity: 0.70, // 70% of dry days have clear skies
    evidenceLabel: 'Dark clouds observed',
    hypothesisLabel: 'Will rain',
    insight: 'Weather apps update predictions continuously as new evidence (satellite data, pressure changes) comes in.',
  },
  guilty: {
    name: 'Court Trial',
    description: 'Fingerprints match at the scene. Guilty?',
    prior: 0.001, // 1 in 1000 prior (random person being guilty)
    priorLabel: 'Prior probability of guilt',
    sensitivity: 0.99, // Fingerprint match if guilty
    specificity: 0.9999, // Very rare false match
    evidenceLabel: 'Fingerprints match',
    hypothesisLabel: 'Is guilty',
    insight: 'Even "one in a million" evidence doesn\'t mean guilt! In a city of millions, multiple people might match.',
  },
};

export function BayesUpdater({
  id = 'bayes-updater',
  interactive = true,
  width = 650,
  height = 350,
  className = '',
}: BayesUpdaterProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentScenario, setCurrentScenario] = useState<keyof typeof scenarios>('medical');
  const [customPrior, setCustomPrior] = useState<number | null>(null);
  const [customSensitivity, setCustomSensitivity] = useState<number | null>(null);
  const [customSpecificity, setCustomSpecificity] = useState<number | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'prior' | 'evidence' | 'posterior'>('posterior');

  const { markInteractionComplete } = useProgressStore();

  const scenario = scenarios[currentScenario];

  // Use custom values or scenario defaults
  const prior = customPrior ?? scenario.prior;
  const sensitivity = customSensitivity ?? scenario.sensitivity;
  const specificity = customSpecificity ?? scenario.specificity;

  // Bayes calculation
  const bayesCalc = useMemo(() => {
    // P(H) = prior
    // P(E|H) = sensitivity (true positive rate)
    // P(E|¬H) = 1 - specificity (false positive rate)
    // P(¬H) = 1 - prior

    const pE_given_H = sensitivity;
    const pE_given_notH = 1 - specificity;
    const pNotH = 1 - prior;

    // P(E) = P(E|H)P(H) + P(E|¬H)P(¬H)
    const pE = pE_given_H * prior + pE_given_notH * pNotH;

    // P(H|E) = P(E|H)P(H) / P(E)
    const posterior = (pE_given_H * prior) / pE;

    // Likelihood ratio
    const likelihoodRatio = pE_given_H / pE_given_notH;

    return {
      prior,
      pE_given_H,
      pE_given_notH,
      pE,
      posterior,
      likelihoodRatio,
      updateFactor: posterior / prior,
    };
  }, [prior, sensitivity, specificity]);

  // Reset custom values when scenario changes
  useEffect(() => {
    setCustomPrior(null);
    setCustomSensitivity(null);
    setCustomSpecificity(null);
  }, [currentScenario]);

  // Draw visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 60, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    // Bar chart comparing prior and posterior
    const barWidth = 80;
    const barSpacing = 120;
    const maxBarHeight = innerHeight - 40;

    const bars = [
      { label: 'Prior', value: bayesCalc.prior, color: 'var(--viz-vector-secondary)' },
      { label: 'Posterior', value: bayesCalc.posterior, color: 'var(--primary)' },
    ];

    // Only show relevant bars based on animation phase
    const visibleBars = animationPhase === 'prior'
      ? bars.slice(0, 1)
      : bars;

    const xOffset = (innerWidth - (visibleBars.length * barWidth + (visibleBars.length - 1) * barSpacing)) / 2;

    visibleBars.forEach((bar, i) => {
      const barHeight = bar.value * maxBarHeight;
      const x = xOffset + i * (barWidth + barSpacing);
      const y = innerHeight - barHeight;

      // Bar
      mainGroup.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', barWidth)
        .attr('height', barHeight)
        .attr('fill', bar.color)
        .attr('rx', 4)
        .attr('opacity', 0.8);

      // Value label
      mainGroup.append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', y - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .text(`${(bar.value * 100).toFixed(1)}%`);

      // Bar label
      mainGroup.append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', innerHeight + 25)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '13px')
        .text(bar.label);
    });

    // Arrow showing update
    if (animationPhase === 'posterior' && visibleBars.length === 2) {
      const arrowY = innerHeight / 2;
      const arrowStartX = xOffset + barWidth + 20;
      const arrowEndX = xOffset + barWidth + barSpacing - 20;

      // Arrow line
      mainGroup.append('line')
        .attr('x1', arrowStartX)
        .attr('y1', arrowY)
        .attr('x2', arrowEndX - 10)
        .attr('y2', arrowY)
        .attr('stroke', 'var(--foreground)')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)');

      // Arrowhead marker
      svg.append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', 'var(--foreground)');

      // Update factor label
      const updateText = bayesCalc.updateFactor > 1
        ? `×${bayesCalc.updateFactor.toFixed(1)}`
        : `×${bayesCalc.updateFactor.toFixed(2)}`;

      mainGroup.append('text')
        .attr('x', (arrowStartX + arrowEndX) / 2)
        .attr('y', arrowY - 15)
        .attr('text-anchor', 'middle')
        .attr('fill', bayesCalc.updateFactor > 1 ? 'var(--success)' : 'var(--error)')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(updateText);

      mainGroup.append('text')
        .attr('x', (arrowStartX + arrowEndX) / 2)
        .attr('y', arrowY + 20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '11px')
        .attr('opacity', 0.7)
        .text('Evidence');
    }

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(`P(${scenario.hypothesisLabel} | ${scenario.evidenceLabel})`);

  }, [bayesCalc, animationPhase, width, height, scenario]);

  const handleScenarioChange = useCallback((key: string) => {
    setCurrentScenario(key as keyof typeof scenarios);
    setAnimationPhase('posterior');
    markInteractionComplete(id);
  }, [id, markInteractionComplete]);

  const resetToDefaults = useCallback(() => {
    setCustomPrior(null);
    setCustomSensitivity(null);
    setCustomSpecificity(null);
  }, []);

  return (
    <div className={`bayes-updater ${className}`}>
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
          {/* Scenario Selector */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="text-sm font-medium text-[var(--foreground)]/70 mb-3">
              Choose a scenario:
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(scenarios).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => handleScenarioChange(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentScenario === key
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)]'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--foreground)]/50 mt-2">
              {scenario.description}
            </p>
          </div>

          {/* Parameters */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]/70">
                Adjust parameters:
              </div>
              {(customPrior !== null || customSensitivity !== null || customSpecificity !== null) && (
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--foreground)]/60">
                    {scenario.priorLabel}
                  </label>
                  <span className="font-mono text-xs text-[var(--viz-vector-secondary)]">
                    {(prior * 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.5"
                  step="0.001"
                  value={prior}
                  onChange={(e) => {
                    setCustomPrior(parseFloat(e.target.value));
                    markInteractionComplete(id);
                  }}
                  className="viz-slider"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--foreground)]/60">
                    Sensitivity (TPR)
                  </label>
                  <span className="font-mono text-xs text-[var(--success)]">
                    {(sensitivity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={sensitivity}
                  onChange={(e) => {
                    setCustomSensitivity(parseFloat(e.target.value));
                    markInteractionComplete(id);
                  }}
                  className="viz-slider"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--foreground)]/60">
                    Specificity (TNR)
                  </label>
                  <span className="font-mono text-xs text-[var(--primary)]">
                    {(specificity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.9999"
                  step="0.01"
                  value={specificity}
                  onChange={(e) => {
                    setCustomSpecificity(parseFloat(e.target.value));
                    markInteractionComplete(id);
                  }}
                  className="viz-slider"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--viz-vector-secondary)]/20 rounded-lg p-3">
                <div className="text-xs text-[var(--foreground)]/60 mb-1">Before Evidence (Prior)</div>
                <div className="text-2xl font-bold text-[var(--viz-vector-secondary)]">
                  {(bayesCalc.prior * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-[var(--foreground)]/50 mt-1">
                  P({scenario.hypothesisLabel})
                </div>
              </div>
              <div className="bg-[var(--primary)]/20 rounded-lg p-3">
                <div className="text-xs text-[var(--foreground)]/60 mb-1">After Evidence (Posterior)</div>
                <div className="text-2xl font-bold text-[var(--primary)]">
                  {(bayesCalc.posterior * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-[var(--foreground)]/50 mt-1">
                  P({scenario.hypothesisLabel} | {scenario.evidenceLabel})
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--viz-grid)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--foreground)]/70">Belief update:</span>
                <span className={`font-bold ${
                  bayesCalc.updateFactor > 1 ? 'text-[var(--success)]' : 'text-[var(--error)]'
                }`}>
                  {bayesCalc.updateFactor > 1 ? '↑' : '↓'} {bayesCalc.updateFactor.toFixed(1)}×
                  {bayesCalc.updateFactor > 1 ? ' more likely' : ' less likely'}
                </span>
              </div>
            </div>
          </div>

          {/* Show Calculation Toggle */}
          <details className="bg-[var(--surface-elevated)] rounded-xl">
            <summary className="p-4 cursor-pointer font-medium text-[var(--primary)] hover:bg-[var(--viz-grid)]/30 rounded-xl">
              📊 Show Bayes&apos; Theorem Calculation
            </summary>
            <div className="px-4 pb-4 space-y-3">
              <div className="bg-[var(--surface)] p-4 rounded-lg font-mono text-sm">
                <p className="text-[var(--foreground)]/70 mb-2">Bayes&apos; Theorem:</p>
                <p className="text-center text-lg mb-4">
                  P(H|E) = <span className="text-[var(--success)]">P(E|H)</span> × <span className="text-[var(--viz-vector-secondary)]">P(H)</span> / P(E)
                </p>

                <div className="space-y-2 text-xs">
                  <p><span className="text-[var(--viz-vector-secondary)]">P(H)</span> = {bayesCalc.prior.toFixed(4)} <span className="text-[var(--foreground)]/50">(prior)</span></p>
                  <p><span className="text-[var(--success)]">P(E|H)</span> = {bayesCalc.pE_given_H.toFixed(4)} <span className="text-[var(--foreground)]/50">(sensitivity)</span></p>
                  <p><span className="text-[var(--error)]">P(E|¬H)</span> = {bayesCalc.pE_given_notH.toFixed(4)} <span className="text-[var(--foreground)]/50">(false positive rate)</span></p>
                  <p className="pt-2 border-t border-[var(--viz-grid)]">
                    P(E) = P(E|H)×P(H) + P(E|¬H)×P(¬H) = {bayesCalc.pE.toFixed(4)}
                  </p>
                  <p className="pt-2 border-t border-[var(--viz-grid)] text-[var(--primary)] font-bold">
                    P(H|E) = {bayesCalc.pE_given_H.toFixed(4)} × {bayesCalc.prior.toFixed(4)} / {bayesCalc.pE.toFixed(4)} = {bayesCalc.posterior.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </details>

          {/* Insight */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)]/80">
              <strong className="text-[var(--primary)]">Insight:</strong> {scenario.insight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
