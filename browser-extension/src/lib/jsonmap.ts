/** Map which can take any JSON as key and uses its sorted serialization as the underlying key. */
export class JsonMap<K, V> {
  private map = new Map<string, V>()

  set(key: K, value: V): this {
    this.map.set(stableStringify(key), value)
    return this
  }

  get(key: K): V | undefined {
    return this.map.get(stableStringify(key))
  }

  has(key: K): boolean {
    return this.map.has(stableStringify(key))
  }

  delete(key: K): boolean {
    return this.map.delete(stableStringify(key))
  }

  clear(): void {
    this.map.clear()
  }

  get size(): number {
    return this.map.size
  }

  *values(): IterableIterator<V> {
    yield* this.map.values()
  }

  *entries(): IterableIterator<[K, V]> {
    for (const [stringKey, value] of this.map.entries()) {
      yield [JSON.parse(stringKey) as K, value]
    }
  }

  *keys(): IterableIterator<K> {
    for (const stringKey of this.map.keys()) {
      yield JSON.parse(stringKey) as K
    }
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries()
  }
}

function stableStringify(v: unknown): string {
  return JSON.stringify(v, (_k, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // sort object keys recursively
      return Object.keys(val as Record<string, unknown>)
        .sort()
        .reduce(
          (acc, k) => {
            ;(acc as any)[k] = (val as any)[k]
            return acc
          },
          {} as Record<string, unknown>,
        )
    }
    return val
  })
}
