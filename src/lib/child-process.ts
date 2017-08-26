import {
  ChildProcess as NodeChildProcess,
  SpawnOptions as NodeSpawnOptions,
  spawn
} from "child_process";
import StreamCache from "./stream-cache";

export interface SpawnOptions extends NodeSpawnOptions {
  echo?: boolean;
  silentUntilError?: boolean;
}

export default class ChildProcess {
  static spawnAsync(command: string, args?: string[], options?: SpawnOptions): Promise<NodeChildProcess> {
    let bufferOut: StreamCache;
    let bufferErr: StreamCache;

    if (!args) args = [];
    let spawnCommandAndArgs = command + " " + args.join(" ");
    if (options && options.echo)
      console.log(spawnCommandAndArgs);
    if (options && options.silentUntilError) {
      bufferOut = new StreamCache();
      bufferErr = new StreamCache();
    }

    return new Promise<NodeChildProcess>((resolve, reject) => {
      let failed: boolean = false;
      let proc = spawn(command, args, options);
      if (bufferOut) {
        proc.stdout.pipe(bufferOut);
        proc.stderr.pipe(bufferErr);
      }
      proc.once("error", (error: Error) => {
        failed = true;
        if (bufferOut) {
          bufferOut.pipe(process.stdout, { end: false });
          bufferOut.end();
          bufferOut = null;
          bufferErr.pipe(process.stderr, { end: false });
          bufferErr.end();
          bufferErr = null;
          process.stderr.write("Error: " + (error ? error.message : "") + "\nCommand: " + spawnCommandAndArgs + "\n");
        }
        reject(error);
      });
      proc.once("exit", (code: number) => {
        if (code === 0)
          resolve(proc);
        else {
          if (!failed) {
            let error = new Error("Exit code = " + code + " for:\n" + spawnCommandAndArgs + "\n");
            (<any>error).childProcess = proc;
            if (bufferOut) {
              bufferOut.pipe(process.stdout, { end: false });
              bufferOut.end();
              bufferOut = null;
              bufferErr.pipe(process.stderr, { end: false });
              bufferErr.end();
              bufferErr = null;
              process.stderr.write(error.message);
            }
            reject(error);
          }
        }
      });
    });
  }
}