import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI, getModelName, EXPLORER_SYSTEM_PROMPT } from '@/lib/openai'
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

    // Get mission details for context (using Supabase table names)
    const { data: mission, error: missionError } = await supabaseAdmin
      .from('Mission')
      .select('id, title, objective, tripId')
      .eq('id', missionId)
      .single()

    if (missionError || !mission) {
      console.error('Mission not found:', missionError)
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

    let aiFeedback = ''

    // Try AI Vision, fall back to simple message if it fails
    try {
      const openai = getOpenAI()
      const modelName = getModelName()
      
      const visionResponse = await openai.chat.completions.create({
        model: modelName,
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
      } as any)

      aiFeedback = visionResponse.choices[0]?.message?.content || 
        "Great observation! Keep exploring!"
    } catch (aiError) {
      console.error('AI Vision failed, using fallback:', aiError)
      aiFeedback = "Wow, that's a great find! 🌟 Can you tell me more about what you discovered? Try looking for another interesting detail nearby!"
    }

    // Upload image to Supabase Storage
    const fileExt = mimeType.split('/')[1] || 'jpg'
    const fileName = `${mission.tripId}/${missionId}/${studentName}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('submissions')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      // Continue without image URL if upload fails
    }

    // Get public URL
    let photoUrl = ''
    if (uploadData) {
      const { data: urlData } = supabaseAdmin
        .storage
        .from('submissions')
        .getPublicUrl(fileName)
      photoUrl = urlData.publicUrl
    }

    // Save submission to database (using Supabase table names)
    const { data: submission, error: dbError } = await supabaseAdmin
      .from('Result')
      .insert({
        missionId: missionId,
        studentName: studentName,
        photoUrl: photoUrl,
        aiFeedback: aiFeedback,
        tripId: mission.tripId
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