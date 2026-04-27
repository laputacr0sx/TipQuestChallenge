import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Logo / Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-600 mb-2">
            ExploraQuest
          </h1>
          <p className="text-zinc-600 text-lg">
            AI-Powered Field Trip Explorer
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="w-full flex flex-col gap-4">
          {/* Student Card */}
          <Link
            href="/join"
            className="block p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-amber-400"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎒</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-800">
                  I'm a Student
                </h2>
                <p className="text-zinc-500 text-sm">
                  Join a trip and complete missions!
                </p>
              </div>
            </div>
          </Link>

          {/* Teacher Card */}
          <Link
            href="/teacher"
            className="block p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-400"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-800">
                  I'm a Teacher
                </h2>
                <p className="text-zinc-500 text-sm">
                  Create trips and review progress
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-zinc-400 text-sm text-center mt-4">
          Made for Hong Kong Primary Schools
        </p>
      </main>
    </div>
  );
}