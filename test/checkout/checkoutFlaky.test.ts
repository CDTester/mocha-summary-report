import envData from '../../src/utils/loadEnvData';
import { expect } from 'chai';
import addContext from 'mochawesome/addContext';
import { wait } from '../../src/utils/date';
let a = false;
let i = 1;
let retryResults = [];
const env = envData.getEnvData();

describe(`CHECKOUT flaky test with it steps 2 @checkout @regression @flaky $JIRA-3002`, async function () {

  it(`show environment data`, async function () {
    await wait(111);
    addContext(this, {
      title: `env Data`,
      value: env
    })
  });

  it(`Expect 1 to be 1`, async function () {
    await wait(437);
    expect(1).to.equal(1);
  });

  it(`Expect true to be true`, async function () {
      await wait(999);
      expect(true).to.be.true;
  });

  it(`Expect anything to be anything`, async function () {
    await wait(681);
    expect("anything").to.equal("anything");
  });

  it(`Expect true to be true, retries and fails`, async function () {
      await wait(999);
      let b = a;
      if (i === 2) a = true;
      retryResults.push(`Run ${i}: a=${a}; b=${b}`)
      addContext(this, {
        title: `Retried results`,
        value: retryResults
      })
      i++;
      expect(b).to.equal('true');
  });

});