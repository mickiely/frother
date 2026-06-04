import { useState, useEffect } from 'react'
import { getCustomers, getAllFroffers } from '../../lib/dataService'
import { computeSegments } from '../../lib/intelligence'

// TODO (future): wire each campaign's "Draft" button to an actual email/SMS
// composer backed by a transactional send provider (e.g. Klaviyo, Postmark).
// TODO (POS — Square): add campaign_attribution_id to Square order metadata so
// redemptions from this campaign can be tracked back via Square order_id.

const CAMPAIGNS = [
  {
    id: 'c1',
    title: 'One stamp away — come in today',
    desc: 'A small nudge for customers who are one coffee short of a free one.',
    segmentKey: 'oneStampAway',
    channel: 'SMS',
    channelColor: 'bg-blue-100 text-blue-700',
    emoji: '☕',
    urgency: 'high',
    mockMessage: 'Hey {name}, you\'re ONE stamp away from a free coffee at Demo Cafe. Pop in before 10am today and we\'ll double-stamp you. ☕',
  },
  {
    id: 'c2',
    title: 'Morning coffee double-stamp offer',
    desc: 'Reward your early regulars and build a stronger morning habit.',
    segmentKey: 'morningRegulars',
    channel: 'SMS',
    channelColor: 'bg-blue-100 text-blue-700',
    emoji: '🌅',
    urgency: 'medium',
    mockMessage: 'Rise and grind, {name}! Double stamps on all coffees before 10am this week at Demo Cafe. 🌅',
  },
  {
    id: 'c3',
    title: 'Steak night reminder — dinner fans',
    desc: 'Tuesday 2-for-1 reminder sent the day before to dinner and steak lovers.',
    segmentKey: 'dinnerFans',
    channel: 'Email',
    channelColor: 'bg-indigo-100 text-indigo-700',
    emoji: '🥩',
    urgency: 'medium',
    mockMessage: 'Hey {name}, don\'t forget — 2-for-1 Steak Night is TOMORROW at Demo Cafe from 6pm. Grab a friend and book a table. 🥩',
  },
  {
    id: 'c4',
    title: 'Complete profile — unlock your reward',
    desc: 'Remind customers who\'ve earned a reward but haven\'t completed their profile.',
    segmentKey: 'rewardLocked',
    channel: 'SMS',
    channelColor: 'bg-blue-100 text-blue-700',
    emoji: '🔓',
    urgency: 'high',
    mockMessage: 'Hi {name}, you\'ve earned a free coffee at Demo Cafe! Complete your profile to unlock it: [link] 🔓',
  },
  {
    id: 'c5',
    title: 'We miss you — comeback offer',
    desc: 'Re-engage customers who haven\'t visited in over 30 days.',
    segmentKey: 'dormant',
    channel: 'Email',
    channelColor: 'bg-indigo-100 text-indigo-700',
    emoji: '💌',
    urgency: 'medium',
    mockMessage: 'Hey {name}, it\'s been a while! Come back to Demo Cafe and enjoy a free muffin with your next coffee. We\'ve missed you. 🧁',
  },
]

export default function CampaignsTab({ venue }) {
  const [segments, setSegments] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    getCustomers(venue.id).then(custs => {
      setSegments(computeSegments(custs, venue.loyaltyRule.stampsRequired))
    })
  }, [venue.id])

  if (preview) {
    return (
      <CampaignPreview
        campaign={preview}
        targetCount={segments?.[preview.segmentKey]?.customers?.length ?? 0}
        onClose={() => setPreview(null)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="frother-card bg-amber-50 border-amber-200 px-4 py-3">
        <p className="text-sm font-black text-amber-900">Draft only — no SMS/email sent yet.</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Use this to plan future campaigns, preview targeting, and shape copy. It is not connected to live sending.
        </p>
      </div>

      {CAMPAIGNS.map(c => {
        const count = segments?.[c.segmentKey]?.customers?.length ?? '—'
        const urgencyRing = c.urgency === 'high' ? 'ring-1 ring-amber-300' : ''
        return (
          <div key={c.id} className={`frother-card p-4 ${urgencyRing}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{c.emoji}</span>
                <div>
                  <p className="font-black text-sm text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-black px-2 py-1 rounded-full border border-gray-900/10 ${c.channelColor}`}>
                      {c.channel}
                    </span>
                    <span className="text-xs text-gray-500">
                      {typeof count === 'number'
                        ? `${count} customer${count !== 1 ? 's' : ''}`
                        : 'Loading...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setPreview(c)}
              disabled={typeof count === 'number' && count === 0}
              className="frother-button mt-3 w-full text-sm border-2 border-gray-200 text-gray-800 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-none"
            >
              {count === 0 ? 'No customers in segment' : 'Preview campaign →'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── Campaign preview ──────────────────────────────────────────────────────────

function CampaignPreview({ campaign, targetCount, onClose }) {
  const [sent, setSent] = useState(false)

  return (
    <div className="space-y-4 pb-10">
      <button onClick={onClose} className="text-sm text-gray-500">← Back to campaigns</button>

      <div className="frother-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{campaign.emoji}</span>
          <div>
            <h2 className="font-black text-lg">{campaign.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-black px-2 py-1 rounded-full border border-gray-900/10 ${campaign.channelColor}`}>
                {campaign.channel}
              </span>
              <span className="text-xs text-gray-500">{targetCount} recipients</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message preview</p>
          <p className="text-sm text-gray-700 leading-relaxed">{campaign.mockMessage}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-blue-700">
            <strong>Targeting:</strong> {targetCount} customers in the "{campaign.segmentKey.replace(/([A-Z])/g, ' $1').toLowerCase()}" segment
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-amber-900">Draft only — no SMS/email sent yet.</p>
          <p className="text-xs text-amber-700 mt-0.5">
            This preview is for campaign planning. Nothing is queued, sent, or connected to customers.
          </p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
            <p className="font-bold text-green-800">✓ Draft marked reviewed</p>
            <p className="text-xs text-green-600 mt-0.5">This is a mock — no messages were actually sent.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => setSent(true)}
              className="frother-button w-full bg-gray-900 text-white"
            >
              Mark draft reviewed
            </button>
            <p className="text-xs text-gray-400 text-center">
              Future planning only. No SMS or email will be sent.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
