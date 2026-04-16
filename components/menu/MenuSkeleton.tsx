function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-lg mt-1 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3.5 bg-gray-200 rounded w-2/3" />
        <div className="h-2.5 bg-gray-100 rounded w-full" />
        <div className="h-2.5 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-1/4 mt-1" />
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0 mt-1" />
    </div>
  )
}

function TabSkeleton() {
  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto">
      {[80, 70, 60, 70, 65].map((w, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded-full animate-pulse shrink-0" style={{ width: w }} />
      ))}
    </div>
  )
}

export default function MenuSkeleton() {
  return (
    <div>
      <TabSkeleton />
      <div className="max-w-lg mx-auto px-4 pt-3 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
