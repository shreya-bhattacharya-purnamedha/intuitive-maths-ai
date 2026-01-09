import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  // Track completed sections
  completedSections: string[];

  // Track which visualizations have been interacted with
  interactionsCompleted: Record<string, boolean>;

  // Track code labs that have been run
  codeLabsRun: Record<string, number>;

  // Last visited chapter
  lastVisited: string | null;

  // Time spent per chapter (in seconds)
  timeSpent: Record<string, number>;

  // Narration mode: has user seen the narrated version?
  narrationsViewed: Record<string, boolean>;

  // Actions
  markSectionComplete: (sectionId: string) => void;
  markInteractionComplete: (vizId: string) => void;
  incrementCodeLabRun: (labId: string) => void;
  setLastVisited: (chapterId: string) => void;
  addTimeSpent: (chapterId: string, seconds: number) => void;
  markNarrationViewed: (vizId: string) => void;
  hasViewedNarration: (vizId: string) => boolean;
  getChapterProgress: (chapterId: string) => number;
  resetProgress: () => void;
}

const initialState = {
  completedSections: [],
  interactionsCompleted: {},
  codeLabsRun: {},
  lastVisited: null,
  timeSpent: {},
  narrationsViewed: {},
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,

      markSectionComplete: (sectionId: string) =>
        set((state) => ({
          completedSections: state.completedSections.includes(sectionId)
            ? state.completedSections
            : [...state.completedSections, sectionId],
        })),

      markInteractionComplete: (vizId: string) =>
        set((state) => ({
          interactionsCompleted: {
            ...state.interactionsCompleted,
            [vizId]: true,
          },
        })),

      incrementCodeLabRun: (labId: string) =>
        set((state) => ({
          codeLabsRun: {
            ...state.codeLabsRun,
            [labId]: (state.codeLabsRun[labId] || 0) + 1,
          },
        })),

      setLastVisited: (chapterId: string) =>
        set({ lastVisited: chapterId }),

      addTimeSpent: (chapterId: string, seconds: number) =>
        set((state) => ({
          timeSpent: {
            ...state.timeSpent,
            [chapterId]: (state.timeSpent[chapterId] || 0) + seconds,
          },
        })),

      markNarrationViewed: (vizId: string) =>
        set((state) => ({
          narrationsViewed: {
            ...state.narrationsViewed,
            [vizId]: true,
          },
        })),

      hasViewedNarration: (vizId: string) => {
        return get().narrationsViewed[vizId] || false;
      },

      getChapterProgress: (chapterId: string) => {
        const state = get();
        const chapterSections = state.completedSections.filter((s) =>
          s.startsWith(chapterId)
        );
        // This is a simplified calculation - in production you'd know total sections
        return chapterSections.length;
      },

      resetProgress: () => set(initialState),
    }),
    {
      name: 'maths-ai-progress',
    }
  )
);
