import * as gulp from "gulp";
import * as path from "path";
import * as vfs from "vinyl-fs";
import NodeModule from "./node-module";

export default class DotNetModuleReference {
  private _projectPath: string;
  private _nodeModule: NodeModule;

  constructor(projectPath: string, nodeModule: NodeModule) {
    this._projectPath = projectPath;
    this._nodeModule = nodeModule;
  }

  get projectPath(): string {
    return this._projectPath;
  }

  get nodeModule(): NodeModule {
    return this._nodeModule;
  }

  getAssemblySourceDir(assemblyName: string): string {
    return path.join(this._nodeModule.packageDir, "Source", assemblyName);
  }

  getAssemblyBinaryDir(assemblyName: string): string {
    const sourceDir = this.getAssemblySourceDir (assemblyName);
    return path.join(sourceDir, "bin", "Release");
  }

  async importAssemblyAsync(packageName: string, assemblyName: string | string[]) {
    const binDestDir = path.join(this._projectPath, "Source", "packages", packageName, "lib");

    let binAssemblies: string[] = [];
    binAssemblies = binAssemblies.concat(<string[]>assemblyName);

    let promises: Promise<void>[] = [];

    binAssemblies.forEach(assembly => {
      const srcDir = this.getAssemblyBinaryDir(assembly);
      promises = promises.concat(
        this.copyPatternsAsync(
          path.join(srcDir, assembly + ".dll"),
          binDestDir,
          { base: srcDir }
        ));
    });

    await Promise.all(promises);
  }

  private async copyPatternsAsync(sourcePatterns: string | string[], destination: string, options?: any) {
    await new Promise((resolve, reject) => {
      let destinationOptions: vfs.DestOptions;

      gulp
        .src(sourcePatterns, options)
        .pipe(gulp.dest(destination, destinationOptions))
        .on("end", resolve)
        .on("error", reject);
    });
  }
}