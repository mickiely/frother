export default function FrofferCard({ froffer, onRedeem, showRedeem = false }) {
  const isExpiringSoon = froffer.expiresAt && new Date(froffer.expiresAt) < new Date(Date.now() + 7 * 86400000)

  return (
    <div className="frother-card p-4 flex gap-4 items-start relative overflow-hidden">
      <div className="absolute right-4 top-0 h-2 w-20 rounded-b-full bg-[#F4B84A]" />
      <div className="text-3xl flex-shrink-0 w-14 h-14 bg-[#F7F3EA] rounded-2xl border-2 border-gray-900 flex items-center justify-center rotate-[-3deg] shadow-[3px_3px_0_#111827]">
        {froffer.emoji || '🎁'}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-gray-900 text-base leading-tight">{froffer.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{froffer.description}</p>
        {froffer.expiresAt && (
          <p className={`text-xs mt-2 font-black ${isExpiringSoon ? 'text-[#E84A4A]' : 'text-[#246B4B]'}`}>
            Ends {new Date(froffer.expiresAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>
      {showRedeem && onRedeem && (
        <button
          onClick={() => onRedeem(froffer)}
          className="flex-shrink-0 text-xs font-black px-3 py-2 rounded-xl text-white shadow-[2px_2px_0_#111827]"
          style={{ backgroundColor: '#16A34A' }}
        >
          Use
        </button>
      )}
    </div>
  )
}
