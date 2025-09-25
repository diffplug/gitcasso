import { switchToTab } from '@/entrypoints/popup/popup'

interface OpenTabPopupProps {
  uniqueKey: string
}

export function OpenTabPopup({ uniqueKey }: OpenTabPopupProps) {
  const handleClick = () => {
    switchToTab(uniqueKey)
  }

  return (
    <button
      onClick={handleClick}
      className='w-full cursor-pointer text-left hover:bg-opacity-80'
      type='button'
    >
      <p>Tab is already open.</p>
      <p>Click to activate.</p>
    </button>
  )
}
