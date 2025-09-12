import hljs from "highlight.js";
import OverType from "overtype";

export function githubPrNewCommentContentScript() {
  if (window.location.hostname !== "github.com") {
    return;
  }
  OverType.setCodeHighlighter(hljsHighlighter);
  const ghCommentBox = document.getElementById(
    "new_comment_field",
  ) as HTMLTextAreaElement | null;
  if (ghCommentBox) {
    const overtypeContainer = modifyDOM(ghCommentBox);
    new OverType(overtypeContainer, {
      autoResize: true,
      minHeight: "102px",
      padding: "var(--base-size-8)",
      placeholder: "Add your comment here...",
    });
  }
}

function modifyDOM(overtypeInput: HTMLTextAreaElement): HTMLElement {
  overtypeInput.classList.add("overtype-input");
  const overtypePreview = document.createElement("div");
  overtypePreview.classList.add("overtype-preview");
  overtypeInput.insertAdjacentElement("afterend", overtypePreview);
  const overtypeWrapper = overtypeInput.parentElement!.closest("div")!;
  overtypeWrapper.classList.add("overtype-wrapper");
  overtypeInput.placeholder = "Add your comment here...";
  const overtypeContainer = overtypeWrapper.parentElement!.closest("div")!;
  overtypeContainer.classList.add("overtype-container");
  return overtypeContainer.parentElement!.closest("div")!;
}

function hljsHighlighter(code: string, language?: string) {
  try {
    if (language && hljs.getLanguage(language)) {
      const result = hljs.highlight(code, { language });
      return result.value;
    } else {
      const result = hljs.highlightAuto(code);
      return result.value;
    }
  } catch (error) {
    console.warn("highlight.js highlighting failed:", error);
    return code;
  }
}
