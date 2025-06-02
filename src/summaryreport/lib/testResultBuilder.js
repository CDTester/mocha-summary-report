const envCi = require('./envCi');
const path = require('path');
const moment = require('moment');


/**
 * buildTestCaseResults - Builds a summary of a suite run
 * @param {Mocha.Suite} suite contains details of the suite run
 * @param {object} _config reporter options for suiteReport
 * @param {number} index number assigned to the suite to describe the order in which the suite ran
 * @returns {object} Object contains suite run summary
 */
function buildTestCaseResults (suite, _config, index) {
  const test = {};
  console.log(`TRB-buildTestCase: suite.tests = ${suite.tests}`)
  if (suite.tests.length > 0) {

    // get tag value from config
    const tagPrefix = _config.reporterOptions.tagPrefix || '@';

    // get testID value from config
    const testIDPrefix = _config.reporterOptions.testIDPrefix || '$';

    // add link if other reports are being used
    test.otherReport = (_config.reporterOptions.otherReportLink !== undefined) ? true : false;
    test.reportLink = (_config.reporterOptions.otherReportLink !== undefined) ? path.resolve(process.env.INIT_CWD, _config.reporterOptions.otherReportLink) : "";

    // test suite index
    test.index = index;

    // get test title and remove tags and testID from title
    test.title = suite.title.split(' ').filter((title) => !title.startsWith(tagPrefix) && !title.startsWith(testIDPrefix)).join(' ');

    // get test tags
    test.tags = suite.title.split(' ').filter((tag) => tag.startsWith(tagPrefix)).map((x) => x.substring(x.indexOf(tagPrefix) + 1));

    // get testID
    test.testID = suite.title.split(' ').filter((testID) => testID.startsWith(testIDPrefix)).map((x) => x.substring(x.indexOf(testIDPrefix) + 1)).join(', ');

    // create an aray for test steps
    test.steps = [];
    let stepIndex = 1;
    for (const step of suite.tests) {
      const stepDetails = {};
      stepDetails.index = stepIndex++;
      stepDetails.testStepTitle = step.title;
      stepDetails.passed = (step.state === 'passed') ? 1 : 0;
      stepDetails.failed = (step.state === 'failed') ? 1 : 0;
      stepDetails.skipped = (step.state === 'pending') ? 1 : 0;
      stepDetails.status = (stepDetails.passed === 1) ? "Passed" : (stepDetails.skipped === 1) ? "Skipped" : "Failed";
      stepDetails.class = (stepDetails.passed === 1) ? "success" : (stepDetails.skipped === 1) ? "info" : "danger";
      stepDetails.duration = step.duration !== undefined ? (step.duration / 1000).toFixed(3) : '0.000';
      stepDetails.error = step.err ? step.err.message : '';

      test.steps.push(stepDetails);
    }

    // get test step results
    test.totalSteps = test.steps.length;
    test.passedSteps = test.steps.filter(e => e.passed === 1).length;
    test.failedSteps = test.steps.filter(e => e.failed === 1).length;
    test.skippedSteps = test.steps.filter(e => e.skipped === 1).length;
    test.passedPercent = `${Number(test.passedSteps / test.totalSteps * 100).toFixed(2)}` || '0';
    test.skippedPercent = `${Number(test.skippedSteps / test.totalSteps * 100).toFixed(2)}` || '0';
    test.failedPercent = `${Number(test.failedSteps / test.totalSteps * 100).toFixed(2)}` || '0';

    test.duration = ((test.steps.reduce((accumulator, step) => accumulator + Number(step.duration), 0))).toFixed(3) || '0.000';

    return test;
  }
  else {
    return undefined;
  }
}

/**
 * buildSummaryResults - builds a summary of all the suites
 * @param {object} tests contains details of all the suites run
 * @param {object} _config reporter options for suiteReport
 * @returns {object} Object contains summary of all suites executed
 */
