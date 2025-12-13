import ActivityBar from '@/layout/activity-bar';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
    component: () => (
        <div className="flex h-screen">
            <ActivityBar />
            <Outlet />
            <TanStackRouterDevtools />
        </div>
    ),
});
