/**
 * envCi - get CI details from process.env
 * @returns {object} Object contains CI details
 */
function envCiImage (ciName) {
  let ciVariables = {};
  if (ciName === undefined) ciName = 'Local';

  // get CI/CD variables
  if (ciName === 'Appveyor') ciVariables.icon = 'https://avatars.githubusercontent.com/u/1117363?s=200&v=4';
  else if (ciName === 'Azure Pipelines') ciVariables.icon = 'https://avatars.githubusercontent.com/ml/1303?s=400&v=4';
  else if (ciName === 'Azure DevOps') ciVariables.icon = 'https://static-00.iconduck.com/assets.00/azuredevops-icon-512x511-xk93ro2p.png';
  else if (ciName === 'Bamboo') ciVariables.icon = 'https://icon.icepanel.io/Technology/svg/Bamboo.svg';
  else if (ciName === 'Bitbucket') ciVariables.icon = 'https://static-00.iconduck.com/assets.00/bitbucket-icon-512x460-aj2zdfts.png'; 
  else if (ciName === 'Bitrise') ciVariables.icon = 'https://avatars.githubusercontent.com/u/7174390?s=200&v=4';
  else if (ciName === 'Buddy') ciVariables.icon = 'https://avatars.githubusercontent.com/u/15231049?s=200&v=4';
  else if (ciName === 'Buildkite') ciVariables.icon = 'https://avatars.githubusercontent.com/u/5055988?s=200&v=4';
  else if (ciName === 'CircleCI') ciVariables.icon = 'https://avatars.githubusercontent.com/u/1231870?s=200&v=4';
  else if (ciName === 'Cirrus CI') ciVariables.icon = 'https://avatars.githubusercontent.com/u/29414678?s=200&v=4';
  else if (ciName === 'Cloudflare Pages') ciVariables.icon = 'https://images.seeklogo.com/logo-png/42/1/cloudflare-pages-single-logo-png_seeklogo-426078.png';
  else if (ciName === 'AWS CodeBuild') ciVariables.icon = 'https://symbols.getvecta.com/stencil_12/0_aws-codebuild.9678750410.svg';
  else if (ciName === 'Codefresh') ciVariables.icon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Codefresh-lightBG-trans.svg/512px-Codefresh-lightBG-trans.svg.png?20170929165507';
  else if (ciName === 'Codeship') ciVariables.icon = 'https://avatars.githubusercontent.com/u/2988541?s=200&v=4';
  else if (ciName === 'Drone') ciVariables.icon = 'https://avatars.githubusercontent.com/u/2181346?s=200&v=4';
  else if (ciName === 'GitHub Actions') ciVariables.icon = 'https://static-00.iconduck.com/assets.00/github-icon-512x489-i96zunkj.png';
  else if (ciName === 'GitLab CI') ciVariables.icon = 'https://static-00.iconduck.com/assets.00/gitlab-icon-512x471-wfbmkpzi.png';
  else if (ciName === 'Jenkins') ciVariables.icon = 'https://static-00.iconduck.com/assets.00/jenkins-original-icon-371x512-8gujah0v.png';
  else if (ciName === 'JetBrains Space') ciVariables.icon = 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_175365c0d5c218c1d9349528b1acb0f8/jetbrains-space.png';
  else if (ciName === 'Netlify') ciVariables.icon = 'https://cdn.brandfetch.io/idoW6GB9ca/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1746443990071';
  else if (ciName === 'Puppet') ciVariables.icon = 'https://avatars.githubusercontent.com/u/234268?s=200&v=4';
  else if (ciName === 'Sail CI') ciVariables.icon = 'https://avatars.githubusercontent.com/u/38353143?s=200&v=4';
  else if (ciName === 'Screwdriver.cd') ciVariables.icon = 'https://avatars.githubusercontent.com/u/19417863?s=200&v=4';
  else if (ciName === 'Scrutinizer') ciVariables.icon = 'https://avatars.githubusercontent.com/u/2988888?s=200&v=4';
  else if (ciName === 'Semaphore') ciVariables.icon = 'https://avatars.githubusercontent.com/u/47175507?s=200&v=4';
  else if (ciName === 'Shippable') ciVariables.icon = 'https://avatars.githubusercontent.com/u/5647221?s=200&v=4';
  else if (ciName === 'TeamCity') ciVariables.icon = 'https://upload.wikimedia.org/wikipedia/commons/2/29/TeamCity_Icon.svg';
  else if (ciName === 'Travis CI') ciVariables.icon = 'https://avatars.githubusercontent.com/u/639823?s=200&v=4';
  else if (ciName === 'Vela') ciVariables.icon = 'https://avatars.githubusercontent.com/u/55509865?s=200&v=4';
  else if (ciName === 'Vercel') ciVariables.icon = 'https://w7.pngwing.com/pngs/436/888/png-transparent-vercel-hd-logo-thumbnail.png';
  else if (ciName === 'Wercker') ciVariables.icon = 'https://upload.wikimedia.org/wikipedia/en/6/6e/Wercker_logo.png';
  else if (ciName === 'Woodpecker CI') ciVariables.icon = 'https://avatars.githubusercontent.com/u/84780935?s=200&v=4';
  else ciVariables.icon = 'https://static-00.iconduck.com/assets.00/laptop-emoji-512x512-xtenmzmj.png';

  return ciVariables;
}





module.exports = {
  envCiImage
};