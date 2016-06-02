import * as ts from "gulp-typescript";

export interface TypeScriptCompileTaskOptions {
  lint?: boolean;
  projectFile?: string;
  compilerOptions?: ts.Params;
}

export default class TypeScriptBuilder {
  static compileAsync(project: ts.Project, options?: TypeScriptCompileTaskOptions): Promise<any>;
  static compileAsync(options?: TypeScriptCompileTaskOptions): Promise<any>;
}