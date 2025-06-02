# mocha-summary-report
Generates summary reports of all the suites executed in a single Mocha execution.

## Console Summary Feature
Provides a summary for each suite and a total summary of all the suites in the terminal console.

<img align="center" src="./docs/console_summary.png" alt="summary report in console" width="80%" />

This report can be turned off via the report options.

## Text File Summary Feature
Provides a summary of all the suites in a text file. This text file can be added to an email.

<img align="center" src="./docs/text_file_summary.png" alt="summary report in text file" width="50%" />

This report can be turned off via the report options.

## HTML Summary Feature
Provides a summary of when and where the suites were executed, a summary of all the suites and a summary of each test (including the test steps) in a HTML file.

The HTML report has a responsive web design to match most screen sizes.
### Large Screens
<img align="center" src="./docs/html_summary_large_ci_local.png" alt="large html report" width="80%" />


### Small Screens
<img align="right" src="./docs/html_summary_small.png" alt="small html report" width="60%" />

This report can be turned off via the report options.


### Test Suite Details Section
This Section provides information about the overall details about when and where the tests were executed. 
<img align="center" src="./docs/html_summary_large_ci_jenkins.png" alt="large html report" width="80%" />

#### Suite Details
This sub section provides information about the:
- version of the project release that is being tested. This information comes from process.env variable, this can be set in the CI server parameters or added to npm_config_ varaibles either in your npmrc file or as a custom option on the execution line. The location can be configured in the report options.
- test cycle that this test executed as part of. Similar to Version, this is configurable. 
- test environment that this test executed as part of. Similar to Version, this is configurable. 
- tags found in all the tests that were executed. Duplicate tags are removed. The tag should be placed in your test file on the Mocha Describe feature. Tags can be useful to denote what type of test (e.g. smoke, regression etc) and/or the feature of the project. The tag prefix can be configured in the reporter options. 

#### Run Time Details
This sub section provides information about the:
- Run Date of the test execution.
- Start Time of the the first test execution.
- End Time of the last test execution.
- Duration of the total test executions.

#### CI Server Details
This section can show some limited information about the CI/CD server the test was executed on. A custom set of functions have been created based on env-ci package, this is due to  that package uses import to load modules and I could not get it to work with the mocha-multi-reporters which usess require to load mdules. This version of the package works with the following CI servers:
- Azure Devops
- Bitbucket
- CircleCI
- GitHub Actions
- GitLab CI
- Jenkins
- TeamCity
- Travis

If the tests are run on a local machine, then the sub section heading will indicate this.

### Summary Section
#### Test Suite Summary
This section provides an overall status of how many tests:
- were executed
- passed
- skipped
- failed
Then provides a Passed test execution rate. 

#### Test Step Summary
This section provides an overall status of how many test steps:
- were executed
- passed
- skipped
- failed
Then provides a Passed test step execution rate. 

### Suites Section
#### Links to other reports
This is how the Suites section appears when no other reports are used during the Mocha test execution.
<img align="center" src="./docs/html_summary_without_other_reports.png" alt="large html report" width="80%" />

This is how the Suites section appears when other reports are used during the Mocha test execution. A button is made available that opens the other report in a new browser tab.
<img align="center" src="./docs/html_summary_with_other_reports.png" alt="large html report" width="80%" />


#### Test Suite run information
<img align="center" src="./docs/html_summary_without_other_reports.png" alt="large html report" width="80%" />

This section Provides detais of each test suite, including:
- The Test ID. This should be a unique code that can identify your test on your test management tool. In this example, Zephyr tests are located on Jira and will have a Jira issue key. The test ID should be placed on the Mocha Describe feature where tags are detailed. The Test ID prefix can be configured in the reporter options.
- Tags associated to the test. The tag should be placed in your test file on the Mocha Describe feature. Tags can be useful to denote what type of test (e.g. smoke, regression etc) and/or the feature of the project. The tag prefix can be configured in the reporter options. 
- Test Scenario title.
- How many steps in the tests Passed, skipped or failed.
- The duration of the test suite in seconds. 


#### Test Step information
<img align="center" src="./docs/html_test_steps.png" alt="large html report" width="80%" />

Each test suite can be expanded to reveal more details about the test steps status by clicking on the + icon in the Expand column. This new section shows the test step:
- Number.
- Title/description. 
- Errors message that was produced if the test step failed.
- Status.
- Duration in seconds.


## Reporter Options
The summary reports can be configured in the reporter options:

| Option Name       | Type    | Default        | Description                                                                                               |
| :---------------- | :------ | :------------- | :-------------------------------------------------------------------------------------------------------- |
| `consoleSummary`  | boolean | true           | option to turn off the summary in the console log by setting to false.                                    |
| `textFileSummary` | boolean | true           | option to turn off the summary in a text file by setting to false.                                        |
| `htmlSummary`     | boolean | true           | option to turn off the summary in a text file by setting to false.                                        |
| `projectName`     | string  | `--`           | process.env variable name that denotes the name of the project.                                           |
| `projectVersion`  | string  | `--`           | process.env variable name that denotes the version of the project being tested.                           |
| `projectCycle`    | string  | `--`           | process.env variable name that denotes the test cycle name of the test execution.                         |
| `environmentVar`  | string  | `--`           | process.env variable name that denotes the test environment.                                              |
| `tagPrefix`       | string  | `@`            | Prefix to be used to capture tags used in the tests.                                                      |
| `testIDPrefix`    | string  | `$`            | Prefix to be used to capture the test ID used in the tests.                                               |
| `passRateGreen`   | string  | `90`           | Value used to determine the background colour of the overall success rate of which is deemed acceptable.  |
| `passRateAmber`   | string  | `50`           | Value used to determine the background colour of the overall success rate of which is deemed a warning.   |
| `output`          | string  | `test_report`  | Folder location to be used to save summary report to.                                                     |
| `otherReportLink` | string  | undefined      | File location of any other reports created at the end of the test execution.                              |


