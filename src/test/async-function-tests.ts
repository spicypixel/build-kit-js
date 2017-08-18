import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

let should = chai.should();
chai.use(chaiAsPromised);

// The test checks these values in multiple places
// to help ensure no synchronization issues.
let num1: number = 0;
let num2: number = 0;

async function asyncFunctionTest() {
  num1.should.equal(0);
  num2.should.equal(0);
  await setNum1();
  num1.should.equal(1);
  num2.should.equal(0);
  await setNum2();
  num1.should.equal(1);
  num2.should.equal(1);
}

async function setNum1() {
  num1.should.equal(0);
  num2.should.equal(0);
  await new Promise((resolve, reject) => {
    num1 = 1;
    resolve();
  });
}

async function setNum2() {
  num1.should.equal(1);
  num2.should.equal(0);
  await new Promise((resolve, reject) => {
    num2 = 1;
    resolve();
  });
}

describe("AsyncFunction", function () {
  it("should resolve promises", async function () {
    num1.should.equal(0);
    num2.should.equal(0);
    await asyncFunctionTest();
    num1.should.equal(1);
    num2.should.equal(1);
  });
});