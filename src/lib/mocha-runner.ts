import * as Promise from "bluebird";
import * as gulp from "gulp";
import * as mocha from "gulp-mocha";

export default class MochaRunner {
  runAsync(testPathPatterns?: string|string[], options?: MochaSetupOptions): Promise<any> {
    if (!testPathPatterns)
      testPathPatterns = "./test/**/*.js";

    return new Promise<any>((resolve, reject) => {
      return gulp.src(testPathPatterns, { read: false })
        .pipe(mocha(options))
        .once("end", resolve)
        .once("error", reject);
    });
  }
}