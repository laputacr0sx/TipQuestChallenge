import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI, EXPLORER_SYSTEM_PROMPT } from '@/lib/openai'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const missionId = formData.get('missionId') as string
    const studentName = formData.get('studentName') as string
    const imageFile = formData.get('image') as File

    // Validation
    if (!missionId || !studentName || !imageFile) {
      return NextResponse.json(
        { error: 'Missing required fields: missionId, studentName, and image are required.' },
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

    // Get mission details for context
    const { data: mission, error: missionError } = await supabaseAdmin
      .from('missions')
      .select('id, title, objective, trip_id')
      .eq('id', missionId)
      .single()

    if (missionError || !mission) {
      return NextResponse.json(
        { error: 'Mission not found.' },
        { status: 404 }
      )
    }

    // Convert image to base64 for OpenAI Vision
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')
    const mimeType = imageFile.type || 'image/jpeg'

    // Call OpenAI Vision API
    const openai = getOpenAI()
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXPLORER_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Mission: ${mission.title}\nObjective: ${mission.objective}\n\n${studentName} has submitted this photo. Give them encouraging feedback about what they found, point out interesting details, and ask a follow-up question to help them observe more!`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    })

    const aiFeedback = visionResponse.choices[0]?.message?.content || 
      "Great observation! Keep exploring!"

    // Upload image to Supabase Storage
    const fileName = `${mission.trip_id}/${missionId}/${studentName}-${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('submissions')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image. Please try again.' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from('submissions')
      .getPublicUrl(fileName)

    const photoUrl = urlData.publicUrl

    // Save submission to database
    const { data: submission, error: dbError } = await supabaseAdmin
      .from('results')
      .insert({
        mission_id: missionId,
        student_name: studentName,
        photo_url: photoUrl,
        ai_feedback: aiFeedback
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving submission:', dbError)
      return NextResponse.json(
        { error: 'Failed to save submission.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      submission: {
        ...submission,
        photoUrl
      }
    })
  } catch (error) {
    console.error('Error processing submission:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}