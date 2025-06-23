const fs = require('fs');
const path = require('path');


/**
 * folderExists - checks if folder exists, if not then it creates it
 * @param {string} folderName The folder where the report will be saved to
 */
function folderExists (folderName) {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, {recursive:true});
      console.log(`[\x1b[90mmocha-summary-report\x1b[0m]: Folder created: ${folderName}`)
    }
  }
  catch {
    console.error(`[\x1b[90mmocha-summary-report\x1b[0m]: \x1b[31m ERROR:\x1b[33m Failed to create folder ${folderName}\x1b[0m`);
  }
}


/**
 * saveReport - Save report to designated folder
 * @param {string} folderName The folder where the report will be saved to
 * @param {string} fileName The name of the report to be saved
 * @param {string} html the HTML content to be saved
 */
function saveReport (folderName, fileName, html) {
  const filePath = path.resolve(folderName, fileName);

  try {
    fs.writeFileSync(filePath, html);
    console.log(`[\x1b[90mmocha-summary-report\x1b[0m]: HTML report saved to folder ${filePath}\x1b[0m`);
  }
  catch {
    console.error(`[\x1b[90mmocha-summary-report\x1b[0m]: \x1b[31m ERROR:\x1b[33m Failed to save HTML report to folder ${filePath}\x1b[0m`);
  }
}


module.exports = {
  saveReport,
  folderExists
};