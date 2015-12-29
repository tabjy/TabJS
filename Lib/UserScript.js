/*jslint node: true*/
'use strict';

const Log = requireModule('Lib/Log');
const Path = require('path');
const RootPath = Path.dirname(require.main.filename);
const Fs = require('fs');

var path = Path.join(RootPath, '/Server/Initial');
try {
  var files = Fs.readdirSync(path);
  for (var i = 0; i < files.length; i++) {
    if (Path.extname(files[i]) == '.js') {
      console.log('Loading ' + files[i] + '...');
      require(Path.join(RootPath, '/Server/Initial', files[i]));
      console.log(files[i] + ' Loaded.');
    }
  }
} catch (err) {
  Log.warn(err.stack, 'System');
}
