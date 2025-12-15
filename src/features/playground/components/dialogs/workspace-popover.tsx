import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { useToggle } from '@features/playground/hooks';
import { useFileSystem } from '@features/playground/store';
import { getWorkspaceNames } from '@features/playground/store/file-system';

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
import { Input } from '@/components/ui/input';

export function WorkspacePopover() {
    const [isOpen, toggleOpen] = useToggle();
    const fsTree = useFileSystem(state => state.fsTree);
    const selectedWorkspace = useFileSystem(state => state.selectedWorkspace);
    const selectWorkspace = useFileSystem(state => state.selectWorkspace);

    const workspaceNames = getWorkspaceNames(fsTree);

    return (
        <Popover open={isOpen} onOpenChange={toggleOpen}>
            <PopoverTrigger asChild>
                <Button variant="secondary" className="w-full justify-between gap-2 font-normal">
                    <span className="truncate">{selectedWorkspace ?? 'Select workspace'}</span>
                    <ChevronDown className="size-4 opacity-70" />
                </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-80 p-1">
                <div className="text-muted-foreground px-2 py-1.5 text-[11px] font-semibold tracking-wide uppercase">
                    Workspaces
                </div>

                <div className="max-h-64 overflow-auto px-1 pb-1">
                    {workspaceNames.length === 0 ? (
                        <div className="text-muted-foreground px-2 py-6 text-sm">No workspaces yet.</div>
                    ) : (
                        workspaceNames.map(name => {
                            const isSelected = name === selectedWorkspace;
                            return (
                                <Button
                                    key={name}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        'w-full justify-start gap-2 font-normal',
                                        isSelected && 'bg-accent text-accent-foreground hover:bg-accent',
                                    )}
                                    onClick={() => {
                                        selectWorkspace(name);
                                        toggleOpen(false);
                                    }}
                                >
                                    <Check className={cn('size-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                                    <span className="truncate">{name}</span>
                                </Button>
                            );
                        })
                    )}
                </div>

                <Separator className="my-1" />

                <div className="p-1">
                    <CreateWorkspaceDialog />
                </div>
            </PopoverContent>
        </Popover>
    );
}

function CreateWorkspaceDialog() {
    const [isOpen, toggleOpen] = useToggle(false);
    const [workspaceName, setWorkspaceName] = useState('');
    const createDir = useFileSystem(state => state.createDir);

    const handleCreateWorkspace = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!workspaceName) return;
        const workspaceNames = getWorkspaceNames(useFileSystem.getState().fsTree);
        if (workspaceNames.includes(workspaceName)) {
            toast.error('Workspace with this name already exists');
            return;
        }
        createDir('/.workspaces', workspaceName);
        toast.success('Workspace created successfully');
        setWorkspaceName('');
        toggleOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={toggleOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 font-normal">
                    <Plus className="size-4" />
                    New workspace…
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                    <DialogDescription>
                        Workspaces are a way to organize your files and projects separately. Create a new workspace to
                        get started.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateWorkspace} className="grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="workspace-name" className="text-sm font-medium">
                            Workspace name
                        </label>
                        <Input
                            id="workspace-name"
                            placeholder="my-workspace"
                            value={workspaceName}
                            onChange={e => setWorkspaceName(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="sm:flex-row sm:justify-end">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
