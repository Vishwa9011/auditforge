import type { Ino } from '@features/playground/types';
import { writeFileContent } from '@features/playground/lib/fs-db';
import { useFileExplorerStore, useFileSystem } from '@features/playground/store';
import { resolvePath } from '@features/playground/store/file-system';

export async function saveFileByIno(ino: Ino) {
    const { draftsByIno, clearUnsaved } = useFileExplorerStore.getState();
    const draft = draftsByIno.get(ino);
    if (!draft) return false;

    await writeFileContent(ino, draft.content);
    clearUnsaved(ino);
    return true;
}

export async function saveActiveFile() {
    const activeFile = useFileSystem.getState().activeFile;
    if (!activeFile) return;

    const res = resolvePath(activeFile);
    if (res.kind == 'missing') return;

    await saveFileByIno(res.meta.ino);
}

export async function saveAllUnsavedFiles() {
    const { unsavedInos } = useFileExplorerStore.getState();
    const inos = Array.from(unsavedInos);

    let savedCount = 0;
    for (const ino of inos) {
        const didSave = await saveFileByIno(ino);
        if (didSave) savedCount += 1;
    }

    return savedCount;
}

export const createFileWithContent = async (path: string, filename: string, content: string) => {
    const createFile = useFileSystem.getState().createFile;

    createFile(path, filename);

    const res = resolvePath(`${path}/${filename}`);
    if (res.kind !== 'found') {
        console.error('Failed to create file at', `${path}/${filename}`);
        return false;
    }

    await writeFileContent(res.meta.ino, content);

    return true;
};
