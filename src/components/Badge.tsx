import { type JSX, useState } from "react"
import { twMerge } from "tailwind-merge"
import type { VariantProps } from "tailwind-variants"
import { badgeCVA, typeColors, typeIcons } from "@/components/design"
import type { CommentTableRow } from "@/entrypoints/background"

import { CodePreview } from "./BadgePopups/CodePreview"
import { ImagePreview } from "./BadgePopups/ImagePreview"
import { LinkPreview } from "./BadgePopups/LinkPreview"
import { OpenTabPopup } from "./BadgePopups/OpenTabPopup"
import { TextPreview } from "./BadgePopups/TextPreview"
import { TimePreview } from "./BadgePopups/TimePreview"

const typePopups = {
  code: CodePreview,
  image: ImagePreview,
  link: LinkPreview,
  open: OpenTabPopup,
  text: TextPreview,
  time: TimePreview,
} satisfies Partial<
  Record<keyof typeof typeIcons, (props: BadgePopupProps) => JSX.Element>
>

export interface BadgePopupProps {
  row: CommentTableRow
}

export type BadgeProps = VariantProps<typeof badgeCVA> & {
  type: keyof typeof typeIcons
  text?: number | string
  data?: CommentTableRow
}

const Badge = ({ text, type, data }: BadgeProps) => {
  const Icon = typeIcons[type]
  const [showTooltip, setShowTooltip] = useState(false)
  const PopupComponent =
    showTooltip &&
    type in typePopups &&
    typePopups[type as keyof typeof typePopups]
  return (
    <button
      type="button"
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={twMerge(
          badgeCVA({
            clickable: type in typePopups,
            type,
          })
        )}
      >
        {type === "blank" || <Icon className="h-3 w-3" />}
        {text || type}
      </span>
      {PopupComponent && data && (
        <div
          className={twMerge(
            "absolute top-full right-0 z-10 w-30 rounded border px-2 py-1 text-left text-xs shadow-lg",
            typeColors[type]
          )}
        >
          <PopupComponent row={data} />
        </div>
      )}
    </button>
  )
}

export default Badge
