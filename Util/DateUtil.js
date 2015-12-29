/*jslint node: true*/
'use strict';

class DateUtil {
  static format(date, pattern) {
    if (!date) {
      date = new Date();
    } else if (!(date instanceof Date)) {
      date = new Date(date);
    }
    pattern = pattern || 'yyyy-MM-dd';
    let y = date.getFullYear().toString();
    let o = {
      M: date.getMonth() + 1, //month
      d: date.getDate(), //day
      h: date.getHours(), //hour
      m: date.getMinutes(), //minute
      s: date.getSeconds() //second
    };
    pattern = pattern.replace(/(y+)/ig, function(a, b) {
      return y.substr(4 - Math.min(4, b.length));
    });
    for (var i in o) {
      pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
        return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
      });
    }
    return pattern;
  }

  formatDateTime(date) {
    if (!date) {
      date = new Date();
    }
    return this.format(date, "yyyy-MM-dd hh:mm:ss");
  }

  secondToTime(sec_num) {
    var days = Math.floor(sec_num / (3600 * 24));
    var hours = Math.floor((sec_num - (days * 3600 * 24)) / 3600);
    var minutes = Math.floor((sec_num - (days * 3600 * 24) - (hours * 3600)) / 60);
    var seconds = Math.round(sec_num - (days * 3600 * 24) - (hours * 3600) - (minutes * 60));

    if (sec_num < 60) {
      return seconds + 's';
    } else if (sec_num < 60 * 60) {
      return minutes + 'm ' + seconds + 's';
    } else if (sec_num < 60 * 60 * 60) {
      return hours + 'h ' + minutes + 'm ' + seconds + 's';
    } else {
      return days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
    }
  }
}

module.exports = DateUtil;
