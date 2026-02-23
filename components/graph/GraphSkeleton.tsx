// GraphSkeleton — used as fallback while GraphCanvas loads (SSR-free)
export function GraphSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center">
        <div className="skeleton w-48 h-4 mx-auto mb-3 rounded-full" />
        <div className="skeleton w-32 h-3 mx-auto rounded-full" />
        <div className="mt-8 flex gap-4 justify-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-32 h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
