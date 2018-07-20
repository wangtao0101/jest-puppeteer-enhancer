const jest = require('jest');

process.env.JEST_PUPPETEER_CONFIG = 'scripts/jest-puppeteer.config.js';

const argv = process.argv.slice(2);

jest.run(argv);
