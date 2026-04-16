import type { Categoria } from '@/lib/types'

const CATEGORIAS: { value: Categoria | 'todos'; label: string; emoji: string }[] = [
  { value: 'todos', label: 'Todos', emoji: '🍴' },
  { value: 'entradas', label: 'Entradas', emoji: '🥗' },
  { value: 'platos', label: 'Platos', emoji: '🍛' },
  { value: 'bebidas', label: 'Bebidas', emoji: '🥤' },
  { value: 'postres', label: 'Postres', emoji: '🍮' },
]

interface CategoryTabsProps {
  selected: Categoria | 'todos'
  onChange: (cat: Categoria | 'todos') => void
}

export default function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  return (
    <div className="overflow-x-auto bg-white border-b border-gray-100">
      <div className="flex gap-1 px-4 py-3 min-w-max">
        {CATEGORIAS.map((cat) => {
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
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
