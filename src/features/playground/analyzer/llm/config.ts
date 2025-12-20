export const LLM_PROVIDERS = ['ollama', 'openai'] as const;
export type LlmProvider = (typeof LLM_PROVIDERS)[number];

export const THINKING_LEVELS = ['low', 'medium', 'high'] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

export const MAX_TOKENS_LIMIT: Record<LlmProvider, number> = {
    ollama: 10_000,
    openai: 32_000,
};

export type ModelSuggestion = {
    id: string;
    label: string;
    selected?: boolean;
    provider: LlmProvider;
    allowedThinkingLevels?: ThinkingLevel[];
    defaultThinkingLevel?: ThinkingLevel;
};

export const MODEL_SUGGESTIONS: Record<LlmProvider, ModelSuggestion[]> = {
    ollama: [
        { id: 'codellama:7b', label: 'Codellama (7b)', provider: 'ollama', selected: true },
        { id: 'llama3.1:8b', label: 'Llama 3.1 (8B)', provider: 'ollama' },
        { id: 'llama3.2:3b', label: 'Llama 3.2 (3B)', provider: 'ollama', allowedThinkingLevels: ['low', 'medium'] },
        { id: 'qwen2.5:7b', label: 'Qwen 2.5 (7B)', provider: 'ollama' },
        { id: 'deepseek-r1:7b', label: 'DeepSeek R1 (7B)', provider: 'ollama' },
    ],
    openai: [
        { id: 'gpt-4o-mini', label: 'GPT-4o mini', provider: 'openai', selected: true },
        { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
        { id: 'gpt-5.2', label: 'GPT-5.2', provider: 'openai' },
    ],
};

export function getDefaultModel(provider: LlmProvider): string {
    const selected = MODEL_SUGGESTIONS[provider].find(m => m.selected);
    switch (provider) {
        case 'ollama':
            return selected?.id || 'llama3.1:8b';
        case 'openai':
            return selected?.id || 'gpt-4o-mini';
    }
}

export function getAllowedThinkingLevels(provider: LlmProvider, model: string): ThinkingLevel[] {
    const suggestion = MODEL_SUGGESTIONS[provider].find(m => m.id === model);
    return suggestion?.allowedThinkingLevels ?? [...THINKING_LEVELS];
}

export function clampThinkingLevel(provider: LlmProvider, model: string, thinkingLevel: ThinkingLevel): ThinkingLevel {
    const allowed = getAllowedThinkingLevels(provider, model);
    return allowed.includes(thinkingLevel) ? thinkingLevel : (allowed[0] ?? 'medium');
}
