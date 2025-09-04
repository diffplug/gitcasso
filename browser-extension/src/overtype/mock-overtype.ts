/**
 * Mock implementation of Overtype for development
 * This wraps a textarea and provides a minimal interface
 */
export class OverType {
  public element: HTMLTextAreaElement
  public instanceId: number
  public initialized: boolean = true

  private static instanceCount = 0

  constructor(target: HTMLTextAreaElement) {
    this.element = target
    this.instanceId = ++OverType.instanceCount

    // Store reference on the element
    ;(target as any).overTypeInstance = this

    // Apply basic styling or enhancement
    this.enhance()
  }

  private enhance(): void {
    // Mock enhancement - could add basic styling, event handlers, etc.
    this.element.style.fontFamily =
      'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
    this.element.style.fontSize = '14px'
    this.element.style.lineHeight = '1.5'
  }

  getValue(): string {
    return this.element.value
  }

  setValue(value: string): void {
    this.element.value = value
  }

  destroy(): void {
    // Clean up any enhancements
    delete (this.element as any).overTypeInstance
    this.initialized = false
  }
}
