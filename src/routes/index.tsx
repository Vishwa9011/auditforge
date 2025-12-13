import { createFileRoute } from '@tanstack/react-router';
import { FileExplorer, PlaygroundLayout } from '@/features/playground/components';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    return (
        <div className="w-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} className="max-w-72">
                    <FileExplorer />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={80} className="w-full">
                    <PlaygroundLayout />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
