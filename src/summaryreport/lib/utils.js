const fs = require('fs');
const path = require('path');

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
    console.log(`[\x1b[90msummaryReport\x1b[0m]: HTML report saved to folder ${filePath}\x1b[0m`);
  }
  catch {
    console.error(`[\x1b[90msummaryReport\x1b[0m]: \x1b[31m ERROR:\x1b[33m Failed to save HTML report to folder ${filePath}\x1b[0m`);
  }
}

module.exports = {
  saveReport
};