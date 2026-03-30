import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { AiChatResponse, AiSummarizeResponse } from '../types/api';

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
    let fullContext = conversationContext || ''
    if (history && history.length > 0) {
      const historyStr = history
        .slice(-8)
        .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text.slice(0, 200)}`)
        .join('\n')
      fullContext = fullContext ? `${fullContext}\nRecent messages:\n${historyStr}` : `Recent messages:\n${historyStr}`
    }

    const conversationHistory = history?.slice(-8).map((entry) => ({
      role: entry.role === 'ai' ? 'assistant' : entry.role,
      text: entry.text.slice(0, 500),
    }))

    const response = await apiClient.post('/ai/chat', {
      message,
      conversation_context: fullContext.slice(0, 3000) || undefined,
      conversation_history: conversationHistory,
    })
    return response.data
  },

  summarize: async (rawText: string, sourceType: 'pdf' | 'manual' = 'manual'): Promise<ApiResponse<AiSummarizeResponse>> => {
    const response = await apiClient.post('/ai/summarize', {
      raw_text: rawText,
      source_type: sourceType,
    });
    return response.data;
  },

  health: async () => {
    const response = await apiClient.get('/ai/health');
    return response.data;
  },
};

export default aiService;
