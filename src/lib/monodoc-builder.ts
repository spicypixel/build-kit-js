import * as Promise from "bluebird";
import * as gulp from "gulp";
import * as flatten from "gulp-flatten";
import * as path from "path";
import ChildProcess from "./child-process";
import * as fs from "fs-extra";
let fsp = <any>Promise.promisifyAll(fs);

export default class MonoDocBuilder {
  outDir: string;

  constructor(outDir?: string) {
    if (!outDir)
      outDir = path.join(__dirname, "MonoDoc");

    this.outDir = outDir;
  }

  updateAsync(assemblies: string[], assemblyPath?: string): Promise<any> {
    // Drop .dll
    for (let i = 0; i < assemblies.length; ++i) {
      assemblies[i] = assemblies[i].replace(".dll", "");
    }

    // Get assembly path
    if (!assemblyPath) {
      assemblyPath = path.join(__dirname, "Source", "${assembly}",
          "bin", "Release");
    }

    let assemblyPaths: string[] = [];
    assemblies.forEach(a => {
      assemblyPaths = assemblyPaths.concat(
        path.join(assemblyPath.replace("${assembly}", a), a + ".dll"));
    });

    let xmlParams: string[] = [];
    assemblies.forEach(a => {
      xmlParams = xmlParams.concat("-i");
      xmlParams = xmlParams.concat(
        path.join(assemblyPath.replace("${assembly}", a), a + ".xml"));
    });

    return ChildProcess.spawnAsync("mdoc", [
      "update",
      "-out:" + path.join(this.outDir, "xml"),
    ].concat(xmlParams).concat(assemblyPaths), { log: true });
  }

  async assembleAsync(prefix: string, assembleDir?: string): Promise<any> {
    console.log("Assembling MonoDocs ...");

    if (!assembleDir)
      assembleDir = path.join(this.outDir, "assemble");

    await fsp.mkdirpAsync(assembleDir);

    let prefixPath = path.join(assembleDir, prefix);

    return ChildProcess.spawnAsync("mdoc", [
      "assemble", "-o", prefixPath, path.join(this.outDir, "xml")
    ], { log: true });
  }

  installAsync(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getInstallPathAsync().then((installPath: string) => {
        gulp
          .src([
            path.join(this.outDir, "assemble", "*"),
            path.join(this.outDir, "*.source")])
          .pipe(flatten())
          .pipe(gulp.dest(installPath))
          .on("end", resolve)
          .on("error", reject);
      });
    });
  }

  async buildAsync(prefix: string, assemblies: string[], assemblyPath?: string): Promise<any> {
    await this.updateAsync(assemblies, assemblyPath);
    await this.assembleAsync(prefix);
  }

  getInstallPathAsync(): Promise<string> {
    return Promise.resolve("/Library/Frameworks/Mono.framework/External/monodoc/");
    // execute("pkg-config monodoc --variable=sourcesdir", callback);
  }
}