const envCi = require('./envCi');
const path = require('path');
const moment = require('moment');


/**
 * buildSuiteStart - Starts to build a summary of a test suite run
 * @param {Mocha.Suite} suite contains details of the suite run
 * @param {object} _config reporter options for suiteReport
 * @param {number} index number assigned to the suite to describe the order in which the suite ran
 * @returns {object} Object contains suite run summary:
*/
function buildSuiteStart (suite, _config, index) {
  const _suite = {};

  // get tag & testID value from config
  const tagPrefix = _config.reporterOptions.tagPrefix || '@';
  const testIDPrefix = _config.reporterOptions.testIDPrefix || '$';

  // add link if other reports are being used
  _suite.otherReport = (_config.reporterOptions.otherReportLink !== undefined) ? true : false;
  _suite.reportLink = (_config.reporterOptions.otherReportLink !== undefined) ? path.resolve(process.env.INIT_CWD, _config.reporterOptions.otherReportLink) : "";

  // test suite index
  _suite.index = index;

  // get test title and remove tags and testID from title
  _suite.title = suite.title.split(' ').filter((title) => !title.startsWith(tagPrefix) && !title.startsWith(testIDPrefix)).join(' ');

  // get test tags and testID
  _suite.tags = suite.title.split(' ').filter((tag) => tag.startsWith(tagPrefix)).map((x) => x.substring(x.indexOf(tagPrefix) + 1)) || ['--'];
  _suite.testID = suite.title.split(' ').filter((testID) => testID.startsWith(testIDPrefix)).map((x) => x.substring(x.indexOf(testIDPrefix) + 1)).join(', ') || '--';
  if (_config.reporterOptions.manualTestLink === undefined) {
    _suite.testUrl = undefined;
  }
  else {
    _suite.testUrl = process.env[_config.reporterOptions.manualTestLink];
  }

  // initialise test steps and other suite data
  _suite.steps = [];
  _suite.totalSteps = 0;
  _suite.passedSteps = 0;
  _suite.failedSteps = 0;
  _suite.skippedSteps = 0;
  _suite.passedPercent = '';
  _suite.skippedPercent = '';
  _suite.failedPercent = '';
  _suite.duration = '';

  return _suite;
}

/**
 * buildTestStepEnd - Builds a summary of a test step when test execution is run in parallel
 * @param {Mocha.Suite} suite contains details of the suite run
 * @param {number} index number assigned to the suite to describe the order in which the suite ran
 * @returns {object} Object contains suite run summary
*/
function buildTestStepEnd (step, index, _duration) {
  const stepDetails = {};
  let stepIndex = index + 1;
  stepDetails.index = stepIndex++;
  stepDetails.testStepTitle = step.title;
  stepDetails.passed = (step.state === 'passed') ? 1 : 0;
  stepDetails.failed = (step.state === 'failed') ? 1 : 0;
  stepDetails.skipped = (step.state === 'pending') ? 1 : 0;
  stepDetails.status = (stepDetails.passed === 1) ? "Passed" : (stepDetails.skipped === 1) ? "Skipped" : "Failed";
  stepDetails.class = (stepDetails.passed === 1) ? "success" : (stepDetails.skipped === 1) ? "info" : "danger";
  stepDetails.duration = _duration !== undefined ? (_duration / 1000).toFixed(3) : '0.000';
  stepDetails.error = step.err ? step.err.message : '';
  stepDetails.retries = (step.currentRetry() > 0) ? step.currentRetry() : '--';

  return stepDetails;
}

/**
 * buildSuiteEnd - Summarises the summary of a test suite when test execution is run in parallel
 * @param {Mocha.Suite} suite contains details of the suite run
 * @returns {object} Object contains suite run summary
 */
function buildSuiteEnd (suite) {
  // get test step results
  suite.totalSteps = suite.steps.length;
  suite.passedSteps = suite.steps.filter(e => e.passed === 1).length;
  suite.failedSteps = suite.steps.filter(e => e.failed === 1).length;
  suite.skippedSteps = suite.steps.filter(e => e.skipped === 1).length;
  suite.passedPercent = `${Number(suite.passedSteps / suite.totalSteps * 100).toFixed(2)}` || '0';
  suite.skippedPercent = `${Number(suite.skippedSteps / suite.totalSteps * 100).toFixed(2)}` || '0';
  suite.failedPercent = `${Number(suite.failedSteps / suite.totalSteps * 100).toFixed(2)}` || '0';
  suite.duration = ((suite.steps.reduce((accumulator, step) => accumulator + Number(step.duration), 0))).toFixed(3) || '0.000';

  return suite;
}

/**
 * buildSummaryResults - builds a summary of all the suites
 * @param {object} tests contains details of all the suites run
 * @param {object} _config reporter options for suiteReport
 * @returns {object} Object contains summary of all suites executed
*/
function buildSummaryResults (suite, _config) {
  const summary = {};

  // get test summary
  summary.totalTests = suite.tests.length || "0";
  summary.totalTestsPassed = suite.tests.filter(e => e.passedSteps === e.totalSteps).length || 0;
  summary.totalTestsFailed = suite.tests.filter(e => e.failedSteps > 0).length || 0;
  summary.totalTestsSkipped = summary.totalTests - (summary.totalTestsPassed + summary.totalTestsFailed) || 0;
  summary.testPassedRate = ((summary.totalTestsPassed / summary.totalTests) * 100).toFixed(2) || "0.00";
  summary.testPerSecond = ((summary.totalTestsPassed + summary.totalTestsFailed) / suite.info.durationSeconds).toFixed(2) || "0.00";

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
  summary.totalTestSteps = suite.tests.reduce((accumulator, test) => accumulator + Number(test.totalSteps), 0) || 0;
  summary.totalPassedSteps = suite.tests.reduce((accumulator, test) => accumulator + Number(test.passedSteps), 0) || 0;
  summary.totalFailedSteps = suite.tests.reduce((accumulator, test) => accumulator + Number(test.failedSteps), 0) || 0;
  summary.totalSkippedSteps = suite.tests.reduce((accumulator, test) => accumulator + Number(test.skippedSteps), 0) || 0;
  summary.testStepPassedRate = ((summary.totalPassedSteps / summary.totalTestSteps) * 100).toFixed(2) || "0.00";
  summary.stepsPerSecond = ((summary.totalPassedSteps + summary.totalFailedSteps) / suite.info.durationSeconds).toFixed(2) || "0.00";

  // The passed rate can be assigned a colour of red/amber/green based on custom criteria set out in the reporter options
  if (summary.testStepPassedRate >= green) {
    summary.stepPassedRateColor = 'bg-green';
  }
  else if (summary.testStepPassedRate >= amber && summary.testStepPassedRate < green) {
    summary.stepPassedRateColor = 'bg-amber';
  }
  else {
    summary.stepPassedRateColor = 'bg-red';
  }

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
  info.runDate = moment(_results.info.runDate).format('DD/MM/YYYY');
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
  info.icon = ciDetails.icon || '';

  return info;
}


module.exports = {
  buildSuiteStart,
  buildSuiteEnd,
  buildTestStepEnd,
  buildSummaryResults,
  buildSuitesInfo
};