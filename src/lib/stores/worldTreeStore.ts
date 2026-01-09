import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  status: 'active' | 'coming-soon' | 'placeholder';
  internalLink?: string;
  graphyLink?: string;
  price?: {
    membership?: number;
    annual?: number;
    oneTime?: number;
  };
}

export interface PricingModality {
  id: string;
  name: string;
  description: string;
  price: number;
  period?: string;
  features: string[];
  highlighted?: boolean;
}

interface WorldTreeState {
  // Branding
  companyName: string;
  tagline: string;
  logoUrl: string | null;

  // Courses/Branches
  courses: Course[];

  // Pricing
  pricingModalities: PricingModality[];

  // Admin
  isEditMode: boolean;

  // Actions
  setCompanyName: (name: string) => void;
  setTagline: (tagline: string) => void;
  setLogoUrl: (url: string | null) => void;
  setCourses: (courses: Course[]) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  addCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
  setPricingModalities: (modalities: PricingModality[]) => void;
  updatePricingModality: (id: string, updates: Partial<PricingModality>) => void;
  setEditMode: (mode: boolean) => void;
}

const defaultCourses: Course[] = [
  {
    id: 'intuitive-maths-ai',
    title: 'Intuitive Maths of AI',
    description: 'Master the mathematical foundations of AI through interactive visualizations',
    icon: '🧮',
    color: '#6366f1',
    status: 'active',
    internalLink: '/course/part-1/chapter-1-vectors',
    price: { membership: 0, annual: 199, oneTime: 49 },
  },
  {
    id: 'ai-fundamentals-leaders',
    title: 'AI Fundamentals for Leaders',
    description: 'Strategic AI literacy for executives and decision-makers',
    icon: '👔',
    color: '#22c55e',
    status: 'coming-soon',
    price: { membership: 0, annual: 299, oneTime: 79 },
  },
  {
    id: 'ai-productivity-adhd',
    title: 'AI Productivity for ADHD',
    description: 'Leverage AI tools to work with your brain, not against it',
    icon: '🧠',
    color: '#f59e0b',
    status: 'coming-soon',
    price: { membership: 0, annual: 149, oneTime: 39 },
  },
  {
    id: 'vibe-coding-claude',
    title: 'Vibe Coding with Claude Code',
    description: 'Build software through natural conversation with AI',
    icon: '💻',
    color: '#ec4899',
    status: 'coming-soon',
    price: { membership: 0, annual: 249, oneTime: 69 },
  },
  {
    id: 'image-model-finetuning',
    title: 'Image Model Fine-Tuning',
    description: 'Create custom image models for your specific needs',
    icon: '🎨',
    color: '#8b5cf6',
    status: 'placeholder',
    price: { membership: 0, annual: 349, oneTime: 99 },
  },
  {
    id: 'llm-finetuning',
    title: 'LLM Model Fine-Tuning',
    description: 'Customize language models for domain-specific applications',
    icon: '🤖',
    color: '#14b8a6',
    status: 'placeholder',
    price: { membership: 0, annual: 399, oneTime: 119 },
  },
  {
    id: 'resonance-learning',
    title: 'Resonance Learning',
    description: 'Learn faster by aligning with your natural rhythms',
    icon: '🎵',
    color: '#f97316',
    status: 'placeholder',
    price: { membership: 0, annual: 199, oneTime: 49 },
  },
  {
    id: 'textbook-bundle',
    title: 'Textbook Bundle',
    description: 'Comprehensive collection of AI learning resources',
    icon: '📚',
    color: '#64748b',
    status: 'placeholder',
    price: { membership: 0, annual: 99, oneTime: 149 },
  },
];

const defaultPricingModalities: PricingModality[] = [
  {
    id: 'membership',
    name: 'Membership',
    description: 'Full access to all courses and future releases',
    price: 29,
    period: 'month',
    features: [
      'Access to all courses',
      'New courses as they launch',
      'Community access',
      'Monthly live sessions',
      'Cancel anytime',
    ],
    highlighted: true,
  },
  {
    id: 'annual',
    name: 'Annual License',
    description: 'One year of complete access',
    price: 249,
    period: 'year',
    features: [
      'All membership benefits',
      '2 months free',
      'Priority support',
      'Downloadable resources',
    ],
  },
  {
    id: 'pay-per-product',
    name: 'Pay Per Course',
    description: 'Purchase individual courses',
    price: 49,
    period: 'one-time',
    features: [
      'Lifetime access to course',
      'All course updates',
      'Course-specific community',
    ],
  },
];

export const useWorldTreeStore = create<WorldTreeState>()(
  persist(
    (set) => ({
      companyName: 'Purna Medha',
      tagline: 'Nurturing Complete Intelligence',
      logoUrl: null,
      courses: defaultCourses,
      pricingModalities: defaultPricingModalities,
      isEditMode: false,

      setCompanyName: (name) => set({ companyName: name }),
      setTagline: (tagline) => set({ tagline }),
      setLogoUrl: (url) => set({ logoUrl: url }),
      setCourses: (courses) => set({ courses }),
      updateCourse: (id, updates) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      addCourse: (course) =>
        set((state) => ({ courses: [...state.courses, course] })),
      removeCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        })),
      setPricingModalities: (modalities) =>
        set({ pricingModalities: modalities }),
      updatePricingModality: (id, updates) =>
        set((state) => ({
          pricingModalities: state.pricingModalities.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      setEditMode: (mode) => set({ isEditMode: mode }),
    }),
    {
      name: 'world-tree-storage',
    }
  )
);
