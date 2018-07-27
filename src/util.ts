export function randomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let noceStr = '';
  let maxPos = chars.length;
  while (length--) {
    // tslint:disable-next-line:no-bitwise
    noceStr += chars[Math.random() * maxPos | 0];
  }
  return noceStr;
}

export function isString(obj) {
  return typeof obj === 'string' || obj instanceof String;
}

export function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
}
