interface EmptyStateProps {
  emoji?: string
  title: string
  description?: string
}

export default function EmptyState({ emoji = '🍽️', title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
    </div>
  )
}
