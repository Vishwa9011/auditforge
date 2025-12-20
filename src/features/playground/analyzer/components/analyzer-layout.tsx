import { analyzeWithLlm } from '../llm';
import { useState } from 'react';
import { Analyzer } from './analyzer';
import { useFileSystem } from '../../store';
import { readFileContent } from '../../lib';
import type { AnalyzeResult } from '../types';
import { AnalyzerHeader } from './analyzer-header';
import { useMutation } from '@tanstack/react-query';
import { resolveFilename, resolvePath } from '../../store/file-system';

export function AnalyzerLayout() {
    const [data, setData] = useState<AnalyzeResult | null>(null);
    const { activeFile } = useFileSystem();

    const analyzeMutation = useMutation({
        mutationFn: async () => {
            if (!activeFile) return;
            const r = resolvePath(activeFile);
            if (r.kind !== 'found') {
                console.error('File not found in FS:', activeFile);
                return;
            }

            const fileContent = await readFileContent(r.meta.ino);

            const res = await analyzeWithLlm({
                language: 'solidity',
                scope: 'file',
                file: {
                    name: resolveFilename(activeFile) || 'unknown.sol',
                    content: fileContent,
                },
            });

            return res;
        },

        onSuccess: data => {
            setData(data as AnalyzeResult);
            console.log('Analysis result:', data);
        },
        onError: error => {
            console.error('Analysis error:', error);
        },
    });

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="shrink-0">
                <AnalyzerHeader isAnalyzing={analyzeMutation.isPending} onAnalyze={analyzeMutation.mutate} />
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
                <Analyzer isAnalyzing={analyzeMutation.isPending} data={data} />
            </div>
        </div>
    );
}
