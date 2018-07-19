const StackUtils = require('stack-utils');
const path = require('path');
const fs = require('fs');
const { codeFrameColumns } = require('@babel/code-frame');

// stack utils tries to create pretty stack by making paths relative.
const stackUtils = new StackUtils({
  cwd: 'something which does not exist',
});

let nodeInternals = [];
const MAGIC_SNAPSHOT = '@@snapshot@@';

try {
  nodeInternals = StackUtils.nodeInternals()
    // this is to have the tests be the same in node 4 and node 6.
    // TODO: Remove when we drop support for node 4
    .concat(new RegExp('internal/process/next_tick.js'));
} catch (e) {
  // `StackUtils.nodeInternals()` fails in browsers. We don't need to remove
  // node internals in the browser though, so no issue.
}

// filter for noisy stack trace lines
const PATH_NODE_MODULES = `${path.sep}node_modules${path.sep}`;
const PATH_JEST_PACKAGES = `${path.sep}jest${path.sep}packages${path.sep}`;
const JASMINE_IGNORE = /^\s+at(?:(?:.jasmine\-)|\s+jasmine\.buildExpectationResult)/;
const JEST_INTERNALS_IGNORE = /^\s+at.*?jest(-.*?)?(\/|\\)(build|node_modules|packages)(\/|\\)/;
const ANONYMOUS_FN_IGNORE = /^\s+at <anonymous>.*$/;
const ANONYMOUS_PROMISE_IGNORE = /^\s+at (new )?Promise \(<anonymous>\).*$/;
const ANONYMOUS_GENERATOR_IGNORE = /^\s+at Generator.next \(<anonymous>\).*$/;
const NATIVE_NEXT_IGNORE = /^\s+at next \(native\).*$/;
const TITLE_INDENT = '  ';
const MESSAGE_INDENT = '    ';
const STACK_INDENT = '      ';
const STACK_PATH_REGEXP = /\s*at.*\(?(\:\d*\:\d*|native)\)?/;
const EXEC_ERROR_MESSAGE = 'Test suite failed to run';
const ERROR_TEXT = 'Error: ';

const removeInternalStackEntries = (
  lines,
  options,
) => {
  let pathCounter = 0;

  return lines.filter(line => {
    if (ANONYMOUS_FN_IGNORE.test(line)) {
      return false;
    }

    if (ANONYMOUS_PROMISE_IGNORE.test(line)) {
      return false;
    }

    if (ANONYMOUS_GENERATOR_IGNORE.test(line)) {
      return false;
    }

    if (NATIVE_NEXT_IGNORE.test(line)) {
      return false;
    }

    // @ts-ignore
    if (nodeInternals.some(internal => internal.test(line))) {
      return false;
    }

    if (!STACK_PATH_REGEXP.test(line)) {
      return true;
    }

    if (JASMINE_IGNORE.test(line)) {
      return false;
    }

    if (++pathCounter === 1) {
      return true; // always keep the first line even if it's from Jest
    }

    if (options.noStackTrace) {
      return false;
    }

    if (JEST_INTERNALS_IGNORE.test(line)) {
      return false;
    }

    return true;
  });
};

const indentAllLines = (lines, indent) =>
  lines
    .split('\n')
    .map(line => (line ? indent + line : line))
    .join('\n');

const getRenderedCallsite = (
  fileContent,
  line,
  column,
) => {
  let renderedCallsite = codeFrameColumns(
    fileContent,
    { start: { column, line } },
    { highlightCode: true },
  );

  renderedCallsite = indentAllLines(renderedCallsite, MESSAGE_INDENT);

  renderedCallsite = `\n${renderedCallsite}\n`;
  return renderedCallsite;
};

const getTopFrame = (lines) => {
  for (const line of lines) {
    if (line.includes(PATH_NODE_MODULES) || line.includes(PATH_JEST_PACKAGES)) {
      continue;
    }

    const parsedFrame = stackUtils.parseLine(line.trim());

    if (parsedFrame && parsedFrame.file) {
      return parsedFrame;
    }
  }

  return null;
};

const separateMessageFromStack = (content) => {
  if (!content) {
    return { message: '', stack: '' };
  }

  const messageMatch = content.match(/(^(.|\n)*?(?=\n\s*at\s.*\:\d*\:\d*))/);
  let message = messageMatch ? messageMatch[0] : 'Error';
  const stack = messageMatch ? content.slice(message.length) : content;
  // If the error is a plain error instead of a SyntaxError or TypeError
  // we remove it from the message because it is generally not useful.
  if (message.startsWith(ERROR_TEXT)) {
    message = message.substr(ERROR_TEXT.length);
  }
  return { message, stack };
};

const formateCallSite = (lines) => {
  const topFrame = getTopFrame(lines);
  if (!topFrame) {
    return;
  }
  const filename = topFrame.file;
  let renderedCallsite = '';

  if (path.isAbsolute(filename)) {
    let fileContent;
    try {
      // TODO: check & read HasteFS instead of reading the filesystem:
      // see: https://github.com/facebook/jest/pull/5405#discussion_r164281696
      fileContent = fs.readFileSync(filename, 'utf8');
      renderedCallsite = getRenderedCallsite(
        fileContent,
        topFrame.line,
        topFrame.column,
      );
    } catch (e) {
      // the file does not exist or is inaccessible, we ignore
    }
  }
  return renderedCallsite;
};

module.exports = (
  content,
  options = { noStackTrace: false },
) => {

  const contentLines = content.split('\n');
  let screenshot = '';
  if (contentLines.length !== 0) {
    const lastLine = contentLines[contentLines.length - 1];
    if (lastLine.includes(MAGIC_SNAPSHOT)) {
      screenshot = lastLine.split('=')[1];
      contentLines.pop();
    }
  }

  let { message, stack } = separateMessageFromStack(contentLines.join('\n'));
  let stackLines = removeInternalStackEntries(stack.split(/\n/), options);
  stackLines = stackLines.map(line => {
    if (line.trim() === '') {
      return '';
    }
    return `>${line.trim().replace(/\</, '\\<').replace(/\>/, '\\>')}`;
  });

  const callSite = formateCallSite(stackLines);
  return {
    message,
    callSite,
    stack: stackLines.join('  \n'),
    screenshot,
  };
};
