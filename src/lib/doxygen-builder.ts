import * as path from "path";
import ChildProcess from "./child-process";

export default class DoxygenBuilder {
  // Install node dependencies
  static async installThemeAsync() {
    console.log("Installing doxygen theme ...");

    await ChildProcess.spawnAsync("npm", ["install"],
      { cwd: path.join(".", "Doxygen", "theme", "bootstrap"), stdio: "inherit" });
  }

  // Build Doxygen
  static async doxygenAsync() {
    console.log("Building Doxygen docs ...");
    await ChildProcess.spawnAsync("doxygen", [], { stdio: "inherit" });
  }

  // Build
  static async buildAsync() {
    await this.installThemeAsync();
    await this.doxygenAsync();
  }
}