// Vitest setup file
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock environment
vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          execute: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }),
  })),
  getSupabaseAdmin: vi.fn(() => null),
}))

vi.mock('@/lib/openai', () => ({
  getOpenAI: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '[]' } }]
        })
      }
    }
  })),
  getModelName: vi.fn(() => 'gpt-4o-mini'),
  EXPLORER_SYSTEM_PROMPT: 'You are an encouraging guide...',
}))