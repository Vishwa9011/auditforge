import Editor from '@monaco-editor/react';
import type { FileNode } from '../types';

type CodeEditorProps = {
    content?: string;
    fileId?: string;
    file: FileNode | null;
};

export function CodeEditor({ content }: CodeEditorProps) {
    function handleEditorValidation(markers: readonly { message: string }[]) {
        markers.forEach(marker => console.log('onValidate:', marker.message));
    }

    function handleEditorChange(value: string | undefined) {
        console.log('onChange:', value);
    }

    return (
        <div className="h-full w-full border-2 border-black ">
            <Editor
                height="100%"
                theme="vs-dark"
                defaultLanguage="javascript"
                defaultValue={content || ''}
                onValidate={handleEditorValidation}
                onChange={handleEditorChange}
                options={{
                    fontFamily: 'var(--font-mono)',
                    minimap: { enabled: true, autohide: 'none' },
                    fontLigatures: true,
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    wordWrap: 'on',
                    fontSize: 16,
                }}
            />
        </div>
    );
}
