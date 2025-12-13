import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useToggle } from '../hooks';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from './delete-dialog';
import { Button } from '@/components/ui/button';
import { useFileExplorerStore } from '../store';
import type { FileNode, FolderNode } from '../types';
import { memo, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, FileBraces, FilePlusCorner, Folder, FolderOpen, FolderPlus, Pencil } from 'lucide-react';

type FileTreeProps = {
    nodeIds: string[];
};

export const FileTree = memo(function FileTree({ nodeIds }: FileTreeProps) {
    return (
        <div className="space-y-0.5">
            {nodeIds.map(nodeId => (
                <FileTreeNode key={nodeId} nodeId={nodeId} />
            ))}
        </div>
    );
});

type FileTreeNodeProps = {
    nodeId: string;
};

const FileTreeNode = memo(function FileTreeNode({ nodeId }: FileTreeNodeProps) {
    const node = useFileExplorerStore(state => state.nodes.get(nodeId));
    if (!node) return null;

    switch (node.type) {
        case 'file':
            return <FileItem node={node as FileNode} />;
        case 'folder':
            return <FolderItem node={node as FolderNode} />;
        default:
            return null;
    }
});

type FileItemProps = {
    node: FileNode;
};

const FileItem = memo(function FileItem({ node }: FileItemProps) {
    const renameNode = useFileExplorerStore(state => state.renameNode);
    const deleteNode = useFileExplorerStore(state => state.deleteNode);
    const addOpenFile = useFileExplorerStore(state => state.addOpenFile);
    const setActiveFile = useFileExplorerStore(state => state.setActiveFile);

    const [operationMode, setOperationMode] = useState<FileOperationMode>('none');
    const [isNameInputOpen, setIsNameInputOpen] = useState(false);

    const handleNameSubmit = (nextName: string) => {
        if (operationMode === 'rename') {
            renameNode(node.id, nextName);
            toast.success('Renamed successfully');
        }
        setIsNameInputOpen(false);
        setOperationMode('none');
    };

    const handleRenameClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsNameInputOpen(true);
        setOperationMode('rename');
    };

    const handleDelete = () => {
        deleteNode(node.id);
        toast.success('Deleted successfully');
    };

    const handleNameInputBlur = () => {
        setIsNameInputOpen(false);
    };

    const onFileClick = () => {
        console.log('Adding file to open files: ', node);
        addOpenFile(node.id);
        setActiveFile(node.id);
    };

    return (
        <div
            className={cn(
                'group flex h-7 cursor-pointer items-center justify-between gap-2 rounded-md px-2 text-sm',
                'hover:bg-accent/50',
            )}
        >
            {isNameInputOpen ? (
                <NodeNameInput
                    isOpen={isNameInputOpen}
                    onBlur={handleNameInputBlur}
                    onSubmit={handleNameSubmit}
                    defaultValue={node.name}
                />
            ) : (
                <div className="flex min-w-0 items-center gap-1.5" onClick={onFileClick}>
                    <FileBraces className="text-muted-foreground size-4" />
                    <span className="truncate">{node.name}</span>
                </div>
            )}

            <TreeItemActionBar isHidden={isNameInputOpen}>
                <Button variant="ghost" size="icon-xs" onClick={handleRenameClick}>
                    <Pencil />
                </Button>
                <DeleteDialog action={handleDelete} name={node.name} type={node.type} />
            </TreeItemActionBar>
        </div>
    );
});

type FolderItemProps = {
    node: FolderNode;
};

