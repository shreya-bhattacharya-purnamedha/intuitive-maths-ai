'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CalloutProps {
  type?: 'insight' | 'warning' | 'info' | 'aha' | 'tip' | 'math';
  title?: string;
  children: ReactNode;
}

const calloutStyles = {
  insight: {
    bg: 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10',
    border: 'border-indigo-500',
    icon: '💡',
    defaultTitle: 'Key Insight',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500',
    icon: '⚠️',
    defaultTitle: 'Watch Out',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500',
    icon: 'ℹ️',
    defaultTitle: 'Note',
  },
  aha: {
    bg: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10',
    border: 'border-green-500',
    icon: '✨',
    defaultTitle: 'The "Aha!" Moment',
  },
  tip: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500',
    icon: '💡',
    defaultTitle: 'Tip',
  },
  math: {
    bg: 'bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10',
    border: 'border-violet-500',
    icon: '📐',
    defaultTitle: 'The Math',
  },
};

export function Callout({ type = 'insight', title, children }: CalloutProps) {
  const style = calloutStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${style.bg} border-l-4 ${style.border} rounded-r-lg p-4 my-6`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0" role="img" aria-label={type}>
          {style.icon}
        </span>
        <div className="flex-1">
          <h4 className="font-semibold text-[var(--foreground)] mb-1">
            {title || style.defaultTitle}
          </h4>
          <div className="text-[var(--foreground)]/80 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
