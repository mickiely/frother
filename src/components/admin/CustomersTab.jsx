import { useState, useEffect } from 'react'
import { getCustomers, getAllFroffers } from '../../lib/dataService'
import { getSuggestedOffer, getCustomerSummary } from '../../lib/intelligence'

// TODO (POS — Square): map customer.squareCustomerId to Square customer records
// for purchase history, item category counts, and spend tracking.

export default function CustomersTab({ venue }) {
  const [customers, setCustomers] = useState([])
  const [froffers, setFroffers] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    Promise.all([getCustomers(venue.id), getAllFroffers(venue.id)]).then(([custs, frofs]) => {
      setCustomers(custs)
      setFroffers(frofs)
    })
  }, [venue.id])

  if (selected) {
    return (
      <CustomerDetail
        customer={selected}
        froffers={froffers}
        venue={venue}
        onBack={() => setSelected(null)}
      />
    )
  }

  const required = venue.loyaltyRule.stampsRequired

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 font-bold">{customers.length} members</p>
      {customers.map(c => {
        const isLocked = c.stamps >= required && c.profileStatus !== 'full'
        const isReady = c.stamps >= required && c.profileStatus === 'full'
        return (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className="w-full frother-card px-4 py-3.5 flex justify-between items-center text-left"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-black text-sm">{c.name}{c.lastName ? ` ${c.lastName}` : ''}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  c.profileStatus === 'full' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {c.profileStatus === 'full' ? 'Full' : 'Quick'}
                </span>
              </div>
              <p className="text-xs text-gray-400">{c.phone}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm" style={{
                color: isLocked ? '#F59E0B' : isReady ? '#16A34A' : venue.brandColor,
              }}>
                {c.stamps} stamps {isLocked ? '🔒' : isReady ? '🏆' : ''}
              </p>
              <p className="text-xs text-gray-400">{c.rewardsRedeemed} redeemed</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Customer detail panel ─────────────────────────────────────────────────────

function CustomerDetail({ customer, froffers, venue, onBack }) {
  const required = venue.loyaltyRule.stampsRequired
  const summary = getCustomerSummary(customer, required)
  const suggestion = getSuggestedOffer(customer, froffers, required)
  const recentEvents = [...customer.events].reverse().slice(0, 6)

  return (
    <div className="space-y-4 pb-10">
      <button onClick={onBack} className="text-sm text-gray-500">← Back to members</button>

      {/* Header */}
      <div className="frother-card p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-black text-2xl tracking-tight">{customer.name}{customer.lastName ? ` ${customer.lastName}` : ''}</h2>
            <p className="text-gray-500 text-sm">{customer.phone}</p>
            {customer.email && <p className="text-gray-400 text-xs mt-0.5">{customer.email}</p>}
          </div>
          <ProfileStatusBadge status={customer.profileStatus} />
        </div>

        {/* Profile details — only for full profiles */}
        {customer.profileStatus === 'full' && (
          <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {customer.ageRange && <Detail label="Age range" value={customer.ageRange} />}
            {customer.suburb && <Detail label="Suburb" value={`${customer.suburb} ${customer.postcode || ''}`} />}
          </div>
        )}
      </div>

      {/* Suggested next offer */}
      <SuggestionCard suggestion={suggestion} brandColor={venue.brandColor} />

      {/* Loyalty summary */}
      <div className="frother-card p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Loyalty</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <MiniStat label="Stamps" value={customer.stamps} />
          <MiniStat label="Total earned" value={customer.totalStampsEarned} />
          <MiniStat label="Redeemed" value={customer.rewardsRedeemed} />
        </div>
        <RewardStatusBadge summary={summary} rewardDescription={venue.loyaltyRule.rewardDescription} />
      </div>

      {/* Preferences */}
      {customer.profileStatus === 'full' && (
        <div className="frother-card p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preferences</p>
          {customer.offerCategories?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1.5">Favourite offers</p>
              <div className="flex flex-wrap gap-1.5">
                {customer.offerCategories.map(cat => (
                  <span key={cat} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{cat}</span>
                ))}
              </div>
            </div>
          )}
          {customer.preferredVisitTimes?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Visit times</p>
              <div className="flex flex-wrap gap-1.5">
                {customer.preferredVisitTimes.map(t => (
                  <span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3 flex gap-3 text-xs">
            <span className={customer.emailConsent ? 'text-green-600 font-medium' : 'text-gray-300'}>
              {customer.emailConsent ? '✓ Email OK' : '✗ No email'}
            </span>
            <span className={customer.smsConsent ? 'text-green-600 font-medium' : 'text-gray-300'}>
              {customer.smsConsent ? '✓ SMS OK' : '✗ No SMS'}
            </span>
          </div>
        </div>
      )}

      {/* Activity feed */}
      <div className="frother-card p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent activity</p>
        <div className="space-y-2.5">
          {recentEvents.map((ev, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-base mt-0.5 flex-shrink-0">{eventEmoji(ev.type)}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{eventLabel(ev.type)}</p>
                <p className="text-xs text-gray-400">{fmtDate(ev.ts)}</p>
              </div>
            </div>
          ))}
          {recentEvents.length === 0 && (
            <p className="text-sm text-gray-400">No activity yet</p>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <div className="frother-card p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Key dates</p>
        <div className="space-y-1.5">
          {[
            { label: 'Joined', val: customer.quickJoinedAt },
            { label: 'Profile completed', val: customer.profileCompletedAt },
            { label: 'Last stamp', val: customer.lastStampAt },
            { label: 'Last reward earned', val: customer.lastRewardEarnedAt },
            { label: 'Last reward redeemed', val: customer.lastRewardRedeemedAt },
            { label: 'Last seen', val: customer.lastSeenAt },
          ].filter(r => r.val).map(r => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-gray-500">{r.label}</span>
              <span className="text-gray-800 font-medium">{fmtDate(r.val)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function ProfileStatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
      status === 'full' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {status === 'full' ? '✓ Full profile' : 'Quick profile'}
    </span>
  )
}

function RewardStatusBadge({ summary, rewardDescription }) {
  if (summary.isRewardLocked) return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl px-3 py-2 text-sm text-amber-800 font-bold">
      🔒 Reward earned — profile needed to unlock
    </div>
  )
  if (summary.isRewardReady) return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl px-3 py-2 text-sm text-yellow-800 font-bold">
      🏆 Reward ready — {rewardDescription}
    </div>
  )
  return (
    <p className="text-sm text-gray-500">
      {summary.stampsToReward > 0
        ? `${summary.stampsToReward} stamp${summary.stampsToReward !== 1 ? 's' : ''} to next reward`
        : 'Collecting'}
    </p>
  )
}

function SuggestionCard({ suggestion, brandColor }) {
  const urgencyColor = suggestion.urgency === 'high'
    ? 'bg-amber-50 border-amber-200'
    : suggestion.urgency === 'medium'
      ? 'bg-blue-50 border-blue-200'
      : 'bg-gray-50 border-gray-200'

  const urgencyText = suggestion.urgency === 'high'
    ? 'text-amber-800' : suggestion.urgency === 'medium' ? 'text-blue-800' : 'text-gray-700'

  return (
    <div className={`frother-card p-4 ${urgencyColor}`}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Best next offer</p>
      <p className={`font-black text-base ${urgencyText}`}>{suggestion.headline}</p>
      {suggestion.detail && <p className="text-sm text-gray-500 mt-0.5">{suggestion.detail}</p>}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-gray-400">{label}: </span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}

function eventEmoji(type) {
  const map = {
    quick_join_completed: '⚡',
    profile_completion_started: '📝',
    profile_completed: '✅',
    stamp_added: '☕',
    reward_earned: '🎉',
    reward_locked_profile_required: '🔒',
    reward_unlocked_after_profile: '🔓',
    reward_redeemed: '🏆',
  }
  return map[type] || '•'
}

function eventLabel(type) {
  const map = {
    quick_join_completed: 'Joined with quick profile',
    profile_completion_started: 'Started completing profile',
    profile_completed: 'Completed full profile',
    stamp_added: 'Stamp added',
    reward_earned: 'Reward earned',
    reward_locked_profile_required: 'Reward locked — profile required',
    reward_unlocked_after_profile: 'Reward unlocked after profile',
    reward_redeemed: 'Reward redeemed',
  }
  return map[type] || type.replace(/_/g, ' ')
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
