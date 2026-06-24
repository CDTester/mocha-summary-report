import envData from '../../src/utils/loadEnvData';
import { expect } from 'chai';
import { step } from 'mocha-steps';
import { wait } from '../../src/utils/date';
const env = envData.getEnvData();

describe(`Navigation tests in one file`, async function () {

  describe(`NAVIGATION Pass test with step steps 1 @navigation @smoke $JIRA-4001`, async function () {
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

  describe(`NAVIGATION Pass test with step steps 2 @navigation @regression $JIRA-4002`, async function () {
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
  
  describe(`NAVIGATION Pass test with step steps 3 @navigation @regression $JIRA-4003`, async function () {
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
  
  describe(`NAVIGATION Pass test with step steps 4 @navigation @regression $JIRA-4004`, async function () {
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
  
  describe(`NAVIGATION Pass test with step steps 5 @navigation @regression $JIRA-4005`, async function () {
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
  
  describe.skip(`NAVIGATION skip test with step steps 6 @navigation @e2e $JIRA-4006`, async function () {
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

}); 