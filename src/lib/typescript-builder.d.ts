import * as ts from "gulp-typescript";

declare interface TypeScriptCompileTaskOptions {
  lint?: boolean;
  projectFile?: string;
  compilerOptions?: ts.Settings;
}

declare class TypeScriptBuilder {
  static compileAsync(project: ts.Project, options?: TypeScriptCompileTaskOptions): Promise<any>;
  static compileAsync(options?: TypeScriptCompileTaskOptions): Promise<any>;
}