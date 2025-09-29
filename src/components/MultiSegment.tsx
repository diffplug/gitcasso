import { badgeCVA, typeIcons } from "@/components/design"

interface Segment<T> {
  text?: string
  type: keyof typeof typeIcons
  value: T
}
interface MultiSegmentProps<T> {
  segments: Segment<T>[]
  value: T
  onValueChange: (value: T) => void
}

const MultiSegment = <T,>({
  segments,
  value,
  onValueChange,
}: MultiSegmentProps<T>) => {
  return (
    <div className="inline-flex items-center gap-0">
      {segments.map((segment, index) => {
        const Icon = typeIcons[segment.type]
        const isFirst = index === 0
        const isLast = index === segments.length - 1

        const roundedClasses =
          isFirst && isLast
            ? ""
            : isFirst
              ? "!rounded-r-none"
              : isLast
                ? "!rounded-l-none"
                : "!rounded-none"

        return (
          <button
            key={String(segment.value)}
            className={`${badgeCVA({
              clickable: true,
              selected: value === segment.value,
              type: segment.type,
            })} ${roundedClasses}`}
            onClick={() => onValueChange(segment.value)}
            type="button"
          >
            {segment.type === "blank" || <Icon className="h-3 w-3" />}
            {segment.text}
          </button>
        )
      })}
    </div>
  )
}

export default MultiSegment
