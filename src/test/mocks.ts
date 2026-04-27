// Mock implementations for Supabase and OpenAI
// These mocks are used across all API tests

import { vi } from 'vitest'

// Mock data stores
export const mockTrips = new Map()
export const mockMissions = new Map()
export const mockResults = new Map()

// Reset all mock data
export function resetMockData() {
  mockTrips.clear()
  mockMissions.clear()
  mockResults.clear()
}

// Mock Supabase client
export function createMockSupabase() {
  const trips = new Map()
  const missions = new Map()
  const results = new Map()
  
  return {
    from: (table: string) => {
      const insert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          execute: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        execute: vi.fn().mockResolvedValue({ data: [], error: null }),
      })
      
      const select = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            execute: vi.fn().mockResolvedValue({ data: [], error: null }),
            order: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
          order: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
        in: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      })
      
      const update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })
      
      return {
        insert,
        select,
        update,
        // Add methods for different operations
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          execute: vi.fn().mockResolvedValue({ data: [], error: null }),
          order: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.url' } }),
      }),
    },
  }
}

// Mock OpenAI client
export function createMockOpenAI() {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify([
                { title: "Test Mission 1", objective: "Find something interesting" },
                { title: "Test Mission 2", objective: "Take a photo of nature" },
              ])
            }
          }]
        })
      }
    }
  }
}

// Mock environment variables
export function mockEnvVars() {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
  vi.stubEnv('OPENAI_API_KEY', 'test-openai-key')
  vi.stubEnv('OPENAI_BASE_URL', 'https://api.openai.com/v1')
  vi.stubEnv('OPENAI_MODEL', 'gpt-4o-mini')
}

// Helper to create a Next.js request object
export function createMockRequest(body: any = {}) {
  return {
    json: vi.fn().mockResolvedValue(body),
    formData: vi.fn().mockResolvedValue(new FormData()),
  }
}