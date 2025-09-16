import { twMerge } from 'tailwind-merge'
import type { VariantProps } from 'tailwind-variants'
import { badgeCVA, typeIcons } from '@/components/design'

export type BadgeProps = VariantProps<typeof badgeCVA> & {
  type: keyof typeof typeIcons
  text?: number | string
}

const Badge = ({ text, type }: BadgeProps) => {
  const Icon = typeIcons[type]
  return (
    <span
      className={twMerge(
        badgeCVA({
          type,
        }),
      )}
    >
      {type === 'blank' || <Icon className='w-3 h-3' />}
      {text || type}
    </span>
  )
}

export default Badge
