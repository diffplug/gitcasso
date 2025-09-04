import type { CommentContext, TextareaInfo } from './textarea-handler'

export class TextareaRegistry {
  private textareas = new Map<HTMLTextAreaElement, TextareaInfo<any>>()

  register<T extends CommentContext>(textareaInfo: TextareaInfo<T>): void {
    this.textareas.set(textareaInfo.element, textareaInfo)
    // TODO: register as a draft in progress with the global list
  }

  unregisterDueToModification(textarea: HTMLTextAreaElement): void {
    if (this.textareas.has(textarea)) {
      // TODO: register as abandoned or maybe submitted with the global list
      this.textareas.delete(textarea)
    }
  }

  get(textarea: HTMLTextAreaElement): TextareaInfo<any> | undefined {
    return this.textareas.get(textarea)
  }
}
