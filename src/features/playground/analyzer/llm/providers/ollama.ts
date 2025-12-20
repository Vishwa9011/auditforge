import { Ollama } from 'ollama/browser';
import type { ThinkingLevel } from '../config';
import type { AnalyzeRequest, AnalyzeResult } from '../../types';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AnalyzeResponseSchema } from '../schema';
import { validatePromptSize } from '../validation';
import { prepareAnalyzePrompts } from '../prepare';

export type OllamaProviderConfig = {
    host: string;
    model: string;
    thinkingLevel: ThinkingLevel;
};

const clientsByHost = new Map<string, Ollama>();
function getOllamaClient(host: string): Ollama {
    const normalizedHost = host.trim().replace(/\/+$/, '');
    const existing = clientsByHost.get(normalizedHost);
    if (existing) return existing;
    const created = new Ollama({ host: normalizedHost });
    clientsByHost.set(normalizedHost, created);
    return created;
}

export const analyzeWithOllama = async (
    input: AnalyzeRequest,
    config: OllamaProviderConfig,
): Promise<AnalyzeResult> => {
    const prepared = prepareAnalyzePrompts(input, config.thinkingLevel);
    if (!prepared.ok) {
        return { ok: false, error: prepared.error };
    }

    const host = config.host.trim();
    const model = config.model.trim();
    if (!host) return { ok: false, error: 'Missing Ollama host' };
    if (!model) return { ok: false, error: 'Missing Ollama model name' };

    const promptCheck = validatePromptSize(prepared.data.promptForValidation, 'ollama');
    if (!promptCheck.ok) {
        return { ok: false, error: promptCheck.error };
    }

    let response;
    try {
        response = await getOllamaClient(host).chat({
            model,
            messages: [
                { role: 'system', content: prepared.data.systemPrompt },
                { role: 'user', content: prepared.data.userPrompt },
            ],
            format: zodToJsonSchema(AnalyzeResponseSchema),
            options: {
                temperature: 0.1,
            },
        });
    } catch (error) {
        return { ok: false, error };
    }

    let json: unknown;
    try {
        json = JSON.parse(response.message.content);
    } catch {
        return { ok: false, error: 'Model did not return valid JSON' };
    }

    const parsedResponse = AnalyzeResponseSchema.safeParse(json);
    if (!parsedResponse.success) {
        return { ok: false, error: parsedResponse.error };
    }

    return { ok: true, data: parsedResponse.data };
};
