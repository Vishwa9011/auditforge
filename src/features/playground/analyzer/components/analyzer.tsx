import type { AnalyzeResult } from '../types';
import { AnalysisReport } from './report/report';
import { AnalyzerEmptyState, AnalyzerErrorState, AnalyzerLoadingState } from './analyzer-states';

type AnalyzerProps = {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    data?: AnalyzeResult;
};

export function Analyzer({ data, isPending }: AnalyzerProps) {
    if (isPending && !data) {
        return <AnalyzerLoadingState />;
    }

    if (!data) {
        return <AnalyzerEmptyState />;
    }

    if (!data.ok) {
        return <AnalyzerErrorState error={data.error} />;
    }

    return <AnalysisReport data={data.data} />;
}
