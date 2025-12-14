import { create } from 'zustand';
import type { Ino } from '../types';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

enableMapSet();

type FileExplorerStoreState = {
    files: Map<
        Ino,
        {
            path: string;
            ino: Ino;
            content: string;
            mtime: number;
        }
    >;
    changedInos: Set<Ino>;
    updateFileContent: (ino: Ino, content: string, path?: string) => void;
    addChangedIno: (ino: Ino) => void;
    removeInoFromChanged: (ino: Ino) => void;
};

export const useFileExplorerStore = create<FileExplorerStoreState>()(
    immer(set => ({
        files: new Map(),
        changedInos: new Set(),
        addChangedIno: (ino: Ino) => {
            set(state => {
                state.changedInos.add(ino);
            });
        },

        removeInoFromChanged: (ino: Ino) => {
            set(state => {
                state.changedInos.delete(ino);
            });
        },
        updateFileContent: (ino: Ino, content: string, path?: string) => {
            set(state => {
                const existing = state.files.get(ino);
                if (existing) {
                    existing.content = content;
                    existing.mtime = Date.now();
                    if (path) {
                        existing.path = path;
                    }
                    state.files.set(ino, existing);
                } else {
                    state.files.set(ino, {
                        path: path || `untitled-${ino}`,
                        ino,
                        mtime: Date.now(),
                        content,
                    });
                }
            });
        },
    })),
);
