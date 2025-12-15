import { useEffect } from 'react';
import { saveActiveFile } from '@features/playground/lib';

export function useSaveShortcut() {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const isCtrlOrCmd = event.ctrlKey || event.metaKey;

            if (isCtrlOrCmd && event.key.toLowerCase() === 's') {
                event.preventDefault();
                saveActiveFile();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
}
