import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    // Validate code format (4-digit)
    if (!code || !/^\d{4}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid access code. Please enter a 4-digit code.' },
        { status: 400 }
      )
    }

    // Look up trip by access code
    const supabase = getSupabase()
    const { data: trip, error } = await supabase
      .from('Trip')
      .select('id, name, topic, status')
      .eq('accessCode', code)
      .single()

    if (error || !trip) {
      return NextResponse.json(
        { error: 'Trip not found. Please check your code and try again.' },
        { status: 404 }
      )
    }

    // Allow students to join trips in any status (pre, during, post)
    // Teacher controls when students should start exploring
    if (trip.status !== 'during' && trip.status !== 'post' && trip.status !== 'pre') {
      return NextResponse.json(
        { error: 'This trip has not started yet. Please wait for your teacher to begin the exploration!' },
        { status: 400 }
      )
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error verifying trip code:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}