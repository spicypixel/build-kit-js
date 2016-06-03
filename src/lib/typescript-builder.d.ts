import * as ts from "gulp-typescript/release/main";

export interface TypeScriptBuildOptions {
  lint?: boolean;
  projectFile?: string;
  compilerOptions?: ts.Settings;
}

export default class TypeScriptBuilder {
  static buildAsync(project: ts.Project, options?: TypeScriptBuildOptions): Promise<any>;
  static buildAsync(options?: TypeScriptBuildOptions): Promise<any>;
}