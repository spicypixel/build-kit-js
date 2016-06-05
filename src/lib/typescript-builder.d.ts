import * as ts from "gulp-typescript/release/main";

export interface TypeScriptBuildOptions {
  lint?: boolean;
  babel?: boolean;
  projectFile?: string;
  compilerOptions?: ts.Settings;
}

export default class TypeScriptBuilder {
  static buildAsync(project: ts.Project, options?: TypeScriptBuildOptions): Promise<void>;
  static buildAsync(options?: TypeScriptBuildOptions): Promise<void>;
}