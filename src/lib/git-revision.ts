import * as gitRev from "git-rev";

export default class GitRevision {
  static async branchAsync() {
    return new Promise<string>((resolve, reject) => {
      gitRev.branch(resolve);
    });
  }

  static async logAsync() {
    return new Promise<string[][]>((resolve, reject) => {
      gitRev.log(resolve);
    });
  }

  static async longAsync() {
    return new Promise<string>((resolve, reject) => {
      gitRev.long(resolve);
    });
  }

  static async shortAsync() {
    return new Promise<string>((resolve, reject) => {
      gitRev.short(resolve);
    });
  }

  static async tagAsync() {
    return new Promise<string>((resolve, reject) => {
      gitRev.tag(resolve);
    });
  }
}