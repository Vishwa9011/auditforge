import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { APP_SHORTCUT_IDS } from '@/lib/app-shortcuts';
import { useShortcutActions } from '@/hooks/use-shortcut-actions';

export function useGlobalShortcuts() {
    const navigate = useNavigate();

    const actions = useMemo(
        () => ({
            [APP_SHORTCUT_IDS.OPEN_SETTINGS]: () => navigate({ to: '/settings' }),
        }),
        [navigate],
    );

    useShortcutActions(actions);
}
