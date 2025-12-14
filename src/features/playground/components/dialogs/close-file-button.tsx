import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { InodeMeta } from '../../types';
import { useFileExplorerStore, useFileSystem } from '../../store';
import { useToggle } from '../../hooks';
import { X } from 'lucide-react';
import { writeFileContent } from '../../lib';
import { useMemo, useState, type MouseEvent } from 'react';
import { resolveFilename } from '../../store/file-system';

type CloseFileButtonProps = InodeMeta & { path: string; name?: string };

export function CloseFileButton({ ino, path, name }: CloseFileButtonProps) {
    const [isAlertOpen, setIsAlertOpen] = useToggle(false);
    const [isSaving, setIsSaving] = useState(false);
    const closeFile = useFileSystem(state => state.closeFile);
    const draftContent = useFileExplorerStore(state => state.files.get(ino)?.content || '');
    const isDirty = useFileExplorerStore(state => state.changedInos.has(ino));
    const markFileClean = useFileExplorerStore(state => state.removeInoFromChanged);

    const displayName = useMemo(() => name ?? resolveFilename(path) ?? 'this file', [name, path]);

    const requestClose = () => {
        if (isDirty) {
            setIsAlertOpen(true);
        } else {
            closeFile(path);
        }
    };

    const handleSaveChanges = async (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        setIsSaving(true);
        try {
            await writeFileContent(ino, draftContent);
            markFileClean(ino);
            closeFile(path);
            setIsAlertOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscardChanges = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        markFileClean(ino);
        closeFile(path);
        setIsAlertOpen(false);
    };

    return (
        <>
            <Button
                size="icon"
                variant="ghost"
                className="group hover:!bg-accent/80 h-5 w-5 rounded"
                title="Close file"
                aria-label="Close file"
                onPointerDown={event => event.stopPropagation()}
                onClick={event => {
                    event.stopPropagation();
                    requestClose();
                }}
            >
                <span
                    className={
                        isDirty
                            ? 'bg-foreground size-2 rounded-full group-hover:hidden'
                            : 'bg-foreground hidden size-2 rounded-full'
                    }
                />
                <X className={isDirty ? 'hidden size-3 group-hover:block' : 'block size-3'} />
            </Button>

            <AlertDialog
                open={isAlertOpen}
                onOpenChange={nextOpen => {
                    if (isSaving) return;
                    setIsAlertOpen(nextOpen);
                }}
            >
                <AlertDialogContent onPointerDown={event => event.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Save changes to {displayName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your changes will be lost if you don&apos;t save them.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button variant="secondary" disabled={isSaving} onClick={e => e.stopPropagation()}>
                                Keep editing
                            </Button>
                        </AlertDialogCancel>

                        <Button variant="destructive" disabled={isSaving} onClick={handleDiscardChanges}>
                            Discard
                        </Button>

                        <AlertDialogAction asChild>
                            <Button disabled={isSaving} onClick={handleSaveChanges}>
                                {isSaving ? 'Saving…' : 'Save'}
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
