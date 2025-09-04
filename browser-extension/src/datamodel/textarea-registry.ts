import { TextareaInfo, CommentContext } from './textarea-handler';

export class TextareaRegistry {
  private textareas = new Map<HTMLTextAreaElement, TextareaInfo<any>>();

  register<T extends CommentContext>(textareaInfo: TextareaInfo<T>): void {
    this.textareas.set(textareaInfo.element, textareaInfo);
  }

  get(textarea: HTMLTextAreaElement): TextareaInfo<any> | undefined {
    return this.textareas.get(textarea);
  }
}