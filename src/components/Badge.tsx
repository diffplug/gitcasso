import { type JSX, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import type { VariantProps } from 'tailwind-variants'
import { badgeCVA, typeColors, typeIcons } from '@/components/design'

import { CodePreview } from './BadgePreviews/CodePreview'
import { ImagePreview } from './BadgePreviews/ImagePreview'
import { LinkPreview } from './BadgePreviews/LinkPreview'
import { TextPreview } from './BadgePreviews/TextPreview'
import { TimePreview } from './BadgePreviews/TimePreview'

const typeTooltips = {
  code: CodePreview,
  image: ImagePreview,
  link: LinkPreview,
  text: TextPreview,
  time: TimePreview,
} satisfies Partial<Record<keyof typeof typeIcons, () => JSX.Element>>

export type BadgeProps = VariantProps<typeof badgeCVA> & {
  type: keyof typeof typeIcons
  text?: number | string
}

const Badge = ({ text, type }: BadgeProps) => {
  const Icon = typeIcons[type]
  const [showTooltip, setShowTooltip] = useState(false)
  const TooltipComponent =
    showTooltip && type in typeTooltips && typeTooltips[type as keyof typeof typeTooltips]
  return (
    <button
      type='button'
      className='relative'
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={twMerge(
          badgeCVA({
            clickable: type in typeTooltips,
            type,
          }),
        )}
      >
        {type === 'blank' || <Icon className='h-3 w-3' />}
        {text || type}
      </span>
      {TooltipComponent && (
        <div
          className={twMerge(
            'absolute top-full z-10 w-50 rounded border px-2 py-1 text-xs shadow-lg',
            typeColors[type],
          )}
        >
          <TooltipComponent />
        </div>
      )}
    </button>
  )
}

export default Badge
