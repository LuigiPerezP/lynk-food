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
    <div className="overflow-x-auto">
      <div className="flex gap-2 px-4 py-3 min-w-max">
        {CATEGORIAS.map((cat) => {
          const active = selected === cat.value
          return (
            <button
              key={cat.value}
              onClick={() => onChange(cat.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                backgroundColor: active ? '#1D9E75' : '#F3F4F6',
                color: active ? '#fff' : '#374151',
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
