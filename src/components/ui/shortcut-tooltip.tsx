import * as React from 'react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Kbd } from '@/components/ui/kbd';
import { usePlatform } from '@/hooks/use-platform';
import { APP_SHORTCUTS_BY_ID, getShortcutDisplayKeys, type AppShortcutId } from '@/lib/app-shortcuts';

function KeyCombo({ keys }: { keys: readonly string[] }) {
    return (
        <span className="inline-flex items-center gap-1">
            {keys.map((key, index) => (
                <span key={`${key}-${index}`} className="inline-flex items-center">
                    <Kbd className={cn('h-5 px-1.5 text-[11px]', key === '⌘' && 'text-[13px]')}>{key}</Kbd>
                </span>
            ))}
        </span>
    );
}

type ShortcutTooltipProps = {
    label: React.ReactNode;
    shortcutId?: AppShortcutId;
    keys?: readonly string[];
    side?: React.ComponentProps<typeof TooltipContent>['side'];
    align?: React.ComponentProps<typeof TooltipContent>['align'];
    sideOffset?: number;
    className?: string;
    children: React.ReactNode;
};

export function ShortcutTooltip({
    label,
    shortcutId,
    keys: keysProp,
    side = 'bottom',
    align = 'center',
    sideOffset = 6,
    className,
    children,
}: ShortcutTooltipProps) {
    const platform = usePlatform();
    const keymap: 'mac' | 'windows' = platform === 'mac' ? 'mac' : 'windows';

    const keys =
        keysProp ?? (shortcutId ? getShortcutDisplayKeys(APP_SHORTCUTS_BY_ID[shortcutId].keys, keymap) : undefined);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex">{children}</span>
            </TooltipTrigger>
            <TooltipContent side={side} align={align} sideOffset={sideOffset} className={cn('px-2.5', className)}>
                <span className={cn('flex items-center gap-3', keys && 'justify-between')}>
                    <span className="min-w-0">{label}</span>
                    {keys ? <KeyCombo keys={keys} /> : null}
                </span>
            </TooltipContent>
        </Tooltip>
    );
}
