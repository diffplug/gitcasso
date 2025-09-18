---
argument-hint: [corpus_slug]
description: uses Playwright MCP and the `corpus` to parse page elements
---

- using Playwright MCP, navigate to `http://localhost:3001/corpus/$1/gitcasso`
- the page will have a div with id `gitcasso-comment-spots`, wait 500ms for it to settle
- inside the `gitcasso-comment-spots` div you will see something like this:

```json
{
 "url": "https://github.com/diffplug/selfie/issues/523",
 "allTextAreas": [
  {
   "textarea": "id='feedback' name='feedback' className='form-control width-full mb-2'",
   "spot": "NO_SPOT"
  },
  {
   "textarea": "id=':rn:' name='' className='prc-Textarea-TextArea-13q4j overtype-input'",
   "spot": {
    "domain": "github.com",
    "number": 523,
    "slug": "diffplug/selfie",
    "title": "TODO_TITLE",
    "type": "GH_ISSUE_ADD_COMMENT",
    "unique_key": "github.com:diffplug/selfie:523"
   }
  }
 ]
}
```

- this output means that this page is simulating the url `https://github.com/diffplug/selfie/issues/523`
- every textarea on the page is represented
- `NO_SPOT` means that the spot was not enhanced
- `type: GH_ISSUE_ADD_COMMENT` means that it was enhanced by whichever implementation of `CommentEnhancer` returns the spot type `GH_ISSUE_ADD_COMMENT`
- if you search for that string in `src/lib/enhancers` you will find the correct one
- the `tryToEnhance` method returned a `CommentSpot`, and that whole data is splatted out above

If you make a change to the code of the enhancer, you can click the button with id `gitcasso-rebuild-btn`. It will trigger a rebuild of the browser extension, and then refresh the page. You'll be able to see the effects of your change in the `gitcasso-comment-spots` div described above.

## Common extraction workflow

If you see `"title": "TODO_TITLE"` or similar hardcoded `TODO` values in the JSON output, this indicates the enhancer needs some kind of extraction implemented:

1. **Find the enhancer**: Search for the `type` value (e.g., `GH_ISSUE_ADD_COMMENT`) in `src/lib/enhancers/`
2. **Implement extraction**: Replace hardcoded title with DOM extraction:
   ```javascript
   const title = document.querySelector('main h1')!.textContent.replace(/\s*#\d+$/, '').trim()
   ```
4. **Test with rebuild**: Click the 🔄 button to rebuild and verify the title appears correctly in the JSON

## Extraction code style

- Don't hedge your bets and write lots of fallback code or strings of `?.`. Have a specific piece of data you want to get, use non-null `!` assertions where necessary to be clear about getting.
- If a field is empty, represent it with an empty string. Don't use placeholders when extracting data.
- The pages we are scraping are going to change over time, and it's easier to fix broken ones if we know exactly what used to work. If the code has lots of branching paths, it's harder to tell what it was doing.