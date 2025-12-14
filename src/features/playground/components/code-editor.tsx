import Editor from '@monaco-editor/react';
import type { InodeMeta } from '../types';
import { useEffect, useMemo } from 'react';
import { useFileExplorerStore } from '../store';
import { useDebouncedCallback } from 'use-debounce';

type CodeEditorProps = {
    content?: string | null;
    meta?: InodeMeta | null;
    isEditorOpen: boolean;
    path?: string | null;
};

export function CodeEditor({ path, content, meta, isEditorOpen }: CodeEditorProps) {
    const dirtyInos = useFileExplorerStore(state => state.changedInos);
    const markFileDirty = useFileExplorerStore(state => state.addChangedIno);
    const fileDrafts = useFileExplorerStore(state => state.files);
    const upsertDraftContent = useFileExplorerStore(state => state.updateFileContent);
    const debouncedUpsertDraftContent = useDebouncedCallback(upsertDraftContent, 100);

    function handleEditorValidation(markers: readonly { message: string }[]) {
        markers.forEach(marker => console.log('onValidate:', marker.message));
    }

    function handleEditorChange(value?: string) {
        if (meta && value !== undefined) {
            debouncedUpsertDraftContent(meta.ino, value, path || undefined);
            if (!dirtyInos.has(meta.ino)) markFileDirty(meta.ino);
        }
    }

    const draftContent = useMemo(() => {
        if (!meta) return null;
        if (!fileDrafts.has(meta.ino)) return null;
        return fileDrafts.get(meta.ino)?.content;
    }, [fileDrafts, meta]);

    useEffect(() => {
        const upsertDraftContent = useFileExplorerStore.getState().updateFileContent;
        if (meta && content !== undefined && content !== null) {
            if (draftContent == null) {
                upsertDraftContent(meta.ino, content, path || undefined);
            }
        }
    }, [content, meta, draftContent, path]);

    return (
        <div className="h-full w-full border-2 border-black ">
            {!isEditorOpen ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-black/50 text-center">
                    <h2 className="mb-2 text-2xl font-bold text-white">No file is open</h2>
                    <p className="text-md max-w-sm text-white/70">
                        Open a file from the file explorer to start editing code.
                    </p>
                </div>
            ) : (
                <Editor
                    height="100%"
                    theme="vs-dark"
                    defaultLanguage="javascript"
                    defaultValue={draftContent ?? ''}
                    value={draftContent ?? ''}
                    onValidate={handleEditorValidation}
                    onChange={handleEditorChange}
                    options={{
                        fontFamily: 'var(--font-mono)',
                        minimap: { enabled: true, autohide: 'none' },
                        fontLigatures: true,
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        wordWrap: 'on',
                        fontSize: 16,
                    }}
                />
            )}
        </div>
    );
}
