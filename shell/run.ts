export type ExtraRunOptions = Omit<Deno.RunOptions, 'cmd' | 'stdout' | 'stderr' | 'stdin'>;

export interface PipedProcessResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
}
export interface UnpipedProcessResult {
  status: Deno.ProcessStatus;
}
export interface RawProcessResult {
  status: Deno.ProcessStatus;
  stdout: Uint8Array;
  stderr: Uint8Array;
}
export type ProcessResult = PipedProcessResult | UnpipedProcessResult;

export function shellEval(command: string): string[] {
  return [Deno.env.get('SHELL') ?? 'sh', '-c', command];
}

export async function checkCommandAvailable(cmd: string, extraOptions: ExtraRunOptions = {}): Promise<boolean> {
  return await tryRunPiped(shellEval(`command -v ${cmd}`), extraOptions);
}

export function run(command: string[], extraOptions: ExtraRunOptions = {}): Promise<UnpipedProcessResult> {
  const proc = Deno.run({ cmd: command, ...extraOptions });
  return finishUnpipedProcess(proc);
}

export function runPiped(command: string[], extraOptions: ExtraRunOptions = {}): Promise<PipedProcessResult> {
  const proc = Deno.run({ cmd: command, stdout: 'piped', stderr: 'piped', ...extraOptions });
  return finishPipedProcess(proc);
}

export async function tryRunPiped(command: string[], extraOptions: ExtraRunOptions = {}): Promise<boolean> {
  try {
    const proc = Deno.run({ cmd: command, stdout: 'piped', stderr: 'piped', ...extraOptions });
    await finishPipedProcess(proc);
    return true;
  } catch (_) {
    return false;
  }
}

async function finishPipedProcess(proc: Deno.Process): Promise<PipedProcessResult> {
  const [status, stdout, stderr] = await Promise.all([proc.status(), proc.output(), proc.stderrOutput()]);

  const decoder = new TextDecoder();
  const result: PipedProcessResult = {
    status,
    stdout: decoder.decode(stdout),
    stderr: decoder.decode(stderr),
  };
  proc.close();

  if (result.status.success) {
    return result;
  } else {
    throw new ProcessError(result);
  }
}

async function finishUnpipedProcess(proc: Deno.Process): Promise<UnpipedProcessResult> {
  const status = await proc.status();
  proc.close();

  if (status.success) {
    return { status };
  } else {
    throw new ProcessError({ status });
  }
}

export class ProcessError extends Error {
  constructor(readonly result: ProcessResult) {
    super(`Process exited with return code of: ${result.status.code}` + ProcessError.summarize(result));
  }
  private static summarize(result: ProcessResult): string {
    if (!('stdout' in result) || typeof result.stdout !== 'string') {
      return '';
    }
    let message = '';
    if (result.stderr.length > 0) {
      message += '\n' + result.stderr;
    }
    if (result.stdout.length > 0) {
      message += '\n' + result.stdout;
    }
    return message;
  }
}
