import {
  Clock,
  Code,
  EyeOff,
  Image,
  Link,
  MailCheck,
  MessageSquareDashed,
  Monitor,
  Settings,
  TextSelect,
  Trash2,
} from 'lucide-react'
import { tv } from 'tailwind-variants'

// TV configuration for stat badges
export const badgeCVA = tv({
  base: 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-normal h-5',
  defaultVariants: {
    clickable: false,
  },
  variants: {
    clickable: {
      false: '',
      true: 'cursor-pointer border border-transparent hover:border-current border-dashed',
    },
    selected: {
      false: '',
      true: '!border-solid !border-current',
    },
    type: {
      blank: 'bg-transparent text-gray-700',
      code: 'bg-pink-50 text-pink-700',
      hideTrashed: 'bg-transparent text-gray-700',
      image: 'bg-purple-50 text-purple-700',
      link: 'bg-blue-50 text-blue-700',
      open: 'bg-cyan-50 text-cyan-700',
      sent: 'bg-green-50 text-green-700',
      settings: 'bg-gray-50 text-gray-700',
      text: 'bg-gray-50 text-gray-700',
      time: 'bg-gray-50 text-gray-700',
      trashed: 'bg-gray-50 text-yellow-700',
      unsent: 'bg-amber-100 text-amber-700',
    },
  },
})

// Map types to their icons
export const typeIcons = {
  blank: Code,
  code: Code,
  hideTrashed: EyeOff,
  image: Image,
  link: Link,
  open: Monitor,
  sent: MailCheck,
  settings: Settings,
  text: TextSelect,
  time: Clock,
  trashed: Trash2,
  unsent: MessageSquareDashed,
} as const
