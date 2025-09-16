import type { VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { statBadge, typeIcons } from '@/components/design'

export type BadgeProps = VariantProps<typeof statBadge> & {
  type: keyof typeof typeIcons
  text?: number | string
}

const Badge = ({ text, type }: BadgeProps) => {
  const Icon = typeIcons[type]
  return (
    <span
      className={twMerge(
        statBadge({
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
