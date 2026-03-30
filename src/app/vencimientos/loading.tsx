'use client'

export default function VencimientosLoading() {
  return (
    <div className="min-h-screen bg-[#ECEFF8] text-gray-800">
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-gray-200 animate-pulse" />
              <div>
                <div className="h-5 w-64 bg-gray-200 rounded-xl animate-pulse" />
                <div className="h-3 w-48 bg-gray-100 rounded-xl mt-2 animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-48 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </header>
      <main className="max-w-[1920px] mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/70 border border-white/40 shadow-lg shadow-gray-200/50 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 rounded-2xl bg-white/70 border border-white/40 shadow-lg shadow-gray-200/50 animate-pulse" />
          <div className="lg:col-span-2 h-96 rounded-2xl bg-white/70 border border-white/40 shadow-lg shadow-gray-200/50 animate-pulse" />
        </div>
        <div className="h-64 rounded-2xl bg-white/70 border border-white/40 shadow-lg shadow-gray-200/50 animate-pulse" />
      </main>
    </div>
  )
}
