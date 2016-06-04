import * as Promise from "bluebird";
import * as path from "path";
import ChildProcess from "./child-process";

export default class DoxygenBuilder {
  // Install node dependencies
  static async installThemeAsync(): Promise<void> {
    console.log("Installing doxygen theme ...");

    await ChildProcess.spawnAsync("npm", ["install"],
      { cwd: path.join(".", "Doxygen", "theme", "bootstrap"), log: true });
  }

  // Build Doxygen
  static async doxygenAsync(): Promise<void> {
    console.log("Building Doxygen docs ...");
    await ChildProcess.spawnAsync("doxygen", [], { log: true });
  }

  // Build
  static async buildAsync(): Promise<void> {
    await this.installThemeAsync();
    await this.doxygenAsync();
  }
}