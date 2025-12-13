import { PlaygroundEditor } from './playground-editor';
import { PlaygroundHeader } from './playground-header';

export function PlaygroundLayout() {
    return (
        <div className="flex h-full w-full flex-col">
            <PlaygroundHeader />
            <PlaygroundEditor />
        </div>
    );
}
