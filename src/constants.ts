import * as path from 'path';

export const MAGIC_SNAPSHOT = '@@snapshot@@';
export const REPORTER_FILE_NAME = 'reporter';
export const reporterPath = `${process.cwd()}/.reporter`;
export const imagePath = path.join(reporterPath, 'images');
export const STUB_MESSAGE = '@STUB_MESSAGE@';
export const STUB_TIME = '@STUB_TIME@';
