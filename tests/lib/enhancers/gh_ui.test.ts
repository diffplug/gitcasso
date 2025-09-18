import { describe, expect, withCorpus } from '../../corpus-fixture'

expect

import type { StrippedLocation } from '@/lib/enhancer'
import { EnhancerRegistry } from '../../../src/lib/registries'
import { CORPUS } from '../../corpus/_corpus-index'

const enhancers = new EnhancerRegistry()

function getUIResults(document: Document, window: Window) {
  const textareas = document.querySelectorAll('textarea')
  const location: StrippedLocation = {
    host: window.location.host,
    pathname: window.location.pathname,
  }
  const uiResults = []
  for (const textarea of textareas) {
    const enhanced = enhancers.tryToEnhance(textarea, location)
    const forValue = `id=${textarea.id} name=${textarea.name} className=${textarea.className}`
    if (enhanced) {
      uiResults.push({
        for: forValue,
        title: enhanced.enhancer.tableTitle(enhanced.spot),
        upperDecoration: enhanced.enhancer.tableUpperDecoration(enhanced.spot),
      })
    } else {
      uiResults.push({
        for: forValue,
        title: null,
        upperDecoration: null,
      })
    }
  }
  return uiResults
}

// Get all corpus entries that start with 'gh_'
const githubCorpusEntries = Object.keys(CORPUS).filter((key) => key.startsWith('gh_'))

describe('github ui', () => {
  for (const corpusKey of githubCorpusEntries) {
    withCorpus(
      corpusKey as keyof typeof CORPUS,
    ).it('should render correct UI elements', async () => {
      expect(getUIResults(document, window)).toMatchSnapshot()
    })
  }
})
