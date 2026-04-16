interface OrderNotesProps {
  value: string
  onChange: (v: string) => void
}

export default function OrderNotes({ value, onChange }: OrderNotesProps) {
  return (
    <div className="px-4 pb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Notas para cocina (opcional)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: sin cebolla, alergia al maní, término medio…"
        rows={3}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 placeholder:text-gray-400"
        style={{ focusRingColor: '#1D9E75' } as React.CSSProperties}
      />
    </div>
  )
}
