/*jslint node: true*/
'use strict';

const Config = requireModule('Model/Config');
const Path = require('path');
const RootPath = Path.dirname(require.main.filename);
const Url = require('url');
const Zlib = require('zlib');
const Fs = require('fs');
const Formidable = require('formidable');
const Ejs = require('ejs');
const Jade = require('jade');
const ExtendObject = requireModule('Util/ExtendObject');
const Http = require('http');
const requireController = requireModule('Util/RequireController');
const Session = requireModule('Model/Session');
const Log = requireModule('Lib/Log');

class Controller {
  constructor(request, response, controllerPath, urlVariable) {
    this.request = request;
    this.response = response;

    this.controllerPath = controllerPath;
    this.ejsPath = null;
    this.jadePath = null;
    this.templateData = {};

    this.urlVariable = urlVariable || {};
    this.getVariable = {};
    this.postVariable = {};
    this.postFile = {};

    this.requestCookies = {};
    this.responseCookies = [];

    this.sessionId = null;

    var self = this;

    this.request.on('close', function() {
      self.onRequestClose();
    });
    this.response.on('close', function() {
      self.onResponseClose();

    });
    this.response.on('finish', function() {
      self.onResponseFinish();
    });
  }

  runController() {
    var self = this;
    this.resolvePath();
    this.readCookies();
    this.readSession().then(function() {
      return self.readHTTPActionVariable();
    }).then(function() {
      try {
        self.mainLogic();
      } catch (error) {
        self.handleError(error);
      }
    }).catch(function(error) {
      self.handleError(error);
    });

  }

  resolvePath() {
    var controllerDirPath = Path.join(RootPath, '/Server/Controller/');
    var viewDirPath = Path.join(RootPath, '/Server/View/');
    var relativePath = Path.relative(controllerDirPath, this.controllerPath);
    var templatePathObject = Path.parse(Path.join(viewDirPath, relativePath));
    var templatePath = Path.join(templatePathObject.dir, templatePathObject.name);
    this.ejsPath = templatePath + '.ejs';
    this.jadePath = templatePath + '.jade';
  }

  readCookies() {
    var cookieString = this.request.headers.cookie; //cookies string waiting to be processed
    //parse cookies string and save to class variable
    if (cookieString) {
      var pairs = cookieString.split(/[;,] */);
      for (var i = 0; i < pairs.length; i++) {
        var idx = pairs[i].indexOf('=');
        var key = pairs[i].substr(0, idx);
        var val = pairs[i].substr(++idx, pairs[i].length).trim();
        this.requestCookies[key] = val;
      }
    }
  }

