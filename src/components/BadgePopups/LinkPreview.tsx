import type { BadgePopupProps } from '@/components/Badge'

export function LinkPreview({ row: _row }: BadgePopupProps) {
  return (
    <>
      TODO{' '}
      <a href='https://github.com/diffplug/gitcasso/issues/79' className='underline'>
        #79
      </a>
      : show text, url, and preview info for every link in the draft
    </>
  )
}
