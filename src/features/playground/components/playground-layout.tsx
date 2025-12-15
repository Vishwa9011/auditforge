import { PlaygroundEditor } from '@features/playground/components/playground-editor';
import { PlaygroundHeader } from '@features/playground/components/playground-header';

export function PlaygroundLayout() {
    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
            <PlaygroundHeader />
            <PlaygroundEditor />
        </div>
    );
}
