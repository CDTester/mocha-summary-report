import envData from '../../src/utils/loadEnvData';
import { expect } from 'chai';
import { wait } from '../../src/utils/date';


const env = new envData('example2.test.ts').getEnvData;

describe(`CHECKOUT Pass test with it steps 1 @checkout @smoke $JIRA-3001`, async function () {

  it(`Expect [1,2,3] to include 2`, async function () {
    expect([1,2,3]).to.include(2);
    await wait(500);
  });

  it(`Expect 1 not to be null`, async function () {
    expect(1).to.not.be.null;
    await wait(328);
  });

  it(`Expect undefined to be undefined`, async function () {
    expect(undefined).to.be.undefined;
    await wait(713);
  });

}); 