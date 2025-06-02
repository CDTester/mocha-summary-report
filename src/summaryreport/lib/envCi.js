/**
 * envCi - get CI details from process.env
 * @returns {object} Object contains CI details
 */
function envCi () {
  const env = process.env;
  let ciVariables = {};

  // detect CI/CD 
  const ciName = detectCi(env);

  // get CI/CD variables
  if (ciName === 'Jenkins') ciVariables = jenkins(env);
  else if (ciName === 'CircleCI') ciVariables = circleCi(env);
  else if (ciName === 'Bitbucket') ciVariables = bitbucket(env);
  else if (ciName === 'Travis CI') ciVariables = travis(env);
  else if (ciName === 'TeamCity') ciVariables = teamCity(env);
  else if (ciName === 'GitHub Actions') ciVariables = githubActions(env);
  else if (ciName === 'GitLab CI') ciVariables = gitlab(env);
  else if (ciName === 'Azure DevOps') ciVariables = azureDevOps(env);
  else ciVariables = local(env);

  return ciVariables;
}

function detectCi (_env) {
  let ci = '';

  const envKeys = Object.keys(_env);

  if (envKeys.includes("JENKINS_URL")) ci = 'Jenkins';
  else if (envKeys.includes("CIRCLECI")) ci = 'CircleCI';
  else if (envKeys.includes("BITBUCKET_BUILD_NUMBER")) ci = 'Bitbucket';
  else if (envKeys.includes("TRAVIS")) ci = 'Travis CI';
  else if (envKeys.includes("TEAMCITY_VERSION")) ci = 'TeamCity';
  else if (envKeys.includes("GITHUB_ACTIONS")) ci = 'GitHub Actions';
  else if (envKeys.includes("GITLAB_CI")) ci = 'GitLab CI';
  else if (envKeys.includes("BUILD_BUILDURI")) ci = 'Azure DevOps';
  else ci = 'Local';

  return ci;
}

function jenkins (_env) {
  const jenkinsVariables = {};

  jenkinsVariables.isCi = true;
  jenkinsVariables.buildUrl = _env.BUILD_URL;
  jenkinsVariables.buildNumber = _env.BUILD_NUMBER;
  jenkinsVariables.jobName = _env.JOB_NAME;
  jenkinsVariables.name = "Jenkins";

  return jenkinsVariables;
}

function circleCi (_env) {
  const circleCiVariables = {};

  circleCiVariables.isCi = true;
  circleCiVariables.buildUrl = _env.CIRCLE_BUILD_URL;
  circleCiVariables.buildNumber = _env.CIRCLE_BUILD_NUM;
  circleCiVariables.jobName = `${_env.CIRCLE_BUILD_NUM}.${_env.CIRCLE_NODE_INDEX}`;
  circleCiVariables.name = "CircleCI";

  return circleCiVariables;
}

function bitbucket (_env) {
  const bitbucketVariables = {};

  bitbucketVariables.isCi = true;
  bitbucketVariables.buildUrl = _env.BITBUCKET_REPO_SLUG;
  bitbucketVariables.buildNumber = _env.BITBUCKET_BUILD_NUMBER;
  bitbucketVariables.jobName = _env.BITBUCKET_JOB_NAME;
  bitbucketVariables.name = "Bitbucket";

  return bitbucketVariables;
}

function travis (_env) {
  const travisVariables = {};

  travisVariables.isCi = true;
  travisVariables.buildUrl = _env.TRAVIS_BUILD_WEB_URL;
  travisVariables.buildNumber = _env.TRAVIS_BUILD_NUMBER;
  travisVariables.jobName = _env.TRAVIS_JOB_NUMBER;
  travisVariables.name = "Travis CI";

  return travisVariables;
}

function teamCity (_env) {
  const teamCityVariables = {};

  teamCityVariables.isCi = true;
  teamCityVariables.buildUrl = _env.BUILD_URL;
  teamCityVariables.buildNumber = _env.BUILD_NUMBER;
  teamCityVariables.jobName = "--";
  teamCityVariables.name = "TeamCity";

  return teamCityVariables;
}

function githubActions (_env) {
  const githubActionsVariables = {};

  githubActionsVariables.isCi = true;
  githubActionsVariables.buildUrl = _env.GITHUB_REPOSITORY;
  githubActionsVariables.buildNumber = _env.GITHUB_RUN_ID;
  githubActionsVariables.jobName = "--";
  githubActionsVariables.name = "GitHub Actions";

  return githubActionsVariables;
}

function gitlab (_env) {
  const gitlabVariables = {};

  gitlabVariables.isCi = true;
  gitlabVariables.buildUrl = `${_env.CI_PROJECT_URL}/pipelines/${_env.CI_PIPELINE_ID}`;
  gitlabVariables.buildNumber = _env.CI_PIPELINE_ID;
  gitlabVariables.jobName = _env.CI_JOB_ID;
  gitlabVariables.name = "GitLab CI/CD";

  return gitlabVariables;
}

function azureDevOps (_env) {
  const azureDevOpsVariables = {};

  azureDevOpsVariables.isCi = true;
  azureDevOpsVariables.buildUrl = _env.BUILD_BUILDURI;
  azureDevOpsVariables.buildNumber = _env.BUILD_BUILDNUMBER;
  azureDevOpsVariables.jobName = "--";
  azureDevOpsVariables.name = "Azure DevOps";

  return azureDevOpsVariables;
}

function local (_env) {
  const localVariables = {};

  localVariables.isCi = false;
  localVariables.buildUrl = "--";
  localVariables.buildNumber = "--";
  localVariables.jobName = "--";
  localVariables.name = "Local";

  return localVariables;
}

module.exports = {
  envCi
};