/*jslint node: true*/
'use strict';

const Fs = require('fs');
const Path = require('path');

class FileSystemUtil {
  static type(path) {
    return new Promise(function(resolve, reject) {
      try {
        let stat = Fs.statSync(path);
        if (stat.isFile()) {
          resolve('file');
        } else if (stat.isDirectory()) {
          resolve('directory');
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  static typeSync(path) {
    var stat;
    try {
      stat = Fs.statSync(path);
    } catch (error) {

    }
    if (stat) {
      if (stat.isFile()) {
        return 'file';
      } else if (stat.isDirectory()) {
        return 'directory';
      }
    } else {
      return 'DNE'; //does not exist
    }
  }

  static list(path) {
    return new Promise(function(resolve, reject) {
      try {
        let files = Fs.readdirSync(path);
        let fileList = [];
        for (let i = 0; i < files.length; i++) {
          let filePath = Path.join(path, files[i]);
          let stat = Fs.statSync(filePath);
          let pathObject = Path.parse(filePath);
          let result = {
            name: pathObject.name,
            ext: pathObject.ext.slice(1),
            base: pathObject.base,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            birthtime: stat.birthtime
          };
          if (stat.isFile()) {
            result.type = 'file';
          } else if (stat.isDirectory()) {
            result.base += '/';
            result.type = 'directory';
            result.size = '-';
          }
          fileList.push(result);
        }
        resolve(fileList);
      } catch (error) {
        reject(error);
      }
    });
  }

  static formatBytes(bytes, decimals) {
    if (bytes === 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
  }

}

module.exports = FileSystemUtil;
