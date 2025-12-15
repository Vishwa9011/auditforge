import { PlaygroundEditor } from '@features/playground/components/playground-editor';
import { PlaygroundHeader } from '@features/playground/components/playground-header';

export function PlaygroundLayout() {
    return (
        <div className="flex h-full w-full min-h-0 flex-col overflow-hidden">
            <PlaygroundHeader />
            <PlaygroundEditor />
        </div>
    );
}
