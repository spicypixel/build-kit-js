import gulp from "gulp";
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
  await new Promise ((resolve, reject) => {
    gulp.src("./test/**/*.js", { read: false })
      .pipe(mocha())
      .once("finish", resolve)
      .once("error", reject);
    });
}

// Tasks
gulp.task("default", async () => test());
gulp.task("test", async () => test());
gulp.task("build", async () => build());
gulp.task("rebuild", async () => rebuild());
gulp.task("clean", async () => clean());