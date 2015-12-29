/*jslint node: true*/
'use strict';

var argv = require('minimist')(process.argv.slice(2));

console.log('Initializing System Components...\n');

console.log('Initializing RequireModule Utility...');
global.requireModule = require('./Util/RequireModule.js');
console.log('RequireModule utility initialized.\n');

if(argv.tabjs == 'install'){
  console.log('Establishing project structure...');
  requireModule('Lib/Install');
  console.log('Project structure established.\n');
  console.log('Please check and modify *.json config files under ./Config\n');
  process.exit(0);
}

console.log('Initializing RequireModel Utility...');
global.requireModel = require('./Util/RequireModel.js');
console.log('RequireModel utility initialized.\n');

console.log('Initializing Log module...');
const Log = requireModule('Lib/Log');
console.log('Log module initialized.\n');

console.log('Initializing Config module...');
const Config = requireModule('Model/Config');
console.log('Config module initialized.\n');

console.log('Initializing Server library...');
const Server = requireModule('Lib/Server');
console.log('Server library initialized.\n');

console.log('Initializing Database Model...');
const Database = requireModule('Model/Database');
console.log('Database Model initialized.\n');

console.log('Loading User Scripts...');
requireModule('Lib/UserScript');
console.log('User Scripts loaded.');

Database.initializeDb().then(function() {
  Server.start();
}).catch(function(error) {
  Log.error(error.stack, 'System');
});
