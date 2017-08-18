import * as Bluebird from "bluebird";
import * as gulp from "gulp";
import * as mocha from "gulp-mocha";

export default class MochaRunner {
  static async runAsync(testPathPatternsOrOptions?: string | string[] | MochaSetupOptions, options?: MochaSetupOptions): Promise<void> {
    let testPathPatterns: string | string[];
    if (typeof testPathPatternsOrOptions === "string" || Array.isArray(testPathPatternsOrOptions)) {
      testPathPatterns = testPathPatternsOrOptions;
    }
    else {
      options = testPathPatternsOrOptions;
    }
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