import { usePgUiToggle, UI_TOGGLE_KEYS } from '@features/playground/store';

type UiToggleId = (typeof UI_TOGGLE_KEYS)[number] | (string & {});

export function useUiToggle(id: UiToggleId) {
    const isEnabled = usePgUiToggle(state => state.isEnabled(id));
    const toggle = usePgUiToggle(state => state.toggle);

    return {
        isEnabled,
        toggle: (enabled?: boolean) => toggle(id, enabled),
    };
}
