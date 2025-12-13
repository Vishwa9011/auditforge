import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { NodeType } from '../types';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

type DeleteDialogProps = {
    type: NodeType;
    name: string;
    action: () => void;
};

export function DeleteDialog({ type, name, action }: DeleteDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'ghost'} size={'icon-xs'}>
                    <Trash />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your file
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button type="submit" onClick={action}>
                        Yes, delete <code>{name}</code> {type == 'file' ? 'file' : 'folder'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
