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
module.exports = function(request,override) {
  var modelPath = Path.join(RootPath,'/Server/Model');

  var fileName = Path.join(modelPath,request);
  //calculate absolute path
  fileName = Module._resolveFilename(fileName, this);

  var cachedModule = Module._cache[fileName];

  //if module is cached and override is disabled
  if (cachedModule && !override) {
    return cachedModule.exports;
  }

  //else create a new instance
  var module = new Module(fileName, this);
  Module._cache[fileName] = module;

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
