'use client';

import { useWorldTreeStore } from '@/lib/stores/worldTreeStore';

export function PricingSection() {
  const { pricingModalities } = useWorldTreeStore();

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Learning Path</h2>
          <p className="text-lg text-[var(--foreground)]/60 max-w-2xl mx-auto">
            Flexible pricing options to match your learning goals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pricingModalities.map((pricing) => (
            <div
              key={pricing.id}
              className={`relative rounded-2xl p-6 ${
                pricing.highlighted
                  ? 'bg-gradient-to-b from-[var(--primary)]/20 to-[var(--surface-elevated)] border-2 border-[var(--primary)]'
                  : 'bg-[var(--surface-elevated)] border border-[var(--viz-grid)]'
              }`}
            >
              {pricing.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--primary)] text-white text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{pricing.name}</h3>
                <p className="text-sm text-[var(--foreground)]/60 mb-4">
                  {pricing.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">${pricing.price}</span>
                  {pricing.period && pricing.period !== 'one-time' && (
                    <span className="text-[var(--foreground)]/60">/{pricing.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {pricing.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-[var(--foreground)]/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  pricing.highlighted
                    ? 'bg-[var(--primary)] text-white hover:opacity-90'
                    : 'bg-[var(--surface)] border border-[var(--viz-grid)] hover:bg-[var(--viz-grid)]'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
