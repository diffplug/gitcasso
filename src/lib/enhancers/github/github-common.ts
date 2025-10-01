import hljs from "highlight.js"
import type { Options } from "overtype"
import OverType from "overtype"
import { oncePerRefresh } from "@/lib/once-per-refresh"

export const commonGitHubOptions: Options = {
  autoResize: true,
  lineHeight: "var(--text-body-lineHeight-medium, 1.4285)",
  padding: "var(--base-size-16)",
}

export function prepareGitHubHighlighter() {
  oncePerRefresh("github-highlighter", () => {
    const textColor = "rgb(31, 35, 40)"
    const headingColor = "rgb(174, 52, 151)"
    OverType.setTheme({
      colors: {
        blockquote: "rgb(89, 99, 110)",
        code: "#59636e",
        codeBg: "#f6f8fa",
        cursor: "#000000",
        em: "rgb(126, 123, 255)",
        h1: headingColor,
        h2: headingColor,
        h3: headingColor,
        hr: "#5a7a9b",
        link: "rgb(9, 105, 218)",
        selection: "rgba(0, 123, 255, 0.3)",
        strong: "rgb(45, 1, 142)",
        syntaxMarker: textColor,
        text: textColor,
      },
      name: "custom-github",
    })
    OverType.setCodeHighlighter(githubHighlighter)
  })
}

function githubHighlighter(code: string, language?: string) {
  try {
    if (language && hljs.getLanguage(language)) {
      const result = hljs.highlight(code, { language })
      return result.value
    } else {
      return code
    }
  } catch (error) {
    console.warn("highlight.js highlighting failed:", error)
    return code
  }
}
