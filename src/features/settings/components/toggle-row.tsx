import { Switch } from '@/components/ui/switch';

type ToggleRowProps = {
    label: string;
    checked: boolean;
    description: string;
    onCheckedChange: (checked: boolean) => void;
};

export function ToggleRow({ label, description, checked, onCheckedChange }: ToggleRowProps) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-muted-foreground text-xs">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}
