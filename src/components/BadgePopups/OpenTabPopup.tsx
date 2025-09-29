import type { BadgePopupProps } from "@/components/Badge"
import { openOrFocusComment } from "@/entrypoints/popup/popup"

export function OpenTabPopup({ row }: BadgePopupProps) {
  const handleClick = () => {
    openOrFocusComment(row.spot.unique_key)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full cursor-pointer text-left hover:bg-opacity-80"
      type="button"
    >
      <p>Tab is already open.</p>
      <p>Click to activate.</p>
    </button>
  )
}
