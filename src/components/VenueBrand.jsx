export default function VenueBrand({ venue, size = 'md' }) {
  const textSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-3xl'
  const markSize = size === 'lg' ? 'w-16 h-16' : size === 'sm' ? 'w-11 h-11' : 'w-14 h-14'

  return (
    <div className="flex items-center gap-3">
      <img src="/frother-logo.png" alt="" aria-hidden="true" className={`${markSize} object-contain shrink-0`} width="64" height="64" />
      <div className="leading-none">
        <span className={`${textSize} frother-wordmark block`}>Frother</span>
        {venue?.name && (
          <span className="mt-1 block text-[11px] font-black uppercase tracking-wider text-gray-500">
            {venue.name}
          </span>
        )}
      </div>
    </div>
  )
}
