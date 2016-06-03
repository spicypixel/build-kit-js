import gulp from "gulp";
import gutil from "gulp-util";
import mocha from "gulp-mocha";
import del from "del";
import TypeScriptBuilder from "./src/lib/typescript-builder";

function clean() {
  return del(["lib", "test", "test-output"]);
}

async function build() {
  await TypeScriptBuilder.buildAsync();
}

async function rebuild() {
  await clean();
  await build();
}

async function test() {
  await build();
  return new Promise((resolve, reject) => {
    return gulp.src("./test/**/*.js", { read: false })
      .pipe(mocha())
      .once("end", resolve)
      .once("error", reject);
  });
}

// Tasks
gulp.task("default", () => test());
gulp.task("test", () => test());
gulp.task("build", () => build());
gulp.task("rebuild", () => rebuild());
gulp.task("clean", () => clean());