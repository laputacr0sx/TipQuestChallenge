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

    // Fetch all Trip with mission and student counts
    const { data: trips, error } = await supabaseAdmin
      .from('Trip')
      .select(`
        id,
        name,
        accessCode,
        destination,
        topic,
        status,
        createdAt,
        Mission (id),
        Result (id)
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching trips:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trips.' },
        { status: 500 }
      )
    }

    // Format the response - include accessCode for authenticated teacher dashboard
    const formattedTrips = (trips || []).map((trip: any) => ({
      id: trip.id,
      name: trip.name,
      accessCode: trip.accessCode, // Needed for teacher to manage trips
      destination: trip.destination,
      topic: trip.topic,
      status: trip.status,
      missionCount: trip.Mission?.length || 0,
      studentCount: new Set(trip.Result?.map((r: any) => r.studentName) || []).size,
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