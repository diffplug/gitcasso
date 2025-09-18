import { CORPUS } from '../../corpus/_corpus-index'
import { describe, detectedSpots, expect, withCorpus } from '../../corpus-fixture'

// Get all corpus entries that start with 'gh_'
const githubCorpusEntries = (Object.keys(CORPUS) as Array<keyof typeof CORPUS>).filter((key) =>
  key.startsWith('gh_'),
)

describe('github detection', () => {
  for (const corpusKey of githubCorpusEntries) {
    withCorpus(corpusKey).it('should detect correct spots', async () => {
      expect(detectedSpots()).toMatchSnapshot()
    })
  }
})
