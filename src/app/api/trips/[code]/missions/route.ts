import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      )
    }

    // First, get the trip by access code
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('Trip')
      .select('id')
      .eq('accessCode', code)
      .single()

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found.' },
        { status: 404 }
      )
    }

    // Fetch missions for this trip
    const { data: missions, error: missionsError } = await supabaseAdmin
      .from('Mission')
      .select('id, title, objective, hint, order')
      .eq('tripId', trip.id)
      .order('order', { ascending: true })

    if (missionsError) {
      console.error('Error fetching missions:', missionsError)
      return NextResponse.json(
        { error: 'Failed to fetch missions.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ missions: missions || [] })
  } catch (error) {
    console.error('Error in GET /api/trips/[code]/missions:', error)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}