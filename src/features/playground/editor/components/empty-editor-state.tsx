export function EmptyEditorState() {
    return (
        <div className="bg-accent/10 pointer-events-none flex h-full min-h-0 items-center justify-center">
            <div className="text-muted-foreground flex flex-col items-center gap-3">
                <img src="/logo.png" alt="No file open" className="pointer-events-none w-92 opacity-40" />

                <p className="text-sm">No file is open</p>

                <div className="text-muted-foreground/60 pointer-events-none mt-2 flex gap-4 text-xs">
                    <span>⌘P Open file</span>
                    <span>⌘N New file</span>
                </div>
            </div>
        </div>
    );
}
