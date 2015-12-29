/*jslint node: true*/
'use strict';

const Fs = require('fs');
const Path = require('path');
const DateUtil = requireModule('Util/DateUtil');
const RootPath = Path.dirname(require.main.filename);
require('colors');

class Debug {
  static _write(msg, type, isSync, sender) {
    sender = sender || 'Server';
    let logName = sender + "_" + DateUtil.format() + ".log";
    let logPath = RootPath + '/Log/' + logName;
    let fileMsg = '[' + DateUtil.format(null, 'hh:mm:ss') + '][' + type + '] \t' + msg + '\n';
    switch (type) {
      case 'Error':

        console.error('[' + DateUtil.format(null, 'hh:mm:ss') + '][' + sender + '][' + type + '] \t' + msg.red);
        break;
      case 'Warning':
        console.warn('[' + DateUtil.format(null, 'hh:mm:ss') + '][' + sender + '][' + type + '] \t' + msg.yellow);
        break;
      case 'Success':
        console.log('[' + DateUtil.format(null, 'hh:mm:ss') + '][' + sender + '][' + type + '] \t' + msg.green);
        break;
      default:
        console.log('[' + DateUtil.format(null, 'hh:mm:ss') + '][' + sender + '][' + type + '] \t' + msg );
    }
    if (isSync) {
      try {
        Fs.appendFileSync(logPath, fileMsg);
      } catch (err) {
        console.error('An error occurs while writing log file!');
        console.error(err, err.stack.split("\n"));
      }
    } else {
      Fs.appendFile(logPath, fileMsg, function(err) {
        if (err) {
          console.error('An error occurs while writing log file!');
          console.error(err, err.stack.split("\n"));
        }
      });
    }
  }

  static log(msg, sender) {
    this._write(msg, 'Log', false, sender);
  }

  static warn(msg, sender) {
    this._write(msg, 'Warning', false, sender);
  }

  static error(msg, sender) {
    this._write(msg, 'Error', false, sender);
  }

  static success(msg, sender) {
    this._write(msg, 'Success', false, sender);
  }

  static logSync(msg, sender) {
    this._write(msg, 'Log', true, sender);
  }

  static warnSync(msg, sender) {
    this._write(msg, 'Warning', true, sender);
  }

  static errorSync(msg, sender) {
    this._write(msg, 'Error', true, sender);
  }

  static successSync(msg, sender) {
    this._write(msg, 'Success', false, sender);
  }
}

module.exports = Debug;
