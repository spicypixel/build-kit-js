import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import GitRevision from "../lib/git-revision";

let should = chai.should();
chai.use(chaiAsPromised);

describe("GitRevision", function () {
  it("should get branch", async function () {
    let result = await GitRevision.branchAsync();
    result.should.not.be.undefined;
    result.should.have.length.greaterThan(0);
  });

  // Disable log test because dependency git-rev
  // has a JSON parsing bug.
  // it("should get log", async function () {
  //   let result = await GitRevision.logAsync();
  //   result.should.not.be.undefined;
  // });

  it("should get long", async function () {
    let result = await GitRevision.longAsync();
    result.should.not.be.undefined;
    result.should.have.lengthOf(40);
  });

  it("should get short", async function () {
    let result = await GitRevision.shortAsync();
    result.should.not.be.undefined;
    result.should.have.lengthOf(7);
  });

  it("should get tag", async function () {
    let result = await GitRevision.tagAsync();
    result.should.not.be.undefined;
    result.should.have.length.greaterThan(0);
  });
});