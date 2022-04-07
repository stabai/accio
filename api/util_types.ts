export type PromiseRecord<T> = {
  [P in keyof T]: Promise<T[P]>;
};

export async function awaitRecord<T>(record: PromiseRecord<T>): Promise<T> {
  const mapped: Partial<T> = {};
  for (const prop in record) {
    const promise = record[prop] as Promise<T[Extract<keyof T, string>]>;
    const value = await promise;
    mapped[prop] = value;
  }
  return mapped as T;
}

export function assertExhaustive<T>(_obj: never, message?: string): T {
  throw new Error(message ?? 'Non-exhaustive condition');
}

export async function anyTrue(promises: Promise<boolean | undefined>[]): Promise<boolean> {
  const racing = promises.map((p) =>
    p.then((result) => {
      if (result !== true) {
        throw new Error('Check failed');
      } else {
        return true;
      }
    })
  );
  try {
    return await Promise.any(racing);
  } catch {
    return false;
  }
}

// deno-lint-ignore no-explicit-any
export type CommandYargs = any;
// deno-lint-ignore no-explicit-any
export interface NamedArgs extends Record<string, any> {
  _: string[];
  $0: string;
}

export class KeyedSet<K, V> {
  private readonly map = new Map<K, V>();

  constructor(private readonly keyExtractor: (value: V) => K) {}
  put(value: V): this {
    const key = this.keyExtractor(value);
    if (this.map.has(key)) {
      throw new Error(`Key collision: ${key}`);
    }
    this.map.set(key, value);
    return this;
  }
  get(key: K): V | undefined {
    return this.map.get(key);
  }
  clear(): void {
    this.map.clear();
  }
  deleteKey(key: K): boolean {
    return this.map.delete(key);
  }
  deleteValue(value: V): boolean {
    return this.map.delete(this.keyExtractor(value));
  }
  // deno-lint-ignore no-explicit-any
  forEach(callbackfn: (value: V, key: K, set: Map<K, V>) => void, thisArg?: any): void {
    this.map.forEach(callbackfn, thisArg);
  }
  hasKey(key: K): boolean {
    return this.map.has(key);
  }
  hasValue(value: V): boolean {
    return this.map.has(this.keyExtractor(value));
  }
  get size() {
    return this.map.size;
  }
  entries(): IterableIterator<[K, V]> {
    return this.map.entries();
  }
  keys(): IterableIterator<K> {
    return this.map.keys();
  }
  values(): IterableIterator<V> {
    return this.map.values();
  }
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.map.entries();
  }
  [Symbol.toStringTag]: string;
}
