import { toast } from 'sonner';
import { createFileWithContent } from '@features/playground/lib';
import { useFileSystem } from '@features/playground/store';
import { isDir, resolvePath } from '@features/playground/store/file-system';
import type { ContractSourceFile } from './source-parser';

type ImportToWorkspaceParams = {
    files: ContractSourceFile[];
    destinationDir: string; // absolute path in the in-app FS
    overwrite?: boolean;
    openAfterImport?: boolean;
};

const joinFsPath = (base: string, relative: string) => {
    const baseClean = base === '/' ? '' : base.replace(/\/+$/g, '');
    const relClean = relative.replace(/^\/+/g, '');
    if (!baseClean && !relClean) return '/';
    return `${baseClean}/${relClean}`;
};

const splitFsPath = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    if (!name) return null;
    const parentPath = parts.length === 0 ? '/' : `/${parts.join('/')}`;
    return { parentPath, name };
};

function ensureDirPath(dirPath: string) {
    const createDir = useFileSystem.getState().createDir;

    const parts = dirPath.split('/').filter(Boolean);
    let current = '/';

    for (const part of parts) {
        const next = current === '/' ? `/${part}` : `${current}/${part}`;
        const nextRes = resolvePath(next, useFileSystem.getState().fsTree);

        if (nextRes.kind === 'found') {
            if (!isDir(nextRes.node)) throw new Error(`Path exists but is not a folder: ${next}`);
            current = next;
            continue;
        }

        const parentRes = resolvePath(current, useFileSystem.getState().fsTree);
        if (parentRes.kind !== 'found' || !isDir(parentRes.node)) throw new Error(`Missing parent folder: ${current}`);

        createDir(current, part);
        current = next;
    }
}

function getUniqueDirPath(baseDir: string) {
    const fsTree = useFileSystem.getState().fsTree;
    const baseRes = resolvePath(baseDir, fsTree);
    if (baseRes.kind === 'missing') return baseDir;
    if (baseRes.kind === 'found' && !isDir(baseRes.node)) throw new Error(`Destination exists but is not a folder`);

    for (let i = 2; i < 100; i++) {
        const candidate = `${baseDir}-${i}`;
        const res = resolvePath(candidate, useFileSystem.getState().fsTree);
        if (res.kind === 'missing') return candidate;
    }

    throw new Error('Could not find an available destination folder name.');
}

export async function importSourcesToWorkspace({
    files,
    destinationDir,
    overwrite = true,
    openAfterImport = true,
}: ImportToWorkspaceParams) {
    if (files.length === 0) {
        toast.error('No source files to import');
        return { ok: false as const };
    }

    const safeDestination = getUniqueDirPath(destinationDir);
    ensureDirPath(safeDestination);

    let firstImportedPath: string | null = null;
    for (const file of files) {
        const fullPath = joinFsPath(safeDestination, file.path);
        const split = splitFsPath(fullPath);
        if (!split) continue;

        ensureDirPath(split.parentPath);

        const fsTree = useFileSystem.getState().fsTree;
        const existingRes = resolvePath(fullPath, fsTree);
        if (existingRes.kind === 'found' && !overwrite) continue;

        const ok = await createFileWithContent(split.parentPath, split.name, file.content);
        if (!ok) throw new Error(`Failed to create ${fullPath}`);

        if (!firstImportedPath) firstImportedPath = fullPath;
    }

    if (openAfterImport && firstImportedPath) {
        const { openFile, setActiveFilePath } = useFileSystem.getState();
        openFile(firstImportedPath);
        setActiveFilePath(firstImportedPath);
    }

    toast.success(`Imported ${files.length} file${files.length === 1 ? '' : 's'} to workspace`);
    return { ok: true as const, destinationDir: safeDestination, firstImportedPath };
}
