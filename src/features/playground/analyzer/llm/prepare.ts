import type { AnalyzeRequest } from '../types';
import type { ThinkingLevel } from './config';
import { buildSystemPrompt, buildUserPrompt } from './prompt';
import { AnalyzeRequestSchema } from './schema';

export type PreparedAnalyzePrompts = {
    systemPrompt: string;
    userPrompt: string;
    promptForValidation: string;
};

export function prepareAnalyzePrompts(
    input: AnalyzeRequest,
    thinkingLevel: ThinkingLevel,
): { ok: true; data: PreparedAnalyzePrompts } | { ok: false; error: unknown } {
    const parsed = AnalyzeRequestSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, error: parsed.error };
    }

    const systemPrompt = buildSystemPrompt(thinkingLevel);
    const userPrompt = buildUserPrompt(parsed.data);

    return {
        ok: true,
        data: {
            systemPrompt,
            userPrompt,
            promptForValidation: `${systemPrompt}\n\n${userPrompt}`,
        },
    };
}
