type BulkActionsBarProps = {
  selectedIds: Set<string>
}
export function BulkActionsBar({ selectedIds }: BulkActionsBarProps) {
  return (
    <div className='-translate-x-1/2 fixed bottom-6 left-1/2 z-50 flex transform items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 shadow-lg'>
      <span className='font-medium text-sm'>{selectedIds.size} selected</span>
      <button type='button' className='text-blue-600 text-sm hover:underline'>
        Copy
      </button>
      <button type='button' className='text-blue-600 text-sm hover:underline'>
        Preview
      </button>
      <button type='button' className='text-blue-600 text-sm hover:underline'>
        Discard
      </button>
      <button type='button' className='text-blue-600 text-sm hover:underline'>
        Open
      </button>
    </div>
  )
}
