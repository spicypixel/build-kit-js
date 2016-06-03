"use strict";

import Promise from "bluebird";

// Tools
import gulp from "gulp";
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
  static buildAsync (projectOrOptions, options) {
    let project = projectOrOptions;
    if (projectOrOptions && projectOrOptions.typescript) { // project
      if (!options) options = {};
    } else {
      if (!options) options = projectOrOptions;
      if (!options) options = {};
      if (!options.projectFile) options.projectFile = "tsconfig.json";
      if (!options.compilerOptions) options.compilerOptions = {};
      options.compilerOptions.typescript = typescript;
      project = ts.createProject(options.projectFile, options.compilerOptions);
    }

    if (!options.lint) options.lint = true;
    if (!options.babel) {
        if (project.options.target === typescript.ScriptTarget.ES6)
            options.babel = true;
        else
            options.babel = false;
    }

    let rootDir = project.options.rootDir || "./";
    let outDir = project.options.outDir || "./";
    let mapRoot = project.options.mapRoot || outDir;
    let sourceRoot = project.options.sourceRoot || path.relative(outDir, rootDir);

    let tsSources = path.join(rootDir, "**/*.ts"); // includes ambient
    let dtsSources = path.join(rootDir, "**/*.d.ts"); // ambient only
    let jsSources = path.join(rootDir, "**/*.js");

    return new Promise((resolve, reject) => {
      let lint;
      if (options.lint) {
        lint = gulp.src(tsSources)
          .pipe(tslint())
          .pipe(tslint.report("verbose"));
      } else {
        lint = eventStream.merge([]);
      }
      lint.once("end", resolve).once("error", reject);
    }
    ).then(() => {
      return new Promise((resolve, reject) => {
        let tsc = project.src()
          .pipe(gulpif(project.options.sourceMap, sourceMaps.init({ loadMaps: true })))
          .pipe(ts(project))
          .once("end", resolve)
          .once("error", reject);

        let js = tsc.js
          .pipe(gulpif(options.babel, babel()))
          .pipe(gulpif(project.options.sourceMap, sourceMaps.write(mapRoot, {
            includeContent: false,
            sourceRoot: sourceRoot
          })))
          .pipe(gulp.dest(outDir));

        let dts = tsc.dts
          .pipe(gulp.dest(outDir));

        eventStream.merge(js, dts)
          .once("end", resolve)
          .once("error", reject);
      });
    }).then(() => {
      return new Promise((resolve, reject) => {
        // Copy extra JS and ambient declarations
        gulp.src(dtsSources, { base: rootDir })
          .pipe(gulp.dest(outDir))
          .once("end", resolve)
          .once("error", reject);
      });
    }).then(() => {
      return new Promise((resolve, reject) => {
        // Copy extra JS and ambient declarations
        gulp.src(jsSources, { base: rootDir })
          .pipe(gulpif(options.babel, babel()))
          .pipe(gulp.dest(outDir))
          .once("end", resolve)
          .once("error", reject);
      });
    });
  }
}

// Monkey patch to avoid sourceRoot warnings
import fs from "fs-extra";
import tsApi from "gulp-typescript/release/tsApi";
import compiler from "gulp-typescript/release/compiler";
import { Project } from "gulp-typescript/release/project";
import ts2 from "typescript";
import _reporter from "gulp-typescript/release/reporter";

function createEnumMap(input) {
    var map = {};
    var keys = Object.keys(input);
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        var value = input[key];
        if (typeof value === 'number') {
            map[key.toLowerCase()] = value;
        }
    }
    return map;
}
function getScriptTarget(typescript, language) {
    var map = createEnumMap(typescript.ScriptTarget);
    return map[language.toLowerCase()];
}

