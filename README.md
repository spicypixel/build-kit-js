Build Kit for JS
================
Build Kit is a developer library that makes it easy to perform common build-time tasks like compiling TypeScript, generating documentation (Doxygen, Monodoc, etc.), and running tests.

It's a JavaScript project which makes it convenient to integrate into a build or continuous integration system using [gulp](http://gulpjs.com) and NPM. While the project itself is written in JavaScript, it can be used to simplify build tasks for other project types like C# and C++.

Common Tasks
------------
### Compile TypeScript

Lint TypeScript, transcompile TypeScript to ES6, and then transcompile ES6 to ES5 with Babel.

```js
async function build() {
  await BuildKit.TypeScriptBuilder.buildAsync();
}
```

### Run Tests with Mocha

```js
async function test() {
  await BuildKit.MochaRunner.runAsync();
}
```

### Build C# Code with MSBuild

```js
async function buildCode() {
  await BuildKit.MSBuildBuilder.buildAsync({
    properties: {
      UnityEnginePath: UnityEditor.enginePath
    },
    toolsVersion: 12.0,
    targets: ["Build"],
    errorOnFail: true,
    stdout: true
  });
}
```

### Run C# Tests with NUnit

```js
async function test() {
  await BuildKit.NUnitRunner.runAsync();
}
```

### Build Doxygen Docs

```js
async function buildDocs() {
  await BuildKit.DoxygenBuilder.buildAsync();
}
```

### Build MonoDoc Docs

```js
async function buildDocs() {
  let monoDocBuilder = new BuildKit.MonoDocBuilder();
  let assemblies = [
    "System.Threading",
    "SpicyPixel.Threading",
    "SpicyPixel.Threading.Unity"];
  await monoDocBuilder.buildAsync("SpicyPixel.ConcurrencyKit", assemblies);
}
```

Installation
------------
### Install Node and NPM

On OS X:

```
brew install node
```

### Initialize your project for NPM

If you haven't already initialized your project for NPM, then from your project folder, run the following and follow the prompts:

```
npm init
```

### Install the Build Kit

Execute in your project root:

```
npm install @spicypixel/build-kit-js
```

Using the Build Kit
-------------------
Here is an example Gulp build script written in ES6 using Babel.

The `build` task transcompiles TypeScript to ES6 and then uses a Babel transform to transcompile to ES5 in order to support async/await on older platforms. These settings can be configured through standard JSON configuration files or through inline code options.

The `test` task performs a build and then runs tests in the project using Mocha.

```js
"use strict";
import gulp from "gulp";
import del from "del";
import { TypeScriptBuilder, MochaRunner } from "@spicypixel/build-kit-js";

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
  await build();
  await MochaRunner.runAsync();
}

// Tasks
gulp.task("default", () => test());
gulp.task("clean", () => clean());
gulp.task("build", () => build());
gulp.task("rebuild", () => rebuild());
gulp.task("test", () => test());
```

## Gulp Setup

Here's how you can setup a gulpfile like the above that uses ES6 language features.

### Install Gulp

Install Gulp locally into your project and globally so you can run it from the terminal.

```
npm install gulp && npm install gulp -g
```

### Install Babel

Install Babel to perform transcompilation from ES6 (aka ES2015) to ES5.

```
npm install babel-core babel-preset-es2015 babel-preset-stage-0 babel-plugin-transform-runtime --save-dev
```

Create a `.babelrc` file with the following:

```json
{
  "presets": ["es2015", "stage-0"],
  "plugins": [
    "transform-runtime"
  ]
}
```

### Create a Build Script and Run

Create a build script like the above and save it as `gulpfile.babel.js`. Then run it with:

```
gulp <your-task-name>
```

Continuous Integration
----------------------
Gulp scripts can be easily integrated into continuous integration. For example, here is a sample `.gitlab-ci.yml` for use with [GitLab](http://gitlab.com).

This caches the node modules directory but keeps it maintained, then runs the test task using the project local gulp binary.

```yaml
cache:
  paths:
    - node_modules/

build:
  script:
    - npm prune
    - npm update
    - npm install
    - node node_modules/.bin/gulp test
```