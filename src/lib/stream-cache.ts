/// <reference types="node" />

import * as Util from "util";
import * as stream from "stream";

export default class StreamCache extends stream.Stream implements NodeJS.WritableStream {
  writable: boolean;
  readable: boolean;

  private _buffers: any[];
  private _dests: any[];
  private _ended: boolean;

  constructor() {
    super();
    this.writable = true;
    this.readable = true;

    this._buffers = [];
    this._dests   = [];
    this._ended   = false;
  }

  write(buffer: Buffer | string, encoding?: string | Function, cb?: Function): boolean {
    this._buffers.push(buffer);

    this._dests.forEach(function(dest) {
      dest.write(buffer);
    });

    return true;
  }

  pipe<T>(dest: T, options?: { end?: boolean }) {
    this._buffers.forEach(function(buffer) {
      (<any>dest).write(buffer);
    });

    if (this._ended) {
      if (options && options.end)
        (<any>dest).end();
      return dest;
    }

    this._dests.push(dest);

    return dest;
  }

  getLength(): number {
    return this._buffers.reduce(function(totalLength, buffer) {
      return totalLength + buffer.length;
    }, 0);
  }

  end() {
    this._dests.forEach(function(dest) {
      dest.end();
    });

    this._ended = true;
    this._dests = [];
  }
}