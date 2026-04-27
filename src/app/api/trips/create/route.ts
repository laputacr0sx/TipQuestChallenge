import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, topic, destination } = body

    if (!name || !destination) {
      return NextResponse.json(
        { error: 'Name and destination are required.' },
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

    // Generate a unique 4-digit access code
    const accessCode = Math.floor(1000 + Math.random() * 9000).toString()

    const { data, error } = await supabaseAdmin
      .from('trips')
      .insert({
        name,
        topic: topic || 'General Exploration',
        destination,
        accessCode,
        status: 'pre'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating trip:', error)
      return NextResponse.json(
        { error: 'Failed to create trip: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      trip: {
        id: data.id,
        name: data.name,
        destination: data.destination,
        topic: data.topic,
        accessCode: data.access_code,
        status: data.status
      }
    })
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}