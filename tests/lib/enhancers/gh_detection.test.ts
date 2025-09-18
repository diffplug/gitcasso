import { CORPUS } from '../../corpus/_corpus-index'
import { describe, expect, getDetectionResults, withCorpus } from '../../corpus-fixture'

// Get all corpus entries that start with 'gh_'
const githubCorpusEntries = Object.keys(CORPUS).filter((key) => key.startsWith('gh_'))

describe('github detection', () => {
  for (const corpusKey of githubCorpusEntries) {
    withCorpus(corpusKey as keyof typeof CORPUS).it('should detect correct spots', async () => {
      expect(getDetectionResults()).toMatchSnapshot()
    })
  }
})
