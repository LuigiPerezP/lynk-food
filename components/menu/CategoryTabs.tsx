import type { Categoria } from '@/lib/types'

interface CategoryTabsProps {
  selected: Categoria | 'todos'
  onChange: (cat: Categoria | 'todos') => void
  categorias: string[]
}

export default function CategoryTabs({ selected, onChange, categorias }: CategoryTabsProps) {
  const tabs = [
    { value: 'todos' as const, label: 'Todos', emoji: '🍴' },
    ...categorias.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1), emoji: '' })),
  ]

  return (
    <div className="overflow-x-auto bg-white border-b border-gray-100">
      <div className="flex gap-1 px-4 py-3 min-w-max">
        {tabs.map((cat) => {
          const active = selected === cat.value
          return (
            <button
              key={cat.value}
              onClick={() => onChange(cat.value)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 whitespace-nowrap"
              style={active ? {
                background: 'linear-gradient(135deg, #0D3BB5, #1A6BFF)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(26,107,255,0.35)',
              } : {
                background: '#F3F4F6',
                color: '#6B7280',
              }}
            >
              {cat.emoji && <span>{cat.emoji}</span>}
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
