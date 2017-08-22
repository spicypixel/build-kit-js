import * as gulp from "gulp";
import * as msbuild from "gulp-msbuild";

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
    if (process.platform.match(/darwin/)) {
      (<any>options).msbuildPath = "msbuild";
      if (!options.toolsVersion) options.toolsVersion = undefined;
    }

    if (!sourcePatterns) sourcePatterns = "**/*.sln";

    await new Promise((resolve, reject) => {
      gulp
        .src(sourcePatterns)
        .pipe(msbuild(options))
        .once("end", resolve)
        .once("error", reject);
    });
  }

  static async restoreAsync(sourcePatternsOrOptions?: string | string[] | msbuild.Options, options?: msbuild.Options) {
      let sourcePatterns: string | string[];
      if (typeof sourcePatternsOrOptions === "string" || Array.isArray(sourcePatternsOrOptions)) {
        sourcePatterns = sourcePatternsOrOptions;
      }
      else {
        options = sourcePatternsOrOptions;
      }
      if (!options) options = {};
      options.targets = ["restore"];
      await this.buildAsync(sourcePatterns, options);
  }
}