/*jslint node: true*/
'use strict';

const Controller = requireModule('Model/Controller');
const Config = requireModule('Model/Config');
const Http = require('http');
const Log = requireModule('Lib/Log');

class RESTful extends Controller {
  constructor(request, response, controllerPath, urlVariable) {
    super(request, response, controllerPath, urlVariable);
    this.restfulStatus = {
      code: 200,
      message: 'OK'
    };
    this.restfulData = {};

  }

  handleError(error, statusCode) {
    Log.error(error.stack);
    this.restfulStatus.code = statusCode || error.code || 500;
    this.restfulStatus.code = Number(this.restfulStatus.code);

    this.restfulStatus.message = error.message || Http.STATUS_CODES[this.restfulStatus.code];

    if (Config.general.debug) {
      this.restfulStatus.stack = error.stack;
    }
    this.end();
  }

  mainLogic() {
    super.mainLogic();
    this.setHeader('Content-Type', 'application/json');

    var self = this;
    var onMethodAction = function() {
      if (self.isGet()) {
        self.onGet();
      } else if (self.isPost()) {
        self.onPost();
      } else if (self.isMethod('put')) {
        self.onPut();
      } else if (self.isMethod('patch')) {
        self.onPatch();
      } else if (self.isMethod('delete')) {
        self.onDelete();
      } else {
        self.handleError(new Error('Method Not Allowed'), '405');
      }
    };

    var promise = this.onREST();
    if (promise && promise.then) {
      promise.then(function() {
        onMethodAction();
      }).catch(function(error) {
        self.handleError(error);
      });
    } else {
      onMethodAction();
    }


  }

  onREST() {

  }

  onGet() {
    this.handleError(new Error('Method Not Allowed'), '405');
  }

  onPost() {
    this.handleError(new Error('Method Not Allowed'), '405');
  }

  onPut() {
    this.handleError(new Error('Method Not Allowed'), '405');
  }

  onPatch() {
    this.handleError(new Error('Method Not Allowed'), '405');
  }

  onDelete() {
    this.handleError(new Error('Method Not Allowed'), '405');
  }

  end() {
    this.response.statusCode = this.restfulStatus.code;
    this.response.statusMessage = Http.STATUS_CODES[this.restfulStatus.code];

    if(this.response.statusCode < 400){
      this.restfulStatus.message = Http.STATUS_CODES[this.restfulStatus.code];
    }

    var restfulResult = this.restfulStatus;
    if (Object.keys(this.restfulData).length !== 0) {
      restfulResult.data = this.restfulData;
    }
    super.end(JSON.stringify(restfulResult));
  }

  assign() {
    throw new Error('Controller.assign method is not allowed in its subclass: RESTful');
  }

  renderEjs() {
    throw new Error('Controller.assign method is not allowed in its subclass: RESTful');
  }

  renderJade() {
    throw new Error('Controller.assign method is not allowed in its subclass: RESTful');
  }
}

module.exports = RESTful;
