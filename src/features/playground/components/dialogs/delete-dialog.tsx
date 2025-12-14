import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { TriangleAlert, Trash } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { InodeMeta } from '../../types';

type DeleteDialogProps = {
    type: InodeMeta['type'];
    name: string;
    action: () => void;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export function DeleteDialog({ type, name, action, onClick }: DeleteDialogProps) {
    const label = type === 'file' ? 'file' : 'folder';

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Delete ${label} ${name}`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={onClick}
                >
                    <Trash />
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="sm:max-w-sm">
                <div className="flex items-start gap-4">
                    <div className="bg-destructive/10 text-destructive mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md">
                        <TriangleAlert className="size-5" />
                    </div>

                    <AlertDialogHeader className="gap-1 text-left">
                        <AlertDialogTitle className="leading-6">Delete {label}?</AlertDialogTitle>
                        <AlertDialogDescription className="leading-5">
                            This action cannot be undone. This will permanently delete{' '}
                            <span className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                                {name}
                            </span>
                            {type === 'dir' ? ' and all of its contents.' : '.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </div>

                <AlertDialogFooter className="mt-2 flex-col gap-2 sm:flex-col sm:justify-start">
                    <AlertDialogCancel asChild>
                        <Button type="button" variant="secondary" className="w-full justify-center">
                            Cancel
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button type="button" variant="destructive" className="w-full justify-center" onClick={action}>
                            Delete {label}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
