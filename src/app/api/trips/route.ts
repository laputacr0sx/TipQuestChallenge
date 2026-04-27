import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      )
    }

    // Fetch all trips with mission and student counts
    const { data: trips, error } = await supabaseAdmin
      .from('trips')
      .select(`
        id,
        name,
        access_code,
        destination,
        topic,
        status,
        created_at,
        missions (id),
        results (id)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trips:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trips.' },
        { status: 500 }
      )
    }

    // Format the response
    const formattedTrips = (trips || []).map((trip: any) => ({
      id: trip.id,
      name: trip.name,
      accessCode: trip.access_code,
      destination: trip.destination,
      topic: trip.topic,
      status: trip.status,
      missionCount: trip.missions?.length || 0,
      studentCount: new Set(trip.results?.map((r: any) => r.student_name) || []).size,
    }))

    return NextResponse.json({ trips: formattedTrips })
  } catch (error) {
    console.error('Error in GET /api/trips:', error)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}