"use strict";

const Mocha = require('mocha');
const Base = Mocha.reporters.Spec;
const event = Mocha.Runner.constants;
const moment = require('moment');
const util = require('util');
const testResultBuilder = require('./lib/testResultBuilder.js');
const summaryGenerator = require('./lib/summaryReportGenerator.js');
let isParallel = false;
let suiteNumber = 0;
let stepNumber = 0;
let useBaseReporter = 'true';
const tempResults = {};
const results = {
  tests: [],
  summary: {},
  info: {}
};

function summaryReport (summary, config) {
  summary.capture;

  // This controls whether this reporter uses Mocha Base reporter in the output. By default it will be set to true unless stated as false in reporter options.
  useBaseReporter = (config.reporterOptions.includeMochaBase === undefined) ? true : config.reporterOptions.includeMochaBase;
  if (useBaseReporter) Base.call(this, summary);

  // On the EVENT_RUN_BEGIN (suite), collect run date and start time
  summary.on(event.EVENT_RUN_BEGIN, function () {
    // get start time
    results.info.runDate = moment().local().format('YYYY-MM-DD');
    results.info.startTime = moment(this.stats.start).local().format('HH:mm:ss.SSS');
    results.info.startDuration = moment(this.stats.start).utc();
    let parallel = '';
    if (process.argv.includes('--parallel')) {
      isParallel = true;
      parallel = 'in parallel mode';
    }
    console.log(`\x1b[32mStarting Test Suite ${parallel}\x1b[0m`);
  });

  // On EVENT_SUITE_BEGIN (test) start a temp collection of test stats.  Only starts a collection where the suite.root = false.
  summary.on(event.EVENT_SUITE_BEGIN, function (suiteBegin) {
    if (isParallel) {
      if (suiteBegin.root === false) {
        suiteNumber++;
        tempResults[suiteBegin.__mocha_id__] = testResultBuilder.buildSuiteStart(suiteBegin, config, suiteNumber);
      }
    }
    else {
      if (suiteBegin.root === false) {
        tempResults[suiteNumber] = testResultBuilder.buildSuiteStart(suiteBegin, config, suiteNumber + 1);
      }
    }
  });

  // On EVENT_TEST_BEGIN (step) start a temp collection of step stats and add them to the relevant suite(test)
  summary.on(event.EVENT_TEST_BEGIN, function (testStepStart) {
    let obj = {};
    obj.title = testStepStart.title;
    if (isParallel) {
      if (testStepStart.retriedTest() === null) {
        obj.currentRetry = testStepStart.currentRetry();
        tempResults[testStepStart.parent.__mocha_id__].steps[testStepStart.__mocha_id__] = obj;
      }
    }
    else {
      if (testStepStart.retriedTest() === undefined) {
        obj.currentRetry = testStepStart._currentRetry;
        tempResults[suiteNumber].steps[stepNumber] = obj;
      }
    }
  });

  // On EVENT_TEST_RETRY (step), If a EVENT_TEST_BEGIN results in a failed status and Mocha is set to retry 
  // then ammend the test(step) temp results with the duration and current retry. If retry fails, the EVENT_TEST_BEGIN is run again
  summary.on(event.EVENT_TEST_RETRY, function (testStepRetry) {
    let obj = {};
    obj.title = testStepRetry.title;

    if (isParallel) {
      obj.currentRetry = testStepRetry.currentRetry();

      // If EVENT_TEST_RETRY has not been run before then the duration is initially logged. Else the retry duration needs to be added to the previous duration.
      if (testStepRetry.retriedTest() === null) {
        obj.duration = testStepRetry.duration;
        tempResults[testStepRetry.parent.__mocha_id__].steps[testStepRetry.__mocha_id__] = obj;
      }
      else {
        let retryDuration = tempResults[testStepRetry.parent.__mocha_id__].steps[testStepRetry.retriedTest().__mocha_id__].duration;
        obj.duration = retryDuration + testStepRetry.duration;
        tempResults[testStepRetry.parent.__mocha_id__].steps[testStepRetry.retriedTest().__mocha_id__] = obj;
      }
    }
    else {
      obj.currentRetry = testStepRetry._currentRetry;

      // If EVENT_TEST_RETRY has already run then the retry duration needs to be added to the previous duration
      if (Object.hasOwn(tempResults[suiteNumber].steps[stepNumber], 'duration')) {
        let retryDuration = tempResults[suiteNumber].steps[stepNumber].duration;
        obj.duration = retryDuration + testStepRetry.duration;
      }
      else {
        obj.duration = testStepRetry.duration;
      }
      tempResults[suiteNumber].steps[stepNumber] = obj;
    }
  });

  // On the EVENT_TEST_END (step), the steps details are logged and transformed into values used by the reports. 
  // If EVENT_TEST_RETRY results in a passed status or reaches the retry limit, then this event is run.
  summary.on(event.EVENT_TEST_END, function (testStepEnd) {
    let duration;
    if (isParallel) {
      const parallelStepNumber = tempResults[testStepEnd.parent.__mocha_id__].steps.length;
      let duration = 0;
      if (testStepEnd.retriedTest() === null) {
        duration = testStepEnd.duration;
        tempResults[testStepEnd.parent.__mocha_id__].steps.push(testResultBuilder.buildTestStepEnd(testStepEnd, parallelStepNumber, duration));

        // Delete the temporary element for the step
        delete tempResults[testStepEnd.parent.__mocha_id__].steps[testStepEnd.__mocha_id__];
      }
      else {
        const retryDuration = tempResults[testStepEnd.parent.__mocha_id__].steps[testStepEnd.retriedTest().__mocha_id__].duration;
        duration = retryDuration + testStepEnd.duration;
        tempResults[testStepEnd.parent.__mocha_id__].steps.push(testResultBuilder.buildTestStepEnd(testStepEnd, parallelStepNumber, duration));

        // Delete the temporary element for the step
        delete tempResults[testStepEnd.parent.__mocha_id__].steps[testStepEnd.retriedTest().__mocha_id__];
      }
    }
    else {
      if (testStepEnd._currentRetry === 0) {
        duration = testStepEnd.duration;
      }
      else {
        duration = tempResults[suiteNumber].steps[stepNumber].duration + testStepEnd.duration;
      }

      tempResults[suiteNumber].steps[stepNumber] = testResultBuilder.buildTestStepEnd(testStepEnd, stepNumber, duration);
      stepNumber++;
    }
  });

  // On the EVENT_SUITE_END (test), summarise the test steps
  summary.on(event.EVENT_SUITE_END, function (suite) {
    try {
      if (isParallel) {
        // when suite.root is true, the suite has finished.
        if (suite.root) {
          const testDetails = testResultBuilder.buildSuiteEnd(tempResults[suite.suites[0].__mocha_id__], config, suiteNumber);

          results.tests.push(testDetails);

          console.log(`\t **********************************************************`);
          console.log(`\t ${testDetails.title} Summary`);
          console.log(`\t Total Steps = ${testDetails.totalSteps}, Passed = ${testDetails.passedSteps}, Failed = ${testDetails.failedSteps}, Pending = ${testDetails.skippedSteps}`);
          console.log(`\t **********************************************************`);
        }
      }
      else {
        if (suite.root === false) {
          const testDetails = testResultBuilder.buildSuiteEnd(tempResults[suiteNumber], config, suiteNumber);

          if (testDetails !== undefined) results.tests.push(testDetails);

          // summary for this suite
          if (suite.tests.length > 0 && suite.ctx._runnable !== undefined && config.reporterOptions.consoleSummary) {
            console.log(`\t **********************************************************`);
            console.log(`\t ${testDetails.title} Summary`);
            console.log(`\t Total Steps = ${testDetails.totalSteps}, Passed = ${testDetails.passedSteps}, Failed = ${testDetails.failedSteps}, Pending = ${testDetails.skippedSteps}`);
            console.log(`\t **********************************************************`);
          }
          suiteNumber++;
          stepNumber = 0;
        }
      }
    }
    catch (err) {
      console.error(err);
    }
  });

  // On the EVENT_RUN_END (suite), summarise all the tests and collect information about the suite run time. Then call for the reports to be generated. 
  summary.once(event.EVENT_RUN_END, function () {
    // get end time
    results.info.endTime = moment(this.stats.end).local().format('HH:mm:ss.SSS');
    results.info.endDuration = moment(this.stats.end).utc();
    results.info.duration = results.info.endDuration.subtract(results.info.startDuration).format('HH:mm:ss.SSS');
    results.info.durationSeconds = this.stats.duration / 1000;

    // add summmary of all test suites to the results object
    const summaryDetails = testResultBuilder.buildSummaryResults(results, config);
    results.summary = summaryDetails;

    // add test run info to the results object
    const infoDetails = testResultBuilder.buildSuitesInfo(results, config);
    results.info = infoDetails;

    // executes summary reports based on options
    const consoleSummary = (config.reporterOptions.consoleSummary === undefined) ? 'false' : config.reporterOptions.consoleSummary;
    const textFileSummary = (config.reporterOptions.textFileSummary === undefined) ? 'false' : config.reporterOptions.textFileSummary;
    const htmlSummary = (config.reporterOptions.htmlSummary === undefined) ? 'false' : config.reporterOptions.htmlSummary;
    if (consoleSummary === 'true') summaryGenerator.summaryReportConsole(results);
    if (textFileSummary === 'true') summaryGenerator.summaryReportEmail(results, config);
    if (htmlSummary === 'true') summaryGenerator.summaryReportHtml(results, config);
  });
}

// If the Mocha.Base reporter is set to run, then run that reporter.
if (useBaseReporter) util.inherits(summaryReport, Base);

module.exports = summaryReport;