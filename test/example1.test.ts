import envData from '../src/utils/loadEnvData';
import { expect } from 'chai';
import { step } from 'mocha-steps';
import addContext from 'mochawesome/addContext';
import { wait } from '../src/utils/date';


const env = new envData('example1.test.ts').getEnvData;

describe(`Example test 1 @componentA @smoke $JIRA-1234`, async function () {

  step(`show environment data`, async function () {
    addContext(this, {
      title: `env Data`,
      value: env
    })
    await wait(111);
  });

  step(`Expect 1 to be 1`, async function () {
    expect(1).to.equal(1);
    await wait(437);
  });

  step(`Expect anything to be anthing`, async function () {
    expect("nothing").to.equal("anything");
    await wait(681);
  });

  step(`Expect true to be true`, async function () {
    expect(true).to.be.true;
    await wait(681);
  });

});