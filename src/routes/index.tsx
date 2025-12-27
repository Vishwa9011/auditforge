import { createFileRoute } from '@tanstack/react-router';
import { FileExplorer } from '@features/playground/explorer';
import { OpenFileCommandDialog, PlaygroundLayout } from '@features/playground/components';
import { usePlaygroundShortcuts, useUiToggle, useUnsavedGuard } from '@features/playground/hooks';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export const Route = createFileRoute('/')({
    ssr: false,
    component: Index,
});

function Index() {
    useUnsavedGuard();
    usePlaygroundShortcuts();
    const { isEnabled, toggle } = useUiToggle('file-explorer-panel');
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <div className="h-full w-full overflow-hidden">
                <PlaygroundLayout />
                <Sheet open={isEnabled} onOpenChange={toggle}>
                    <SheetContent side="left" className="w-[min(80vw,26rem)] p-0 [&>button]:hidden">
                        <FileExplorer />
                    </SheetContent>
                </Sheet>
                <OpenFileCommandDialog />
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="min-h-0 min-w-0">
                <ResizablePanel
                    defaultSize={20}
                    minSize={15}
                    className="min-h-0 max-w-[70%] min-w-0"
                    hidden={!isEnabled}
                >
                    <FileExplorer />
                </ResizablePanel>
                <ResizableHandle hidden={!isEnabled} />
                <ResizablePanel defaultSize={80} className="min-h-0 w-full">
                    <PlaygroundLayout />
                </ResizablePanel>
            </ResizablePanelGroup>
            <OpenFileCommandDialog />
        </div>
    );
}
