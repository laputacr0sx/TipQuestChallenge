'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Trip {
  id: string
  name: string
  accessCode: string
  topic: string
  status: 'pre' | 'during' | 'post'
  missionCount: number
  studentCount: number
}

export default function TeacherDashboard() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const topic = formData.get('topic') as string

    // Simulate trip creation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newTrip: Trip = {
      id: Date.now().toString(),
      name,
      accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
      topic,
      status: 'pre',
      missionCount: 0,
      studentCount: 0
    }

    setTrips([...trips, newTrip])
    setShowCreate(false)
    setIsCreating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-100 flex flex-col">
      <header className="p-4 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-blue-600 font-semibold hover:underline">
            ← Back
          </Link>
          <h1 className="font-bold text-zinc-800">Teacher Dashboard</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Create New Trip Button */}
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors text-lg mb-6 flex items-center justify-center gap-2"
          >
            <span className="text-2xl">➕</span>
            Create New Trip
          </button>

          {/* Create Trip Form */}
          {showCreate && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-zinc-800 mb-4">New Field Trip</h2>
              <form onSubmit={handleCreateTrip} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Trip Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g., Science Museum Visit"
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Topic
                  </label>
                  <input
                    name="topic"
                    type="text"
                    required
                    placeholder="e.g., Nature, Science, History"
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 border-2 border-zinc-300 text-zinc-600 font-semibold rounded-xl hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Trip'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Trips List */}
          <h2 className="text-xl font-bold text-zinc-800 mb-4">Your Trips</h2>
          
          {trips.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <span className="text-5xl mb-4 block">📋</span>
              <p className="text-zinc-500">
                No trips yet. Create your first trip to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-zinc-800">{trip.name}</h3>
                      <p className="text-zinc-500">{trip.topic}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trip.status === 'pre' ? 'bg-yellow-100 text-yellow-700' :
                      trip.status === 'during' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {trip.status === 'pre' ? 'Not Started' :
                       trip.status === 'during' ? 'In Progress' : 'Completed'}
                    </span>
                  </div>
                  
                  <div className="flex gap-6 text-sm text-zinc-600 mb-4">
                    <div>
                      <span className="font-semibold">{trip.accessCode}</span>
                      <span className="text-zinc-400 ml-1">Code</span>
                    </div>
                    <div>
                      <span className="font-semibold">{trip.missionCount}</span>
                      <span className="text-zinc-400 ml-1">Missions</span>
                    </div>
                    <div>
                      <span className="font-semibold">{trip.studentCount}</span>
                      <span className="text-zinc-400 ml-1">Students</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-2 bg-blue-100 text-blue-600 font-semibold rounded-lg hover:bg-blue-200 transition-colors">
                      Generate Missions
                    </button>
                    <button className="flex-1 py-2 bg-green-100 text-green-600 font-semibold rounded-lg hover:bg-green-200 transition-colors">
                      Start Trip
                    </button>
                    <button className="px-4 py-2 border-2 border-zinc-200 text-zinc-600 font-semibold rounded-lg hover:bg-zinc-50">
                      View Dashboard
                    </button>
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