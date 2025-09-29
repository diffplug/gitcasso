export function EmptyState() {
  return (
    <div className="mx-auto max-w-4xl py-16 text-center">
      <h2 className="mb-4 font-semibold text-2xl">No comments open</h2>
      <p className="mb-6 text-gray-600">
        Your drafts will appear here when you start typing in comment boxes
        across GitHub and Reddit.
      </p>
      <div className="space-y-2">
        <button type="button" className="text-blue-600 hover:underline">
          How it works
        </button>
        <span className="mx-2">·</span>
        <button type="button" className="text-blue-600 hover:underline">
          Check permissions
        </button>
      </div>
    </div>
  )
}
