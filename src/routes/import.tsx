import { ContractImport } from '@/features/contract-import/components';
import { Learning } from '@/features/contract-import/components/learning';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/import')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="h-dvh w-full overflow-auto">
            <ContractImport />
            <Learning />
        </div>
    );
}
