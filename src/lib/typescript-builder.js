"use strict";

import Promise from "bluebird";

// Tools
import gulp from "gulp";
import gutil from "gulp-util";
import gulpif from "gulp-if";
import ts from "gulp-typescript";
import tslint from "gulp-tslint";
import typescript from "typescript";
import babel from "gulp-babel";

// Streams and process
import eventStream from "event-stream";
import sourceMaps from "gulp-sourcemaps";
import path from "path";

export default class TypeSriptBuilder {
  static async buildAsync(projectOrOptions, options) {
    let project = projectOrOptions;
    if (projectOrOptions && projectOrOptions.typescript) { // project
      if (!options) options = {};
    } else {
      if (!options) options = projectOrOptions;
      if (!options) options = {};
      if (!options.projectFile) options.projectFile = "tsconfig.json";
      if (!options.compilerOptions) options.compilerOptions = {};
      if (!options.compilerOptions.typescript) options.compilerOptions.typescript = typescript;
      project = ts.createProject(options.projectFile, options.compilerOptions);
    }

    if (options.lint === undefined) options.lint = true;
    if (options.babel === undefined) {
      if (project.options.target === typescript.ScriptTarget.ES2015)
        options.babel = true;
      else
        options.babel = false;
    }
    let rootDir = project.options.rootDir || "./";
    let outDir = project.options.outDir || "./";
    let mapRoot = project.options.mapRoot || path.relative(outDir, "./");
    let sourceRoot = project.options.sourceRoot || path.relative(outDir, rootDir);
    let tsSources = path.join(rootDir, "**/*.ts"); // includes ambient
    let dtsSources = path.join(rootDir, "**/*.d.ts"); // ambient only
    let jsSources = path.join(rootDir, "**/*.js");

    gutil.log("Starting '" + gutil.colors.cyan("TypeScript lint") + "'...");
    await new Promise((resolve, reject) => {
      let lint;
      if (options.lint) {
        gutil.log("Linting ...");
        lint = gulp.src(tsSources)
          .pipe(tslint())
          .pipe(tslint.report());
      } else {
        gutil.log("Skip linting ...");
        lint = eventStream.merge([]);
      }
      lint.once("end", () => {
        gutil.log("Finished '" + gutil.colors.cyan("TypeScript lint") + "'");
        resolve();
      }).once("error", reject);
    });

    gutil.log("Starting '" + gutil.colors.cyan("TypeScript compile") + "'...");
    await new Promise((resolve, reject) => {
      let tsc = project.src()
        .pipe(gulpif(project.options.sourceMap, sourceMaps.init({ loadMaps: true })))
        .pipe(project())
        .once("end", () => gutil.log("Processed TypeScript project"))
        .once("error", reject);

      let js = tsc.js
        .pipe(gulpif(options.babel, babel()))
        .pipe(gulpif(project.options.sourceMap, sourceMaps.write(mapRoot, {
          includeContent: false,
          sourceRoot: sourceRoot
        })))
        .pipe(gulp.dest(outDir))
        .once("end", () => gutil.log("Processed js"));

      let dts = tsc.dts
        .pipe(gulp.dest(outDir))
        .once("end", () => gutil.log("Processed dts"));

      eventStream.merge(js, dts)
        .once("end", () => {
          gutil.log("Finished '" + gutil.colors.cyan("TypeScript compile") + "'");
          resolve();
        })
        .once("error", reject);
    });

    gutil.log("Starting '" + gutil.colors.cyan("Copy dts") + "'...");
    await new Promise((resolve, reject) => {
      // Copy extra ambient declarations
      gulp.src(dtsSources, { base: rootDir })
        .pipe(gulp.dest(outDir))
        .once("end", () => {
          gutil.log("Finished '" + gutil.colors.cyan("Copy dts") + "'");
          resolve();
        })
        .once("error", reject);
    });

    gutil.log("Starting '" + gutil.colors.cyan("Copy js") + "'...");
    await new Promise((resolve, reject) => {
      // Copy extra JS
      gulp.src(jsSources, { base: rootDir })
        .pipe(gulpif(options.babel, babel()))
        .pipe(gulp.dest(outDir))
        .once("end", () => {
          gutil.log("Finished '" + gutil.colors.cyan("Copy js") + "'");
          resolve();
        })
        .once("error", reject);
    });
  }
}