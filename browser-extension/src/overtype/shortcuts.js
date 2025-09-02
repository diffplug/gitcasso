/**
 * Keyboard shortcuts handler for OverType editor
 * Uses the same handleAction method as toolbar for consistency
 */

import * as markdownActions from "markdown-actions";

/**
 * ShortcutsManager - Handles keyboard shortcuts for the editor
 */
export class ShortcutsManager {
  constructor(editor) {
    this.editor = editor;
    this.textarea = editor.textarea;
    // No need to add our own listener - OverType will call handleKeydown
  }

  /**
   * Handle keydown events - called by OverType
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {boolean} Whether the event was handled
   */
  handleKeydown(event) {
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const modKey = isMac ? event.metaKey : event.ctrlKey;

    if (!modKey) return false;

    let action = null;

    // Map keyboard shortcuts to toolbar actions
    switch (event.key.toLowerCase()) {
      case "b":
        if (!event.shiftKey) {
          action = "toggleBold";
        }
        break;

      case "i":
        if (!event.shiftKey) {
          action = "toggleItalic";
        }
        break;

      case "k":
        if (!event.shiftKey) {
          action = "insertLink";
        }
        break;

      case "7":
        if (event.shiftKey) {
          action = "toggleNumberedList";
        }
        break;

      case "8":
        if (event.shiftKey) {
          action = "toggleBulletList";
        }
        break;
    }

    // If we have an action, handle it exactly like the toolbar does
    if (action) {
      event.preventDefault();

      // If toolbar exists, use its handleAction method (exact same code path)
      if (this.editor.toolbar) {
        this.editor.toolbar.handleAction(action);
      } else {
        // Fallback: duplicate the toolbar's handleAction logic
        this.handleAction(action);
      }

      return true;
    }

    return false;
  }

  /**
   * Handle action - fallback when no toolbar exists
   * This duplicates toolbar.handleAction for consistency
   */
  async handleAction(action) {
    const textarea = this.textarea;
    if (!textarea) return;

    // Focus textarea
    textarea.focus();

    try {
      switch (action) {
        case "toggleBold":
          markdownActions.toggleBold(textarea);
          break;
        case "toggleItalic":
          markdownActions.toggleItalic(textarea);
          break;
        case "insertLink":
          markdownActions.insertLink(textarea);
          break;
        case "toggleBulletList":
          markdownActions.toggleBulletList(textarea);
          break;
        case "toggleNumberedList":
          markdownActions.toggleNumberedList(textarea);
          break;
      }

      // Trigger input event to update preview
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (error) {
      console.error("Error in markdown action:", error);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    // Nothing to clean up since we don't add our own listener
  }
}
