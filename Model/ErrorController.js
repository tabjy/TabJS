/*jslint node: true*/
'use strict';

const Controller = requireModule('Model/Controller');
const Path = require('path');
const Url = require('url');
const Http = require('http');
const Config = requireModule('Model/Config');
const DateUtil = requireModule('Util/DateUtil');
const Filter = requireModule('Util/Filter');
const Log = requireModule('Lib/Log');

class ErrorController extends Controller {
  //override
  constructor(error, statusCode, request, response, urlVariable) {
    super(request, response, null, urlVariable);
    this.error = error;
    this.statusCode = statusCode;
  }

  //override
  resolvePath() {
    //TODO resolve template path
    this.jadePath = Path.join(__dirname, '../Server/View/ErrorController.jade');
    this.ejsPath = Path.join(__dirname, '../Server/View/ErrorController.ejs');
  }

  readHTTPActionVariable() {
      return new Promise(function(resolve, reject) {
        resolve();
      });
    }

  //overiide
  handleError(error, statusCode) {
    Log.error(error.stack);
    this.response.statusCode = this.statusCode;
    this.response.statusMessage = Http.STATUS_CODES[this.statusCode];
    this.response.setHeader('Content-Type', 'text/plain');
    this.response.removeHeader('Content-Encoding');
    let content = 'HTTP Error 500 Internal Server Error. \n';
    content += 'Server is confused, often caused by an error in the server-side program responding to the request. \n';
    if (Config.general.debug) {
      content += '\nDebug Mode set be to on, dumping error stacks below: \n\n';
      content += this.error.stack + '\n\n';
      content += '====================================================\n\n';
      content += error.stack;
    }
    this.response.end(content);
  }

  //override
  mainLogic() {
    super.mainLogic();
    this.response.statusCode = this.statusCode;
    this.response.statusMessage = Http.STATUS_CODES[this.statusCode];
    this.response.setHeader('Content-Type', 'text/html');
    this.assign({
      statusCode: this.statusCode,
      message: Http.STATUS_CODES[this.statusCode],
      description: Config.http.errorDescription[this.statusCode] || 'No specific description.',
      url: this.request.url,
      host: Config.server.host,
      method: this.request.method.toUpperCase(),
      ip: this.getClientIp(),
      timestamp: DateUtil.format(null,'yyyy-MM-dd hh:mm:ss'),
      stack: this.error.stack,
      version: Config.general.version,
      build: Config.general.build,
      showStack: Config.general.debug
    });
    this.renderJade();
  }
}


module.exports = ErrorController;
