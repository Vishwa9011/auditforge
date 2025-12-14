import type { Ino } from '../types';
import { writeFileContent } from './fs-db';
import { useFileExplorerStore, useFileSystem } from '../store';
import { resolvePath } from '../store/file-system';

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
