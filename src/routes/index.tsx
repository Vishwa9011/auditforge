import { createFileRoute } from '@tanstack/react-router';
import { FileExplorer, PlaygroundLayout } from '@features/playground/components';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useUiToggle } from '@features/playground/hooks/use-ui-toggle';
import { useSaveShortcut } from '@/features/playground/hooks';
import { useUnsavedGuard } from '@/features/playground/hooks/use-unsaved-guard';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    useSaveShortcut();
    useUnsavedGuard();
    const { isEnabled } = useUiToggle('file-explorer-panel');

    return (
        <div className="h-dvh w-full overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="min-h-0">
                <ResizablePanel defaultSize={20} className="min-h-0 max-w-72" hidden={!isEnabled}>
                    <FileExplorer />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={80} className="min-h-0 w-full">
                    <PlaygroundLayout />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
