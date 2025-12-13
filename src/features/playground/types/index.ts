export type NodeType = 'file' | 'folder';

export interface BaseNode {
    id: string;
    name: string;
    type: NodeType;
    parentId: string | null;
}

export interface FileNode extends BaseNode {
    type: 'file';
    content: string;
    extension: string;
}

export interface FolderNode extends BaseNode {
    type: 'folder';
    children: string[];
}

export type FileSystemNode = FileNode | FolderNode;
