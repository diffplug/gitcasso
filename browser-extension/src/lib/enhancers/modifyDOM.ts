// Modify the DOM to trick overtype into adopting it instead of recreating it
export function modifyDOM(overtypeInput: HTMLTextAreaElement): HTMLElement {
  overtypeInput.classList.add('overtype-input')
  const overtypePreview = document.createElement('div')
  overtypePreview.classList.add('overtype-preview')
  overtypeInput.insertAdjacentElement('afterend', overtypePreview)
  const overtypeWrapper = overtypeInput.parentElement!.closest('div')!
  overtypeWrapper.classList.add('overtype-wrapper')
  overtypeInput.placeholder = 'Add your comment here...'
  const overtypeContainer = overtypeWrapper.parentElement!.closest('div')!
  overtypeContainer.classList.add('overtype-container')
  return overtypeContainer.parentElement!.closest('div')!
}
