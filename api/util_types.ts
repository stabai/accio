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

// deno-lint-ignore no-explicit-any
export type CommandYargs = any;
// deno-lint-ignore no-explicit-any
export interface NamedArgs extends Record<string, any> {
  _: string[];
  $0: string;
}

export function idify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}
