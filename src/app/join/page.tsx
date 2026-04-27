'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function JoinTrip() {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!code || !name) {
      setError('Please enter both your name and the trip code.')
      setIsLoading(false)
      return
    }

    if (!/^\d{4}$/.test(code)) {
      setError('Trip code should be 4 digits.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/trips/${code}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to join trip')
        setIsLoading(false)
        return
      }

      // Store session in localStorage
      localStorage.setItem('exploraquest_session', JSON.stringify({
        studentName: name,
        tripId: data.trip.id,
        tripName: data.trip.name,
        tripCode: code
      }))

      // Navigate to explore page
      router.push(`/explore/${code}`)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col p-4">
      <header className="py-4">
        <Link href="/" className="text-amber-600 font-semibold hover:underline">
          ← Back
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-amber-600 mb-2">
            Join Your Trip!
          </h1>
          <p className="text-zinc-600 text-center mb-8">
            Enter your name and trip code to start exploring
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-amber-500 focus:outline-none text-lg text-gray-900 placeholder-gray-400 bg-white"
                maxLength={30}
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-gray-800 mb-2">
                Trip Code (4 digits)
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0000"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-amber-500 focus:outline-none text-lg text-center tracking-widest font-mono text-gray-900 placeholder-gray-400 bg-white"
                maxLength={4}
                inputMode="numeric"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? 'Joining...' : "Let's Go! 🚀"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}