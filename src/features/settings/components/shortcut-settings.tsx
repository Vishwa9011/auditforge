import { cn } from '@/lib/utils';
import { useState } from 'react';
import { usePlatform } from '@/hooks';
import { Kbd } from '@/components/ui/kbd';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { APP_SHORTCUTS, getShortcutDisplayKeys } from '@/lib/app-shortcuts';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function KeyCombo({ keys }: { keys: readonly string[] }) {
    return (
        <span className="inline-flex items-center">
            {keys.map((key, index) => (
                <span key={`${key}-${index}`} className="inline-flex items-center">
                    {index > 0 && <span className="text-muted-foreground/60 px-1 text-[10px]">+</span>}
                    <Kbd className={cn('h-6', key === '⌘' && 'text-[13px]')}>{key}</Kbd>
                </span>
            ))}
        </span>
    );
}

export function ShortcutsSettingsSection() {
    const platform = usePlatform();
    const [keymap, setKeymap] = useState<'mac' | 'windows'>(platform === 'mac' ? 'mac' : 'windows');

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Keyboard shortcuts</CardTitle>
                    <CardDescription>Common actions and their default key bindings.</CardDescription>
                    <CardAction>
                        <div className="bg-muted/40 flex items-center gap-1 rounded-md border p-1">
                            <Button
                                type="button"
                                variant={keymap === 'mac' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => setKeymap('mac')}
                            >
                                Mac
                            </Button>
                            <Button
                                type="button"
                                variant={keymap === 'windows' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => setKeymap('windows')}
                            >
                                Windows
                            </Button>
                        </div>
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        {APP_SHORTCUTS.map(shortcut => (
                            <div
                                key={shortcut.id}
                                className="flex items-center justify-between gap-6 rounded-lg border p-3"
                            >
                                <div className="min-w-0 text-sm font-medium">{shortcut.label}</div>
                                <KeyCombo keys={getShortcutDisplayKeys(shortcut.keys, keymap)} />
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="text-muted-foreground text-xs">Some shortcuts may vary by browser and OS.</div>
                </CardContent>
            </Card>
        </div>
    );
}
