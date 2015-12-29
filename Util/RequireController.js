/*jslint node: true*/
'use strict';

/**
 * Created by Tab/jy on 2015-11-29
 * This is not a replacement of Nodejs's original require module.
 * Do not abuse this encapsulation.
 */

const Module = require('module');
const Path = require('path');
const RootPath = Path.dirname(require.main.filename);
const Config = requireModule('Model/Config');

/**
 * Require a module.
 * @param request {string} - module name/path
 * @param override {bool} - override cached module
 * @returns {object} - the target module
 */
module.exports = function(fileName) {
  /**
  var controllerPath;
  if (isSystemController) {
    controllerPath = Path.join(__dirname, '../Server/Controller');
  } else {
    controllerPath = Path.join(RootPath, '/Server/Controller');
  }

  var flag = path.resolve(request) === path.normalize(request);

  var fileName = Path.join(tabjsPath, request);
  //calculate absolute path
  fileName = Module._resolveFilename(fileName, this);
  */

  var cachedModule = Module._cache[fileName];

  //if module is cached and debug is disabled
  if (cachedModule && !Config.general.debug) {
    return cachedModule.exports;
  }

  //else create a new instance
  var module = new Module(fileName, this);
  if (!Config.general.debug) {
    Module._cache[fileName] = module;
  }

  //load target module
  try {
    module.load(fileName);
  } catch (err) {
    delete Module._cache[fileName];
    throw err;
  }

  //export module
  return module.exports;

};
