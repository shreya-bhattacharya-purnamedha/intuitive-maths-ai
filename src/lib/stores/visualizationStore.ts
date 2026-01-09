import { create } from 'zustand';

interface VisualizationState {
  // Shared vectors between components
  sharedVectors: Record<string, [number, number]>;

  // Shared matrices
  sharedMatrices: Record<string, number[][]>;

  // Shared parameters (e.g., learning rate, neuron count)
  sharedParameters: Record<string, number>;

  // Animation state
  isPlaying: Record<string, boolean>;
  animationProgress: Record<string, number>;

  // Actions
  setVector: (id: string, value: [number, number]) => void;
  setMatrix: (id: string, value: number[][]) => void;
  setParameter: (id: string, value: number) => void;
  setPlaying: (id: string, playing: boolean) => void;
  setAnimationProgress: (id: string, progress: number) => void;
  resetVisualization: (id: string) => void;
  resetAll: () => void;
}

const initialState = {
  sharedVectors: {},
  sharedMatrices: {},
  sharedParameters: {},
  isPlaying: {},
  animationProgress: {},
};

export const useVisualizationStore = create<VisualizationState>()((set) => ({
  ...initialState,

  setVector: (id: string, value: [number, number]) =>
    set((state) => ({
      sharedVectors: {
        ...state.sharedVectors,
        [id]: value,
      },
    })),

  setMatrix: (id: string, value: number[][]) =>
    set((state) => ({
      sharedMatrices: {
        ...state.sharedMatrices,
        [id]: value,
      },
    })),

  setParameter: (id: string, value: number) =>
    set((state) => ({
      sharedParameters: {
        ...state.sharedParameters,
        [id]: value,
      },
    })),

  setPlaying: (id: string, playing: boolean) =>
    set((state) => ({
      isPlaying: {
        ...state.isPlaying,
        [id]: playing,
      },
    })),

  setAnimationProgress: (id: string, progress: number) =>
    set((state) => ({
      animationProgress: {
        ...state.animationProgress,
        [id]: Math.max(0, Math.min(1, progress)),
      },
    })),

  resetVisualization: (id: string) =>
    set((state) => {
      const { [id]: _v, ...restVectors } = state.sharedVectors;
      const { [id]: _m, ...restMatrices } = state.sharedMatrices;
      const { [id]: _p, ...restParams } = state.sharedParameters;
      const { [id]: _play, ...restPlaying } = state.isPlaying;
      const { [id]: _prog, ...restProgress } = state.animationProgress;

      return {
        sharedVectors: restVectors,
        sharedMatrices: restMatrices,
        sharedParameters: restParams,
        isPlaying: restPlaying,
        animationProgress: restProgress,
      };
    }),

  resetAll: () => set(initialState),
}));
