import { useFileExplorerStore } from '../store';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { FileNode } from '../types';
import { Button } from '@/components/ui/button';
import { Bot, Save, SaveAll, Sidebar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlaygroundHeader() {
    const { openFiles, activeFileId, nodes } = useFileExplorerStore(
        useShallow(state => ({
            openFiles: state.openFiles,
            activeFileId: state.activeFileId,
            nodes: state.nodes,
        })),
    );

    const activeFiles = useMemo(() => {
        if (openFiles.size === 0) return [];

        return Array.from(openFiles)
            .map(fileId => nodes.get(fileId))
            .filter((node): node is FileNode => node?.type === 'file');
    }, [nodes, openFiles]);

    return (
        <header className="">
            <div className="flex h-10 items-center justify-between border-b px-2">
                <Button variant={'ghost'} size={'icon-sm'}>
                    <Sidebar className="size-4" />
                </Button>

                <div className="flex h-full shrink-0 items-center gap-1 px-2">
                    <Button variant="ghost" className="h-6 gap-1 !px-2">
                        <Save className="size-3.5" />
                        <span className="text-xs">Save</span>
                    </Button>

                    <Button variant="ghost" className="h-6 gap-1 !px-2">
                        <SaveAll className="size-3.5" />
                        <span className="text-xs">Save All</span>
                    </Button>

                    <Button variant="ghost" className="h-6 gap-1 !px-2">
                        <Bot className="size-3.5" />
                        <span className="text-xs">Analyze</span>
                    </Button>
                </div>
            </div>
            <div className="flex h-8 items-center overflow-hidden border-b">
                <div className="h-full min-w-0 flex-1">
                    <div className="scroll-thin flex h-full items-center overflow-x-auto overflow-y-hidden ">
                        {activeFiles.map(file => (
                            <div
                                key={file.id}
                                className={cn(
                                    'hover:bg-accent/50 flex h-full cursor-pointer items-center gap-1 border-r px-2 whitespace-nowrap',
                                    file.id === activeFileId && 'bg-accent/50 font-semibold',
                                )}
                            >
                                <span className="text-sm">{file.name}</span>
                                <Button variant="ghost" size="icon" className="hover:!bg-accent/80 h-5 w-5">
                                    <X className="size-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
