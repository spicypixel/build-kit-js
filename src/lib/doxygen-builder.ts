import * as Promise from "bluebird";
import * as path from "path";
import ChildProcess from "./child-process";

export default class DoxygenBuilder {
  constructor() {
  }

  // Install node dependencies
  installThemeAsync(): Promise<any> {
    console.log("Installing doxygen theme ...");

    return ChildProcess.spawnAsync("npm", ["install"],
      { cwd: path.join(__dirname, "Doxygen", "theme", "bootstrap"), log: true });
  }

  // Build Doxygen
  doxygenAsync(): Promise<any> {
    console.log("Building Doxygen docs ...");
    return ChildProcess.spawnAsync("doxygen", [], { log: true });
  }

  // Build
  async buildAsync(): Promise<any> {
    await this.installThemeAsync();
    await this.doxygenAsync();
  }
}