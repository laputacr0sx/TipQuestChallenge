import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required.' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, name, topic, status')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found.' },
        { status: 404 }
      )
    }

    // Get all missions for this trip
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('id, title, objective')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })

    if (missionsError) {
      console.error('Error fetching missions:', missionsError)
      return NextResponse.json(
        { error: 'Failed to fetch missions.' },
        { status: 500 }
      )
    }

    // Get all submissions with mission details
    const { data: submissions, error: submissionsError } = await supabase
      .from('results')
      .select(`
        id,
        student_name,
        photo_url,
        ai_feedback,
        timestamp,
        mission_id,
        missions (
          title,
          objective
        )
      `)
      .in('mission_id', missions.map(m => m.id))
      .order('timestamp', { ascending: false })

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json(
        { error: 'Failed to fetch submissions.' },
        { status: 500 }
      )
    }

    // Organize data: submissions grouped by mission
    const missionStats = missions.map(mission => {
      const missionSubmissions = submissions.filter(
        s => s.mission_id === mission.id
      )
      const uniqueStudents = new Set(missionSubmissions.map(s => s.student_name))
      
      return {
        ...mission,
        submissionCount: missionSubmissions.length,
        uniqueStudents: uniqueStudents.size,
        submissions: missionSubmissions
      }
    })

    // Calculate overall stats
    const totalSubmissions = submissions.length
    const uniqueStudentsAll = new Set(submissions.map(s => s.student_name)).size

    return NextResponse.json({
      trip,
      stats: {
        totalMissions: missions.length,
        totalSubmissions,
        uniqueStudents: uniqueStudentsAll
      },
      missions: missionStats
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}