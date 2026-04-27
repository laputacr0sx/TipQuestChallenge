'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Mission {
  id: string
  title: string
  objective: string
}

interface Submission {
  id: string
  photo_url: string
  ai_feedback: string
  timestamp: string
}

export default function ExploreTrip() {
  const params = useParams()
  const code = params.code as string
  
  const [session, setSession] = useState<{
    studentName: string
    tripId: string
    tripName: string
  } | null>(null)
  
  const [missions, setMissions] = useState<Mission[]>([])
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Submission | null>(null)
  const [error, setError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    // Check for session
    const stored = localStorage.getItem('exploraquest_session')
    if (!stored) {
      router.push('/join')
      return
    }
    
    const sessionData = JSON.parse(stored)
    if (sessionData.tripCode !== code) {
      router.push('/join')
      return
    }
    
    setSession(sessionData)
    loadMissions(sessionData.tripId)
  }, [code, router])

  const loadMissions = async (tripId: string) => {
    try {
      // For now, we'll simulate missions since we don't have a real DB
      // In production, this would fetch from /api/trips/{code}/missions
      const mockMissions: Mission[] = [
        { id: '1', title: 'Find a Tree', objective: 'Look for a tree with interesting bark' },
        { id: '2', title: 'Spot a Bird', objective: 'Find and photograph any bird' },
        { id: '3', title: 'Cloud Shapes', objective: 'Find clouds that look like something' },
        { id: '4', title: 'Color Hunt', objective: 'Find something red, yellow, and blue' },
        { id: '5', title: 'Texture Search', objective: 'Find something rough and something smooth' },
      ]
      setMissions(mockMissions)
    } catch (err) {
      setError('Failed to load missions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!selectedMission || !selectedFile || !session) return
    
    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('missionId', selectedMission.id)
      formData.append('studentName', session.studentName)
      formData.append('image', selectedFile)

      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock response
      const mockFeedback: Submission = {
        id: Date.now().toString(),
        photo_url: previewImage!,
        ai_feedback: `Great job, ${session.studentName}! 🎉 You found something amazing! Can you tell me more about what you discovered? Try looking for another interesting detail nearby!`,
        timestamp: new Date().toISOString()
      }
      
      setFeedback(mockFeedback)
    } catch (err) {
      setError('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetCapture = () => {
    setSelectedMission(null)
    setPreviewImage(null)
    setSelectedFile(null)
    setFeedback(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-amber-600 text-xl">Loading your adventure... 🌟</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Show feedback after submission
  if (feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col">
        <header className="p-4 bg-white shadow-sm">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <Link href="/" className="text-amber-600 font-semibold">
              ← Exit
            </Link>
            <h1 className="font-bold text-zinc-800">{session.tripName}</h1>
            <span className="text-zinc-400">👤 {session.studentName}</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img 
                src={feedback.photo_url} 
                alt="Your submission" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-bold text-amber-600">AI Guide Says:</h2>
                </div>
                <p className="text-zinc-700 text-lg leading-relaxed">
                  {feedback.ai_feedback}
                </p>
              </div>
            </div>
            
            <button
              onClick={resetCapture}
              className="w-full mt-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Continue Exploring! 🔍
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Show camera capture UI
  if (selectedMission) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col">
        <header className="p-4 bg-white shadow-sm">
          <div className="max-w-md mx-auto">
            <button 
              onClick={() => setSelectedMission(null)}
              className="text-amber-600 font-semibold"
            >
              ← Back to Missions
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-amber-600 mb-2">
                {selectedMission.title}
              </h2>
              <p className="text-zinc-600">{selectedMission.objective}</p>
            </div>

            {/* Camera/Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 bg-white rounded-2xl shadow-lg border-2 border-dashed border-amber-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition-colors"
            >
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <>
                  <span className="text-5xl mb-2">📷</span>
                  <p className="text-zinc-500 font-medium">Tap to take a photo!</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {selectedFile && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full mt-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-lg"
              >
                {isSubmitting ? 'AI is thinking... 🤖' : 'Submit for Review! 🚀'}
              </button>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Show mission list
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col">
      <header className="p-4 bg-white shadow-sm">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link href="/" className="text-amber-600 font-semibold">
            ← Exit
          </Link>
          <h1 className="font-bold text-zinc-800">{session.tripName}</h1>
          <span className="text-zinc-400">👤 {session.studentName}</span>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-auto">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-zinc-800 mb-2">Your Missions</h2>
          <p className="text-zinc-500 mb-6">Choose a mission to complete!</p>

          <div className="space-y-4">
            {missions.map((mission, index) => (
              <button
                key={mission.id}
                onClick={() => setSelectedMission(mission)}
                className="w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-800">{mission.title}</h3>
                  <p className="text-zinc-500 text-sm">{mission.objective}</p>
                </div>
                <span className="text-2xl">👉</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}