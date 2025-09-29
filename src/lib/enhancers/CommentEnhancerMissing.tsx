import type { OverTypeInstance } from "overtype"
import type { ReactNode } from "react"
import type {
  CommentEnhancer,
  CommentSpot,
  StrippedLocation,
} from "../enhancer"

/** Used when an entry is in the table which we don't recognize. */
export class CommentEnhancerMissing implements CommentEnhancer {
  tableUpperDecoration(spot: CommentSpot): ReactNode {
    return (
      <button
        type="button"
        className="relative inline-block cursor-pointer border-none bg-transparent p-0 text-left underline"
        style={{
          display: "inline-block",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          const popup = e.currentTarget.querySelector(".popup") as HTMLElement
          if (popup) popup.style.display = "block"
        }}
        onMouseLeave={(e) => {
          const popup = e.currentTarget.querySelector(".popup") as HTMLElement
          if (popup) popup.style.display = "none"
        }}
      >
        hover for json
        <div
          className="popup absolute top-full left-0 z-50 min-w-[320px] rounded border border-gray-300 bg-gray-100 p-2 shadow-lg"
          style={{ display: "none" }}
        >
          <pre className="m-0 cursor-text select-text whitespace-pre-wrap break-words font-mono text-xs">
            {JSON.stringify(spot, null, 2)}
          </pre>
        </div>
      </button>
    )
  }
  tableTitle(spot: CommentSpot): string {
    return `Unknown type '${spot.type}'`
  }
  forSpotTypes(): string[] {
    throw new Error("Method not implemented.")
  }
  tryToEnhance(
    _textarea: HTMLTextAreaElement,
    _location: StrippedLocation
  ): CommentSpot | null {
    throw new Error("Method not implemented.")
  }
  enhance(
    _textarea: HTMLTextAreaElement,
    _spot: CommentSpot
  ): OverTypeInstance {
    throw new Error("Method not implemented.")
  }
}
