import { LoadingSpinner } from './LoadingSpinner'

export function RouteLoader({ message = 'Loading page...' }: { message?: string }) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: '#DBEAFE' }} />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: '#D1FAE5' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm px-8 py-10 text-center animate-pulse">
          <LoadingSpinner size="lg" message={message} />
        </div>
      </div>
    </div>
  )
}
