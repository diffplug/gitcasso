import { describe, expect, it } from 'vitest'
import { statsFor } from '../../../src/lib/enhancers/draft-stats'

describe('statsFor', () => {
  it('should handle empty markdown', () => {
    expect(statsFor('')).toMatchInlineSnapshot(`
      {
        "charCount": 0,
        "codeBlocks": [],
        "images": [],
        "links": [],
      }
    `)
  })

  it('should count characters', () => {
    expect(statsFor('Hello world')).toMatchInlineSnapshot(`
      {
        "charCount": 11,
        "codeBlocks": [],
        "images": [],
        "links": [],
      }
    `)
  })

  it('should extract images with alt text', () => {
    expect(statsFor('![Alt text](https://example.com/image.png)')).toMatchInlineSnapshot(`
      {
        "charCount": 42,
        "codeBlocks": [],
        "images": [
          {
            "alt": "Alt text",
            "url": "https://example.com/image.png",
          },
        ],
        "links": [],
      }
    `)
  })

  it('should extract images without alt text', () => {
    expect(statsFor('![](https://example.com/image.png)')).toMatchInlineSnapshot(`
      {
        "charCount": 34,
        "codeBlocks": [],
        "images": [
          {
            "url": "https://example.com/image.png",
          },
        ],
        "links": [],
      }
    `)
  })

  it('should extract links', () => {
    expect(statsFor('[Link text](https://example.com)')).toMatchInlineSnapshot(`
      {
        "charCount": 32,
        "codeBlocks": [],
        "images": [],
        "links": [
          {
            "text": "Link text",
            "url": "https://example.com",
          },
        ],
      }
    `)
  })

  it('should extract code blocks with language', () => {
    expect(statsFor('```javascript\nconsole.log("hello")\n```')).toMatchInlineSnapshot(`
      {
        "charCount": 38,
        "codeBlocks": [
          {
            "code": "console.log("hello")
      ",
            "language": "javascript",
          },
        ],
        "images": [],
        "links": [],
      }
    `)
  })

  it('should extract code blocks without language', () => {
    expect(statsFor('```\nconsole.log("hello")\n```')).toMatchInlineSnapshot(`
      {
        "charCount": 28,
        "codeBlocks": [
          {
            "code": "console.log("hello")
      ",
          },
        ],
        "images": [],
        "links": [],
      }
    `)
  })

  it('should handle complex markdown with multiple elements', () => {
    const markdown = `# Title

Here's some text with a [link](https://example.com) and an ![image](https://example.com/img.png).

\`\`\`typescript
function hello() {
  return "world"
}
\`\`\`

More text with another ![alt text](https://example.com/img2.jpg) and [another link](https://test.com).

\`\`\`
plain code block
\`\`\``

    expect(statsFor(markdown)).toMatchInlineSnapshot(`
      {
        "charCount": 293,
        "codeBlocks": [
          {
            "code": "function hello() {
        return "world"
      }
      ",
            "language": "typescript",
          },
          {
            "code": "plain code block
      ",
          },
        ],
        "images": [
          {
            "alt": "image",
            "url": "https://example.com/img.png",
          },
          {
            "alt": "alt text",
            "url": "https://example.com/img2.jpg",
          },
        ],
        "links": [
          {
            "text": "link",
            "url": "https://example.com",
          },
          {
            "text": "another link",
            "url": "https://test.com",
          },
        ],
      }
    `)
  })
})
