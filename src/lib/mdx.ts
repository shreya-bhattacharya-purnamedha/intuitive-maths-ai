// Course structure - purely static data, safe for client components

export interface ChapterMeta {
  slug: string;
  title: string;
  part: number;
  partTitle: string;
  chapter: number;
  description: string;
  teachingGoal?: string;
}

export interface PartMeta {
  id: number;
  title: string;
  theme: string;
  chapters: ChapterMeta[];
}

// Define the course structure
export const courseStructure: PartMeta[] = [
  {
    id: 1,
    title: 'The Geometry of Data',
    theme: 'Intelligence begins with representation',
    chapters: [
      {
        slug: 'chapter-1-vectors',
        title: 'The Vector—Everything is an Arrow',
        part: 1,
        partTitle: 'The Geometry of Data',
        chapter: 1,
        description: 'Moving from thinking of data as a static list to a geometric object',
        teachingGoal: 'Dissolve the misconception that vectors are just "lists of numbers"',
      },
      {
        slug: 'chapter-2-matrices',
        title: 'Matrices as Machines',
        part: 1,
        partTitle: 'The Geometry of Data',
        chapter: 2,
        description: 'Moving from thinking of a matrix as a spreadsheet to a function',
        teachingGoal: 'See matrices as ACTIONS, not containers',
      },
      {
        slug: 'chapter-3-dimensionality',
        title: 'Dimensionality Reduction—The Shadow on the Wall',
        part: 1,
        partTitle: 'The Geometry of Data',
        chapter: 3,
        description: 'How AI simplifies complex reality through projection',
        teachingGoal: 'Compression preserves meaning; some shadows are more informative',
      },
    ],
  },
  {
    id: 2,
    title: 'The Landscape of Learning',
    theme: 'Intelligence is navigation',
    chapters: [
      {
        slug: 'chapter-4-derivatives',
        title: 'Derivatives as Sensitivity',
        part: 2,
        partTitle: 'The Landscape of Learning',
        chapter: 4,
        description: 'The AI engineer\'s definition of derivatives',
        teachingGoal: 'Derivative = "If I nudge this, how loudly does the output scream?"',
      },
      {
        slug: 'chapter-5-gradient-descent',
        title: 'Gradient Descent—The Blind Hiker',
        part: 2,
        partTitle: 'The Landscape of Learning',
        chapter: 5,
        description: 'How neural networks learn by walking downhill in the dark',
        teachingGoal: 'Learning = rolling downhill in the dark',
      },
      {
        slug: 'chapter-6-backpropagation',
        title: 'Backpropagation—The Chain of Blame',
        part: 2,
        partTitle: 'The Landscape of Learning',
        chapter: 6,
        description: 'How neural networks learn through error attribution',
        teachingGoal: 'Chain rule = passing blame down the hierarchy',
      },
    ],
  },
  {
    id: 3,
    title: 'Uncertainty & Belief',
    theme: 'Intelligence is knowing what you don\'t know',
    chapters: [
      {
        slug: 'chapter-7-probability',
        title: 'Probability as Logic',
        part: 3,
        partTitle: 'Uncertainty & Belief',
        chapter: 7,
        description: 'Probability distributions as shapes of belief',
        teachingGoal: 'Probability = quantified uncertainty',
      },
      {
        slug: 'chapter-8-bayes',
        title: 'Bayesian Reasoning—Changing Your Mind',
        part: 3,
        partTitle: 'Uncertainty & Belief',
        chapter: 8,
        description: 'The mathematical engine of updating beliefs',
        teachingGoal: 'Bayes = the rigorous way to update beliefs with evidence',
      },
    ],
  },
  {
    id: 4,
    title: 'The Architecture of Thought',
    theme: 'Mimicking the structure of cognition',
    chapters: [
      {
        slug: 'chapter-9-neurons',
        title: 'Neurons and Universal Approximation',
        part: 4,
        partTitle: 'The Architecture of Thought',
        chapter: 9,
        description: 'Building neural networks from simple components',
        teachingGoal: 'A neuron is just a linear boundary + a decision to fire',
      },
      {
        slug: 'chapter-10-manifolds',
        title: 'High-Dimensional Manifolds',
        part: 4,
        partTitle: 'The Architecture of Thought',
        chapter: 10,
        description: 'The geometry of meaning in high dimensions',
        teachingGoal: 'Real data lives on thin surfaces in high-dimensional space',
      },
      {
        slug: 'chapter-11-generative',
        title: 'Generative AI & The Latent Space',
        part: 4,
        partTitle: 'The Architecture of Thought',
        chapter: 11,
        description: 'How AI becomes creative through latent space exploration',
        teachingGoal: 'Generative AI = walking through concept space',
      },
    ],
  },
  {
    id: 5,
    title: 'The Nature of Intelligence',
    theme: 'The philosophical synthesis',
    chapters: [
      {
        slug: 'chapter-12-attention',
        title: 'Attention is All You Need?',
        part: 5,
        partTitle: 'The Nature of Intelligence',
        chapter: 12,
        description: 'The Transformer architecture and attention mechanism',
        teachingGoal: 'Attention = dynamic routing of relevant information',
      },
      {
        slug: 'chapter-13-conclusion',
        title: 'Conclusion—The Ghost in the Machine',
        part: 5,
        partTitle: 'The Nature of Intelligence',
        chapter: 13,
        description: 'Synthesizing everything into a definition of intelligence',
        teachingGoal: 'Intelligence emerges from simple rules at scale',
      },
    ],
  },
];

// Get all chapter slugs for static generation
export function getAllChapterSlugs(): { partId: string; chapterId: string }[] {
  const slugs: { partId: string; chapterId: string }[] = [];

  for (const part of courseStructure) {
    for (const chapter of part.chapters) {
      slugs.push({
        partId: `part-${part.id}`,
        chapterId: chapter.slug,
      });
    }
  }

  return slugs;
}

// Get chapter metadata by slug
export function getChapterMeta(partId: string, chapterId: string): ChapterMeta | null {
  const partNum = parseInt(partId.replace('part-', ''));
  const part = courseStructure.find((p) => p.id === partNum);

  if (!part) return null;

  return part.chapters.find((c) => c.slug === chapterId) || null;
}

// Get next and previous chapters for navigation
export function getAdjacentChapters(partId: string, chapterId: string) {
  const allChapters = courseStructure.flatMap((part) =>
    part.chapters.map((chapter) => ({
      ...chapter,
      partSlug: `part-${part.id}`,
    }))
  );

  const currentIndex = allChapters.findIndex(
    (c) => c.partSlug === partId && c.slug === chapterId
  );

  return {
    prev: currentIndex > 0 ? allChapters[currentIndex - 1] : null,
    next: currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null,
  };
}
