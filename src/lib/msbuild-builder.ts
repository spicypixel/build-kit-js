import * as gulp from "gulp";
import * as msbuild from "gulp-msbuild";
import ChildProcess from "./child-process";

export default class MSBuildBuilder {
  static async buildAsync(sourcePatternsOrOptions?: string | string[] | msbuild.Options, options?: msbuild.Options) {
    let sourcePatterns: string | string[];
    if (typeof sourcePatternsOrOptions === "string" || Array.isArray(sourcePatternsOrOptions)) {
      sourcePatterns = sourcePatternsOrOptions;
    }
    else {
      options = sourcePatternsOrOptions;
    }
    if (!options) options = {};
    if (options.errorOnFail === undefined) options.errorOnFail = true;
    if (options.emitEndEvent === undefined) options.emitEndEvent = true;
    if (options.stdout === undefined) options.stdout = true;
    if (process.platform.match(/darwin/)) {
      (<any>options).msbuildPath = "msbuild";
      if (!options.toolsVersion) options.toolsVersion = undefined;
    }

    if (!sourcePatterns) {
      sourcePatterns = "**/*.sln";
      if (!options.targets) options.targets = ["Build"];
    }

    await new Promise((resolve, reject) => {
      gulp
        .src(sourcePatterns)
        .pipe(msbuild(options))
        .once("end", resolve)
        .once("error", reject);
    });
  }

  static async restoreAsync(sourcePatterns?: string | string[]) {
    if (!sourcePatterns || sourcePatterns.length === 0) {
      sourcePatterns = "**/*.sln";
    }

    if (process.platform.match(/darwin/)) {

      await ChildProcess.spawnAsync("nuget",
        ["restore"].concat(sourcePatterns),
        { stdio: "inherit" });
    }
    else {
      let options: msbuild.Options = {};
      options.targets = ["restore"];
      await this.buildAsync(sourcePatterns, options);
    }
  }
}