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
    <SpotTable
      spots={sampleSpots}
      enhancerRegistry={enhancers}
      onSpotClick={handleSpotClick}
      title='Comment Spots'
      description='Click on any row to simulate tab switching'
      headerText='Spot Details'
      className='bg-white rounded-lg shadow-sm border border-slate-200'
      headerClassName='p-4 font-medium text-slate-700'
      rowClassName='cursor-pointer transition-colors hover:bg-slate-50 border-b border-slate-200'
      cellClassName='p-4'
      showHeader={true}
    />
  )
}
