import { SpotTable } from '@/components/SpotTable'
import type { CommentState } from '@/entrypoints/background'
import { EnhancerRegistry } from '@/lib/registries'
import { sampleSpots } from './playgroundData'

export function PopupPlayground() {
  const handleSpotClick = (spot: CommentState) => {
    alert(`Clicked: ${spot.spot.type}\nTab: ${spot.tab.tabId}`)
  }

  const enhancers = new EnhancerRegistry()

  return (
    <div className='w-full'>
      <h2 className='mb-4 text-lg font-semibold text-foreground'>Open Comment Spots</h2>

      <div className='border rounded-md'>
        <SpotTable
          spots={sampleSpots}
          enhancerRegistry={enhancers}
          onSpotClick={handleSpotClick}
          headerClassName='p-3 font-medium text-muted-foreground'
          rowClassName='transition-colors hover:bg-muted/50 border-b border-border/40'
          cellClassName='p-3'
          emptyStateMessage='No open comment spots'
          showHeader={true}
        />
      </div>
    </div>
  )
}
