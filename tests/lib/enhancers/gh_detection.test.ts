import { describe, expect, withCorpus } from '../../corpus-fixture'

expect

import type { StrippedLocation } from '@/lib/enhancer'
import { EnhancerRegistry } from '../../../src/lib/registries'
import { CORPUS } from '../../corpus/_corpus-index'

const enhancers = new EnhancerRegistry()

function getDetectionResults(document: Document, window: Window) {
  const textareas = document.querySelectorAll('textarea')
  const location: StrippedLocation = {
    host: window.location.host,
    pathname: window.location.pathname,
  }
  const detectionResults = []
  for (const textarea of textareas) {
    const enhanced = enhancers.tryToEnhance(textarea, location)
    const forValue = `id=${textarea.id} name=${textarea.name} className=${textarea.className}`
    detectionResults.push({
      for: forValue,
      spot: enhanced ? enhanced.spot : 'NO_SPOT',
    })
  }
  return detectionResults
}

// Get all corpus entries that start with 'gh_'
const githubCorpusEntries = Object.keys(CORPUS).filter((key) => key.startsWith('gh_'))

describe('github detection', () => {
  for (const corpusKey of githubCorpusEntries) {
    withCorpus(corpusKey as keyof typeof CORPUS).it('should detect correct spots', async () => {
      expect(getDetectionResults(document, window)).toMatchSnapshot()
    })
  }
})
