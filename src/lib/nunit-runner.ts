import * as Promise from "bluebird";
import * as gulp from "gulp";
import * as nunit from "gulp-nunit-runner";

export default class NUnitRunner {
  static async runAsync(testPathPatterns?: string | string[], options?: nunit.Options): Promise<void> {
    if (!testPathPatterns)
      testPathPatterns = "**/bin/**/*Test.dll";

    if (!options) options = {
      executable: "/usr/local/bin",
      teamcity: false
    };

    await new Promise<void>((resolve, reject) => {
      gulp.src(testPathPatterns, { read: false })
        .pipe(nunit(options))
        .once("end", resolve)
        .once("error", reject);
    });
  }
}