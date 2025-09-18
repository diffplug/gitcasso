import { describe, expect, getUIResults, withCorpus } from '../../corpus-fixture'

expect

import { CORPUS } from '../../corpus/_corpus-index'

// Get all corpus entries that start with 'gh_'
const githubCorpusEntries = Object.keys(CORPUS).filter((key) => key.startsWith('gh_'))

describe('github ui', () => {
  for (const corpusKey of githubCorpusEntries) {
    withCorpus(
      corpusKey as keyof typeof CORPUS,
    ).it('should render correct UI elements', async () => {
      expect(getUIResults()).toMatchSnapshot()
    })
  }
})
