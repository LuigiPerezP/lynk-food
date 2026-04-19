'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false })

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xl text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
        title="Elegir emoji"
      >
        {value || '🍽️'}
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 shadow-xl rounded-xl overflow-hidden">
          <Picker
            data={async () => (await import('@emoji-mart/data')).default}
            onEmojiSelect={(e: { native: string }) => { onChange(e.native); setOpen(false) }}
            locale="es"
            theme="light"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  )
}
