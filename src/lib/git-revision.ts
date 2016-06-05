import * as gitRev from "git-rev";

export default class GitRevision {
  static branchAsync(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      gitRev.branch(resolve);
    });
  }

  // JSON parsing bug in git-rev
  // static logAsync(): Promise<string[][]> {
  //   return new Promise<string[][]>((resolve, reject) => {
  //     gitRev.log(resolve);
  //   });
  // }

  static longAsync(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      gitRev.long(resolve);
    });
  }

  static shortAsync(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      gitRev.short(resolve);
    });
  }

  static tagAsync(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      gitRev.tag(resolve);
    });
  }
}