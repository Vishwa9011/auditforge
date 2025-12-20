import type { AnalyzeRequest, AnalyzeResult } from '../types';
import { analyzeWithOllama } from './providers/ollama';
import { analyzeWithOpenAI } from './providers/openai';
import { getDefaultModel, type LlmProvider, type ThinkingLevel } from './config';
import { useAnalyzerSettings } from '../store/analyzer-settings.store';

export type LlmRunConfig = {
    provider: LlmProvider;
    model: string;
    thinkingLevel: ThinkingLevel;
    openai?: {
        apiKey?: string;
        baseURL?: string;
    };
    ollama?: {
        host?: string;
    };
};

export async function llm(input: AnalyzeRequest): Promise<AnalyzeResult> {
    const { provider, modelByProvider, thinkingLevel, openaiApiKey, ollamaHost } = useAnalyzerSettings.getState();

    const activeModel = modelByProvider[provider] || '';

    const config: LlmRunConfig = {
        provider,
        model: activeModel.trim() || getDefaultModel(provider),
        thinkingLevel,
        openai: {
            apiKey: openaiApiKey.trim() || undefined,
        },
        ollama: {
            host: ollamaHost.trim() || undefined,
        },
    };

    switch (config.provider) {
        case 'ollama': {
            return await analyzeWithOllama(input, {
                host: config.ollama?.host ?? 'http://localhost:11434',
                model: config.model,
                thinkingLevel: config.thinkingLevel,
            });
        }
        case 'openai': {
            return await analyzeWithOpenAI(input, {
                apiKey: config.openai?.apiKey,
                model: config.model,
                thinkingLevel: config.thinkingLevel,
            });
        }
        default:
            throw new Error(`Unsupported LLM: ${config.provider}`);
    }
}
