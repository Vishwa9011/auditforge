export const MODIFIER_KEYS = ['Ctrl', 'Shift', 'Alt'] as const;

export const SHORTCUT_COMBINATION_KEYS = [
    ...MODIFIER_KEYS,
    'Enter',
    'P',
    'N',
    'B',
    'O',
    'F',
    'S',
    'Z',
    'Y',
    'X',
    'C',
    'V',
    'A',
    'W',
    'Q',
    'D',
    ',',
] as const;

export type ShortcutKey = (typeof SHORTCUT_COMBINATION_KEYS)[number];
export type ModifierKey = (typeof MODIFIER_KEYS)[number];

export const APP_SHORTCUT_IDS = {
    OPEN_FILE: 'open-file',
    NEW_FILE: 'new-file',
    OPEN_FILE_EXPLORER: 'open-file-explorer',
    OPEN_AI_ANALYSIS: 'open-ai-analysis',
    OPEN_SETTINGS: 'open-settings',
    CLOSE_FILE: 'close-file',
    CLOSE_ALL_FILES: 'close-all-files',
    SAVE_FILE: 'save-file',
    SAVE_ALL_FILES: 'save-all-file',
} as const;

export type AppShortcutId = (typeof APP_SHORTCUT_IDS)[keyof typeof APP_SHORTCUT_IDS];

export type AppShortcutDefinition = {
    label: string;
    keys: readonly ShortcutKey[];
};

export type AppShortcut = {
    id: AppShortcutId;
} & AppShortcutDefinition;

// Define all application shortcuts here
export const APP_SHORTCUTS_BY_ID = {
    [APP_SHORTCUT_IDS.OPEN_FILE]: {
        label: 'Open file',
        keys: ['Ctrl', 'P'],
    },
    [APP_SHORTCUT_IDS.NEW_FILE]: {
        label: 'Create new file',
        keys: ['Ctrl', 'N'],
    },
    [APP_SHORTCUT_IDS.OPEN_FILE_EXPLORER]: {
        label: 'Open file explorer',
        keys: ['Ctrl', 'B'],
    },
    [APP_SHORTCUT_IDS.OPEN_AI_ANALYSIS]: {
        label: 'Open analyzer panel',
        keys: ['Ctrl', 'Enter'],
    },
    [APP_SHORTCUT_IDS.OPEN_SETTINGS]: {
        label: 'Open settings',
        keys: ['Ctrl', ','],
    },
    [APP_SHORTCUT_IDS.CLOSE_FILE]: {
        label: 'Close file',
        keys: ['Ctrl', 'D'],
    },
    [APP_SHORTCUT_IDS.CLOSE_ALL_FILES]: {
        label: 'Close All files',
        keys: ['Ctrl', 'Shift', 'D'],
    },
    [APP_SHORTCUT_IDS.SAVE_FILE]: {
        label: 'Save file',
        keys: ['Ctrl', 'S'],
    },
    [APP_SHORTCUT_IDS.SAVE_ALL_FILES]: {
        label: 'Save All file',
        keys: ['Ctrl', 'Shift', 'S'],
    },
} as const satisfies Record<AppShortcutId, AppShortcutDefinition>;

export const APP_SHORTCUTS: readonly AppShortcut[] = (
    Object.entries(APP_SHORTCUTS_BY_ID) as Array<[AppShortcutId, AppShortcutDefinition]>
).map(([id, shortcut]) => ({
    id,
    ...shortcut,
}));

export const EMPTY_STATE_SHORTCUT_IDS: readonly AppShortcutId[] = [
    APP_SHORTCUT_IDS.OPEN_FILE,
    APP_SHORTCUT_IDS.NEW_FILE,
    APP_SHORTCUT_IDS.OPEN_FILE_EXPLORER,
];

export type ShortcutKeymap = 'mac' | 'windows';

export function getShortcutDisplayKeys(keys: readonly ShortcutKey[], keymap: ShortcutKeymap): readonly string[] {
    if (keymap !== 'mac') return [...keys];
    return keys.map(key => (key === 'Ctrl' ? '⌘' : key));
}
