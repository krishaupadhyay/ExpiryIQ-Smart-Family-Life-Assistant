import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, ExternalLink } from 'lucide-react'

type Props = {
  query: string                   // what to search for, e.g. the medicine / item name
  kind: 'medicine' | 'grocery'
  align?: 'left' | 'right'        // which side the dropdown opens toward
}

// Search links for each store. They open the store's own search page for this item
// in a new tab — the user checks the exact product and places the order there.
function getStores(query: string, kind: 'medicine' | 'grocery') {
  const q = encodeURIComponent(query.trim())
  const specific =
    kind === 'medicine'
      ? [
          { name: 'Tata 1mg', url: `https://www.1mg.com/search/all?name=${q}` },
          { name: 'PharmEasy', url: `https://pharmeasy.in/search/all?name=${q}` }
        ]
      : [
          { name: 'BigBasket', url: `https://www.bigbasket.com/ps/?q=${q}` },
          { name: 'Blinkit', url: `https://blinkit.com/s/?q=${q}` }
        ]
  return [
    ...specific,
    { name: 'Amazon', url: `https://www.amazon.in/s?k=${q}` },
    { name: 'Flipkart', url: `https://www.flipkart.com/search?q=${q}` }
  ]
}

export default function ReorderLinks({ query, kind, align = 'left' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // close the menu when clicking anywhere outside it
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
      >
        <ShoppingCart className="w-3 h-3" /> Reorder
      </button>

      {open && (
        <div className={`absolute bottom-full mb-2 z-40 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <p className="text-[10px] text-slate-400 px-2 pt-1 pb-1.5">Search “{query}” on:</p>
          {getStores(query, kind).map(store => (
            <a
              key={store.name}
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {store.name} <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          ))}
          <p className="text-[10px] text-slate-400 px-2 pt-1.5 pb-1">
            {kind === 'medicine' ? 'Check the exact medicine and strength before ordering.' : 'Check the exact item and pack size before ordering.'}
          </p>
        </div>
      )}
    </div>
  )
}
