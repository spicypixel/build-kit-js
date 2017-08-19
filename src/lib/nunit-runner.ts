import * as Bluebird from "bluebird";
import * as gulp from "gulp";
import * as nunit from "gulp-nunit-runner";

export default class NUnitRunner {
  static async runAsync(testPathPatternsOrOptions?: string | string[] | nunit.Options, options?: nunit.Options) {
    let testPathPatterns: string | string[];
    if (typeof testPathPatternsOrOptions === "string" || Array.isArray(testPathPatternsOrOptions)) {
      testPathPatterns = testPathPatternsOrOptions;
    }
    else {
      options = testPathPatternsOrOptions;
    }
    if (!testPathPatterns)
      testPathPatterns = "**/bin/**/*Test.dll";

    if (!options) options = {};
    if (options.executable === undefined) {
      options.executable = "/usr/local/bin";
    }
    if (options.teamcity === undefined) {
      options.teamcity = false;
    }

    await new Promise((resolve, reject) => {
      gulp.src(testPathPatterns, { read: false })
        .pipe(nunit(options))
        .once("end", resolve)
        .once("error", reject);
    });
  }
}