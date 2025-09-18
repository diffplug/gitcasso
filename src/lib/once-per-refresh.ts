const hasRunSinceTheLastFullPageload = new Set<string>()

/**
 * This function helps you run a given function only once per full pageload.
 * So this will not run again due to turbolink navigation.
 */
export function oncePerRefresh(key: string, fun: () => void) {
  if (hasRunSinceTheLastFullPageload.has(key)) {
    return
  }
  fun()
  hasRunSinceTheLastFullPageload.add(key)
}
