import OpenAI from 'openai';
import type { ThinkingLevel } from '../config';
import { AnalyzeResponseSchema } from '../schema';
import { validatePromptSize } from '../validation';
import { prepareAnalyzePrompts } from '../prepare';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { AnalyzeRequest, AnalyzeResult } from '../../types';

export type OpenAIProviderConfig = {
    apiKey?: string;
    model: string;
    thinkingLevel: ThinkingLevel;
};

function resolveOpenAiApiKey(explicitApiKey?: string): string | undefined {
    return explicitApiKey?.trim() || '';
}

export async function analyzeWithOpenAI(input: AnalyzeRequest, config: OpenAIProviderConfig): Promise<AnalyzeResult> {
    const prepared = prepareAnalyzePrompts(input, config.thinkingLevel);
    if (!prepared.ok) {
        return { ok: false, error: prepared.error };
    }

    const apiKey = resolveOpenAiApiKey(config.apiKey);
    if (!apiKey) {
        return {
            ok: false,
            error: 'Missing OpenAI API key. Please provide it in the settings.',
        };
    }

    const model = config.model.trim();
    if (!model) return { ok: false, error: 'Missing OpenAI model name' };

    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const promptCheck = validatePromptSize(prepared.data.promptForValidation, 'openai');
    if (!promptCheck.ok) {
        return { ok: false, error: promptCheck.error };
    }

    try {
        const response = await client.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: prepared.data.systemPrompt },
                { role: 'user', content: prepared.data.userPrompt },
            ],

            temperature: 0.1,
            response_format: zodResponseFormat(AnalyzeResponseSchema, 'analyze_response_schema'),
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return { ok: false, error: 'OpenAI returned an empty response' };

        let json: unknown;
        try {
            json = JSON.parse(content);
        } catch (error) {
            return { ok: false, error };
        }

        const parsed = AnalyzeResponseSchema.safeParse(json);
        if (!parsed.success) {
            return { ok: false, error: parsed.error };
        }

        return { ok: true, data: parsed.data };
    } catch (error) {
        return { ok: false, error };
    }
}