  readSession() {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (!Config.http.session.enabled) {
        resolve();
        return;
      }

      var sessionId = self.getCookie(Config.http.session.id);
      if (sessionId) {
        Session.refresh(sessionId).then(function() {
          self.sessionId = sessionId;
          resolve();
        }).catch(function(error) {
          Session.new().then(function(id) {
            self.setCookie(Config.http.session.id, id, {
              isSession: true
            });
            self.sessionId = id;
            resolve();
          });
        });
      } else {
        Session.new().then(function(id) {
          self.setCookie(Config.http.session.id, id, {
            isSession: true
          });
          self.sessionId = id;
          resolve();
        });
      }
    });
  }

  readHTTPActionVariable() {
    this.getVariable = Url.parse(this.request.url, true).query;

    var form = new Formidable.IncomingForm();
    form.uploadDir = Path.join(RootPath, Config.server.uploadDir);
    form.multiples = true;

    var self = this;
    return new Promise(function(resolve, reject) {
      form.parse(self.request, function(err, fields, files) {
        if (err) {
          reject(err);
          return;
        }
        self.postVariable = fields;
        self.postFile = files;
        resolve();
      });
    });

  }


  mainLogic() {
    //this method is meant to be overridden by subclass
  }


  onRequestClose() {
    //this method is meant to be overridden by subclass
  }

  onResponseClose() {
    //this method is meant to be overridden by subclass
  }

  onResponseFinish() {
    //this method is meant to be overridden by subclass
  }

  handleError(error, statusCode) {
    Log.error(error.stack);
    statusCode = statusCode || 500;
    statusCode = String(statusCode);
    //var errorControllerPath = Path.join(__dirname, '../Server/Controller/errorController.js');
    //var ErrorController = require(errorControllerPath);
    var ErrorController;
    try {
      if (Config.server.customErrorController.enabled) {
        let errorControllerPath = Path.join(RootPath, '/Server/Controller/', Config.server.customErrorController.controllerPath);
        ErrorController = require(errorControllerPath);
      } else {
        // TODO for debug only. To be removed
        ErrorController = requireModule('Model/ErrorController');
      }
      var errorController = new ErrorController(error, statusCode, this.request, this.response, this.urlVariable);
      errorController.runController();
    } catch (errorControllerError) {
      this.response.statusCode = statusCode;
      this.response.statusMessage = Http.STATUS_CODES[statusCode];
      this.response.setHeader('Content-Type', 'text/plain');
      this.response.removeHeader('Content-Encoding');
      let content = 'HTTP Error 500 Internal Server Error. \n';
      content += 'Server is confused, often caused by an error in the server-side program responding to the request. \n';
      if (Config.general.debug) {
        content += '\nDebug Mode set be to on, dumping error stacks below: \n\n';
        content += error.stack + '\n\n';
        content += '====================================================\n\n';
        content += errorControllerError.stack;
      }
      this.response.end(content);
      //this.response.end(error.stack + '\n\n============!!!===========================\n\n' + errorControllerError.stack);
    }
  }

  end(content) {
    this.response.setHeader('Set-Cookie', this.responseCookies);


    var compressionPriority = Config.server.compression.priority;
    var compressionFileType = Config.server.compression.fileType;
    var acceptEncoding = this.request.headers['accept-encoding'] || '';

    var self = this;
    var compressionFunctionMap = {
      'gzip': function() {
        self.response.setHeader('Content-Encoding', 'gzip');
        return new Promise(function(resolve, reject) {
          Zlib.gzip(content, function(error, result) {
            if (error) {
              reject(error);
              return;
            }
            resolve();
            self.response.end(result);
          });
        });
      },
      'deflate': function() {
        self.response.setHeader('Content-Encoding', 'deflate');
        return new Promise(function(resolve, reject) {
          Zlib.deflate(content, function(error, result) {
            if (error) {
              reject(error);
              return;
            }
            resolve();
            self.response.end(result);
          });
        });
      }
    };

    for (let i = 0; i < compressionPriority.length; i++) {
      if (acceptEncoding.indexOf(compressionPriority[i]) !== -1) {
        let compressionFunction = compressionFunctionMap[compressionPriority[i]];
        if (compressionFunction) {
          return compressionFunction();
        }
      }
    }

    this.response.end(content);
  }

  //overload name to be an object
  assign(name, value) {
    if (name instanceof Object) {
      let object = name;
      for (let key in object) {
        this.templateData[key] = object[key];
      }
      return;
    }
    this.templateData[name] = value;
  }

  renderEjs(path) {
    if (path) {
      var viewDirPath = Path.join(RootPath, '/Server/View/');
      this.ejsPath = Path.join(viewDirPath, path);
    }
    var self = this;
    Fs.readFile(this.ejsPath, 'utf-8', function(error, template) {
      if (error) {
        self.handleError(error, '500');
        return;
      }
      try {
        var content = Ejs.render(template, self.templateData, {
          filename: self.ejsPath,
        });
        self.end(content);
      } catch (error) {
        self.handleError(error, '500');
      }
    });
  }

  renderJade(path) {
    if (path) {
      var viewDirPath = Path.join(RootPath, '/Server/View/');
      this.jadePath = Path.join(viewDirPath, path);
    }

    try {
      var content = Jade.renderFile(this.jadePath, this.templateData);
      this.end(content);
    } catch (error) {
      this.handleError(error, '500');
    }
  }

  getClientIp() {
    var ipAddress;
    var forwardedIpsStr = this.request.headers['x-real-ip'] || this.request.headers['x-forwarded-for'];
    if (forwardedIpsStr) {
      ipAddress = forwardedIpsStr;
    } else {
      ipAddress = this.request.connection.remoteAddress;
    }
    return ipAddress;
  }

  isMethod(methodName) {
    return methodName.toUpperCase() === this.request.method.toUpperCase();
  }

  isGet() {
    return this.isMethod('GET');
  }

  isPost() {
    return this.isMethod('POST');
  }

  isAjax() {
    if (this.request.headers['x-requested-with'] && this.request.header['x-requested-with'].toUpperCase === 'XMLHTTPREQUEST') {
      return true;
    } else {
      return false;
    }
  }

  get(name) {
    if (name) {
      return this.getVariable[name];
    } else {
      return this.getVariable;
    }
  }

  post(name) {
    if (name) {
      return this.postVariable[name];
    } else {
      return this.postVariable;
    }
  }

  getUrlVariable(name) {
    if (name) {
      return this.urlVariable[name];
    } else {
      return this.urlVariable;
    }
  }

  param(name) {
    return this.post(name) || this.get(name) || this.getUrlVariable(name);
  }

  file(name) {
    if (name) {
      return this.postFile[name];
    } else {
      return this.postFile;
    }
  }

  getCookie(name) {
    if (name) {
      return this.requestCookies[name];
    } else {
      return this.requestCookies;
    }
  }

  getHeader(name) {
    if (name) {
      return this.request.headers[name.toLowerCase()];
    } else {
      return this.request.headers;
    }
  }

  getUserAgent() {
    return this.getHeader('user-agent');
  }

  setHeader(name, value) {
    if (!value && name instanceof Object) {
      let object = name;
      for (let key in object) {
        this.response.setHeader(key, object[key]);
      }
    } else {
      this.response.setHeader(name, value);
    }
  }

  redirect(url, code) {
    code = code || 302;
    this.response.statusCode = code;
    this.response.setHeader('Location', url);
    this.end();
  }

  setCookie(key, value, options) {
    options = options || {};
    var expires = (new Date()).valueOf() + (options.expires || Config.http.cookies.lifetime) * 1000;
    var cookie = {
      name: key,
      value: value,
      expires: (new Date(expires)).toGMTString(),
      domain: options.domain || Config.http.cookies.domain,
      path: options.path || Config.http.cookies.path,
      isSession: options.isSession || false
    };
    if (options.httpOnly) {
      cookie.httpOnly = true;
    }

    let cookiesString = cookie.name + '=' + cookie.value;
    if (!cookie.isSession) {
      cookiesString += '; expires=' + cookie.expires;
    }
    cookiesString += '; domain=' + cookie.domain;
    cookiesString += '; path=' + cookie.path;
    if (cookie.httpOnly) {
      cookiesString += '; HttpOnly';
    }
    this.responseCookies.push(cookiesString);

    //this.responseCookies.push(cookie);
  }

  getSession() {
    return Session.get(this.sessionId);
  }

  destorySession() {
    return Session.destory(this.sessionId);
  }

  putSession(data) {
    return Session.put(this.sessionId, data);
  }

}





module.exports = Controller;



//
