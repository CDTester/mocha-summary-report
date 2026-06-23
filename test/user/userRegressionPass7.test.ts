import envData from '../../src/utils/loadEnvData';
import { expect } from 'chai';
import { step } from 'mocha-steps';
import { wait } from '../../src/utils/date';
const env = envData.getEnvData();


describe(`USER Example test using step steps 9 @user @regression $JIRA-6009`, async function () {

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