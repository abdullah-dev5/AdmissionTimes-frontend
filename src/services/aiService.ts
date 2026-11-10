import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { AiChatResponse, AiCompareResponse, AiSummarizeResponse } from '../types/api';

export interface ChatHistoryEntry {
  role: 'user' | 'assistant' | 'ai'
  text: string
}

export const aiService = {
  chat: async (
    message: string,
    conversationContext?: string,
    history?: ChatHistoryEntry[]
  ): Promise<ApiResponse<AiChatResponse>> => {
    // The backend merges the page context with the history; send each once.
    const conversationHistory = history
      ?.map((entry) => ({ role: entry.role === 'ai' ? 'assistant' : entry.role, text: entry.text.trim().slice(0, 500) }))
      .filter((entry) => entry.text)
      .slice(-8)

    const response = await apiClient.post(
      '/ai/chat',
      {
        message,
        conversation_context: conversationContext?.trim().slice(0, 3000) || undefined,
        conversation_history: conversationHistory?.length ? conversationHistory : undefined,
      },
      { timeout: 60000 }
    )
    return response.data
  },

  summarize: async (rawText: string, sourceType: 'pdf' | 'manual' = 'manual'): Promise<ApiResponse<AiSummarizeResponse>> => {
    const response = await apiClient.post(
      '/ai/summarize',
      {
        raw_text: rawText,
        source_type: sourceType,
      },
      { timeout: 60000 }
    );
    return response.data;
  },

  comparePrograms: async (
    admissionIds: string[],
    focus?: string
  ): Promise<ApiResponse<AiCompareResponse>> => {
    const response = await apiClient.post(
      '/ai/compare',
      {
        admission_ids: admissionIds,
        focus: focus?.trim() || undefined,
      },
      { timeout: 60000 }
    );
    return response.data;
  },

  health: async () => {
    const response = await apiClient.get('/ai/health');
    return response.data;
  },
};

export default aiService;
