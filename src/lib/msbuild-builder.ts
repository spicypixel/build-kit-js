import * as Promise from "bluebird";
import * as path from "path";
import * as gulp from "gulp";
import * as msbuild from "gulp-msbuild";

export default class MSBuildBuilder {
  static async buildAsync(sourcePatternsOrOptions?: string | string[] | msbuild.Options, options?: msbuild.Options): Promise<void> {
    let sourcePatterns: string | string[];
    if (typeof sourcePatternsOrOptions === "string" || Array.isArray(sourcePatternsOrOptions)) {
      sourcePatterns = sourcePatternsOrOptions;
    }
    else {
      options = sourcePatternsOrOptions;
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
}