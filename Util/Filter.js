/*jslint node: true*/
'use strict';

class Filter {
  static escapeHTML(string) {
    string = String(string);
    return string
      //.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/\'/g, '&#39;');
  }
}

module.exports = Filter;
