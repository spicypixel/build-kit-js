import NodeModule from "../lib/node-module";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as path from "path";

let should = chai.should();
chai.use(chaiAsPromised);

describe("NodeModule", () => {
  it("should match root by RegExp", () => {
    "/Users/test/project/node_modules/test-module/lib/other/index.js".match(
      NodeModule.getRootPathRegEx("test-module"))[0].
      should.equal("/Users/test/project/node_modules/test-module/");

    should.not.exist("/Users/test/project/node_modules/@test-scope/test-module".match(
      NodeModule.getRootPathRegEx("@test-scope/test-module")));

    "/Users/test/project/node_modules/@test-scope/test-module/".match(
      NodeModule.getRootPathRegEx("@test-scope/test-module"))[0].
      should.equal("/Users/test/project/node_modules/@test-scope/test-module/");

    "/Users/test/project/node_modules/@test-scope/test-module/index.js".match(
      NodeModule.getRootPathRegEx("@test-scope/test-module"))[0].
      should.equal("/Users/test/project/node_modules/@test-scope/test-module/");
  });

  it("should match root by path", () => {
    NodeModule.getRootPath("chai").endsWith("/chai/").should.be.true;
  });
});