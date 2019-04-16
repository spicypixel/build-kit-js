import gulp from "gulp";
import gutil from "gulp-util";
import mocha from "gulp-mocha";
import del from "del";
import TypeScriptBuilder from "./src/lib/typescript-builder";

async function clean() {
  await del(["lib", "test", "test-output"]);
}

async function build() {
  await TypeScriptBuilder.buildAsync();
}

async function rebuild() {
  await clean();
  await build();
}

async function test() {
  await rebuild();
  return gulp.src("./test/**/*.js", { read: false })
    .pipe(mocha({
      env: {
        NODE_ENV: "test"
      },
      bail: true,
      exit: true,
    }))
    .once("end", () => Promise.resolve())
    .once("error", (err) => Promise.reject(err));
}

// Tasks
gulp.task("default", () => test());
gulp.task("test", () => test());
gulp.task("build", () => build());
gulp.task("rebuild", () => rebuild());
gulp.task("clean", () => clean());