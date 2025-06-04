import envData from '../src/utils/loadEnvData';
import { expect } from 'chai';
import { step } from 'mocha-steps';
import { wait } from '../src/utils/date';


const env = new envData('example2.test.ts').getEnvData;

describe(`Example test 2 @componentB @smoke $JIRA-1235`, async function () {

  step(`Expect [1,2,3] to include 2`, async function () {
    expect([1,2,3]).to.include(2);
    await wait(500);
  });

  step(`Expect 1 not to be null`, async function () {
    expect(1).to.not.be.null;
    await wait(328);
  });

  step(`Expect undefined to be undefined`, async function () {
    expect(undefined).to.be.undefined;
    await wait(713);
  });

});