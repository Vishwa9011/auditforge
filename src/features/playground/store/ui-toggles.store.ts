import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const UI_TOGGLE_KEYS = ['file-explorer-panel', 'analyzer-panel'] as const;

type PlaygroundUiToggleStore = {
    toggleStateById: Record<string, boolean>;

    isEnabled: (id: string) => boolean;
    toggle: (id: string, enabled?: boolean) => void;
    resetAllToggles: () => void;
};

export const usePgUiToggle = create<PlaygroundUiToggleStore>()(
    persist(
        immer((set, get) => ({
            toggleStateById: {},

            isEnabled: id => Boolean(get().toggleStateById[id]),

            toggle: (id, enabled) => {
                set(state => {
                    state.toggleStateById[id] = enabled ?? !Boolean(state.toggleStateById[id]);
                });
            },

            resetAllToggles: () => {
                set(state => {
                    state.toggleStateById = {};
                });
            },
        })),
        {
            name: 'pg-ui-toggles',
            version: 1,
            partialize: state => ({
                toggleStateById: state.toggleStateById,
            }),
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);
