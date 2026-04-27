'use client'

import { useEffect, useState, use } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Trip {
  id: string
  name: string
  topic: string
  status: 'pre' | 'during' | 'post'
}

interface MissionSubmission {
  id: string
  studentName: string
  photoUrl: string
  aiFeedback: string
  createdAt: string
}

interface Mission {
  id: string
  title: string
  objective: string
  submissionCount: number
  uniqueStudents: number
  submissions: MissionSubmission[]
}

interface DashboardData {
  trip: Trip
  stats: {
    totalMissions: number
    totalSubmissions: number
    uniqueStudents: number
  }
  missions: Mission[]
}

export default function TripDashboard() {
  const params = useParams()
  const tripId = params.tripId as string
  
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [tripId])

  const loadDashboard = async () => {
    try {
      setError(null)
      const res = await fetch(`/api/dashboard/${tripId}`)
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Trip not found')
        }
        throw new Error('Failed to load dashboard data')
      }
      
      const dashboardData = await res.json()
      setData(dashboardData)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-blue-600 text-xl">Loading dashboard... 📊</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-100 flex flex-col">
        <header className="p-4 bg-white shadow-sm">
          <div className="max-w-4xl mx-auto">
            <Link href="/teacher" className="text-blue-600 font-semibold hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
            <span className="text-5xl mb-4 block">😕</span>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">Oops!</h2>
            <p className="text-zinc-500 mb-4">{error}</p>
            <Link 
              href="/teacher"
              className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600"
            >
              Back to Teacher Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (!data) return null

  // Selected mission detail view
  if (selectedMission) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-100 flex flex-col">
        <header className="p-4 bg-white shadow-sm">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button 
              onClick={() => setSelectedMission(null)}
              className="text-blue-600 font-semibold hover:underline"
            >
              ← Back
            </button>
            <h1 className="font-bold text-zinc-800">{data.trip.name}</h1>
            <Link href="/teacher" className="text-blue-600 font-semibold hover:underline">
              Exit
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">
                {selectedMission.title}
              </h2>
              <p className="text-zinc-600">{selectedMission.objective}</p>
              <div className="mt-4 flex gap-4 text-sm text-zinc-500">
                <span>📝 {selectedMission.submissionCount} submissions</span>
                <span>👥 {selectedMission.uniqueStudents} students</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-zinc-800 mb-4">Submissions</h3>
            
            {selectedMission.submissions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <span className="text-4xl mb-2 block">📭</span>
                <p className="text-zinc-500">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedMission.submissions.map((submission) => (
                  <div key={submission.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="flex">
                      {submission.photoUrl && (
                        <div className="w-32 h-32 flex-shrink-0">
                          <img 
                            src={submission.photoUrl} 
                            alt="Submission" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-zinc-800">
                            {submission.studentName}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {formatDate(submission.createdAt)}
                          </span>
                        </div>
                        <p className="text-zinc-600 text-sm">{submission.aiFeedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-100 flex flex-col">
      <header className="p-4 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/teacher" className="text-blue-600 font-semibold hover:underline">
            ← Back
          </Link>
          <h1 className="font-bold text-zinc-800">{data.trip.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            data.trip.status === 'pre' ? 'bg-yellow-100 text-yellow-700' :
            data.trip.status === 'during' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {data.trip.status === 'pre' ? 'Not Started' :
             data.trip.status === 'during' ? 'In Progress' : 'Completed'}
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{data.stats.totalMissions}</div>
              <div className="text-sm text-zinc-500">Missions</div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{data.stats.totalSubmissions}</div>
              <div className="text-sm text-zinc-500">Submissions</div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{data.stats.uniqueStudents}</div>
              <div className="text-sm text-zinc-500">Students</div>
            </div>
          </div>

          {/* Mission List */}
          <h2 className="text-xl font-bold text-zinc-800 mb-4">Mission Details</h2>
          
          {data.missions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <span className="text-5xl mb-4 block">📋</span>
              <p className="text-zinc-500 mb-4">No missions created yet</p>
              <Link 
                href="/teacher"
                className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600"
              >
                Go back to generate missions
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.missions.map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => setSelectedMission(mission)}
                  className="w-full bg-white rounded-2xl shadow-md p-6 text-left hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-zinc-800">{mission.title}</h3>
                    <span className="text-2xl">👉</span>
                  </div>
                  <p className="text-zinc-500 text-sm mb-4">{mission.objective}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                      📝 {mission.submissionCount} submissions
                    </span>
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg">
                      👥 {mission.uniqueStudents} students
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}