import envData from '../src/utils/loadEnvData';
import { expect } from 'chai';
import { step } from 'mocha-steps';
import addContext from 'mochawesome/addContext';
import { wait } from '../src/utils/date';
let a = false;
let i = 1;
let retryResults = [];
const env = new envData('example1.test.ts').getEnvData;

describe(`Example test 1 @componentA @smoke $JIRA-1234`, async function () {

  step(`show environment data`, async function () {
    await wait(111);
    addContext(this, {
      title: `env Data`,
      value: env
    })
  });

  step(`Expect 1 to be 1`, async function () {
    await wait(437);
    expect(1).to.equal(1);
  });

  step(`Expect true to be true`, async function () {
      await wait(999);
      let b = a;
      if (i === 2) a = true;
      retryResults.push(`Run ${i}: a=${a}; b=${b}`)
      addContext(this, {
        title: `Retried results`,
        value: retryResults
      })
      i++;
      expect(b).to.be.true;
  });

  step(`Expect anything to be anything`, async function () {
    await wait(681);
    expect("nothing").to.equal("anything");
  });

  step(`Expect step to be skipped`, async function () {
    await wait(123);
  });


});