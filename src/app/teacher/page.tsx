"use client";

import { useState } from "react";
import Link from "next/link";

interface Trip {
  id: string;
  name: string;
  accessCode: string;
  destination: string;
  topic: string;
  status: "pre" | "during" | "post";
  missionCount: number;
  studentCount: number;
}

export default function TeacherDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatingTripId, setGeneratingTripId] = useState<string | null>(null);

  const handleGenerateMissions = async (trip: Trip) => {
    setGeneratingTripId(trip.id);
    try {
      const res = await fetch("/api/trips/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          destination: trip.destination,
          topic: trip.topic,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate missions");

      const data = await res.json();
      console.log("Generated missions:", data.missions);
      alert(`Successfully generated ${data.missions.length} missions!`);

      // Update mission count
      setTrips(
        trips.map((t) =>
          t.id === trip.id ? { ...t, missionCount: data.missions.length } : t,
        ),
      );
    } catch (err) {
      console.error("Failed to generate missions:", err);
      alert("Failed to generate missions. Please try again.");
    } finally {
      setGeneratingTripId(null);
    }
  };

  const handleCreateTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const topic = formData.get("topic") as string;
    const destination = formData.get("destination") as string;

    try {
      const res = await fetch("/api/trips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, topic, destination }),
      });

      if (!res.ok) throw new Error("Failed to create trip");

      const data = await res.json();

      const newTrip: Trip = {
        id: data.trip.id,
        name: data.trip.name,
        destination: data.trip.destination,
        accessCode: data.trip.accessCode,
        topic: data.trip.topic,
        status: data.trip.status,
        missionCount: 0,
        studentCount: 0,
      };

      setTrips([...trips, newTrip]);
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create trip:", err);
      alert("Failed to create trip. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-100 flex flex-col">
      <header className="p-4 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-blue-600 font-semibold hover:underline"
          >
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
              <h2 className="text-xl font-bold text-zinc-800 mb-4">
                New Field Trip
              </h2>
              <form onSubmit={handleCreateTrip} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Trip Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g., Science Museum Visit"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Destination
                  </label>
                  <input
                    name="destination"
                    type="text"
                    required
                    placeholder="e.g., Hong Kong Science Museum"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Topic
                  </label>
                  <input
                    name="topic"
                    type="text"
                    required
                    placeholder="e.g., Nature, Science, History"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400 bg-white"
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
                    {isCreating ? "Creating..." : "Create Trip"}
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
                      <h3 className="font-bold text-xl text-zinc-800">
                        {trip.name}
                      </h3>
                      <p className="text-zinc-500">
                        {trip.destination} • {trip.topic}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        trip.status === "pre"
                          ? "bg-yellow-100 text-yellow-700"
                          : trip.status === "during"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {trip.status === "pre"
                        ? "Not Started"
                        : trip.status === "during"
                          ? "In Progress"
                          : "Completed"}
                    </span>
                  </div>

                  <div className="flex gap-6 text-sm text-gray-700 mb-4">
                    <div className="bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="font-bold text-blue-700 text-lg">
                        {trip.accessCode}
                      </span>
                      <span className="text-blue-500 ml-1">Code</span>
                    </div>
                    <div className="bg-green-50 px-3 py-2 rounded-lg">
                      <span className="font-bold text-green-700">
                        {trip.missionCount}
                      </span>
                      <span className="text-green-600 ml-1">Missions</span>
                    </div>
                    <div className="bg-purple-50 px-3 py-2 rounded-lg">
                      <span className="font-bold text-purple-700">
                        {trip.studentCount}
                      </span>
                      <span className="text-purple-600 ml-1">Students</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleGenerateMissions(trip)}
                      disabled={generatingTripId === trip.id}
                      className="flex-1 py-2 bg-blue-100 text-blue-600 font-semibold rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      {generatingTripId === trip.id
                        ? "Generating..."
                        : "Generate Missions"}
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
  );
}

