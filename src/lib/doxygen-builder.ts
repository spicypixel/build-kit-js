import * as Promise from "bluebird";
import * as path from "path";
import ChildProcess from "./child-process";

export default class DoxygenBuilder {
  // Install node dependencies
  static installThemeAsync(): Promise<any> {
    console.log("Installing doxygen theme ...");

    return ChildProcess.spawnAsync("npm", ["install"],
      { cwd: path.join(__dirname, "Doxygen", "theme", "bootstrap"), log: true });
  }

  // Build Doxygen
  static doxygenAsync(): Promise<any> {
    console.log("Building Doxygen docs ...");
    return ChildProcess.spawnAsync("doxygen", [], { log: true });
  }

  // Build
  static async buildAsync(): Promise<any> {
    await this.installThemeAsync();
    await this.doxygenAsync();
  }
}