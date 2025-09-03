import OverType from "../overtype/overtype";

export default defineContentScript({
  main() {
    if (window.location.hostname !== "github.com") {
      return;
    }

    const ghCommentBox = document.getElementById(
      "new_comment_field"
    ) as HTMLTextAreaElement | null;
    if (ghCommentBox) {
      const overtypeContainer = modifyGithubDOM(ghCommentBox);
      new OverType(overtypeContainer, {
        placeholder: "Add your comment here...",
        autoResize: true,
        minHeight: "102px",
        padding: "var(--base-size-8)",
      });
    }
  },
  matches: ["<all_urls>"],
  runAt: "document_end",
});

function modifyGithubDOM(ghCommentBox: HTMLTextAreaElement): HTMLElement {
  ghCommentBox.classList.add("overtype-input");
  const previewDiv = document.createElement("div");
  previewDiv.classList.add("overtype-preview");
  ghCommentBox.insertAdjacentElement("afterend", previewDiv);
  const ghCommentWrapper = ghCommentBox.parentElement!.closest("div")!;
  ghCommentWrapper.classList.add("overtype-wrapper");
  injectGithubStyles({
    commentBox: ghCommentBox,
    commentWrapper: ghCommentWrapper,
    overtypePreviewDiv: previewDiv,
  });
  const ghCommentContainer = ghCommentWrapper.parentElement!.closest("div")!;
  ghCommentContainer.classList.add("overtype-container");
  return ghCommentContainer.parentElement!.closest("div")!;
}

interface GithubDOM {
  commentBox: HTMLTextAreaElement;
  commentWrapper: HTMLDivElement;
  overtypePreviewDiv: HTMLDivElement;
}
function injectGithubStyles({
  commentBox,
  commentWrapper,
  overtypePreviewDiv,
}: GithubDOM) {
  commentBox.placeholder = "Add your comment here...";
  commentBox.style.fontFamily = "inherit !important";
  commentBox.style.fontSize = "var(--text-body-size-medium) !important";
  overtypePreviewDiv.style.fontFamily = "inherit !important";
  overtypePreviewDiv.style.fontSize = "var(--text-body-size-medium) !important";
  commentWrapper.style.margin = "var(--base-size-8) !important";
  commentWrapper.style.border =
    "var(--borderWidth-thin) solid var(--borderColor-default, var(--color-border-default)) !important";
  commentWrapper.style.borderRadius = "var(--borderRadius-medium) !important";
  commentWrapper.style.width =
    "calc(100% - var(--stack-padding-condensed, 8px) * 2) !important";
}
