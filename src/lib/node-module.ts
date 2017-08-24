import * as gulp from "gulp";
import * as path from "path";
import * as vfs from "vinyl-fs";

export default class NodeModule {
  private _name: string;
  private _packageDir: string;
  private _resolvedPath: string;

  /** @summary Gets the root path of a node module.
   *  @description A node module may resolve to a subfolder and file
   * like lib/index.js. This truncates the path to the module root.
  */
  static getPackageDir(nodeModuleName: string): string {
    return require.resolve(nodeModuleName)
      .match(NodeModule.getPackageDirRegEx(nodeModuleName))[0];
  }

  /** Returns the RegEx used to match the root path of the specified module. */
  static getPackageDirRegEx(nodeModuleName: string): RegExp {
    return new RegExp(".*" + nodeModuleName + "/");
  }

  constructor(name: string) {
    this._name = name;
    this._resolvedPath = require.resolve(name);
    this._packageDir = NodeModule.getPackageDir(name);
  }

  get name(): string {
    return this._name;
  }

  get packageDir(): string {
    return this._packageDir;
  }

  get resolvedPath(): string {
    return this._resolvedPath;
  }
}