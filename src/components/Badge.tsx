import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import type { VariantProps } from 'tailwind-variants'
import { badgeCVA, typeIcons, typeTooltips } from '@/components/design'

export type BadgeProps = VariantProps<typeof badgeCVA> & {
  type: keyof typeof typeIcons
  text?: number | string
}

const Badge = ({ text, type }: BadgeProps) => {
  const Icon = typeIcons[type]
  const [showTooltip, setShowTooltip] = useState(false)
  const TooltipComponent = showTooltip && typeTooltips[type]
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
            clickable: !!typeTooltips[type],
            type,
          }),
        )}
      >
        {type === 'blank' || <Icon className='h-3 w-3' />}
        {text || type}
      </span>
      {TooltipComponent && (
        <div
          className={
            'absolute top-full z-10 w-max rounded bg-gray-800 px-2 py-1 text-white text-xs shadow-lg'
          }
        >
          <TooltipComponent />
        </div>
      )}
    </button>
  )
}

export default Badge
