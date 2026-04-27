import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['pre', 'during', 'post']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pre, during, or post.' },
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

    // Check if code is a UUID (trip ID) or 4-digit access code
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isUUID = UUID_REGEX.test(code)
    
    let trip;
    if (isUUID) {
      // If it's a UUID, look up by ID directly
      const { data, error } = await supabaseAdmin
        .from('Trip')
        .select('id, name, accessCode')
        .eq('id', code)
        .single()
      
      if (error || !data) {
        return NextResponse.json(
          { error: 'Trip not found.' },
          { status: 404 }
        )
      }
      trip = data;
    } else {
      // Otherwise look up by access code
      const { data, error } = await supabaseAdmin
        .from('Trip')
        .select('id, name, accessCode')
        .eq('accessCode', code)
        .single()
      
      if (error || !data) {
        return NextResponse.json(
          { error: 'Trip not found.' },
          { status: 404 }
        )
      }
      trip = data;
    }

    const { data: updatedTrip, error } = await supabaseAdmin
      .from('Trip')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', trip.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating trip status:', error)
      return NextResponse.json(
        { error: 'Failed to update trip status.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      trip: {
        id: updatedTrip.id,
        name: updatedTrip.name,
        status: updatedTrip.status,
        accessCode: updatedTrip.accessCode,
      }
    })
  } catch (error) {
    console.error('Error in PATCH /api/trips/[code]/status:', error)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}