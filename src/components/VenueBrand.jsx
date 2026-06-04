export default function VenueBrand({ venue, size = 'md' }) {
  const textSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
  const dotSize = size === 'lg' ? 'w-14 h-14 text-3xl' : size === 'sm' ? 'w-9 h-9 text-lg' : 'w-11 h-11 text-2xl'

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${dotSize} rounded-2xl flex items-center justify-center font-black text-white border-2 border-white/70 shadow-lg rotate-[-3deg]`}
        style={{ backgroundColor: venue.brandColor, boxShadow: '4px 4px 0 #111827' }}
      >
        {venue.name.charAt(0)}
      </div>
      <span className={`${textSize} font-black tracking-tight`}>{venue.name}</span>
    </div>
  )
}
