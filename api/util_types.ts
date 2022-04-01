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
