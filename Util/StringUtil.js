/*jslint node: true*/
'use strict';

class StringUtil {
  static capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  static isString(input) {
    return typeof "string" === typeof input;
  }
}
