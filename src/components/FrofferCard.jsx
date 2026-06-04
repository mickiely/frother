export default function FrofferCard({ froffer, onRedeem, showRedeem = false }) {
  const isExpiringSoon = froffer.expiresAt && new Date(froffer.expiresAt) < new Date(Date.now() + 7 * 86400000)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 items-start">
      <div className="text-3xl flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
        {froffer.emoji || '🎁'}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-base leading-tight">{froffer.title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{froffer.description}</p>
        {froffer.expiresAt && (
          <p className={`text-xs mt-1 font-medium ${isExpiringSoon ? 'text-orange-500' : 'text-gray-400'}`}>
            Ends {new Date(froffer.expiresAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>
      {showRedeem && onRedeem && (
        <button
          onClick={() => onRedeem(froffer)}
          className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
          style={{ backgroundColor: '#2D6A4F' }}
        >
          Use
        </button>
      )}
    </div>
  )
}
