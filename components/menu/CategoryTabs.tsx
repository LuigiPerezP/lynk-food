import type { CategoriaItem } from '@/lib/hooks/useCategorias'

interface CategoryTabsProps {
  secciones: CategoriaItem[]
  getSubcats: (id: string) => CategoriaItem[]
  selectedSection: string | 'todos'  // ID de sección o 'todos'
  selectedSubcat: string | null      // ID de subcategoría o null
  onSectionChange: (s: string | 'todos') => void
  onSubcatChange: (s: string | null) => void
}

const btn = (active: boolean) => ({
  background: active ? 'linear-gradient(135deg, #0D3BB5, #1A6BFF)' : '#F3F4F6',
  color: active ? '#fff' : '#6B7280',
  boxShadow: active ? '0 2px 8px rgba(26,107,255,0.35)' : 'none',
})

export default function CategoryTabs({ secciones, getSubcats, selectedSection, selectedSubcat, onSectionChange, onSubcatChange }: CategoryTabsProps) {
  const currentSeccion = secciones.find(s => s.id === selectedSection)
  const subcats = currentSeccion ? getSubcats(currentSeccion.id) : []

  function handleSectionClick(id: string | 'todos') {
    onSectionChange(id)
    onSubcatChange(null)
  }

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Primary tabs — sections */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 px-4 py-2.5 min-w-max">
          <button
            onClick={() => handleSectionClick('todos')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 whitespace-nowrap"
            style={btn(selectedSection === 'todos')}
          >
            🍴 Todos
          </button>
          {secciones.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSectionClick(s.id)}
              className="flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 whitespace-nowrap capitalize"
              style={btn(selectedSection === s.id)}
            >
              {s.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary chips — subcategories */}
      {subcats.length > 0 && (
        <div className="overflow-x-auto border-t border-gray-50">
          <div className="flex gap-1.5 px-4 py-2 min-w-max">
            <button
              onClick={() => onSubcatChange(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
              style={btn(!selectedSubcat)}
            >
              Todo
            </button>
            {subcats.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSubcatChange(sub.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap capitalize"
                style={btn(selectedSubcat === sub.id)}
              >
                {sub.nombre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
