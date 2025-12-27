import ActivityBar from '@/layout/activity-bar';
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';
import { useGlobalShortcuts } from '@/hooks/use-global-shortcuts';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/queryClient';
import { Toaster } from '@/components/ui/sonner';

import appCss from '../index.css?url';

export const Route = createRootRoute({
    ssr: false,
    head: () => ({
        meta: [
            { charSet: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
            { title: 'AuditForge' },
        ],
        links: [
            { rel: 'icon', href: '/favicon.ico', media: '(prefers-color-scheme: light)' },
            { rel: 'icon', href: '/favicon-dark.ico', media: '(prefers-color-scheme: dark)' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Geist:wght@100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap',
            },
            { rel: 'stylesheet', href: appCss },
        ],
    }),
    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
                    <QueryClientProvider client={queryClient}>
                        <AppFrame>{children}</AppFrame>
                        <Toaster />
                        <TanStackRouterDevtools />
                    </QueryClientProvider>
                </ThemeProvider>
                <Scripts />
            </body>
        </html>
    );
}

function AppFrame({ children }: { children: React.ReactNode }) {
    useGlobalShortcuts();
    return (
        <div className="flex h-dvh w-full overflow-hidden">
            <ActivityBar />
            <div className="min-h-0 min-w-0 flex-1">{children}</div>
        </div>
    );
}
