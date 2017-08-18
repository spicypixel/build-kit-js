import MSBuildBuilder from "../lib/msbuild-builder";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as fs from "fs-extra";

let should = chai.should();
chai.use(chaiAsPromised);

describe("MSBuildBuilder", function () {
  this.timeout (5000);

  it("should build", async function () {
    await MSBuildBuilder.buildAsync ("./test-input/msbuild/good.csproj").should.eventually.be.fulfilled;
    fs.unlink ("./test-input/msbuild/good.cs.exe");
  });
  it("should fail", async function () {
    await MSBuildBuilder.buildAsync ("./test-input/msbuild/bad.csproj").should.eventually.be.rejected;
  });
});