function getCompilerOptions(settings, projectPath, configFileName) {
    var typescript = settings.typescript || ts2;
    if (settings.sourceRoot !== undefined) {
        console.warn('gulp-typescript: sourceRoot isn\'t supported any more. Use sourceRoot option of gulp-sourcemaps instead.');
    }
    // Try to use `convertCompilerOptionsFromJson` to convert options.
    if (typescript.convertCompilerOptionsFromJson) {
        // Copy settings and remove several options
        var newSettings = {};
        for (var _i = 0, _a = Object.keys(settings); _i < _a.length; _i++) {
            var option = _a[_i];
            if (option === 'declarationFiles') {
                newSettings.declaration = settings.declarationFiles;
                continue;
            }
            if (option === 'noExternalResolve' ||
                option === 'sortOutput' ||
                option === 'typescript' ||
                option === 'sourceMap' ||
                option === 'inlineSourceMap')
                continue;
            newSettings[option] = settings[option];
        }
        var result = typescript.convertCompilerOptionsFromJson(newSettings, projectPath, configFileName);
        var reporter = _reporter.defaultReporter();
        for (var _b = 0, _c = result.errors; _b < _c.length; _b++) {
            var error = _c[_b];
            reporter.error(utils.getError(error, typescript), typescript);
        }
        result.options.sourceMap = true;
        result.options.suppressOutputPathCheck = true;
        return result.options;
    }
    // Legacy conversion
    var tsSettings = {};
    for (var key in settings) {
        if (!Object.hasOwnProperty.call(settings, key))
            continue;
        if (key === 'noExternalResolve' ||
            key === 'declarationFiles' ||
            key === 'sortOutput' ||
            key === 'typescript' ||
            key === 'target' ||
            key === 'module' ||
            key === 'moduleResolution' ||
            key === 'jsx' ||
            key === 'sourceRoot' ||
            key === 'sourceMap' ||
            key === 'inlineSourceMap')
            continue;
        tsSettings[key] = settings[key];
    }
    if (typeof settings.target === 'string') {
        tsSettings.target = getScriptTarget(typescript, settings.target);
    }
    else if (typeof settings.target === 'number') {
        tsSettings.target = settings.target;
    }
    if (typeof settings.module === 'string') {
        tsSettings.module = getModuleKind(typescript, settings.module);
    }
    else if (typeof settings.module === 'number') {
        tsSettings.module = settings.module;
    }
    if (typeof settings.jsx === 'string') {
        // jsx is not supported in TS1.4 & 1.5, so we cannot do `tsSettings.jsx = `, but we have to use brackets.
        tsSettings['jsx'] = getJsxEmit(typescript, settings.jsx);
    }
    else if (typeof settings.jsx === 'number') {
        tsSettings['jsx'] = settings.jsx;
    }
    if (typeof settings.moduleResolution === 'string') {
        // moduleResolution is not supported in TS1.4 & 1.5, so we cannot do `tsSettings.moduleResolution = `, but we have to use brackets.
        tsSettings['moduleResolution'] = getModuleResolution(typescript, settings.moduleResolution);
    }
    else if (typeof settings.moduleResolution === 'number') {
        tsSettings['moduleResolution'] = settings.moduleResolution;
    }
    if (tsApi.isTS14(typescript)) {
        if (tsSettings.target === undefined) {
            // TS 1.4 has a bug that the target needs to be set.
            tsSettings.target = ts.ScriptTarget.ES3;
        }
        if (tsSettings.module === undefined) {
            // Same bug in TS 1.4 as previous comment.
            tsSettings.module = ts.ModuleKind.None;
        }
    }
    if (settings.declarationFiles !== undefined) {
        tsSettings.declaration = settings.declarationFiles;
    }
    tsSettings.sourceMap = true;
    // Suppress errors when providing `allowJs` without `outDir`.
    tsSettings.suppressOutputPathCheck = true;
    if (tsSettings.baseUrl) {
        tsSettings.baseUrl = path.resolve(projectPath, tsSettings.baseUrl);
    }
    if (tsSettings.rootDirs) {
        tsSettings.rootDirs = tsSettings.rootDirs.map(function (dir) { return path.resolve(projectPath, dir); });
    }
    return tsSettings;
}

let originalCreateProject = ts.createProject;
ts.createProject = function createProject(fileNameOrSettings, settings) {
  var tsConfigFileName = undefined;
  var tsConfigContent = undefined;
  var projectDirectory = process.cwd();
  if (fileNameOrSettings !== undefined) {
      if (typeof fileNameOrSettings === 'string') {
          tsConfigFileName = fileNameOrSettings;
          projectDirectory = path.dirname(fileNameOrSettings);
          // load file and strip BOM, since JSON.parse fails to parse if there's a BOM present
          var tsConfigText = fs.readFileSync(fileNameOrSettings).toString();
          var typescript = (settings && settings.typescript) || ts;
          var tsConfig = tsApi.parseTsConfig(typescript, tsConfigFileName, tsConfigText);
          tsConfigContent = tsConfig.config || {};
          if (tsConfig.error) {
              console.log(tsConfig.error.messageText);
          }
          var newSettings = {};
          if (tsConfigContent.compilerOptions) {
              for (var _i = 0, _a = Object.keys(tsConfigContent.compilerOptions); _i < _a.length; _i++) {
                  var key = _a[_i];
                  newSettings[key] = tsConfigContent.compilerOptions[key];
              }
          }
          if (settings) {
              for (var _b = 0, _c = Object.keys(settings); _b < _c.length; _b++) {
                  var key = _c[_b];
                  newSettings[key] = settings[key];
              }
          }
          settings = newSettings;
      }
      else {
          settings = fileNameOrSettings;
      }
  }

  let sourceRoot = settings.sourceRoot;
  delete settings.sourceRoot;

//   var project = originalCreateProject(settings);

//   if (tsConfigFileName) {
//     project.configFileName = tsConfigFileName;
//     project.projectDirectory = projectDirectory;
//     project.config = tsConfigContent;
//   }

//   if (sourceRoot)
//     settings.sourceRoot = sourceRoot;

//   return project;

  var project = new Project(tsConfigFileName, projectDirectory, tsConfigContent, getCompilerOptions(settings, projectDirectory, tsConfigFileName), settings.noExternalResolve ? true : false, settings.sortOutput ? true : false, settings.typescript);
  // Isolated modules are only supported when using TS1.5+
  if (project.options['isolatedModules'] && !tsApi.isTS14(project.typescript)) {
      if (project.options.out !== undefined || project.options['outFile'] !== undefined || project.sortOutput) {
          console.warn('You cannot combine option `isolatedModules` with `out`, `outFile` or `sortOutput`');
      }
      project.options['newLine'] = ts.NewLineKind.LineFeed; //new line option/kind fails TS1.4 typecheck
      project.options.sourceMap = false;
      project.options.declaration = false;
      project.options['inlineSourceMap'] = true;
      project.compiler = new compiler.FileCompiler();
  }
  else {
      project.compiler = new compiler.ProjectCompiler();
  }

  if (sourceRoot)
    settings.sourceRoot = sourceRoot;

  return project;
}