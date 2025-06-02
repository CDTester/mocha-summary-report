"use strict";

const Mocha = require('mocha');
const event = Mocha.Runner.constants;
const moment = require('moment');
const testResultBuilder = require('./lib/testResultBuilder.js');
const summaryGenerator = require('./lib/summaryReportGenerator');
let config;
let suiteNumber = 0;
const results = {
  tests: [],
  summary: {},
  info: {}
};

function summaryReport (summary, _options) {
  config = _options;
  summary.capture;

  summary.on(event.EVENT_RUN_BEGIN, function () {
    // get start time
    results.info.runDate = moment().local().format('YYYY-MM-DD');
    results.info.startTime = moment(this.stats.start).local().format('HH:mm:ss.SSS');
    results.info.startDuration = moment(this.stats.start).utc();
    console.log(`\x1b[32mStarting Test Suite`);
  });

  summary.on(event.EVENT_SUITE_END, function (suite) {
    try {
      suiteNumber++;

      // add test suite details to the results object
      const testDetails = testResultBuilder.buildTestCaseResults(suite, config, suiteNumber);
      if (testDetails !== undefined) results.tests.push(testDetails);

      // summary for this suite
      if (suite.tests.length > 0 && suite.ctx._runnable !== undefined && config.reporterOptions.consoleSummary) {
        console.log('\t**********************************************************');
        console.log(`\tTotal Steps = ${testDetails.totalSteps}, Passed = ${testDetails.passedSteps}, Failed = ${testDetails.failedSteps}, Pending = ${testDetails.skippedSteps}`);
        console.log('\t**********************************************************');
      }
    }
    catch (err) {
      console.error(err);
    }
  });

  summary.once(event.EVENT_RUN_END, function () {
    // get end time
    results.info.endTime = moment(this.stats.end).local().format('HH:mm:ss.SSS');
    results.info.endDuration = moment(this.stats.end).utc();
    results.info.duration = results.info.endDuration.subtract(results.info.startDuration).format('HH:mm:ss.SSS');

    // add summmary of all test suites to the results object
    const summaryDetails = testResultBuilder.buildSummaryResults(results.tests, config);
    results.summary = summaryDetails;


    // add test run info to the results object
    const infoDetails = testResultBuilder.buildSuitesInfo(results, config);
    results.info = infoDetails;

    if (config.reporterOptions.consoleSummary === undefined || config.reporterOptions.consoleSummary) summaryGenerator.summaryReportConsole(results);
    if (config.reporterOptions.textFileSummary === undefined || config.reporterOptions.textFileSummary) summaryGenerator.summaryReportEmail(results, config);
    if (config.reporterOptions.htmlSummary === undefined || config.reporterOptions.htmlSummary) summaryGenerator.summaryReportHtml(results, config);

  });
}
module.exports = summaryReport;