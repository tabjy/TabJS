/*jslint node: true*/
'use strict';

const Log = requireModule('Lib/Log');
const Path = require('path');
const RootPath = Path.dirname(require.main.filename);
const Fs = require('fs');
const FileSystemUtil = requireModule('Util/FileSystemUtil');

const PathList = {
  'Config': Path.join(RootPath, '/Config/'),
  'Server': Path.join(RootPath, '/Server/'),
  'Server/Controller': Path.join(RootPath, '/Server/Controller/'),
  'Server/Initial': Path.join(RootPath, '/Server/Initial/'),
  'Server/Model': Path.join(RootPath, '/Server/Model/'),
  'Server/Resource': Path.join(RootPath, '/Server/Resource/'),
  'Server/View': Path.join(RootPath, '/Server/View/'),
};

if (FileSystemUtil.typeSync(Path.join(RootPath, '/Log/')) !== 'directory') {
  console.warn(Path.join(RootPath, '/Log/') + ' does not exist!');
  Fs.mkdirSync(Path.join(RootPath, '/Log/'));
  console.log(Path.join(RootPath, '/Log/') + ' created!\n');
} else {
  console.log(Path.join(RootPath, '/Log/') + ' already exists!\n');
}

for (let key in PathList) {
  if (FileSystemUtil.typeSync(PathList[key]) !== 'directory') {
    Log.warn(PathList[key] + ' does not exist!','System');
    Fs.mkdirSync(PathList[key]);
    Log.success(PathList[key] + ' created!\n','System');
  } else {
    Log.log(PathList[key] + ' already exists!\n','System');
  }
}

const ConfigList = ['Dashboard.json', 'Database.json', 'Dying.json', 'General.json', 'Http.json', 'Server.json'];

ConfigList.forEach(function(configFile) {
  if (FileSystemUtil.typeSync(Path.join(RootPath, '/Config/', configFile)) !== 'file') {
    Log.warn(Path.join(RootPath, '/Config/', configFile) + ' does not exist!','System');
    Fs.writeFileSync(Path.join(RootPath, '/Config/', configFile), Fs.readFileSync(Path.join(__dirname, '../Config/', configFile)));
    Log.success(Path.join(RootPath, '/Config/', configFile) + ' created!\n','System');
  } else {
    Log.log(Path.join(RootPath, '/Config/', configFile) + ' already exists!\n','System');
  }
});

Fs.writeFileSync(Path.join(RootPath, '/Server/Controller/index.js'), Fs.readFileSync(Path.join(__dirname, '../Server/Resource/hello_world/index.js')));
Fs.writeFileSync(Path.join(RootPath, '/Server/View/index.jade'), Fs.readFileSync(Path.join(__dirname, '../Server/Resource/hello_world/index.jade')));
