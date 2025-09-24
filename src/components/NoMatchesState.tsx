type NoMatchesStateProps = {
  onClearFilters: () => void
}
export function NoMatchesState({ onClearFilters }: NoMatchesStateProps) {
  return (
    <div className='py-16 text-center'>
      <p className='mb-4 text-gray-600'>No matches found</p>
      <button type='button' onClick={onClearFilters} className='text-blue-600 hover:underline'>
        Clear filters
      </button>
    </div>
  )
}
