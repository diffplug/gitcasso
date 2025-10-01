// Link that opens outside of the popup
export function LinkOutOfPopup(
  props: React.AnchorHTMLAttributes<HTMLAnchorElement>
) {
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="truncate hover:underline"
    >
      {props.children}
    </a>
  )
}
