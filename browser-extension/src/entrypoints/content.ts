import OverType from "../overtype/overtype";

export default defineContentScript({
  main() {
    const ghCommentBox = document.getElementById("new_comment_field") as
      | HTMLTextAreaElement
      | undefined;
    if (ghCommentBox) {
      const overtypeContainer = modifyGithubDOM(ghCommentBox);
      new OverType(overtypeContainer, {
        placeholder: "Add your comment here...",
      });
    }
  },
  matches: ["<all_urls>"],
  runAt: "document_end",
});

function modifyGithubDOM(ghCommentBox: HTMLTextAreaElement) {
  ghCommentBox.classList.add("overtype-input");
  const previewDiv = document.createElement("div");
  previewDiv.classList.add("overtype-preview");
  ghCommentBox.insertAdjacentElement("afterend", previewDiv);
  const ghCommentWrapper = ghCommentBox.parentElement!.closest("div")!;
  ghCommentWrapper.classList.add("overtype-wrapper");
  const ghCommentContainer = ghCommentWrapper.parentElement!.closest("div")!;
  ghCommentContainer.classList.add("overtype-container");
  return ghCommentContainer.parentElement!.closest("div")!;
}
