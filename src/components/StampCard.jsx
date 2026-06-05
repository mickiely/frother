export default function StampCard({
  stamps,
  required,
  brandColor,
  rewardDescription,
  isRewardLocked = false,
  rewardsRedeemed = 0,
}) {
  const isEarned = stamps >= required
  const visibleStamps = Math.min(stamps, required)
  const dots = Array.from({ length: required }, (_, i) => i < visibleStamps)
  const isRewardReady = isEarned && !isRewardLocked
  const isRedeemedFreshCard = stamps === 0 && rewardsRedeemed > 0
  const progressPercent = required > 0 ? Math.min(100, (visibleStamps / required) * 100) : 0
  // Index of the next stamp the customer will earn (used for pulse animation)
  const nextStampIndex = isEarned ? -1 : visibleStamps

  const progressMessage = getProgressMessage({
    stamps: visibleStamps,
    required,
    isRewardLocked,
    isRewardReady,
    isRedeemedFreshCard,
  })

  let statusEl = null
  if (isRewardLocked) {
    statusEl = (
      <div className="frother-sticker text-[11px] px-3 py-1.5 rotate-[-1deg]">
        Reward locked
      </div>
    )
  } else if (isRewardReady) {
    statusEl = (
      <div className="frother-sticker frother-sticker-green text-[11px] px-3 py-1.5">
        Reward ready
      </div>
    )
  }

  return (
    <div className={`frother-card p-5 relative overflow-hidden ${isRewardReady ? 'reward-ready-card' : ''}`}>
      {isRewardReady && (
        <div className="reward-celebration" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500 font-bold">Buy {required}, get 1 free</p>
          <p className="text-lg font-black tracking-tight text-gray-900">
            You have {visibleStamps} of {required} stamps.
          </p>
        </div>
        {statusEl}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-black text-gray-500 mb-2">
          <span>Your progress</span>
          <span>{visibleStamps} of {required}</span>
        </div>
        <div className="h-4 rounded-full border-2 border-gray-900 bg-[#FFF8EA] overflow-hidden shadow-[2px_2px_0_#111827]">
          <div
            className="h-full rounded-r-full transition-all duration-500"
            style={{ width: `${progressPercent}%`, backgroundColor: brandColor }}
          />
        </div>
      </div>

      <div
        className="grid grid-cols-5 gap-2 mb-4"
        aria-label={`${visibleStamps} of ${required} stamps collected`}
      >
        {dots.map((filled, i) => {
          const isNext = i === nextStampIndex
          return (
            <div
              key={i}
              className={[
                'aspect-square rounded-full flex items-center justify-center text-lg transition-all border-2 font-black',
                filled
                  ? 'scale-105'
                  : isNext
                    ? 'stamp-next bg-[#F8F1E4] text-gray-400'
                    : 'bg-[#F8F1E4] border-gray-300 text-gray-300',
              ].join(' ')}
              style={
                filled
                  ? { backgroundColor: brandColor + '22', borderColor: '#111827', boxShadow: '2px 2px 0 #111827' }
                  : {}
              }
            >
              {filled
                ? <span style={{ color: brandColor }}>{i + 1}</span>
                : <span>{i + 1}</span>
              }
            </div>
          )
        })}
      </div>

      <p className={`text-base text-center font-black ${isRewardLocked ? 'text-amber-700' : 'text-gray-900'}`}>
        {progressMessage}
      </p>

      {isRewardReady && (
        <p className="mt-2 text-sm text-center font-bold text-gray-600">
          {rewardDescription}
        </p>
      )}

      <p className="mt-3 text-xs text-gray-500 text-center font-bold">
        Next time, tap the counter sign again or ask staff to look you up.
      </p>
    </div>
  )
}

function getProgressMessage({ stamps, required, isRewardLocked, isRewardReady, isRedeemedFreshCard }) {
  if (isRewardReady) return 'Your free one is ready. Show this to staff.'
  if (isRewardLocked) return 'Your reward is ready. Ask staff to help you use it.'
  if (isRedeemedFreshCard) return 'Reward used. New card started.'
  if (stamps === 0) return 'Start here.'
  if (stamps <= 3) return 'Nice start.'
  if (stamps <= 6) return "You're getting close."
  if (stamps < required) return 'Almost there.'
  return 'Reward ready.'
}
