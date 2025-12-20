import { MAX_PROMPT_TOKENS_BY_PROVIDER, type LlmProvider } from './config';

function estimateTokensFromText(text: string): number {
    return Math.ceil(text.length / 4);
}

export function validatePromptSize(prompt: string, provider: LlmProvider) {
    const estimatedTokens = estimateTokensFromText(prompt);
    const maxTokenAllowed = MAX_PROMPT_TOKENS_BY_PROVIDER[provider];

    if (estimatedTokens > maxTokenAllowed) {
        return {
            ok: false,
            error: `Prompt exceeds the ${provider} limit (${maxTokenAllowed} tokens). Estimated: ${estimatedTokens} tokens (${prompt.length} chars).`,
        };
    }

    return { ok: true };
}
