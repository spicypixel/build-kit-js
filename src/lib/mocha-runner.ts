import * as gulp from "gulp";
import * as mocha from "gulp-mocha";

export default class MochaRunner {
  static async runAsync(testPathPatternsOrOptions?: string | string[] | MochaSetupOptions, options?: MochaSetupOptions) {
    let testPathPatterns: string | string[];
    if (typeof testPathPatternsOrOptions === "string" || Array.isArray(testPathPatternsOrOptions)) {
      testPathPatterns = testPathPatternsOrOptions;
    }
    else {
      options = testPathPatternsOrOptions;
    }
    if (!testPathPatterns)
      testPathPatterns = "./test/**/*.js";

    await new Promise((resolve, reject) => {
      gulp.src(testPathPatterns, { read: false })
        .pipe(mocha(options))
        .once("finish", resolve)
        .once("error", reject);
    });
  }
}