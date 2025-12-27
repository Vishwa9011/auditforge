import { createServerFn } from '@tanstack/react-start';
import { zodResponseFormat } from 'openai/helpers/zod';

import { AnalyzeResponseSchema } from '../schema';

type OpenAiAnalyzeInput = {
    apiKey: string;
    model: string;
    systemPrompt: string;
    userPrompt: string;
};

export const openAiAnalyzeServerFn = createServerFn({ method: 'POST' })
    .inputValidator((input: OpenAiAnalyzeInput) => {
        const apiKey = input.apiKey?.trim();
        const model = input.model?.trim();
        const systemPrompt = input.systemPrompt ?? '';
        const userPrompt = input.userPrompt ?? '';

        if (!apiKey) throw new Error('Missing OpenAI API key');
        if (!model) throw new Error('Missing OpenAI model name');
        if (!systemPrompt || !userPrompt) throw new Error('Missing prompts');

        return { apiKey, model, systemPrompt, userPrompt };
    })
    .handler(async ({ data }) => {
        const OpenAI = (await import('openai')).default;

        const client = new OpenAI({ apiKey: data.apiKey });
        const response = await client.chat.completions.create({
            model: data.model,
            messages: [
                { role: 'system', content: data.systemPrompt },
                { role: 'user', content: data.userPrompt },
            ],
            temperature: 0.1,
            response_format: zodResponseFormat(AnalyzeResponseSchema, 'analyze_response_schema'),
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('OpenAI returned an empty response');

        return { content };
    });
