import { toast } from 'sonner';
import { useState } from 'react';
import { useFileSystem } from '@features/playground/store';
import { isDir, resolvePath } from '@features/playground/store/file-system';

type WorkspaceCreateMode = 'none' | 'create-file' | 'create-folder';

export function useWorkspaceRootCreate() {
    const fsTree = useFileSystem(state => state.fsTree);
    const cwd = useFileSystem(state => state.cwd);
    const createFile = useFileSystem(state => state.createFile);
    const createFolder = useFileSystem(state => state.createDir);

    const workspaceResult = resolvePath(cwd, fsTree);
    const canCreateInWorkspace = workspaceResult.kind === 'found' && isDir(workspaceResult.node);

    const [createMode, setCreateMode] = useState<WorkspaceCreateMode>('none');
    const [createDraftKey, setCreateDraftKey] = useState(0);

    const openCreate = (mode: Exclude<WorkspaceCreateMode, 'none'>) => {
        if (!canCreateInWorkspace) {
            toast.error('Select or create a workspace first');
            return;
        }
        setCreateMode(mode);
        setCreateDraftKey(v => v + 1);
    };

    const handleCreateFileClick = () => openCreate('create-file');
    const handleCreateFolderClick = () => openCreate('create-folder');

    const handleNameInputBlur = () => {
        setCreateMode('none');
    };

    const handleNameSubmit = (rawName: string) => {
        const name = rawName.trim();
        if (!name) {
            setCreateMode('none');
            return;
        }

        const parent = resolvePath(cwd, useFileSystem.getState().fsTree);
        if (parent.kind !== 'found' || !isDir(parent.node)) {
            toast.error('Workspace not found');
            setCreateMode('none');
            return;
        }

        if (parent.node.has(name)) {
            toast.error('A file or folder with this name already exists');
            return;
        }

        if (createMode === 'create-file') {
            createFile(cwd, name);
            toast.success('File created');
        } else if (createMode === 'create-folder') {
            createFolder(cwd, name);
            toast.success('Folder created');
        }

        setCreateMode('none');
    };

    const placeholder = createMode === 'create-file' ? 'New file name' : 'New folder name';

    return {
        canCreateInWorkspace,
        createMode,
        createDraftKey,
        placeholder,
        handleCreateFileClick,
        handleCreateFolderClick,
        handleNameInputBlur,
        handleNameSubmit,
    };
}
