import { MAX_TOKENS_LIMIT, type LlmProvider } from './config';

export function validatePromptSize(prompt: string, llm: LlmProvider) {
    const promptLength = prompt.length;

    const maxTokenAllowed = MAX_TOKENS_LIMIT[llm];

    if (promptLength > maxTokenAllowed) {
        return {
            ok: false,
            error: `Prompt size exceeds the maximum token limit of ${maxTokenAllowed} for ${llm} provider. Current size: ${promptLength} tokens. Please reduce the prompt size.`,
        };
    }

    return { ok: true };
}
