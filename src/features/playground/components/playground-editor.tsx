import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { CodeEditor } from './code-editor';
import { useFileExplorerStore } from '../store';
import type { FileNode } from '../types';

export function PlaygroundEditor() {
    const activeFile = useFileExplorerStore(state => {
        if (!state.activeFileId) return null;
        return (state.nodes.get(state.activeFileId) as FileNode | undefined) ?? null;
    });
    return (
        <div className="h-full w-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <CodeEditor file={activeFile} content={activeFile?.content} fileId={activeFile?.id} />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <div className="h-full w-full bg-black p-4">Preview Area</div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
