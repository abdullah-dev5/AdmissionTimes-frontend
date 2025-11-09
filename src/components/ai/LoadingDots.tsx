function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  )
}

export default LoadingDots

