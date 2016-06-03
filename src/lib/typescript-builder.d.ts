import * as ts from "gulp-typescript";

export interface TypeScriptBuildOptions {
  lint?: boolean;
  projectFile?: string;
  compilerOptions?: ts.Params;
}

export default class TypeScriptBuilder {
  static buildAsync(project: ts.Project, options?: TypeScriptBuildOptions): Promise<any>;
  static buildAsync(options?: TypeScriptBuildOptions): Promise<any>;
}