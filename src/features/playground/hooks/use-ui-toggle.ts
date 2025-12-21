import { useCallback, useEffect, useMemo } from 'react';
import { usePgUiToggle, type UiToggleKey } from '@features/playground/store';

/**
 * @param id toggle key
 * @param defaultEnabled default enabled state
 * @returns object with isEnabled and toggle function
 */
export function useUiToggle(id: UiToggleKey, defaultEnabled = false) {
    const toggleInStore = usePgUiToggle(state => state.toggle);
    const isEnabled = usePgUiToggle(state => state.isEnabled(id));

    useEffect(() => {
        if (usePgUiToggle.getState().toggleStateById[id] === undefined) {
            toggleInStore(id, defaultEnabled);
        }
    }, [defaultEnabled, id, toggleInStore]);

    const toggle = useCallback((enabled?: boolean) => toggleInStore(id, enabled), [id, toggleInStore]);

    return useMemo(() => ({ isEnabled, toggle }), [isEnabled, toggle]);
}
