'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { courseStructure } from '@/lib/mdx';
import { useProgressStore } from '@/lib/stores/progressStore';

const STORAGE_KEY = 'nav-expanded-parts';

interface NavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Navigation({ isOpen = true, onClose }: NavigationProps) {
  const pathname = usePathname();
  const [expandedParts, setExpandedParts] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { completedSections, lastVisited } = useProgressStore();

  // Load expanded state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setExpandedParts(JSON.parse(stored));
      } else {
        // Default: expand part 1 and current part
        const currentPart = parseInt(pathname?.match(/part-(\d+)/)?.[1] || '1');
        setExpandedParts([1, currentPart].filter((v, i, a) => a.indexOf(v) === i));
      }
    } catch {
      setExpandedParts([1]);
    }
    setIsInitialized(true);
  }, []);

  // Auto-expand the current part when navigating
  useEffect(() => {
    if (!isInitialized) return;
    const currentPart = parseInt(pathname?.match(/part-(\d+)/)?.[1] || '0');
    if (currentPart && !expandedParts.includes(currentPart)) {
      setExpandedParts(prev => {
        const updated = [...prev, currentPart];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [pathname, isInitialized]);

  // Save to localStorage whenever expandedParts changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedParts));
    }
  }, [expandedParts, isInitialized]);

  const togglePart = (partId: number) => {
    setExpandedParts((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId]
    );
  };

  const expandAll = useCallback(() => {
    setExpandedParts(courseStructure.map(p => p.id));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedParts([]);
  }, []);

  const allExpanded = expandedParts.length === courseStructure.length;

  const isChapterComplete = (chapterSlug: string) => {
    return completedSections.some((s) => s.startsWith(chapterSlug));
  };

  const isCurrentChapter = (partId: number, chapterSlug: string) => {
    return pathname === `/course/part-${partId}/${chapterSlug}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-full w-[280px] bg-[var(--surface)] border-r border-[var(--viz-grid)] z-50 overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--viz-grid)] p-4">
            <Link href="/" className="block">
              <h1 className="text-lg font-bold text-[var(--foreground)]">
                Intuitive Maths of AI
              </h1>
              <p className="text-xs text-[var(--foreground)]/60 mt-1">
                Interactive Course
              </p>
            </Link>

            {/* Mobile close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-[var(--surface-elevated)] rounded-lg lg:hidden"
                aria-label="Close navigation"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Continue where you left off */}
          {lastVisited && (
            <div className="p-4 border-b border-[var(--viz-grid)]">
              <Link
                href={lastVisited}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 rounded-lg text-sm text-[var(--primary)] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Continue Learning
              </Link>
            </div>
          )}

          {/* Course structure */}
          <div className="p-4 space-y-2">
            {/* Expand/Collapse All */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--viz-grid)] mb-2">
              <span className="text-xs text-[var(--foreground)]/50 font-medium uppercase tracking-wide">
                Chapters
              </span>
              <button
                onClick={allExpanded ? collapseAll : expandAll}
                className="text-xs text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors flex items-center gap-1"
              >
                {allExpanded ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    Collapse All
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Expand All
                  </>
                )}
              </button>
            </div>

            {courseStructure.map((part) => (
              <div key={part.id} className="space-y-1">
                {/* Part header */}
                <button
                  onClick={() => togglePart(part.id)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--surface-elevated)] rounded-lg transition-colors text-left"
                >
                  <div>
                    <span className="text-xs text-[var(--primary)] font-medium">
                      Part {part.id}
                    </span>
                    <h3 className="text-sm font-medium text-[var(--foreground)]">
                      {part.title}
                    </h3>
                  </div>
                  <motion.svg
                    animate={{ rotate: expandedParts.includes(part.id) ? 180 : 0 }}
                    className="w-4 h-4 text-[var(--foreground)]/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </button>

                {/* Chapters */}
                <AnimatePresence>
                  {expandedParts.includes(part.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 space-y-1">
                        {part.chapters.map((chapter) => {
                          const isCurrent = isCurrentChapter(part.id, chapter.slug);
                          const isComplete = isChapterComplete(chapter.slug);

                          return (
                            <Link
                              key={chapter.slug}
                              href={`/course/part-${part.id}/${chapter.slug}`}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isCurrent
                                  ? 'bg-[var(--primary)] text-white'
                                  : 'hover:bg-[var(--surface-elevated)] text-[var(--foreground)]/80'
                              }`}
                            >
                              {/* Status indicator */}
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                                  isComplete
                                    ? 'bg-green-500 text-white'
                                    : isCurrent
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[var(--surface-elevated)] text-[var(--foreground)]/50'
                                }`}
                              >
                                {isComplete ? '✓' : chapter.chapter}
                              </span>
                              <span className="line-clamp-1">{chapter.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
