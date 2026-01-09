'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Course, useWorldTreeStore } from '@/lib/stores/worldTreeStore';
import Link from 'next/link';

interface WorldTreeVisualizationProps {
  width?: number;
  height?: number;
  onCourseClick?: (course: Course) => void;
}

export function WorldTreeVisualization({
  width = 900,
  height = 700,
  onCourseClick,
}: WorldTreeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { courses, isEditMode } = useWorldTreeStore();
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const centerX = width / 2;
    const trunkBottom = height - 50;
    const trunkTop = height * 0.45;
    const trunkWidth = 40;

    // Gradient definitions
    const defs = svg.append('defs');

    // Trunk gradient
    const trunkGradient = defs.append('linearGradient')
      .attr('id', 'trunkGradient')
      .attr('x1', '0%')
      .attr('x2', '100%');
    trunkGradient.append('stop').attr('offset', '0%').attr('stop-color', '#5d4037');
    trunkGradient.append('stop').attr('offset', '50%').attr('stop-color', '#8d6e63');
    trunkGradient.append('stop').attr('offset', '100%').attr('stop-color', '#5d4037');

    // Leaf gradient
    const leafGradient = defs.append('radialGradient')
      .attr('id', 'leafGradient')
      .attr('cx', '50%')
      .attr('cy', '30%');
    leafGradient.append('stop').attr('offset', '0%').attr('stop-color', '#4ade80');
    leafGradient.append('stop').attr('offset', '100%').attr('stop-color', '#166534');

    // Ground
    svg.append('ellipse')
      .attr('cx', centerX)
      .attr('cy', trunkBottom + 10)
      .attr('rx', 150)
      .attr('ry', 25)
      .attr('fill', '#166534')
      .attr('opacity', 0.3);

    // Tree trunk
    const trunkPath = `
      M ${centerX - trunkWidth / 2} ${trunkBottom}
      Q ${centerX - trunkWidth / 2 - 10} ${(trunkBottom + trunkTop) / 2} ${centerX - trunkWidth / 3} ${trunkTop}
      L ${centerX + trunkWidth / 3} ${trunkTop}
      Q ${centerX + trunkWidth / 2 + 10} ${(trunkBottom + trunkTop) / 2} ${centerX + trunkWidth / 2} ${trunkBottom}
      Z
    `;

    svg.append('path')
      .attr('d', trunkPath)
      .attr('fill', 'url(#trunkGradient)');

    // Trunk texture lines
    for (let i = 0; i < 5; i++) {
      const y = trunkTop + (trunkBottom - trunkTop) * (i / 5);
      svg.append('path')
        .attr('d', `M ${centerX - trunkWidth / 3} ${y} Q ${centerX} ${y + 10} ${centerX + trunkWidth / 3} ${y}`)
        .attr('fill', 'none')
        .attr('stroke', '#4e342e')
        .attr('stroke-width', 1)
        .attr('opacity', 0.3);
    }

    // Main canopy (background)
    svg.append('ellipse')
      .attr('cx', centerX)
      .attr('cy', trunkTop - 80)
      .attr('rx', 280)
      .attr('ry', 180)
      .attr('fill', 'url(#leafGradient)')
      .attr('opacity', 0.15);

    // Calculate branch positions
    const numCourses = courses.length;
    const branchAngles: number[] = [];
    const leftBranches = Math.ceil(numCourses / 2);
    const rightBranches = Math.floor(numCourses / 2);

    // Left branches (going up)
    for (let i = 0; i < leftBranches; i++) {
      const angle = Math.PI / 2 + (Math.PI / 3) * ((i + 0.5) / leftBranches);
      branchAngles.push(angle);
    }

    // Right branches (going up)
    for (let i = 0; i < rightBranches; i++) {
      const angle = Math.PI / 2 - (Math.PI / 3) * ((i + 0.5) / rightBranches);
      branchAngles.push(angle);
    }

    // Draw branches and course nodes
    courses.forEach((course, idx) => {
      const angle = branchAngles[idx];
      const branchLength = 120 + Math.random() * 40;
      const startY = trunkTop + 30 + (idx % 3) * 25;

      const startX = centerX + (idx < leftBranches ? -15 : 15);
      const endX = startX + Math.cos(angle) * branchLength;
      const endY = startY - Math.sin(angle) * branchLength;

      const midX = startX + Math.cos(angle) * branchLength * 0.5;
      const midY = startY - Math.sin(angle) * branchLength * 0.5;

      const isHovered = hoveredCourse === course.id;

      // Branch
      const branchGradient = defs.append('linearGradient')
        .attr('id', `branch-${course.id}`)
        .attr('x1', '0%')
        .attr('x2', '100%');
      branchGradient.append('stop').attr('offset', '0%').attr('stop-color', '#5d4037');
      branchGradient.append('stop').attr('offset', '100%').attr('stop-color', '#8d6e63');

      svg.append('path')
        .attr('d', `M ${startX} ${startY} Q ${midX} ${midY - 20} ${endX} ${endY}`)
        .attr('fill', 'none')
        .attr('stroke', `url(#branch-${course.id})`)
        .attr('stroke-width', isHovered ? 8 : 6)
        .attr('stroke-linecap', 'round');

      // Leaf cluster behind node
      const leafCluster = svg.append('g');
      for (let l = 0; l < 5; l++) {
        const leafAngle = (l / 5) * Math.PI * 2;
        const leafDist = 35 + Math.random() * 15;
        leafCluster.append('ellipse')
          .attr('cx', endX + Math.cos(leafAngle) * leafDist)
          .attr('cy', endY + Math.sin(leafAngle) * leafDist * 0.6)
          .attr('rx', 20 + Math.random() * 10)
          .attr('ry', 15 + Math.random() * 8)
          .attr('fill', course.color)
          .attr('opacity', 0.2);
      }

      // Course node (fruit)
      const nodeGroup = svg.append('g')
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setHoveredCourse(course.id))
        .on('mouseleave', () => setHoveredCourse(null))
        .on('click', () => {
          setSelectedCourse(course);
          if (onCourseClick) onCourseClick(course);
        });

      // Glow effect
      if (isHovered || course.status === 'active') {
        nodeGroup.append('circle')
          .attr('cx', endX)
          .attr('cy', endY)
          .attr('r', isHovered ? 50 : 42)
          .attr('fill', course.color)
          .attr('opacity', isHovered ? 0.4 : 0.2)
          .attr('filter', 'blur(10px)');
      }

      // Main circle
      nodeGroup.append('circle')
        .attr('cx', endX)
        .attr('cy', endY)
        .attr('r', isHovered ? 40 : 35)
        .attr('fill', course.status === 'active' ? course.color : 'var(--surface-elevated)')
        .attr('stroke', course.color)
        .attr('stroke-width', 3)
        .attr('opacity', course.status === 'placeholder' ? 0.6 : 1);

      // Icon
      nodeGroup.append('text')
        .attr('x', endX)
        .attr('y', endY + 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', isHovered ? '28px' : '24px')
        .text(course.icon);

      // Status badge
      if (course.status === 'coming-soon') {
        nodeGroup.append('circle')
          .attr('cx', endX + 25)
          .attr('cy', endY - 25)
          .attr('r', 12)
          .attr('fill', '#f59e0b');

        nodeGroup.append('text')
          .attr('x', endX + 25)
          .attr('y', endY - 21)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text('Soon');
      }

      // Label
      const labelY = endY + 55;
      nodeGroup.append('text')
        .attr('x', endX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--foreground)')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(course.title.length > 20 ? course.title.substring(0, 18) + '...' : course.title);

      if (isHovered) {
        // Description on hover
        const descWords = course.description.split(' ');
        let line1 = '';
        let line2 = '';
        descWords.forEach(word => {
          if (line1.length < 30) {
            line1 += (line1 ? ' ' : '') + word;
          } else if (line2.length < 30) {
            line2 += (line2 ? ' ' : '') + word;
          }
        });

        nodeGroup.append('text')
          .attr('x', endX)
          .attr('y', labelY + 16)
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--foreground)')
          .attr('font-size', '10px')
          .attr('opacity', 0.7)
          .text(line1);

        if (line2) {
          nodeGroup.append('text')
            .attr('x', endX)
            .attr('y', labelY + 28)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--foreground)')
            .attr('font-size', '10px')
            .attr('opacity', 0.7)
            .text(line2);
        }
      }
    });

    // Roots
    const rootPaths = [
      `M ${centerX - 20} ${trunkBottom} Q ${centerX - 60} ${trunkBottom + 30} ${centerX - 100} ${trunkBottom + 20}`,
      `M ${centerX} ${trunkBottom} Q ${centerX} ${trunkBottom + 40} ${centerX - 20} ${trunkBottom + 35}`,
      `M ${centerX + 20} ${trunkBottom} Q ${centerX + 60} ${trunkBottom + 30} ${centerX + 100} ${trunkBottom + 20}`,
    ];

    rootPaths.forEach(path => {
      svg.append('path')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', '#5d4037')
        .attr('stroke-width', 8)
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0.6);
    });

    // Title at trunk
    svg.append('text')
      .attr('x', centerX)
      .attr('y', trunkBottom - 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('opacity', 0.8)
      .text('WORLD TREE');

  }, [courses, hoveredCourse, width, height, isEditMode, onCourseClick]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="mx-auto"
        style={{ background: 'transparent' }}
      />

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface-elevated)] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedCourse.icon}</span>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: selectedCourse.color }}>
                    {selectedCourse.title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCourse.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    selectedCourse.status === 'coming-soon' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedCourse.status === 'active' ? 'Available Now' :
                     selectedCourse.status === 'coming-soon' ? 'Coming Soon' : 'Planned'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-[var(--foreground)]/70 mb-6">
              {selectedCourse.description}
            </p>

            {selectedCourse.price && (
              <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                <div className="bg-[var(--surface)] rounded-lg p-2">
                  <div className="text-xs text-[var(--foreground)]/50">Membership</div>
                  <div className="font-bold">{selectedCourse.price.membership === 0 ? 'Included' : `$${selectedCourse.price.membership}/mo`}</div>
                </div>
                <div className="bg-[var(--surface)] rounded-lg p-2">
                  <div className="text-xs text-[var(--foreground)]/50">Annual</div>
                  <div className="font-bold">${selectedCourse.price.annual}</div>
                </div>
                <div className="bg-[var(--surface)] rounded-lg p-2">
                  <div className="text-xs text-[var(--foreground)]/50">One-Time</div>
                  <div className="font-bold">${selectedCourse.price.oneTime}</div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {selectedCourse.status === 'active' && selectedCourse.internalLink && (
                <Link
                  href={selectedCourse.internalLink}
                  className="flex-1 py-3 rounded-lg text-center font-medium text-white"
                  style={{ backgroundColor: selectedCourse.color }}
                >
                  Start Learning
                </Link>
              )}
              {selectedCourse.graphyLink && (
                <a
                  href={selectedCourse.graphyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-lg text-center font-medium bg-[var(--surface)] hover:bg-[var(--viz-grid)] border border-[var(--viz-grid)]"
                >
                  View on Graphy
                </a>
              )}
              {selectedCourse.status !== 'active' && (
                <button className="flex-1 py-3 rounded-lg text-center font-medium bg-[var(--surface)] border border-[var(--viz-grid)] cursor-not-allowed opacity-60">
                  {selectedCourse.status === 'coming-soon' ? 'Notify Me' : 'Coming Soon'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
