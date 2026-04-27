import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI, EXPLORER_SYSTEM_PROMPT } from '@/lib/openai'
import { getSupabaseAdmin } from '@/lib/supabase'

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
    const missionPrompt = `You are creating educational missions for a Hong Kong primary school field trip.

Trip Details:
- Destination: ${destination}
- Topic: ${topic || 'General Exploration'}
- Additional Notes: ${customInstructions || 'None'}

Generate 5-7 age-appropriate missions (8-10 year old students) for this field trip. Each mission should:
1. Be observable at the destination
2. Encourage careful observation
3. Be achievable with a photo
4. Be exciting and engaging

For each mission, provide:
- title: Short, catchy mission name (max 30 characters)
- objective: What the student should find/observe (max 100 characters)

Respond with a JSON array of missions in this exact format:
[
  {"title": "...", "objective": "..."},
  ...
]`

    // Call OpenAI to generate missions
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXPLORER_SYSTEM_PROMPT },
        { role: 'user', content: missionPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate missions. Please try again.' },
        { status: 500 }
      )
    }

    const missions = JSON.parse(content)
    
    // Insert missions into database
    const missionRecords = missions.map((mission: { title: string; objective: string }) => ({
      trip_id: tripId,
      title: mission.title,
      objective: mission.objective
    }))

    const { data: insertedMissions, error: insertError } = await supabaseAdmin
      .from('missions')
      .insert(missionRecords)
      .select()

    if (insertError) {
      console.error('Error inserting missions:', insertError)
      return NextResponse.json(
        { error: 'Failed to save missions.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      missions: insertedMissions 
    })
  } catch (error) {
    console.error('Error generating missions:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}