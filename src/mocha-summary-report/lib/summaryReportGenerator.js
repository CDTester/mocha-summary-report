"use strict";

const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const utils = require('./utils');


/**
 * write summary results to console log
 * @param {object} result contains details of all the suites run and summary detail
*/
function summaryReportConsole (result) {
  const totalT = '\x1b[97m \x1b[1m Total Tests:     \x1b[21m \x1b[96m';
  const totalTS = '\x1b[97m \x1b[1m Total Test Steps:\x1b[21m \x1b[96m';
  const passed = '\x1b[97m \x1b[1m Passed:\x1b[21m \x1b[96m';
  const failed = '\x1b[97m \x1b[1m Failed:\x1b[21m \x1b[96m';
  const pending = '\x1b[97m \x1b[1m Pending:\x1b[21m \x1b[96m';
  const testPercent = '\x1b[97m \x1b[1m TEST_PASS_PERCENTAGE:     \x1b[21m \x1b[96m';
  const testStepPercent = '\x1b[97m \x1b[1m TEST_STEP_PASS_PERCENTAGE:\x1b[21m \x1b[96m';
  const duration = '\x1b[97m \x1b[1m Duration:\x1b[21m \x1b[96m';

  console.log('\x1b[93m **********************************************************************************');
  console.log(`\x1b[93m *${totalT} ${result.summary.totalTests} \t ${passed} ${result.summary.totalTestsPassed} \t ${failed} ${result.summary.totalTestsFailed} \t ${pending} ${result.summary.totalTestsSkipped}`);
  console.log(`\x1b[93m *${totalTS} ${result.summary.totalTestSteps} \t ${passed} ${result.summary.totalPassedSteps} \t ${failed} ${result.summary.totalFailedSteps} \t ${pending} ${result.summary.totalSkippedSteps}`);
  console.log(`\x1b[93m *${testPercent} ${result.summary.testPassedRate} %`);
  console.log(`\x1b[93m *${testStepPercent} ${result.summary.testStepPassedRate} %`);
  console.log(`\x1b[93m *${duration} ${result.info.duration}`);
  console.log('\x1b[93m **********************************************************************************\x1b[0m');
}


/**
 * write summary results to text file to be attached to emails
 * @param {object} result contains details of all the suites run and summary detail
 * @param {object} config reporter options for suiteReport
*/
async function summaryReportEmail (result, config) {
  const folder = path.resolve(process.env.INIT_CWD, config.reporterOptions.output, 'emailSummary.txt');
  const file = fs.createWriteStream(folder);
  file.write(`Total Tests: ${result.summary.totalTests}\n`);
  file.write(`Passed Tests: ${result.summary.totalTestsPassed}\n`);
  file.write(`Failed Tests: ${result.summary.totalTestsFailed}\n`);
  file.write(`Skipped Tests: ${result.summary.totalTestsSkipped}\n`);
  file.write(`Test Steps: ${result.summary.totalTestSteps}\n`);
  file.write(`Test Steps passed: ${result.summary.totalPassedSteps}\n`);
  file.write(`Test Steps failed: ${result.summary.totalFailedSteps}\n`);
  file.write(`Test Steps skipped: ${result.summary.totalSkippedSteps}\n`);
  file.write(`Test Pass Rate: ${result.summary.testPassedRate} %\n`);
  file.write(`Test Step Pass Rate: ${result.summary.testStepPassedRate} %\n`);
  file.write(`Duration: ${result.info.duration}`);
  file.end();
}

/**
 * Builds a summary report in HTML format
 * @param {object} result contains details of all the suites run and summary detail
 * @param {object} config reporter options for suiteReport
*/
async function summaryReportHtml (result, config) {
  try {
    // build up sections to go in report.html template
    const data = {
      info: await buildHtmlSection('info.html', result.info),
      summary: await buildHtmlSection('summary.html', result.summary),
      tests: await buildHtmlSection('testCases.html', result.tests)
    };

    // build report template
    const html = await buildHtmlSection('report.html', data, true);

    // save report to config.reporterOptions.output
    const endPath = config.reporterOptions.output || 'test_report';
    const folder = path.resolve(process.env.INIT_CWD, endPath);

    // save report to folder
    utils.saveReport(folder, 'summary-report.html', html);
  }
  catch (e) {
    console.log('error in summary report');
    console.error(e);
  }
}


/**
 *  build html from a template and insert data to that template
 * @param {string} templateName file name of the template
 * @param {object} data data to be used by the template
 * @return {string} built html
*/
async function buildHtmlSection (templateName, data) {
  let html;
  if (data) {
    const template = path.resolve(__dirname, '..', 'templates', templateName);

    const source = await fs.readFileSync(template).toString();
    try {
      const compiledTemplate = handlebars.compile(source);
      html = compiledTemplate(data);
      return html;
    }
    catch (e) {
      console.log('error in building template');
      console.error(e);
    }
  }
}


module.exports = {
  summaryReportHtml,
  summaryReportConsole,
  summaryReportEmail
};