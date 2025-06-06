import envData from '../src/utils/loadEnvData';
import { expect } from 'chai';
import { step } from 'mocha-steps';
import { wait } from '../src/utils/date';


const env = new envData('example3.test.ts').getEnvData;

describe(`Example test 3 @componentC @smoke $JIRA-1236`, async function () {

  step(`Expect 'foo' to not be NaN`, async function () {
    expect('foo').to.not.be.NaN;
    await wait(333);
  });

  step(`Expect 1 not to be null`, async function () {
    expect(1).to.not.be.null;
    await wait(444);
  });

  step(`Expect [1,2,3] to not be empty`, async function () {
    expect([1,2,3]).to.not.be.empty;
    await wait(555);
  });

});