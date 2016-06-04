import * as Promise from "bluebird";
import * as path from "path";
import * as gulp from "gulp";
import * as msbuild from "gulp-msbuild";

export default class MSBuildBuilder {
  static async buildAsync(sourcePatterns: string|string[], options?: msbuild.Options): Promise<void> {
    await new Promise((resolve, reject) => {
      gulp
        .src(sourcePatterns)
        .pipe(msbuild(options))
        .once("end", resolve)
        .once("error", reject);
    });
  }
}