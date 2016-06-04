import * as Promise from "bluebird";
import * as gulp from "gulp";
import * as mocha from "gulp-mocha";

export default class MochaRunner {
  static async runAsync(testPathPatterns?: string|string[], options?: MochaSetupOptions): Promise<void> {
    if (!testPathPatterns)
      testPathPatterns = "./test/**/*.js";

    await new Promise<void>((resolve, reject) => {
      gulp.src(testPathPatterns, { read: false })
        .pipe(mocha(options))
        .once("end", resolve)
        .once("error", reject);
    });
  }
}