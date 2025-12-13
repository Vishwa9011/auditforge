import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FileNode, FileSystemNode, FolderNode } from '../types';

export const ROOT_ID = 'root';

function getFileExtension(fileName: string) {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot <= 0 || lastDot === fileName.length - 1) return '';
    return fileName.slice(lastDot + 1);
}

type FileExplorerState = {
    nodes: Map<string, FileSystemNode>;
    rootId: string;

    openFiles: Set<string>;

    selectedNodeId: string | null;
    activeFileId: string | null;

    createFolder: (parentId: string, folderName: string) => void;
    createFile: (parentId: string, fileName: string) => void;
    deleteNode: (nodeId: string) => void;
    renameNode: (nodeId: string, newName: string) => void;
    setActiveFile: (fileId: string) => void;

    addOpenFile: (fileId: string) => void;

    getNodes: (children: string[]) => FileSystemNode[];
};

export const useFileExplorerStore = create<FileExplorerState>()(
    persist(
        (set, get) => ({
            nodes: new Map<string, FileSystemNode>([
                [
                    ROOT_ID,
                    {
                        id: ROOT_ID,
                        name: 'workspace',
                        type: 'folder',
                        parentId: null,
                        children: [],
                    },
                ],
            ]),

            openFiles: new Set<string>(),

            rootId: ROOT_ID,
            selectedNodeId: null,
            activeFileId: null,

            createFolder: (parentId, folderName) => {
                set(state => {
                    const parent = state.nodes.get(parentId);
                    if (!parent || parent.type !== 'folder') return state;

                    const folder: FolderNode = {
                        id: uuidv4(),
                        name: folderName,
                        type: 'folder',
                        parentId,
                        children: [],
                    };

                    const nodes = new Map(state.nodes);
                    nodes.set(folder.id, folder);
                    nodes.set(parentId, { ...parent, children: [...parent.children, folder.id] });

                    return { nodes };
                });
            },

            createFile: (parentId, fileName) => {
                set(state => {
                    const parent = state.nodes.get(parentId);
                    if (!parent || parent.type !== 'folder') return state;

                    const file: FileNode = {
                        id: uuidv4(),
                        name: fileName,
                        type: 'file',
                        parentId,
                        content: '',
                        extension: getFileExtension(fileName),
                    };

                    const nodes = new Map(state.nodes);
                    nodes.set(file.id, file);
                    nodes.set(parentId, { ...parent, children: [...parent.children, file.id] });

                    return { nodes };
                });
            },

            deleteNode: nodeId => {
                set(state => {
                    if (nodeId === ROOT_ID) return state;
                    const node = state.nodes.get(nodeId);
                    if (!node) return state;

                    const nodes = new Map(state.nodes);

                    const removeNodeRecursively = (id: string) => {
                        const current = nodes.get(id);
                        if (!current) return;

                        if (current.type === 'folder') {
                            for (const childId of current.children) removeNodeRecursively(childId);
                        }

                        nodes.delete(id);
                    };

                    if (node.parentId) {
                        const parent = nodes.get(node.parentId);
                        if (parent && parent.type === 'folder') {
                            nodes.set(parent.id, {
                                ...parent,
                                children: parent.children.filter(id => id !== nodeId),
                            });
                        }
                    }

                    removeNodeRecursively(nodeId);

                    const activeFileId =
                        state.activeFileId && nodes.has(state.activeFileId) ? state.activeFileId : null;
                    const selectedNodeId =
                        state.selectedNodeId && nodes.has(state.selectedNodeId) ? state.selectedNodeId : null;

                    return { nodes, activeFileId, selectedNodeId };
                });
            },

            renameNode: (nodeId, newName) => {
                set(state => {
                    const node = state.nodes.get(nodeId);
                    if (!node) return state;

                    const nodes = new Map(state.nodes);
                    if (node.type === 'file') {
                        nodes.set(nodeId, { ...node, name: newName, extension: getFileExtension(newName) });
                    } else {
                        nodes.set(nodeId, { ...node, name: newName });
                    }

                    return { nodes };
                });
            },

            setActiveFile: fileId => {
                set(state => {
                    const node = state.nodes.get(fileId);
                    if (node && node.type === 'file') {
                        return { activeFileId: fileId };
                    }
                    return { activeFileId: null };
                });
            },

            addOpenFile: fileId => {
                set(state => {
                    const openFiles = new Set(state.openFiles);
                    openFiles.add(fileId);
                    return { openFiles };
                });
            },

            getNodes: (children: string[]) => {
                const { nodes } = get();
                return children.map(id => nodes.get(id)).filter((node): node is FileSystemNode => node !== undefined);
            },
        }),
        {
            name: 'file-explorer-storage',
            storage: createJSONStorage(() => sessionStorage),

            partialize: state => ({
                nodes: Array.from(state.nodes.entries()),
                rootId: state.rootId,
                selectedNodeId: state.selectedNodeId,
                activeFileId: state.activeFileId,
                openFiles: Array.from(state.openFiles),
            }),

            onRehydrateStorage: () => state => {
                if (!state) return;
                state.nodes = new Map(state.nodes as unknown as Array<[string, FileSystemNode]>);

                if (state.activeFileId) {
                    const node = state.nodes.get(state.activeFileId);
                    if (!node || node.type !== 'file') state.activeFileId = null;
                }
                state.openFiles = new Set(state.openFiles as unknown as string[]);
            },
        },
    ),
);