function buildSummaryResults (tests, _config) {
  const summary = {};

  // get test summary
  summary.totalTests = tests.length || "0";
  summary.totalTestsPassed = tests.filter(e => e.passedSteps === e.totalSteps).length || "0";
  summary.totalTestsFailed = tests.filter(e => e.failedSteps > 0).length || "0";
  summary.totalTestsSkipped = summary.totalTests - (summary.totalTestsPassed + summary.totalTestsFailed) || "0";
  summary.testPassedRate = ((summary.totalTestsPassed / summary.totalTests) * 100).toFixed(2) || "0.00";

  // The passed rate can be assigned a colour of red/amber/green based on custom criteria set out in the reporter options
  const green = _config.reporterOptions.passRateGreen || 90;
  const amber = _config.reporterOptions.passRateAmber || 50;
  if (summary.testPassedRate >= green) {
    summary.testPassedRateColor = 'bg-green';
  }
  else if (summary.testPassedRate >= amber) {
    summary.testPassedRateColor = 'bg-amber';
  }
  else {
    summary.testPassedRateColor = 'bg-red';
  }

  // get test step summary
  summary.totalTestSteps = tests.reduce((accumulator, test) => accumulator + Number(test.totalSteps), 0) || "--";
  summary.totalPassedSteps = tests.reduce((accumulator, test) => accumulator + Number(test.passedSteps), 0) || "--";
  summary.totalFailedSteps = tests.reduce((accumulator, test) => accumulator + Number(test.failedSteps), 0) || "--";
  summary.totalSkippedSteps = tests.reduce((accumulator, test) => accumulator + Number(test.skippedSteps), 0) || "--";
  summary.testStepPassedRate = ((summary.totalPassedSteps / summary.totalTestSteps) * 100).toFixed(2) || "0.00";

  // The passed rate can be assigned a colour of red/amber/green based on custom criteria set out in the reporter options
  if (summary.testStepPassedRate > 90) {
    summary.stepPassedRateColor = 'bg-green';
  }
  else if (summary.testStepPassedRate > 50) {
    summary.stepPassedRateColor = 'bg-amber';
  }
  else {
    summary.stepPassedRateColor = 'bg-red';
  }

  // get suite run duration
  summary.totalDuration = tests.reduce((accumulator, test) => accumulator + Number(test.duration), 0);
  summary.averageTestExecutionRate = (summary.totalTests / summary.totalDuration).toFixed(3);

  return summary;
}


/**
 * buildSuitesInfo - collates meta data details of all the test suites run.
 * @param {object} _results contains details of all the suites run and summary details
 * @param {object} _config reporter options for suiteReport
 * @returns {object} Object contains version, cycle, environment, tags, runtime and CI/CD details
 */
function buildSuitesInfo (_results, _config) {
  const info = {};
  info.environment = process.env[_config.reporterOptions.environmentVar] || '--';
  info.project = process.env[_config.reporterOptions.projectName] || _config.reporterOptions.projectName || '--';
  info.projectVersion = process.env[_config.reporterOptions.projectVersion] || _config.reporterOptions.projectVersion || '--';
  info.projectCycle = process.env[_config.reporterOptions.projectCycle] || _config.reporterOptions.projectCycle || '--';

  // get tags from tests, remove duplicates and join them
  const mappedTags = _results.tests.flatMap((test) => test.tags);
  const noDupTags = [];
  mappedTags.forEach(tag => {
    if (!noDupTags.includes(tag)) noDupTags.push(tag);
  });

  // convert to an array of objects
  info.tags = noDupTags.map(tags => ({ tag: tags }));

  // get test run time info
  info.runDate = moment(_results.info.runDate).format('ddd DD/MM/YYYY');
  info.startTime = _results.info.startTime || '--';
  info.endTime = _results.info.endTime || '--';
  info.duration = _results.info.duration || '--';

  // set some example env variables to test CI/CD
  // process.env.JENKINS_URL = "http://myjenkins.com";
  // process.env.BUILD_NUMBER = "12";
  // process.env.JOB_NAME = "myjob";
  // process.env.BUILD_URL = `http://myjenkins.com/job/${process.env.JOB_NAME}/${process.env.BUILD_NUMBER}/`;

  // get CI/CD info
  const ciDetails = envCi.envCi();
  info.isCi = ciDetails.isCi;
  info.ciServer = ciDetails.name;
  info.buildUrl = ciDetails.buildUrl || '--';
  info.buildNumber = ciDetails.buildNumber || '--';
  info.jobName = ciDetails.jobName || '--';

  return info;
}


module.exports = {
  buildTestCaseResults,
  buildSummaryResults,
  buildSuitesInfo
};