// const envCi = require('./envCi');
let envCi;
(async () => { envCi = (await import("env-ci")).default;})();
const envCiImage = require('./envCiImage.js');
const path = require('path');
const moment = require('moment');
const config = require('config');

/**
 * buildSuiteStart - Starts to build a summary of a test suite run
 * @param {Mocha.Suite} suite contains details of the suite run
 * @param {object} _config reporter options for suiteReport
 * @param {number} index number assigned to the suite to describe the order in which the suite ran
 * @returns {object} Object contains suite run summary:
*/
function buildSuiteStart (suite, _config, index) {
  const test = {};

  // get tag & testID value from config
  const tagPrefix = _config.reporterOptions.tagPrefix || '@';
  const testIDPrefix = _config.reporterOptions.testIDPrefix || '$';

  // add link if other reports are being used
  test.otherReport = (_config.reporterOptions.otherReportLink !== undefined) ? true : false;
  test.reportLink = (_config.reporterOptions.otherReportLink !== undefined) ? _config.reporterOptions.otherReportLink : "";

  // test suite index
  test.index = index;

  // get test title and remove tags and testID from title
  test.title = suite.title.split(' ').filter((title) => !title.startsWith(tagPrefix) && !title.startsWith(testIDPrefix)).join(' ');

  // get test tags and testID
  test.tags = suite.title.split(' ').filter((tag) => tag.startsWith(tagPrefix)).map((x) => x.substring(x.indexOf(tagPrefix) + 1)) || ['--'];
  test.testID = suite.title.split(' ').filter((testID) => testID.startsWith(testIDPrefix)).map((x) => x.substring(x.indexOf(testIDPrefix) + 1)).join(', ') || '--';
  if (_config.reporterOptions.manualTestLink === undefined) {
    test.testUrl = undefined;
  }
  else {
    test.testUrl = process.env[_config.reporterOptions.manualTestLink];
  }

  // initialise test steps and other suite data
  test.steps = [];
  test.totalSteps = 0;
  test.passedSteps = 0;
  test.failedSteps = 0;
  test.skippedSteps = 0;
  test.passedPercent = '';
  test.skippedPercent = '';
  test.failedPercent = '';
  test.duration = '';

  test.statusByTags = {}
  for (let tag in test.tags) {
    if (test.tags[tag] !== 'flaky') {
      test.statusByTags[test.tags[tag]] = 'unknown'
    }
  }


  return test;
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
  stepDetails.class = (stepDetails.passed === 1) ? "success" : (stepDetails.skipped === 1) ? "primary" : "danger";
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
  
  let isFlaky = suite.tags.includes('flaky') ? true : false;
  for (let tag in suite.tags) {
    if (suite.tags[tag] !== 'flaky') {
      if (suite.totalSteps === suite.passedSteps) {
        suite.statusByTags[suite.tags[tag]] = {passed: 1, failed: 0, skipped: 0, flaky: isFlaky, riskFlaky: isFlaky}
      }
      else if (suite.totalSteps === suite.skippedSteps) {
        suite.statusByTags[suite.tags[tag]] = {passed: 0, failed: 0, skipped: 1, flaky: isFlaky, riskFlaky: false}
      }
      else {
      suite.statusByTags[suite.tags[tag]] = {passed: 0, failed: 1, skipped: 0, flaky: isFlaky, riskFlaky: isFlaky}
      }
    }
  }
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

  // list test phases
  summary.suiteTags = config.get('mochaSummaryReportReporterOptions.testPhases') || ['smoke', 'regression']; // these overlap with area tags, exclude from total

  // get test summary
  summary.totalTests = suite.tests.length || "0";
  summary.totalTestsPassed = suite.tests.filter(e => e.passedSteps === e.totalSteps).length || 0;
  summary.totalTestsFailed = suite.tests.filter(e => e.failedSteps > 0).length || 0;
  summary.totalTestsSkipped = summary.totalTests - (summary.totalTestsPassed + summary.totalTestsFailed) || 0;
  summary.testPassedRate = summary.totalTests > 0 ? ((summary.totalTestsPassed / (summary.totalTests - summary.totalTestsSkipped)) * 100).toFixed(2) : 0.00;
  summary.testPerSecond = summary.totalTests > 0 ? ((summary.totalTestsPassed + summary.totalTestsFailed) / suite.info.durationSeconds).toFixed(2) : 0.00;

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
  summary.testStepPassedRate = summary.totalTestSteps > 0 ? ((summary.totalPassedSteps / (summary.totalTestSteps - summary.totalSkippedSteps)) * 100).toFixed(2) : 0.00;
  summary.stepsPerSecond = summary.totalTests > 0 ? ((summary.totalPassedSteps + summary.totalFailedSteps) / suite.info.durationSeconds).toFixed(2) : 0.00;

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

  // Collate stats from data from each test  
  summary.byTag = suite.tests.reduce((acc, test) => {
    for (const [tag, stats] of Object.entries(test.statusByTags)) {
      if (!acc[tag]) {
        acc[tag] = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0, riskFlaky: 0 };
      }
      acc[tag].total++;
      acc[tag].passed += stats.passed;
      acc[tag].failed += stats.failed;
      acc[tag].skipped += stats.skipped;
      if (stats.flaky) acc[tag].flaky++;
      if (stats.riskFlaky) acc[tag].riskFlaky++;
    }
    return acc;
  }, {});

  // create passed rate, coverage and confidence stats per test
  let flaky_penalty = 0.4;
  for (const tag in summary.byTag) {
    let passedPercent = (summary.byTag[tag].total - summary.byTag[tag].skipped) > 0 ? (summary.byTag[tag].passed / (summary.byTag[tag].total - summary.byTag[tag].skipped) * 100).toFixed(2) : 0.00;
    let coveragePercent = summary.byTag[tag].total > 0 ? ((summary.byTag[tag].total - summary.byTag[tag].skipped) / summary.byTag[tag].total * 100).toFixed(2): 0.00;
    let coverageSkipText = ''
    let flaky_text = '';
    let nonflaky_text = '';

    if (summary.byTag[tag].skipped > 0) {
      // check if any flaky were skipped, riskFlaky are flaky tests that were executed
      if (summary.byTag[tag].flaky - summary.byTag[tag].riskFlaky > 0) {
        flaky_text = `${summary.byTag[tag].flaky - summary.byTag[tag].riskFlaky} flaky skipped`
      }
      // check if non flaky tests were skipped
      if (summary.byTag[tag].skipped - (summary.byTag[tag].flaky - summary.byTag[tag].riskFlaky) > 0){
        nonflaky_text = `${summary.byTag[tag].skipped - (summary.byTag[tag].flaky - summary.byTag[tag].riskFlaky)} skipped`
      }
      if (nonflaky_text !== '' && flaky_text !== '') {
        coverageSkipText = `${nonflaky_text}, ${flaky_text}`;
      }
      if (nonflaky_text !== '' && flaky_text === '') {
        coverageSkipText = nonflaky_text;
      }
      if (nonflaky_text === '' && flaky_text !== '') {
        coverageSkipText = flaky_text;
      }
    }
    if (nonflaky_text === '' && flaky_text === '') {
      coverageSkipText = 'none skipped';
    }

    let coverageText = `${(summary.byTag[tag].total - summary.byTag[tag].skipped)}/${summary.byTag[tag].total} run, ${coverageSkipText} `;
    let flakyPercent = summary.byTag[tag].total > 0 ? (summary.byTag[tag].riskFlaky / summary.byTag[tag].total ).toFixed(2) : 0.00;
    let flakyDrop = summary.byTag[tag].total > 0 ? ((flakyPercent * flaky_penalty) * 100).toFixed(2) : 0
    let coverageDrop = summary.byTag[tag].total > 0 ? ((100 - coveragePercent )).toFixed(2) : 0
    let confidence = passedPercent > 0 ? (passedPercent * (1-(flakyDrop/100)) * (1 - (coverageDrop/100))).toFixed(2) : 0

    summary.byTag[tag]['key'] = tag;
    summary.byTag[tag]['passedPercent'] = passedPercent;
    summary.byTag[tag]['coveragePercent'] = coveragePercent;
    summary.byTag[tag]['coverageText'] = coverageText;
    summary.byTag[tag]['flakyPercent'] = flakyPercent;
    summary.byTag[tag]['flakyDrop'] = flakyDrop;
    summary.byTag[tag]['coverageDrop'] = coverageDrop;
    summary.byTag[tag]['confidence'] = confidence;

    if (passedPercent >= 85) {
      summary.byTag[tag].colourPassed = 'w3-green';
      summary.byTag[tag].paleColourPassed = 'w3-pale-green';
    }
    else if (passedPercent >= 60) {
      summary.byTag[tag].colourPassed = 'w3-orange';
      summary.byTag[tag].paleColourPassed = 'w3-sand';
    }
    else {
      summary.byTag[tag].colourPassed = 'w3-red';
      summary.byTag[tag].paleColourPassed = 'w3-pale-red';
    }

    if (coveragePercent >= 85) {
      summary.byTag[tag].colourCoverage = 'w3-green';
      summary.byTag[tag].paleColourCoverage = 'w3-pale-green';
    }
    else if (coveragePercent >= 60) {
      summary.byTag[tag].colourCoverage = 'w3-orange';
      summary.byTag[tag].paleColourCoverage = 'w3-sand';
    }
    else {
      summary.byTag[tag].colourCoverage = 'w3-red';
      summary.byTag[tag].paleColourCoverage = 'w3-pale-red';
    }

    if (confidence >= 85) {
      summary.byTag[tag].colourConfidence = 'w3-green';
      summary.byTag[tag].paleColourConfidence = 'w3-pale-green';
    }
    else if (confidence >= 60) {
      summary.byTag[tag].colourConfidence = 'w3-orange';
      summary.byTag[tag].paleColourConfidence = 'w3-sand';
    }
    else {
      summary.byTag[tag].colourConfidence = 'w3-red';
      summary.byTag[tag].paleColourConfidence = 'w3-pale-red';
    }
  }

  // Collate data from each test to create a total set of stats  
  summary.total = Object.entries(summary.byTag)
    .filter(([tag]) => !summary.suiteTags.includes(tag))
    .reduce((acc, [, stats]) => {
      acc.total    += stats.total;
      acc.passed   += stats.passed;
      acc.failed   += stats.failed;
      acc.skipped  += stats.skipped;
      acc.flaky    += stats.flaky;
      acc.riskFlaky += stats.riskFlaky;
      return acc;
    }, { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0, riskFlaky: 0 });

  // do risk summary for  all tests
  let passedPercent = summary.total.passed > 0 ? (summary.total.passed / (summary.total.total - summary.total.skipped) * 100).toFixed(2) : 0.00;
  let coveragePercent = summary.total.passed > 0 ? ((summary.total.total - summary.total.skipped) / summary.total.total * 100).toFixed(2) : 0.00;
  let coverageSkipText = ''
  let flaky_text = '';
  let nonflaky_text = '';

  if (summary.total.skipped > 0) {
    // check if any flaky were skipped, riskFlaky are flaky tests that were executed
    if (summary.total.flaky - summary.total.riskFlaky > 0) {
      flaky_text = `${summary.total.flaky - summary.total.riskFlaky} flaky skipped`
    }
    // check if non flaky tests were skipped
    if (summary.total.skipped - (summary.total.flaky - summary.total.riskFlaky) > 0){
      nonflaky_text = `${summary.total.skipped - (summary.total.flaky - summary.total.riskFlaky)} skipped`
    }
    if (nonflaky_text !== '' && flaky_text !== '') {
      coverageSkipText = `${nonflaky_text}, ${flaky_text}`;
    }
    if (nonflaky_text !== '' && flaky_text === '') {
      coverageSkipText = nonflaky_text;
    }
    if (nonflaky_text === '' && flaky_text !== '') {
      coverageSkipText = flaky_text;
    }
  }
  if (nonflaky_text === '' && flaky_text === '') {
    coverageSkipText = 'none skipped';
  }

  let coverageText = `${(summary.total.total - summary.total.skipped)}/${summary.total.total} run, ${coverageSkipText} `;
  let flakyPercent = summary.total.passed === 0 ? 0 : (summary.total.riskFlaky / summary.total.total ).toFixed(2);
  let flakyDrop = summary.total.total > 0 ? ((flakyPercent * flaky_penalty) * 100).toFixed(2) : 0.00;
  let coverageDrop = summary.total.total > 0 ? ((100 - coveragePercent )).toFixed(2) : 0.00;
  let confidence = summary.total.total > 0 ? (passedPercent * (1-(flakyDrop/100)) * (1- (coverageDrop/100))).toFixed(2) : 0.00;

  summary.total['passedPercent'] = passedPercent;
  summary.total['coveragePercent'] = coveragePercent;
  summary.total['coverageText'] = coverageText;
  summary.total['flakyPercent'] = flakyPercent;
  summary.total['flakyDrop'] = flakyDrop;
  summary.total['coverageDrop'] = coverageDrop;
  summary.total['confidence'] = confidence;

  if (passedPercent >= 85) {
    summary.total.colourPassed = 'w3-green';
    summary.total.paleColourPassed = 'w3-pale-green';
  }
  else if (passedPercent >= 60) {
    summary.total.colourPassed = 'w3-orange';
    summary.total.paleColourPassed = 'w3-pale-orange';
  }
  else {
    summary.total.colourPassed = 'w3-red';
    summary.total.paleColourPassed = 'w3-pale-red';
  }

  if (coveragePercent >= 85) {
    summary.total.colourCoverage = 'w3-green';
    summary.total.paleColourCoverage = 'w3-pale-green';
  }
  else if (coveragePercent >= 60) {
    summary.total.colourCoverage = 'w3-orange';
    summary.total.paleColourCoverage = 'w3-pale-orange';
  }
  else {
    summary.total.colourCoverage = 'w3-red';
    summary.total.paleColourCoverage = 'w3-pale-red';
  }

  if (confidence >= 85) {
    summary.total.colourConfidence = 'w3-green';
    summary.total.paleColourConfidence = 'w3-pale-green';
  }
  else if (confidence >= 60) {
    summary.total.colourConfidence = 'w3-orange';
    summary.total.paleColourConfidence = 'w3-pale-orange';
  }
  else {
    summary.total.colourConfidence = 'w3-red';
    summary.total.paleColourConfidence = 'w3-pale-red';
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
  info.project = process.env[_config.reporterOptions.projectName] || '--';
  info.projectVersion = process.env[_config.reporterOptions.projectVersion] || '--';
  info.projectCycle = process.env[_config.reporterOptions.projectCycle] || '--';

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
  info.parallel = _results.info.parallel ? 'Yes': 'No';

  // set some example env variables to test CI/CD
  // process.env.BUDDY_WORKSPACE_ID = "http://bitrise.io";
  // process.env.JENKINS_URL = "http://myjenkins.com";
  // process.env.BUILD_NUMBER = "12";
  // process.env.JOB_NAME = "myjob";
  // process.env.BUILD_URL = `http://myjenkins.com/job/${process.env.JOB_NAME}/${process.env.BUILD_NUMBER}/`;

  // get CI/CD info
  const ciDetails = envCi();
  info.name = ciDetails.name || 'Local';
  const ciImage = envCiImage.envCiImage(ciDetails.name);
  info.isCi = ciDetails.isCi;
  info.ciServer = ciDetails.name || 'Local';
  info.buildUrl = ciDetails.buildUrl || '--';
  info.buildNumber = ciDetails.build || '--';
  info.jobName = ciDetails.jobName || '--';
  info.icon = ciImage.icon || '';

  return info;
}


module.exports = {
  buildSuiteStart,
  buildSuiteEnd,
  buildTestStepEnd,
  buildSummaryResults,
  buildSuitesInfo
};