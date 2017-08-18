import * as Bluebird from "bluebird";
import * as gulp from "gulp";
import * as flatten from "gulp-flatten";
import * as path from "path";
import ChildProcess from "./child-process";
import * as fs from "fs-extra";
let fsp = <any>Bluebird.promisifyAll(fs);

export interface DependencyManagerOptions {
}

export default class DependencyManager implements DependencyManagerOptions {
  constructor(options?: DependencyManagerOptions) {
  }

  getNodeModuleDir(nodeScope: string, nodeModuleName: string): string {
    const regEx = new RegExp(".*\/node_modules\/" + nodeScope + "\/[^/]+\/");
    const nodeModuleDir = require.resolve(nodeScope + "/" + nodeModuleName)
      .match(regEx)[0];
    return nodeModuleDir;
  }

  getAssemblySourceDir(nodeScope: string, nodeModuleName: string, assemblyName: string): string {
    const nodeModuleDir = this.getNodeModuleDir (nodeScope, nodeModuleName);
    return path.join(nodeModuleDir, "Source", assemblyName);
  }

  getAssemblyBinaryDir(nodeScope: string, nodeModuleName: string, assemblyName: string): string {
    const sourceDir = this.getAssemblySourceDir (nodeScope, nodeModuleName, assemblyName);
    return path.join(sourceDir, "bin", "Release");
  }

  importPackageAssembly(packageName: string, nodeScope: string, nodeModuleName: string, assemblyName: string | string[]): Promise<void[]> {
    const binDestDir = path.join("Source", "packages", packageName, "lib");

    let binAssemblies: string[] = [];
    binAssemblies = binAssemblies.concat(<string[]>assemblyName);

    let promises: Promise<void>[] = [];

    binAssemblies.forEach(assembly => {
      const srcDir = this.getAssemblyBinaryDir (nodeScope, nodeModuleName, assembly);
      promises = promises.concat(
        this.copyPatternsAsync(
          path.join(srcDir, assembly + ".dll"),
          binDestDir,
          { base: srcDir }
        ));
    });

    return Promise.all(promises);
  }

  private async copyPatternsAsync(sourcePatterns: string | string[], destination: string, options?: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let destinationOptions: gulp.DestOptions;

      gulp
        .src(sourcePatterns, options)
        .pipe(gulp.dest(destination, destinationOptions))
        .on("end", resolve)
        .on("error", reject);
    });
  }
}