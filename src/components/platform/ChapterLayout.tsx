'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { useProgressStore } from '@/lib/stores/progressStore';
import type { ChapterMeta } from '@/lib/mdx';

interface ChapterLayoutProps {
  children: ReactNode;
  meta: ChapterMeta;
  prevChapter?: { slug: string; title: string; partSlug: string } | null;
  nextChapter?: { slug: string; title: string; partSlug: string } | null;
}

export function ChapterLayout({
  children,
  meta,
  prevChapter,
  nextChapter,
}: ChapterLayoutProps) {
  const [navOpen, setNavOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { setLastVisited, addTimeSpent } = useProgressStore();

  // Track time spent on chapter
  useEffect(() => {
    const chapterId = `part-${meta.part}/${meta.slug}`;
    setLastVisited(`/course/${chapterId}`);

    const startTime = Date.now();

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent > 5) {
        // Only track if spent more than 5 seconds
        addTimeSpent(chapterId, timeSpent);
      }
    };
  }, [meta.part, meta.slug, setLastVisited, addTimeSpent]);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setNavOpen(false);
      } else {
        setNavOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation sidebar */}
      <Navigation isOpen={navOpen} onClose={() => setNavOpen(false)} />

      {/* Mobile nav toggle */}
      {!navOpen && (
        <button
          onClick={() => setNavOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--viz-grid)] lg:hidden"
          aria-label="Open navigation"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Overlay for mobile */}
      {navOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Main content */}
      <main
        className={`transition-all duration-300 ${
          navOpen && !isMobile ? 'lg:ml-[280px]' : ''
        }`}
      >
        {/* Chapter header */}
        <header className="border-b border-[var(--viz-grid)] bg-[var(--surface)]">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 mb-4">
              <Link href="/" className="hover:text-[var(--primary)]">
                Home
              </Link>
              <span>/</span>
              <span>Part {meta.part}: {meta.partTitle}</span>
              <span>/</span>
              <span className="text-[var(--foreground)]">Chapter {meta.chapter}</span>
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-3"
            >
              {meta.title}
            </motion.h1>

            {/* Teaching goal */}
            {meta.teachingGoal && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-[var(--primary)] font-medium"
              >
                {meta.teachingGoal}
              </motion.p>
            )}

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[var(--foreground)]/70 mt-2"
            >
              {meta.description}
            </motion.p>
          </div>
        </header>

        {/* Content */}
        <article className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            {children}
          </motion.div>
        </article>

        {/* Chapter navigation */}
        <nav className="border-t border-[var(--viz-grid)] bg-[var(--surface)]">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center">
              {/* Previous */}
              <div className="flex-1">
                {prevChapter && (
                  <Link
                    href={`/course/${prevChapter.partSlug}/${prevChapter.slug}`}
                    className="group flex items-center gap-3 text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
                  >
                    <svg
                      className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <div className="text-left">
                      <span className="text-xs text-[var(--foreground)]/50 block">
                        Previous
                      </span>
                      <span className="text-sm font-medium line-clamp-1">
                        {prevChapter.title}
                      </span>
                    </div>
                  </Link>
                )}
              </div>

              {/* Next */}
              <div className="flex-1 flex justify-end">
                {nextChapter && (
                  <Link
                    href={`/course/${nextChapter.partSlug}/${nextChapter.slug}`}
                    className="group flex items-center gap-3 text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
                  >
                    <div className="text-right">
                      <span className="text-xs text-[var(--foreground)]/50 block">
                        Next
                      </span>
                      <span className="text-sm font-medium line-clamp-1">
                        {nextChapter.title}
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </main>
    </div>
  );
}
