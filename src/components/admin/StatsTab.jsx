import { useState, useEffect } from 'react'
import { getStats } from '../../lib/dataService'

// TODO (POS — Square): stamp issuance stats can be cross-referenced with
// Square payment_id to validate that stamps match actual purchases.

export default function StatsTab({ venue }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats(venue.id).then(setStats)
  }, [venue.id])

  if (!stats) return <p className="text-gray-400 text-sm text-center py-8">Loading...</p>

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total members', value: stats.totalMembers, emoji: '👥' },
          { label: 'Stamps issued', value: stats.stampsIssued, emoji: '☕' },
          { label: 'Rewards redeemed', value: stats.rewardsRedeemed, emoji: '🏆' },
          { label: 'Offers redeemed', value: stats.offersRedeemed, emoji: '🎁' },
        ].map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <Section label="Profile funnel">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Quick joins" value={stats.quickJoins} emoji="⚡" />
          <StatCard label="Full profiles" value={stats.fullProfiles} emoji="✅" />
          <StatCard label="Completion rate" value={`${stats.profileCompletionRate}%`} emoji="📈" />
          <StatCard label="Locked rewards" value={stats.lockedRewards} emoji="🔒" />
        </div>
      </Section>

      <Section label="Reward pipeline">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Unlocked after profile" value={stats.unlockedAfterProfile} emoji="🔓" />
          <StatCard label="Rewards redeemed" value={stats.rewardsRedeemed} emoji="🏆" />
        </div>
      </Section>

      <Section label="Marketing consents">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Email consent" value={stats.emailConsent} emoji="📧" />
          <StatCard label="SMS consent" value={stats.smsConsent} emoji="📱" />
        </div>
      </Section>

      {Object.keys(stats.byAgeRange).length > 0 && (
        <FreqSection title="Members by age range" data={stats.byAgeRange} />
      )}
      {Object.keys(stats.offerCategoryFreq).length > 0 && (
        <FreqSection title="Favourite offer categories" data={stats.offerCategoryFreq} />
      )}
      {Object.keys(stats.visitTimeFreq).length > 0 && (
        <FreqSection title="Preferred visit times" data={stats.visitTimeFreq} />
      )}
      {Object.keys(stats.bySuburb).length > 0 && (
        <FreqSection title="Members by suburb" data={stats.bySuburb} />
      )}
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  )
}

export function StatCard({ label, value, emoji, small = false }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className={small ? 'text-xl mb-0.5' : 'text-2xl mb-1'}>{emoji}</p>
      <p className={small ? 'text-2xl font-bold text-gray-900' : 'text-3xl font-bold text-gray-900'}>{value ?? 0}</p>
      <p className="text-sm text-gray-400 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

export function FreqSection({ title, data, color = '#6B7280' }) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1])
  const max = sorted[0]?.[1] || 1
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</p>
      <div className="space-y-2">
        {sorted.map(([label, count]) => (
          <div key={label} className="flex items-center gap-3">
            <p className="text-sm text-gray-700 w-32 flex-shrink-0 truncate">{label}</p>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-2 rounded-full" style={{ width: `${(count / max) * 100}%`, backgroundColor: color }} />
            </div>
            <p className="text-sm font-semibold text-gray-600 w-5 text-right">{count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
