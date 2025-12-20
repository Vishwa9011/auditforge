import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LlmProvider, ThinkingLevel } from '../llm/config';
import * as llmConfig from '../llm/config';

type AnalyzerSettingsState = {
    provider: LlmProvider;
    modelByProvider: Record<LlmProvider, string>;
    thinkingLevel: ThinkingLevel;

    openaiApiKey: string;
    ollamaHost: string;

    setProvider: (provider: LlmProvider) => void;
    setModel: (model: string) => void;
    setThinkingLevel: (level: ThinkingLevel) => void;
    setOpenaiApiKey: (apiKey: string) => void;
    setOllamaHost: (host: string) => void;
    reset: () => void;
};

const DEFAULT_MODEL_BY_PROVIDER: AnalyzerSettingsState['modelByProvider'] = {
    ollama: llmConfig.getDefaultModelSuggestion('ollama').id,
    openai: llmConfig.getDefaultModelSuggestion('openai').id,
};

const DEFAULTS: Pick<
    AnalyzerSettingsState,
    'provider' | 'modelByProvider' | 'thinkingLevel' | 'openaiApiKey' | 'ollamaHost'
> = {
    provider: llmConfig.DEFAULT_PROVIDER,
    modelByProvider: { ...DEFAULT_MODEL_BY_PROVIDER },
    thinkingLevel: llmConfig.getDefaultModelSuggestion(llmConfig.DEFAULT_PROVIDER).defaultThinkingLevel || 'low',
    openaiApiKey: '',
    ollamaHost: llmConfig.DEFAULT_OLLAMA_HOST,
};

export const useAnalyzerSettings = create<AnalyzerSettingsState>()(
    persist(
        immer((set, get) => ({
            ...DEFAULTS,

            setProvider: provider => {
                set(state => {
                    state.provider = provider;
                    const fallbackModelId = llmConfig.getDefaultModelSuggestion(provider).id.trim();
                    const modelId = state.modelByProvider[provider]?.trim() || fallbackModelId;
                    state.modelByProvider[provider] = modelId;
                    state.thinkingLevel = llmConfig.clampThinkingLevel(provider, modelId, state.thinkingLevel);
                });
            },

            setModel: model => {
                const { provider } = get();
                set(state => {
                    const normalized = model.trim();
                    const modelId = normalized || llmConfig.getDefaultModelSuggestion(provider).id.trim();
                    state.modelByProvider[provider] = modelId;
                    state.thinkingLevel = llmConfig.clampThinkingLevel(provider, modelId, state.thinkingLevel);
                });
            },

            setThinkingLevel: level => {
                const { provider, modelByProvider } = get();
                const modelId = modelByProvider[provider] ?? '';
                set(state => {
                    state.thinkingLevel = llmConfig.clampThinkingLevel(provider, modelId, level);
                });
            },

            setOpenaiApiKey: apiKey => {
                set(state => {
                    state.openaiApiKey = apiKey;
                });
            },

            setOllamaHost: host => {
                set(state => {
                    state.ollamaHost = host;
                });
            },

            reset: () => {
                set(state => {
                    state.provider = DEFAULTS.provider;
                    state.modelByProvider = { ...DEFAULT_MODEL_BY_PROVIDER };
                    state.thinkingLevel = DEFAULTS.thinkingLevel;
                    state.openaiApiKey = DEFAULTS.openaiApiKey;
                    state.ollamaHost = DEFAULTS.ollamaHost;
                });
            },
        })),
        {
            name: 'analyzer-settings',
            version: 2,
            storage: createJSONStorage(() => localStorage),
            migrate: (persistedState, version) => {
                if (version !== 1) return persistedState as AnalyzerSettingsState;

                const prev = persistedState as Partial<
                    Omit<AnalyzerSettingsState, 'modelByProvider'> & { model?: string }
                >;

                const provider = prev.provider ?? DEFAULTS.provider;
                const fallbackModelId = DEFAULT_MODEL_BY_PROVIDER[provider];
                const migratedModelId =
                    typeof prev.model === 'string' && prev.model.trim() ? prev.model.trim() : fallbackModelId;
                const modelByProvider: AnalyzerSettingsState['modelByProvider'] = {
                    ...DEFAULT_MODEL_BY_PROVIDER,
                    [provider]: migratedModelId,
                };

                const modelId = modelByProvider[provider] ?? '';
                const thinkingLevel = llmConfig.clampThinkingLevel(
                    provider,
                    modelId,
                    prev.thinkingLevel ?? DEFAULTS.thinkingLevel,
                );

                return {
                    ...DEFAULTS,
                    ...prev,
                    provider,
                    modelByProvider,
                    thinkingLevel,
                };
            },
        },
    ),
);
