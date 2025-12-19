import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMemo, type KeyboardEvent } from 'react';
import { useFileSystem } from '@features/playground/store';
import type { InodeMeta } from '@features/playground/types';
import FileIcon from '@features/playground/components/file-icon';
import { CloseFileButton } from '@features/playground/components/dialogs';
import { CloseAllFilesButton } from '@features/playground/components/dialogs';
import { getFileExtension, resolveFilename, resolvePath } from '@features/playground/store/file-system';

type OpenFileTab = InodeMeta & { path: string; name: string };

type EditorTabProps = {
    file: OpenFileTab;
    isActive: boolean;
    onActivate: (path: string) => void;
};

function EditorTab({ file, isActive, onActivate }: EditorTabProps) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onActivate(file.path);
        }
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    className={cn(
                        'group relative flex h-full cursor-pointer items-center gap-2 border-r pr-2 pl-3 whitespace-nowrap',
                        isActive ? 'bg-accent/50 text-foreground' : 'text-muted-foreground',
                    )}
                    onClick={() => onActivate(file.path)}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                >
                    <FileIcon className="size-4" extension={getFileExtension(file.path)} />
                    <span className={cn('max-w-48 truncate text-xs', isActive && 'font-semibold')}>{file.name}</span>
                    <CloseFileButton {...file} />
                    {isActive && <span className="bg-sidebar-primary absolute inset-x-0 top-0 h-px" />}
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" sideOffset={2} className="max-w-96 break-all">
                <span className="text-muted-foreground font-mono text-[11px]">{file.path}</span>
            </TooltipContent>
        </Tooltip>
    );
}

export function EditorTabs() {
    const fsTree = useFileSystem(state => state.fsTree);
    const openFiles = useFileSystem(state => state.openFiles);
    const activeFile = useFileSystem(state => state.activeFile);
    const setActiveFile = useFileSystem(state => state.setActiveFile);

    const openFileTabs = useMemo(() => {
        const tabs: OpenFileTab[] = [];

        for (const filePath of openFiles) {
            const resolved = resolvePath(filePath, fsTree);
            if (resolved.kind !== 'found') continue;
            tabs.push({
                ...resolved.meta,
                path: filePath,
                name: resolveFilename(filePath) || 'untitled',
            });
        }

        return tabs;
    }, [openFiles, fsTree]);

    return (
        <div className="flex h-10 items-stretch overflow-hidden border-b">
            <div className="h-full min-w-0 flex-1">
                <div
                    role="tablist"
                    aria-label="Open files"
                    className="scroll-thin flex h-full w-full min-w-0 items-center overflow-x-auto overflow-y-hidden" // scroll-gutter & overflow-x-scroll class when you don't want bounce
                >
                    {openFileTabs.map(file => {
                        const isActive = file.path === activeFile;
                        return <EditorTab key={file.path} file={file} isActive={isActive} onActivate={setActiveFile} />;
                    })}
                </div>
            </div>
            <div className="flex h-full shrink-0 items-center gap-1 border-l px-2">
                <CloseAllFilesButton />
            </div>
        </div>
    );
}
