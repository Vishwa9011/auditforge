import { Files, Import, User } from 'lucide-react';

export const navLinks = [
    {
        id: 'file-explorer',
        title: 'File Explorer',
        url: '/',
        icon: Files,
    },
    {
        id: 'import',
        title: 'Import',
        url: '/import',
        icon: Import,
    },
    {
        id: 'profile',
        title: 'Profile',
        url: '/profile',
        icon: User,
    },
] as const;
