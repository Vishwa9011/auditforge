import { Analyzer } from './analyzer';
import { analyzeWithLlm } from '../llm';
import { useFileSystem } from '../../store';
import { readFileContent } from '../../lib';
import type { AnalyzeResult } from '../types';
import { AnalyzerHeader } from './analyzer-header';
import { useMutation } from '@tanstack/react-query';
import { resolveFilename, resolvePath } from '../../store/file-system';

export function AnalyzerLayout() {
    const { activeFile } = useFileSystem();

    const analyzeMutation = useMutation({
        mutationFn: async () => {
            if (!activeFile) {
                return {
                    ok: false,
                    error: 'No active file to analyze.' as any,
                } as AnalyzeResult;
            }
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
    });

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="shrink-0">
                <AnalyzerHeader isAnalyzing={analyzeMutation.isPending} onAnalyze={analyzeMutation.mutate} />
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
                <Analyzer
                    isPending={analyzeMutation.isPending}
                    isError={analyzeMutation.isError}
                    data={analyzeMutation.data}
                    error={analyzeMutation.error}
                />
            </div>
        </div>
    );
}
