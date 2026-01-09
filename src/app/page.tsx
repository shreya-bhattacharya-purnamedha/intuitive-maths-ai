'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { courseStructure } from '@/lib/mdx';
import { useProgressStore } from '@/lib/stores/progressStore';

export default function Home() {
  const { completedSections, lastVisited } = useProgressStore();

  const totalChapters = courseStructure.reduce(
    (acc, part) => acc + part.chapters.length,
    0
  );

  const completedChapters = new Set(
    completedSections.map((s) => s.split('/')[0])
  ).size;

  const progress = Math.round((completedChapters / totalChapters) * 100);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--foreground)] mb-6">
              Intuitive Maths
              <br />
              <span className="text-[var(--primary)]">of AI</span>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--foreground)]/70 max-w-3xl mx-auto mb-8">
              Learn the mathematics of artificial intelligence through
              interactive visualizations. No prerequisites—just curiosity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {lastVisited ? (
                <Link
                  href={lastVisited}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl font-medium transition-colors"
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
              ) : (
                <Link
                  href="/course/part-1/chapter-1-vectors"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl font-medium transition-colors"
                >
                  Start Learning
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              )}

              <Link
                href="#course-outline"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--foreground)] rounded-xl font-medium transition-colors border border-[var(--viz-grid)]"
              >
                View Course Outline
              </Link>
            </div>

            {/* Progress indicator */}
            {progress > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <div className="inline-flex items-center gap-3 bg-[var(--surface)] px-4 py-2 rounded-full">
                  <div className="w-32 h-2 bg-[var(--viz-grid)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--success)] rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-[var(--foreground)]/60">
                    {progress}% complete
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Course Features */}
      <section className="py-16 bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[var(--primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Intuitive First</h3>
              <p className="text-[var(--foreground)]/60">
                Every concept explained through real-world analogies before
                diving into equations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive</h3>
              <p className="text-[var(--foreground)]/60">
                Drag vectors, tweak parameters, and watch concepts come alive
                through exploration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Aha Moments</h3>
              <p className="text-[var(--foreground)]/60">
                Structured for discovery—experience those breakthrough moments
                of understanding.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Course Outline */}
      <section id="course-outline" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            Course Outline
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-[var(--foreground)]/60 mb-12 max-w-2xl mx-auto"
          >
            13 chapters across 5 parts, taking you from basic vectors to the
            philosophical implications of artificial intelligence.
          </motion.p>

          <div className="space-y-8">
            {courseStructure.map((part, partIndex) => (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: partIndex * 0.1 }}
                className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--viz-grid)]"
              >
                {/* Part header */}
                <div className="px-6 py-4 bg-[var(--surface-elevated)] border-b border-[var(--viz-grid)]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--primary)]">
                      Part {part.id}
                    </span>
                    <span className="text-[var(--foreground)]/30">•</span>
                    <span className="text-sm text-[var(--foreground)]/60 italic">
                      {part.theme}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mt-1">{part.title}</h3>
                </div>

                {/* Chapters */}
                <div className="divide-y divide-[var(--viz-grid)]">
                  {part.chapters.map((chapter) => (
                    <Link
                      key={chapter.slug}
                      href={`/course/part-${part.id}/${chapter.slug}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--surface-elevated)] transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-full bg-[var(--viz-grid)] flex items-center justify-center text-sm font-medium group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                        {chapter.chapter}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium group-hover:text-[var(--primary)] transition-colors">
                          {chapter.title}
                        </h4>
                        <p className="text-sm text-[var(--foreground)]/50">
                          {chapter.description}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-[var(--foreground)]/30 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all"
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
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--viz-grid)]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[var(--foreground)]/50 text-sm">
            Built with love for learners everywhere
          </p>
        </div>
      </footer>
    </main>
  );
}
