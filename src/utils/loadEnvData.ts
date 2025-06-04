import fs from 'fs';
import path from 'path';

/**
 * class to get test env data
 * This class loads environment specific data from config files
*/
export default class envData {
  private _envData: object;
  private _test: string;

  constructor (test) {
    this._test = test;
    this._envData = this.loadEnvironmentData(process.env.npm_config_testenv);

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  get getEnvData () {
    return JSON.parse(JSON.stringify(this._envData));
  }

  private loadEnvironmentData (envName: string | undefined) {
    let envData;

    const pth = path.resolve(process.cwd(), 'config', 'environments', `${envName}.json`);
    console.log(`\x1b[92m Using environment config from ${pth} for test ${this._test}  \x1b[0m`);

    if (fs.existsSync(pth)) {
      try {
        envData = JSON.parse(fs.readFileSync(pth).toString());
      }
      catch (error) {
        if (error instanceof Error) {
          throw new Error(`<FATAL> Cannot load/parse the environment data: ${error.message}`);
        }
      }
    }
    else {
      throw new Error(`<FATAL> Cannot find the environment file: ${pth}`);
    }
    return envData;
  }
}