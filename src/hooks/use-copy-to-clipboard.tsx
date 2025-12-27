import { useEffect, useRef, useState } from 'react';
import copy from 'copy-to-clipboard';

export function useCopyToClipboard() {
    const copiedRefTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [copyTick, setCopyTick] = useState(0);

    const copyToClipboard = (text: string) => {
        const success = copy(text);
        setIsCopied(success);
        if (success) setCopyTick(t => t + 1);
        return success;
    };

    useEffect(() => {
        if (!isCopied) return;
        if (copiedRefTimeout.current) {
            clearTimeout(copiedRefTimeout.current);
            copiedRefTimeout.current = null;
        }

        copiedRefTimeout.current = setTimeout(() => {
            setIsCopied(false);
            copiedRefTimeout.current = null;
        }, 2000);

        return () => {
            if (copiedRefTimeout.current) {
                clearTimeout(copiedRefTimeout.current);
                copiedRefTimeout.current = null;
            }
        };
    }, [isCopied, copyTick]);

    return { isCopied, copyToClipboard };
}
