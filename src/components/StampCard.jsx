export default function StampCard({ stamps, required, brandColor, rewardDescription, isRewardLocked = false }) {
  const isEarned = stamps >= required
  const dots = Array.from({ length: required }, (_, i) => i < stamps)

  let statusEl = null
  if (isRewardLocked) {
    statusEl = (
      <div className="frother-sticker text-[11px] px-3 py-1.5 rotate-[-1deg]">
        🔒 Unlock required
      </div>
    )
  } else if (isEarned) {
    statusEl = (
      <div className="frother-sticker text-[11px] px-3 py-1.5 rotate-[-1deg]">
        🎉 Ready to redeem!
      </div>
    )
  }

  return (
    <div className="frother-card p-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500 font-bold">Your stamps</p>
          <p className="text-3xl font-black tracking-tight">
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
            className={`aspect-square rounded-full flex items-center justify-center text-lg transition-all border-2 ${
              filled ? 'scale-105' : 'bg-[#F7F3EA] border-gray-200'
            }`}
            style={
              filled
                ? { backgroundColor: brandColor + '22', borderColor: '#111827', boxShadow: '2px 2px 0 #111827' }
                : {}
            }
          >
            {filled ? <span style={{ color: brandColor }}>☕</span> : ''}
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-600 text-center font-medium">
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
