export default function VenueBrand({ venue, size = 'md' }) {
  const textSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
  const dotSize = size === 'lg' ? 'w-12 h-12 text-2xl' : size === 'sm' ? 'w-8 h-8 text-base' : 'w-10 h-10 text-xl'

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${dotSize} rounded-xl flex items-center justify-center font-bold text-white`}
        style={{ backgroundColor: venue.brandColor }}
      >
        {venue.name.charAt(0)}
      </div>
      <span className={`${textSize} font-bold tracking-tight`}>{venue.name}</span>
    </div>
  )
}
