import { create } from 'zustand';

type PlaygroundState = Record<string, never>;

export const usePlaygroundStore = create<PlaygroundState>()(() => ({}));