const FolderItem = memo(function FolderItem({ node }: FolderItemProps) {
    const [isOpen, setIsOpen] = useToggle();
    const createFile = useFileExplorerStore(state => state.createFile);
    const createFolder = useFileExplorerStore(state => state.createFolder);
    const renameNode = useFileExplorerStore(state => state.renameNode);
    const deleteNode = useFileExplorerStore(state => state.deleteNode);

    const [operationMode, setOperationMode] = useState<FolderOperationMode>('none');
    const [isNameInputOpen, setIsNameInputOpen] = useState(false);

    const handleCreateFileClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsOpen(true);
        setIsNameInputOpen(true);
        setOperationMode('create-file');
    };

    const handleCreateFolderClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsOpen(true);
        setIsNameInputOpen(true);
        setOperationMode('create-folder');
    };

    const handleRenameClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsNameInputOpen(true);
        setOperationMode('rename');
    };

    const handleNameSubmit = (name: string) => {
        if (operationMode === 'create-file') {
            createFile(node.id, name);
            toast.success('File created successfully');
        } else if (operationMode === 'create-folder') {
            createFolder(node.id, name);
            toast.success('Folder created successfully');
        } else if (operationMode === 'rename') {
            renameNode(node.id, name);
            toast.success('Renamed successfully');
        } else if (operationMode === 'delete') {
            deleteNode(node.id);
            toast.success('Deleted successfully');
        }
        setIsNameInputOpen(false);
        setOperationMode('none');
    };

    const handleNameInputBlur = () => {
        setIsNameInputOpen(false);
    };

    const FolderIcon = isOpen ? FolderOpen : Folder;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <div
                    className={cn(
                        'group flex h-7 w-full items-center justify-between gap-2 rounded-md px-2 text-sm',
                        'hover:bg-accent/50',
                    )}
                >
                    {isNameInputOpen && operationMode == 'rename' ? (
                        <NodeNameInput
                            isOpen={isNameInputOpen}
                            onBlur={handleNameInputBlur}
                            onSubmit={handleNameSubmit}
                            defaultValue={node.name}
                        />
                    ) : (
                        <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5">
                            <ChevronRight
                                className={cn(
                                    'text-muted-foreground size-4 transition-transform',
                                    isOpen && 'rotate-90',
                                )}
                            />
                            <FolderIcon className="text-muted-foreground size-4" />
                            <p className="truncate">{node.name}</p>
                        </div>
                    )}

                    <TreeItemActionBar isHidden={isNameInputOpen}>
                        <Button variant="ghost" size="icon-xs" onClick={handleCreateFileClick}>
                            <FilePlusCorner />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={handleCreateFolderClick}>
                            <FolderPlus />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={handleRenameClick}>
                            <Pencil />
                        </Button>
                        <DeleteDialog action={() => setOperationMode('delete')} name={node.name} type={node.type} />
                    </TreeItemActionBar>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-5">
                <NodeNameInput
                    isOpen={isNameInputOpen && operationMode != 'rename'}
                    onBlur={handleNameInputBlur}
                    onSubmit={handleNameSubmit}
                />
                <div className="border-border/50 mt-0.5 border-l pl-2">
                    <FileTree nodeIds={node.children} />
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
});

type FileOperationMode = 'none' | 'rename';
type FolderOperationMode = 'none' | 'create-file' | 'create-folder' | 'delete' | 'rename';

type TreeItemActionBarProps = {
    children: ReactNode;
    isHidden: boolean;
};

function TreeItemActionBar({ children, isHidden }: TreeItemActionBarProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-1 opacity-0 transition-opacity',
                'pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100',
                isHidden && '!hidden',
            )}
        >
            {children}
        </div>
    );
}

type NodeNameInputProps = {
    isOpen: boolean;
    onBlur: () => void;
    defaultValue?: string;
    onSubmit: (name: string) => void;
};

const NodeNameInput = ({ isOpen, onBlur, onSubmit, defaultValue }: NodeNameInputProps) => {
    const [inputValue, setInputValue] = useState(defaultValue || '');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(inputValue);
        setInputValue('');
    };

    if (!isOpen) return null;
    return (
        <div className="flex min-w-0 flex-1">
            <form className="w-full" onSubmit={handleSubmit}>
                <Input
                    type="text"
                    maxLength={25}
                    onBlur={onBlur}
                    autoFocus
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="bg-background h-7 px-2 text-sm"
                />
            </form>
        </div>
    );
};
