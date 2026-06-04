export default function StampCard({ stamps, required, brandColor, rewardDescription, isRewardLocked = false }) {
  const isEarned = stamps >= required
  const dots = Array.from({ length: required }, (_, i) => i < stamps)

  let statusEl = null
  if (isRewardLocked) {
    statusEl = (
      <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
        🔒 Unlock required
      </div>
    )
  } else if (isEarned) {
    statusEl = (
      <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full animate-bounce">
        🎉 Ready to redeem!
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">Your stamps</p>
          <p className="text-2xl font-bold">
            {Math.min(stamps, required)}
            <span className="text-gray-400 text-lg font-normal"> / {required}</span>
          </p>
        </div>
        {statusEl}
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {dots.map((filled, i) => (
          <div
            key={i}
            className={`aspect-square rounded-full flex items-center justify-center text-lg transition-all ${
              filled ? 'scale-105' : 'bg-gray-100'
            }`}
            style={
              filled
                ? { backgroundColor: brandColor + '22', border: `2px solid ${brandColor}` }
                : {}
            }
          >
            {filled ? <span style={{ color: brandColor }}>☕</span> : ''}
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 text-center">
        {isRewardLocked ? (
          <span className="font-semibold text-amber-700">
            Complete your profile to unlock your free coffee
          </span>
        ) : isEarned ? (
          <span className="font-semibold text-gray-700">🏆 {rewardDescription}</span>
        ) : (
          `${required - stamps} more to earn your ${rewardDescription.toLowerCase()}`
        )}
      </p>
    </div>
  )
}
