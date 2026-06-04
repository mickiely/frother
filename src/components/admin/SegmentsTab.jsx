import { useState, useEffect } from 'react'
import { getCustomers } from '../../lib/dataService'
import { computeSegments } from '../../lib/intelligence'

const SEGMENT_META = {
  quickNotRegistered: { emoji: '⚡', color: 'bg-gray-50 border-gray-200' },
  rewardLocked:       { emoji: '🔒', color: 'bg-amber-50 border-amber-200' },
  oneStampAway:       { emoji: '☕', color: 'bg-green-50 border-green-200' },
  morningRegulars:    { emoji: '🌅', color: 'bg-orange-50 border-orange-200' },
  lunchRegulars:      { emoji: '🍔', color: 'bg-yellow-50 border-yellow-200' },
  dinnerFans:         { emoji: '🥩', color: 'bg-red-50 border-red-200' },
  smsConsent:         { emoji: '📱', color: 'bg-blue-50 border-blue-200' },
  emailConsent:       { emoji: '📧', color: 'bg-indigo-50 border-indigo-200' },
  dormant:            { emoji: '💤', color: 'bg-purple-50 border-purple-200' },
}

export default function SegmentsTab({ venue }) {
  const [segments, setSegments] = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    getCustomers(venue.id).then(custs => {
      setSegments(computeSegments(custs, venue.loyaltyRule.stampsRequired))
    })
  }, [venue.id])

  if (!segments) return <p className="text-gray-400 text-sm text-center py-8">Loading...</p>

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 font-bold">
        Tap a segment to see who's in it.
      </p>

      {Object.entries(segments).map(([key, seg]) => {
        const meta = SEGMENT_META[key] || { emoji: '•', color: 'bg-gray-50 border-gray-200' }
        const isOpen = expanded === key

        return (
          <div key={key} className={`frother-card ${meta.color} overflow-hidden`}>
            <button
              onClick={() => setExpanded(isOpen ? null : key)}
              className="w-full p-4 text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{meta.emoji}</span>
                <div>
                  <p className="font-black text-sm text-gray-900">{seg.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 italic">{seg.hint}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-2xl font-black text-gray-900">{seg.customers.length}</span>
                <span className="text-gray-400 text-sm">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-white/50 pt-3 space-y-2">
                <p className="text-xs text-gray-600 mb-2">{seg.desc}</p>
                {seg.customers.length === 0 ? (
                  <p className="text-sm text-gray-400">No customers in this segment yet</p>
                ) : (
                  seg.customers.map(c => (
                    <div key={c.id} className="bg-white rounded-xl px-3 py-2.5 flex justify-between items-center shadow-sm border border-gray-100">
                      <div>
                        <p className="font-semibold text-sm">{c.name}{c.lastName ? ` ${c.lastName}` : ''}</p>
                        <p className="text-xs text-gray-400">{c.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-700">{c.stamps} stamps</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          c.profileStatus === 'full' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {c.profileStatus === 'full' ? 'Full' : 'Quick'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
