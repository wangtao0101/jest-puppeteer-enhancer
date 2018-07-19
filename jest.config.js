module.exports = {
  "globalSetup": "<rootDir>/lib/setup",
  "globalTeardown": "jest-environment-puppeteer/teardown",
  "testEnvironment": "jest-environment-puppeteer",
  "setupTestFrameworkScriptFile": "./lib/expect",
  reporters: ['default', '<rootDir>/lib/reporter/reporter.js'],
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(ts?)$",
  "moduleNameMapper": {
    "jest-puppeteer-enhancer": "<rootDir>/lib/index.js"
  },
  "moduleFileExtensions": [
    "ts",
    "js"
  ],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  }
}
