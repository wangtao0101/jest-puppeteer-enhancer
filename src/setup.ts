import * as setup from 'jest-environment-puppeteer/setup';
import * as fs from 'fs';
import { reporterPath, imagePath } from './constants';

module.exports =  async function () {
  await setup();
  if (!fs.existsSync(reporterPath)) {
    fs.mkdirSync(reporterPath);
  }
  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath);
  }
};
