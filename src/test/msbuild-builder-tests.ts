import MSBuildBuilder from "../lib/msbuild-builder";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as fs from "fs-extra";

let should = chai.should();
chai.use(chaiAsPromised);

describe("MSBuildBuilder", function () {
  this.timeout (10000);

  it("should restore manual", async function () {
    await MSBuildBuilder.buildAsync ("./test-input/msbuild/good.csproj", { stdout: false, targets: ["restore"] }).should.eventually.be.fulfilled;
    await fs.remove ("./test-input/msbuild/bin");
    await fs.remove ("./test-input/msbuild/obj");
  });

  it("should restore auto", async function () {
    await MSBuildBuilder.restoreAsync ("./test-input/msbuild/good.csproj").should.eventually.be.fulfilled;
    await fs.remove ("./test-input/msbuild/bin");
    await fs.remove ("./test-input/msbuild/obj");
  });

  it("should build", async function () {
    await MSBuildBuilder.buildAsync ("./test-input/msbuild/good.csproj", { stdout: false }).should.eventually.be.fulfilled;
    await fs.remove ("./test-input/msbuild/bin");
    await fs.remove ("./test-input/msbuild/obj");
  });

  it("should fail", async function () {
    await MSBuildBuilder.buildAsync ("./test-input/msbuild/bad.csproj", { stdout: false }).should.eventually.be.rejected;
    await fs.remove ("./test-input/msbuild/bin");
    await fs.remove ("./test-input/msbuild/obj");
  });
});