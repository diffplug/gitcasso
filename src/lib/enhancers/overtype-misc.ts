import type { OverTypeInstance } from "overtype"

// Assert that OverType returned exactly one instance and return it
export function fixupOvertype(instances: OverTypeInstance[]): OverTypeInstance {
  if (instances.length !== 1) {
    throw new Error(
      `Expected OverType to return exactly 1 instance, got ${instances.length}`
    )
  }
  const overtype = instances[0]!
  // this works, but we're now updating twice as often as we need to, because
  // overtype has a built-in update which usually works but not always (#101)
  // and we're doing this which does always work
  const updateOnChange = new MutationObserver(() => {
    overtype.updatePreview()
  })
  updateOnChange.observe(overtype.textarea, {
    attributes: true,
    characterData: true,
  })
  return overtype
}

// Modify the DOM to trick overtype into adopting it instead of recreating it
export function modifyDOM(overtypeInput: HTMLTextAreaElement): HTMLElement {
  overtypeInput.classList.add("overtype-input")
  const overtypePreview = document.createElement("div")
  overtypePreview.classList.add("overtype-preview")
  overtypeInput.insertAdjacentElement("afterend", overtypePreview)
  const overtypeWrapper = overtypeInput.parentElement!.closest("div")!
  overtypeWrapper.classList.add("overtype-wrapper")
  overtypeInput.placeholder = "Add your comment here..."
  const overtypeContainer = overtypeWrapper.parentElement!.closest("div")!
  overtypeContainer.classList.add("overtype-container")

  // Watch for class changes and restore if removed
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        if (!overtypeContainer.classList.contains("overtype-container")) {
          overtypeContainer.classList.add("overtype-container")
        }
      }
    })
  })

  observer.observe(overtypeContainer, {
    attributeFilter: ["class"],
    attributes: true,
  })

  // Find the button that contains the text "Preview"
  const writePreviewTabs = Array.from(
    (overtypeContainer.firstElementChild as HTMLElement).querySelectorAll(
      "button"
    )
  )
  const writeTab = writePreviewTabs.find((button) =>
    button.textContent.includes("Write")
  )
  const previewTab = writePreviewTabs.find((button) =>
    button.textContent.includes("Preview")
  )

  if (writeTab && previewTab) {
    // Hide the textarea when the user is on the "Preview" tab
    writeTab.addEventListener("click", () => {
      overtypeWrapper.style.display = "inline-block"
    })

    previewTab.addEventListener("click", () => {
      overtypeWrapper.style.display = "none"
    })
  }

  return overtypeContainer.parentElement!.closest("div")!
}
