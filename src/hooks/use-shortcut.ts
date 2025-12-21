import { useEffect } from 'react';
import type { ShortcutKey } from '@/lib/app-shortcuts';
import { matchesShortcut } from '@/lib/shortcut-matcher';
import { usePlatform } from '@/hooks/use-platform';

/**
 *
 * @param keys combination of keys to listen for example: ['Ctrl', 'P']
 * @param cb callback to be called when the key combination is pressed
 */
export function useShortcut(keys: readonly ShortcutKey[], cb: () => void) {
    if (keys.length > 3) console.error('Only three Key combinations are allowed.');
    const platform = usePlatform();
    const allowMetaAsCtrl = platform === 'mac';

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.repeat) return;
            if (matchesShortcut(keys, event, { allowMetaAsCtrl })) {
                // Prevent default browser behavior
                event.preventDefault();
                event.stopPropagation();
                cb();
            }
        }

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [keys, cb]);
}
