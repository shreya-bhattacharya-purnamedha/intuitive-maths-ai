'use client';

import { useState, useEffect } from 'react';
import { WorldTreeVisualization } from './WorldTreeVisualization';
import { PricingSection } from './PricingSection';
import { AdminPanel } from './AdminPanel';
import { useWorldTreeStore } from '@/lib/stores/worldTreeStore';
import Link from 'next/link';

export function WorldTreeLanding() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { companyName, tagline, logoUrl, courses, isEditMode, setEditMode } = useWorldTreeStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeCourses = courses.filter((c) => c.status === 'active');
  const upcomingCourses = courses.filter((c) => c.status === 'coming-soon');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1628]">
      {/* Admin Toggle (hidden by default, press 'a' key to show) */}
      <button
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-4 right-4 p-3 bg-[var(--surface-elevated)] rounded-full shadow-lg opacity-30 hover:opacity-100 transition-opacity z-40"
        title="Admin Panel"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Hero Section */}
      <header className="relative pt-8 pb-4">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="w-12 h-12 object-contain" />
            ) : (
              <span className="text-4xl">🌳</span>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">{companyName}</h1>
              <p className="text-xs text-[var(--foreground)]/60">{tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/course/part-1/chapter-1-vectors"
              className="px-4 py-2 text-sm text-[var(--foreground)]/80 hover:text-white transition-colors"
            >
              Courses
            </Link>
            <a
              href="#pricing"
              className="px-4 py-2 text-sm text-[var(--foreground)]/80 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <button className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity">
              Sign In
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="text-center mb-8">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 text-transparent bg-clip-text">
            {companyName} World Tree
          </h2>
          <p className="text-xl text-[var(--foreground)]/70 max-w-2xl mx-auto mb-8">
            A living ecosystem of AI knowledge. Each branch represents a journey
            from curiosity to mastery. Where will your path take you?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/course/part-1/chapter-1-vectors"
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25"
            >
              Start Learning Free
            </Link>
            <a
              href="#tree"
              className="px-8 py-3 bg-[var(--surface-elevated)] text-white font-medium rounded-xl hover:bg-[var(--surface)] transition-colors border border-[var(--viz-grid)]"
            >
              Explore Tree
            </a>
          </div>
        </div>
      </header>

      {/* World Tree Section */}
      <section id="tree" className="relative py-12">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <WorldTreeVisualization width={900} height={700} />
        </div>

        {/* Course Stats */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-[var(--surface-elevated)]/50 backdrop-blur">
              <div className="text-3xl font-bold text-emerald-400">{activeCourses.length}</div>
              <div className="text-sm text-[var(--foreground)]/60">Active Courses</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-[var(--surface-elevated)]/50 backdrop-blur">
              <div className="text-3xl font-bold text-amber-400">{upcomingCourses.length}</div>
              <div className="text-sm text-[var(--foreground)]/60">Coming Soon</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-[var(--surface-elevated)]/50 backdrop-blur">
              <div className="text-3xl font-bold text-purple-400">{courses.length}</div>
              <div className="text-sm text-[var(--foreground)]/60">Total Branches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Course Section */}
      {activeCourses.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Learning Path</h2>
              <p className="text-lg text-[var(--foreground)]/60">
                Start your journey with our flagship course
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-8 border border-indigo-500/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl">{activeCourses[0].icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold">{activeCourses[0].title}</h3>
                      <span className="text-sm text-emerald-400">Available Now</span>
                    </div>
                  </div>
                  <p className="text-[var(--foreground)]/70 mb-6">
                    {activeCourses[0].description}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-[var(--surface)] text-sm">
                      13 Chapters
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[var(--surface)] text-sm">
                      Interactive Visualizations
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[var(--surface)] text-sm">
                      Code Playgrounds
                    </span>
                  </div>
                  <Link
                    href={activeCourses[0].internalLink || '/course/part-1/chapter-1-vectors'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    Start Learning
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="aspect-video rounded-xl bg-[var(--surface)] flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">📐</div>
                      <div className="text-lg font-medium">From Vectors to Transformers</div>
                      <div className="text-sm text-[var(--foreground)]/60">
                        Build intuition for the mathematics of AI
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon Section */}
      {upcomingCourses.length > 0 && (
        <section className="py-20 px-4 bg-[var(--surface)]/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Growing Branches</h2>
              <p className="text-lg text-[var(--foreground)]/60">
                New courses sprouting soon
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--viz-grid)] hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{course.icon}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                      Coming Soon
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                  <p className="text-sm text-[var(--foreground)]/60 mb-4">
                    {course.description}
                  </p>
                  <button className="w-full py-2 rounded-lg bg-[var(--surface)] text-sm font-medium hover:bg-[var(--viz-grid)] transition-colors">
                    Notify Me
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* Philosophy Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">The Philosophy of {companyName}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-bold mb-2">Grow Organically</h3>
              <p className="text-sm text-[var(--foreground)]/60">
                Like a tree, knowledge grows from strong roots. We build intuition
                before formalism, understanding before memorization.
              </p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-bold mb-2">Connect Everything</h3>
              <p className="text-sm text-[var(--foreground)]/60">
                Each branch connects to the trunk. Every concept links to the
                foundations. Nothing exists in isolation.
              </p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">🌳</div>
              <h3 className="text-lg font-bold mb-2">Nurture Completeness</h3>
              <p className="text-sm text-[var(--foreground)]/60">
                Purna means complete. We aim for whole understanding—technical
                depth paired with intuitive clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[var(--viz-grid)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="w-10 h-10 object-contain" />
              ) : (
                <span className="text-3xl">🌳</span>
              )}
              <div>
                <div className="font-bold">{companyName}</div>
                <div className="text-xs text-[var(--foreground)]/60">{tagline}</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--foreground)]/60">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
            <div className="text-sm text-[var(--foreground)]/40">
              &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Panel Modal */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}
