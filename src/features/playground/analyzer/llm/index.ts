import { analyzeWithOllama } from './providers/ollama';
import { analyzeWithOpenAI } from './providers/openai';
import type { AnalyzeRequest, AnalyzeResult } from '../types';
import { useAnalyzerSettings } from '../store/analyzer-settings.store';
import { getDefaultModelSuggestion } from './config';

export async function analyzeWithLlm(input: AnalyzeRequest): Promise<AnalyzeResult> {
    const { provider, modelByProvider, thinkingLevel, openaiApiKey, ollamaHost } = useAnalyzerSettings.getState();
    const model = modelByProvider[provider]?.trim() || getDefaultModelSuggestion(provider).id.trim();
    switch (provider) {
        case 'ollama': {
            return await analyzeWithOllama(input, {
                host: ollamaHost,
                model,
                thinkingLevel,
            });
        }
        case 'openai': {
            return await analyzeWithOpenAI(input, {
                apiKey: openaiApiKey,
                model,
                thinkingLevel,
            });
        }
        default:
            throw new Error(`Unsupported LLM provider: ${provider}`);
    }
}

export const llm = analyzeWithLlm;
