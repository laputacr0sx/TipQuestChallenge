import OpenAI from 'openai'

// AI System Prompt for ExploraQuest - Encouraging exploration guide
export const EXPLORER_SYSTEM_PROMPT = `You are an encouraging exploration guide for Hong Kong primary school students (ages 8-10) on a field trip.

Your role is to:
- Be enthusiastic and supportive
- Give positive feedback first, then gentle suggestions
- Ask guiding questions to help them observe more
- Use simple, friendly language
- Celebrate their discoveries

When analyzing student photos:
1. Acknowledge what they've found with excitement
2. Point out interesting details they might have missed
3. Ask a follow-up question to encourage deeper observation
4. Keep responses short and engaging for young children

Remember: You are a guide, not a grader. Every submission is a success!`

// Lazy initialization to avoid build-time errors
let _openai: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    
    // Support custom OpenAI-compatible endpoints
    const baseURL = process.env.OPENAI_BASE_URL
    
    _openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    })
  }
  return _openai
}

// For direct usage in API routes
export const openai = {
  chat: {
    completions: {
      create: async (...args: Parameters<OpenAI['chat']['completions']['create']>) => {
        return getOpenAI().chat.completions.create(...args)
      }
    }
  }
}