// tslint:disable:max-line-length

import { REPORTER_FILE_NAME, reporterPath } from '../constants';
const formatResultsErrors = require('./message');
const stripAnsi = require('strip-ansi');
import * as fs from 'fs';
import * as path from 'path';

const reporterTestResult: string[] = [];

const getRelativePath = (rootPath, pt) => {
  return path.relative(rootPath, pt).replace(/\\/g, '/');
};

const formatStackPath = (stack) => {
  const lines = stack.split(/\n/).map(line => {
    const match = line.match(/(^\>\s*at .*?\(?)([^()]+)(:[0-9]+:[0-9]+\)?.*$)/);
    if (!match) {
      return line;
    }
    const relativePath = getRelativePath(reporterPath, match[2]);
    const lineNumber = match[3].split(':')[1];
    const lineColumn = match[3].slice(0, match[3].trim().length - 1);
    return `${match[1]}[${relativePath}${lineColumn}](${relativePath}#L${lineNumber}))`;
  });
  return lines.join('  \n');
};

const fileNameRegex = /reporter(\d*)\.md/;
const getReporterFileName = () => {
  let files = fs.readdirSync(reporterPath);
  let fileIndex = -1;
  files.forEach((val, _index) => {
    let fPath = path.join(reporterPath, val);
    let stats = fs.statSync(fPath);
    if (stats.isFile()) {
      const regexResult = val.match(fileNameRegex);
      if (regexResult == null) {
        return;
      }
      const ind = regexResult[1];
      if (ind === '') {
        fileIndex = Math.max(fileIndex, 0);
      } else {
        fileIndex = Math.max(fileIndex, parseInt(ind, 10) + 1);
      }
    }
  });
  if (fileIndex === -1) {
    return REPORTER_FILE_NAME + '.md';
  }
  return `${REPORTER_FILE_NAME}${fileIndex}.md`;
};

class Reporter {
  _globalConfig: any;
  _options: any;

  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(_contexts, results) {
    let content = `
Test Suites: <font color=red>${results.numFailedTestSuites} failed</font>, <font color='#96E22E'>${results.numPassedTestSuites} passed</font>, <font color='#B2D62E'>${results.numPendingTestSuites} skipped</font>, ${results.numTotalTestSuites} total

Tests:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color=red>${results.numFailedTests} failed</font>, <font color='#96E22E'>${results.numPassedTests} passed</font>, <font color='#B2D62E'>${results.numPendingTests} skipped</font>, ${results.numTotalTests} total

Time:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${((new Date().getTime() - results.startTime) / 1000).toFixed(3)}s
`;
    let failContent = '';
    reporterTestResult.map(suit => {
      failContent += suit;
    });
    if (failContent !== '') {
      content += `

## <font color=red size="4">FAIL</font>
${failContent}
`;
    }

    let testContent = '';
    results.testResults.map(suit => {
      const suithead = suit.failureMessage != null ?
        `<font color='#EB2731' size="2">FAIL</font>` : `<font color='#96E22E' size="2">PASS</font>`;
      let summary = `${suithead} ${getRelativePath(process.cwd(), suit.testFilePath)} (${(suit.perfStats.end - suit.perfStats.start) / 1000}s)`;
      let detail = '';
      suit.testResults.map(test => {
        let testhead = '';
        if (test.status === 'failed') {
          testhead = `<font color='#EB2731' size="3">×</font>`;
        } else if (test.status === 'pending') {
          testhead = `<font color='#B2D62E' size="1">○</font>`;
        } else {
          testhead = `<font color='#96E22E' size="3">√</font>`;
        }
        detail += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${testhead}&nbsp;&nbsp;${test.title} (${test.duration / 1000}s)</br>`;
      });
      testContent += `<details>
<summary>${summary}</summary>
${detail}
</details>`;
    });
    if (testContent !== '') {
      content += `

## <font color='#96E22E' size="4">SUMMARY</font>
${testContent}
`;
    }
    fs.writeFileSync(path.join(reporterPath, getReporterFileName()), content);
  }

  onTestResult(_test, testResult, _aggregatedResult) {
    testResult.testResults.map((result) => {
      if (result.status === 'failed') {
        const title = result.ancestorTitles.join(' > ');
        let testReporterMd = `
<details>
<summary><font color=red size="3">× ${title} › ${result.title}</font></summary>

`;
        let image = '';
        result.failureMessages.map(failureMsg => {
          const {
            message,
            callSite,
            stack,
            screenshot,
          } = formatResultsErrors(failureMsg);
          const formatedStack = formatStackPath(stack);
          if (screenshot !== '') {
            image = `![image](./images/${screenshot})`;
          }
          testReporterMd = `${testReporterMd}
\`\`\`js
${stripAnsi(message)}${callSite != null ? '\n' + stripAnsi(callSite) : ''}\`\`\`
${formatedStack}
`;
        });
        reporterTestResult.push(`${testReporterMd}\n${image}\n</details>\n`);
      }
    });
  }
}

module.exports = Reporter;
