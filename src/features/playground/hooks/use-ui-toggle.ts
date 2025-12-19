import { useEffect } from 'react';
import { usePgUiToggle, type UiToggleKey } from '@features/playground/store';

/**
 * @param id toggle key
 * @param defaultEnabled default enabled state
 * @returns object with isEnabled and toggle function
 */
export function useUiToggle(id: UiToggleKey, defaultEnabled = false) {
    const toggle = usePgUiToggle(state => state.toggle);
    const isEnabled = usePgUiToggle(state => state.isEnabled(id));

    useEffect(() => {
        if (usePgUiToggle.getState().toggleStateById[id] === undefined) {
            toggle(id, defaultEnabled);
        }
    }, [defaultEnabled]);

    return {
        isEnabled,
        toggle: (enabled?: boolean) => toggle(id, enabled),
    };
}
