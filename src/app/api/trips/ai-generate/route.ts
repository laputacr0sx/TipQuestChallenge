import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI, getModelName, EXPLORER_SYSTEM_PROMPT } from '@/lib/openai'
import { getSupabaseAdmin } from '@/lib/supabase'

// Fallback mission templates for common destinations
const FALLBACK_MISSIONS: Record<string, { title: string; objective: string }[]> = {
  museum: [
    { title: "Artifact Hunter", objective: "Find an artifact over 100 years old" },
    { title: "Color Detective", objective: "Photograph something with 3 different colors" },
    { title: "Ancient Story", objective: "Find an item that tells a story from long ago" },
    { title: "Pattern Seeker", objective: "Discover a repeating pattern in the exhibits" },
    { title: "Size Compare", objective: "Find something much bigger than your hand" },
  ],
  science: [
    { title: "Experiment Explorer", objective: "Find a hands-on experiment you can try" },
    { title: "Future Tech", objective: "Discover something from the future" },
    { title: "Light & Sound", objective: "Find something that uses light or sound" },
    { title: "Natural Wonder", objective: "Photograph something from nature" },
    { title: "Space Explorer", objective: "Find something from space or the stars" },
  ],
  nature: [
    { title: "Bug Detective", objective: "Find evidence of insects or small creatures" },
    { title: "Leaf Collector", objective: "Photograph 3 different types of leaves" },
    { title: "Bird Watcher", objective: "Spot and photograph a bird" },
    { title: "Flower Finder", objective: "Find a flower and count its petals" },
    { title: "Nature's Colors", objective: "Photograph something in each rainbow color" },
  ],
  default: [
    { title: "Curious Explorer", objective: "Find something that makes you say 'wow!'" },
    { title: "Photo Challenge", objective: "Take a photo of something interesting" },
    { title: "Question Finder", objective: "Find something you want to learn more about" },
    { title: "Detail Detective", objective: "Photograph something with interesting details" },
    { title: "Memory Maker", objective: "Find your favorite thing at this place" },
  ]
}

function getFallbackMissions(destination: string, topic: string): { title: string; objective: string }[] {
  const destLower = (destination + ' ' + topic).toLowerCase()
  
  if (destLower.includes('museum') || destLower.includes('history') || destLower.includes('art')) {
    return FALLBACK_MISSIONS.museum
  }
  if (destLower.includes('science') || destLower.includes('technology') || destLower.includes('tech')) {
    return FALLBACK_MISSIONS.science
  }
  if (destLower.includes('nature') || destLower.includes('park') || destLower.includes('garden') || destLower.includes('zoo')) {
    return FALLBACK_MISSIONS.nature
  }
  return FALLBACK_MISSIONS.default
}

// Add timeout wrapper
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: NodeJS.Timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('AI request timed out')), ms)
  })
  
  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    clearTimeout(timeoutId!)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripId, destination, topic, customInstructions } = body

    if (!tripId || !destination) {
      return NextResponse.json(
        { error: 'Trip ID and destination are required.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      )
    }

    // Build the prompt for mission generation
    const missionPrompt = `Generate 5-7 educational missions for primary school students (ages 8-10) at ${destination} (topic: ${topic || 'General'}).

Each mission must have:
- title: Short catchy name (max 30 chars)
- objective: What to find/observe (max 100 chars)

Format as JSON array:
[{"title": "...", "objective": "..."}, ...]`

    let missions: { title: string; objective: string }[] = []
    let aiSucceeded = false

    // Try AI first with timeout
    try {
      const openai = getOpenAI()
      const modelName = getModelName()
      console.log('Calling AI with model:', modelName)
      
      const completion = await withTimeout(
        openai.chat.completions.create({
          model: modelName,
          messages: [
            { role: 'system', content: EXPLORER_SYSTEM_PROMPT },
            { role: 'user', content: missionPrompt }
          ],
          temperature: 0.8
        }) as Promise<{ choices?: { message?: { content?: string } }[] }>,
        15000 // 15 second timeout
      )

      const content = completion.choices?.[0]?.message?.content
      if (content) {
        try {
          // Remove markdown code blocks if present
          const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          const parsed = JSON.parse(cleanContent) as { missions?: { title: string; objective: string }[] } | { title: string; objective: string }[]
          missions = Array.isArray(parsed) ? parsed : parsed.missions || []
          aiSucceeded = true
          console.log('AI generated missions:', missions.length)
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError)
        }
      }
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError)
    }

    // Use fallback if AI failed
    if (!aiSucceeded || missions.length === 0) {
      console.log('Using fallback missions for:', destination)
      missions = getFallbackMissions(destination, topic || '')
    }

    // Insert missions into database (using Prisma schema field name 'order')
    const missionRecords = missions.map((mission, index) => ({
      tripId: tripId,
      title: mission.title,
      objective: mission.objective,
      order: index + 1
    }))

    const { data: insertedMissions, error: insertError } = await supabaseAdmin
      .from('Mission')
      .insert(missionRecords)
      .select()

    if (insertError) {
      console.error('Error inserting missions:', insertError)
      console.error('Mission records:', JSON.stringify(missionRecords))
      return NextResponse.json(
        { error: 'Failed to save missions: ' + insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      missions: insertedMissions,
      fallback: !aiSucceeded
    })
  } catch (error) {
    console.error('Error generating missions:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Something went wrong: ' + errorMessage },
      { status: 500 }
    )
  }
}