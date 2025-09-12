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

  // Watch for class changes and restore if removed
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (!overtypeContainer.classList.contains('overtype-container')) {
          overtypeContainer.classList.add('overtype-container')
        }
      }
    })
  })

  observer.observe(overtypeContainer, {
    attributeFilter: ['class'],
    attributes: true,
  })

  return overtypeContainer.parentElement!.closest('div')!
}
