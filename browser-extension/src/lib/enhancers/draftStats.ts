export interface MdImage {
  url: string
  alt?: string
}

export interface MdLink {
  text: string
  url: string
}

export interface MdCodeBlock {
  language?: string
  code: string
}

export interface DraftStats {
  charCount: number
  images: MdImage[]
  links: MdLink[]
  codeBlocks: MdCodeBlock[]
}
export function statsFor(md: string): DraftStats {
  const charCount = md.length

  const images: MdImage[] = []
  const links: MdLink[] = []
  const codeBlocks: MdCodeBlock[] = []

  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let imageMatch: RegExpExecArray | null
  while ((imageMatch = imageRegex.exec(md)) !== null) {
    images.push({
      ...(imageMatch[1] && { alt: imageMatch[1] }),
      url: imageMatch[2]!,
    })
  }

  const linkRegex = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g
  let linkMatch: RegExpExecArray | null
  while ((linkMatch = linkRegex.exec(md)) !== null) {
    links.push({
      text: linkMatch[1]!,
      url: linkMatch[2]!,
    })
  }

  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let codeMatch: RegExpExecArray | null
  while ((codeMatch = codeBlockRegex.exec(md)) !== null) {
    codeBlocks.push({
      ...(codeMatch[1] && { language: codeMatch[1] }),
      code: codeMatch[2]!,
    })
  }

  return {
    charCount,
    codeBlocks,
    images,
    links,
  }
}
