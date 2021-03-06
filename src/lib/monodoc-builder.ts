import * as Bluebird from "bluebird";
import * as gulp from "gulp";
import * as flatten from "gulp-flatten";
import * as path from "path";
import ChildProcess from "./child-process";
import * as fs from "fs-extra";
let fsp = <any>Bluebird.promisifyAll(fs);

export interface MonoDocBuilderOptions {
  assemblyDir?: string;       // Directory to locate assemblies (default: ./Source/${assembly}/bin/Release)
  outDir?: string;            // Directory to output docs
  assembleDirName?: string;   // Name to use for assemble output
  xmlDirName?: string;        // Name to use for xml output
}

export default class MonoDocBuilder implements MonoDocBuilderOptions {
  private static getAssemblyDirOrDefault (options?: MonoDocBuilderOptions): string {
    if (options && options.assemblyDir)
      return options.assemblyDir;

    return path.join("Source", "${assembly}", "bin", "Release");
  }

  private static getOutDirOrDefault (options?: MonoDocBuilderOptions): string {
    if (options && options.outDir)
      return options.outDir;

    return "MonoDoc";
  }

  private static getAssembleDirNameOrDefault (options?: MonoDocBuilderOptions): string {
    if (options && options.assembleDirName)
      return options.assembleDirName;

    return "assemble";
  }

  private static getXmlDirNameOrDefault (options?: MonoDocBuilderOptions): string {
    if (options && options.xmlDirName)
      return options.xmlDirName;

    return "xml";
  }

  assemblyDir: string;       // Directory to locate assemblies (default: ./Source/${assembly}/bin/Release)
  outDir: string;            // Directory to output docs
  assembleDirName: string;   // Name to use for assemble output
  xmlDirName: string;        // Name to use for xml output

  private get assembleDir (): string {
    return path.join(this.outDir, this.assembleDirName);
  }

  private get xmlDir (): string {
    return path.join(this.outDir, this.xmlDirName);
  }

  constructor(options?: MonoDocBuilderOptions) {
    this.assemblyDir = MonoDocBuilder.getAssemblyDirOrDefault(options);
    this.outDir = MonoDocBuilder.getOutDirOrDefault(options);
    this.assembleDirName = MonoDocBuilder.getAssembleDirNameOrDefault(options);
    this.xmlDirName = MonoDocBuilder.getXmlDirNameOrDefault(options);
  }

  async updateAsync(assemblies: string[], referencePaths?: string[]) {
    // Drop .dll
    for (let i = 0; i < assemblies.length; ++i) {
      assemblies[i] = assemblies[i].replace(".dll", "");
    }

    let assemblyPaths: string[] = [];
    assemblies.forEach(a => {
      assemblyPaths = assemblyPaths.concat(
        path.join(this.assemblyDir.replace("${assembly}", a), a + ".dll"));
    });

    let xmlParams: string[] = [];
    assemblies.forEach(a => {
      xmlParams = xmlParams.concat("-i");
      xmlParams = xmlParams.concat(
        path.join(this.assemblyDir.replace("${assembly}", a), a + ".xml"));
    });

    let referenceParams: string[] = [];
    if (referencePaths) {
      referencePaths.forEach(r => {
        referenceParams = referenceParams.concat("-L");
        referenceParams = referenceParams.concat(r);
      });
    }

    let params = ["update", "-out:" + this.xmlDir]
      .concat(xmlParams).concat(referenceParams).concat(assemblyPaths);
    await ChildProcess.spawnAsync("mdoc", params, { stdio: "inherit" });
  }

  async assembleAsync(prefix: string) {
    console.log("Assembling MonoDocs ...");

    await fsp.mkdirpAsync(this.assembleDir);

    let prefixPath = path.join(this.assembleDir, prefix);

    await ChildProcess.spawnAsync("mdoc", [
      "assemble", "-o", prefixPath, this.xmlDir
    ], { stdio: "inherit" });
  }

  async installAsync() {
    await new Promise((resolve, reject) => {
      this.getInstallPathAsync().then((installPath: string) => {
        gulp
          .src([
            path.join(this.assembleDir, "*"),
            path.join(this.outDir, "*.source")])
          .pipe(flatten())
          .pipe(gulp.dest(installPath))
          .on("end", resolve)
          .on("error", reject);
      });
    });
  }

  async buildAsync(prefix: string, assemblies: string[], referencePaths?: string[]) {
    await this.updateAsync(assemblies, referencePaths);
    await this.assembleAsync(prefix);
  }

  async getInstallPathAsync() {
    return Promise.resolve("/Library/Frameworks/Mono.framework/External/monodoc/");
    // execute("pkg-config monodoc --variable=sourcesdir", callback);
  }
}