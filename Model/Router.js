/*jslint node: true*/
'use strict';

const Url = require('url');
const Config = requireModule('Model/Config');
const Path = require('path');
const RootPath = Path.dirname(require.main.filename);
const FileSystemUtil = requireModule('Util/FileSystemUtil');
const Static = requireModule('Model/Static');
const requireController = requireModule('Util/RequireController');
const Log = requireModule('Lib/Log');

class Router {
  constructor(request, response) {
    this.pathname = Url.parse(request.url).pathname;
    this.request = request;
    this.response = response;
    this.controllerPath = Path.join(RootPath, '/Server/Controller/', this.pathname);
    this.resourcePath = null;
    this.urlVariable = {};
    this.matchedRouter = false;
    this.targetType = null;
    this.isBackstage = null;
    this.redirectLocation = null;

    this.backstage();
  }

  backstage() {
    if (Config.dashboard.enabled && this.pathname.indexOf(Config.dashboard.entrance) === 0) {
      this.pathname = this.pathname.slice(Config.dashboard.entrance.length);
      this.controllerPath = Path.join(__dirname, '../Server/Controller', this.pathname);
      this.isBackstage = true;
      this.createController();
    } else {
      this.checkRule();
    }
  }

  checkRule() {
    let routerTable = Config.server.router;
    for (let i = 0; i < routerTable.length; i++) {
      let router = routerTable[i];
      let routerRule = router[0].split('/');
      let controllerPath = router[1];

      if (this.matchRule(routerRule)) {
        this.controllerPath = Path.join(RootPath, '/Server/Controller/', controllerPath);
        this.matchedRouter = router;
      } else {
        this.controllerPath = Path.join(RootPath, '/Server/Controller/', this.pathname);
      }
    }

    this.createController();
  }

  matchRule(routerRule) {
    let pathname = this.pathname.split('/');
    if (pathname.length !== routerRule.length) {
      return false;
    }

    let urlVariable = {};
    for (let i = 0; i < routerRule.length; i++) {
      if (routerRule[i].indexOf(':') === 0) {
        if (pathname[i] !== '') {
          urlVariable[routerRule[i].slice(1)] = pathname[i];
        } else {
          urlVariable[routerRule[i].slice(1)] = null;
        }
      } else if (routerRule[i] !== pathname[i]) {
        return false;
      }
    }
    this.urlVariable = urlVariable;
    return true;
  }

  createController() {
    var self = this;
    var controllerActionMap = {
      'found': function() {
        try {
          var Controller = requireController(self.controllerPath);
          var controller = new Controller(self.request, self.response, self.controllerPath, self.urlVariable);
          controller.runController();
        } catch (controllerLoadingError) {
          Log.error(controllerLoadingError.stack);
          var Controller = requireModule('Model/Controller');
          var controller = new Controller(self.request, self.response, self.controllerPath, self.urlVariable);
          controller.handleError(controllerLoadingError, '500');
        }
      },
      'redirect': function() {
        self.response.statusCode = 302;
        self.response.setHeader('Location', self.redirectLocation);
        self.response.end();
      }
    };

    if (this.controllerPath.lastIndexOf('/') == this.controllerPath.length - 1 || this.controllerPath.lastIndexOf('\\') == this.controllerPath.length - 1) {
      this.targetType = 'directory';
    } else {
      this.targetType = 'file';
    }


    let controllerPath;

    if (this.targetType === 'directory') {
      let indexController = Config.server.indexController;
      for (let i = 0; i < indexController.length; i++) {
        let controllerPath = Path.join(this.controllerPath, indexController[i]);

        if (FileSystemUtil.typeSync(controllerPath) === 'file') {
          this.controllerPath = controllerPath;
          controllerActionMap.found();
          return;
        }
      }

      let controllerPath = this.controllerPath.substring(0, this.controllerPath.length - 1) + '.js';

      if (FileSystemUtil.typeSync(controllerPath) === 'file') {
        this.controllerPath = controllerPath;
        if (this.matchedRouter) {
          controllerActionMap.found();
        } else {
          this.redirectLocation = this.pathname.substring(0, this.pathname.length - 1);
          controllerActionMap.redirect();
        }
        return;
      }

    }


    if (this.targetType === 'file') {
      let controllerPath = this.controllerPath + '.js';

      if (FileSystemUtil.typeSync(controllerPath) === 'file') {
        this.controllerPath = controllerPath;
        controllerActionMap.found();
        return;
      }


      let indexController = Config.server.indexController;
      for (let i = 0; i < indexController.length; i++) {
        controllerPath = Path.join(this.controllerPath, indexController[i]);
        if (FileSystemUtil.typeSync(controllerPath) === 'file') {
          this.controllerPath = controllerPath;
          if (this.matchedRouter) {
            controllerActionMap.found();
            return;
          } else {
            this.redirectLocation = this.pathname + '/';
            controllerActionMap.redirect();
          }
          return;
        }

      }
    }

    this.createResource();
  }

  createResource() {
    var self = this;
    var staticActionMap = {
      'found': function() {
        new Static(self.request, self.response, self.resourcePath);
      },
      'redirect': function() {
        self.response.statusCode = 302;
        self.response.setHeader('Location', self.redirectLocation);
        self.response.end();
      },
      'listdir': function() {
        if (Config.server.listDirectory.enabled) {
          try {
            var DirList = requireModule('Model/DirList');
            var controller = new DirList(self.request, self.response, self.dirPath, self.pathname);
            controller.runController();
          } catch (controllerLoadingError) {
            Log.error(controllerLoadingError.stack);
            var Controller = requireModule('Model/Controller');
            var controller = new Controller(self.request, self.response, self.controllerPath, self.urlVariable);
            controller.handleError(controllerLoadingError, '500');
          }
        } else {
          var Controller = requireModule('Model/Controller');
          var controller = new Controller(self.request, self.response, self.controllerPath, self.urlVariable);
          var error = new Error();
          error.stack = '403 Forbidden: ' + self.pathname;
          controller.handleError(error, '403');
        }
      },
      'notfound': function() {
        var Controller = requireModule('Model/Controller');
        var controller = new Controller(self.request, self.response, self.controllerPath, self.urlVariable);
        var error = new Error();
        error.stack = '404 Not Found: ' + self.pathname;
        controller.handleError(error, '404');
      }
    };

    var resourcePath = Path.join(RootPath, '/Server/Resource/', decodeURIComponent(this.pathname));

    if (this.targetType === 'directory') {
      let indexFile = Config.server.indexFile;
      for (let i = 0; i < indexFile.length; i++) {
        let assumedResourcePath = resourcePath + indexFile[i];

        if (FileSystemUtil.typeSync(assumedResourcePath) === 'file') {
          this.redirectLocation = this.pathname + indexFile[i];
          staticActionMap.redirect();
          return;
        }
      }

      //check if file exist, then make a 302 jump
      resourcePath = Path.join(RootPath, '/Server/Resource/', decodeURIComponent(this.pathname));
      resourcePath = resourcePath.substring(0, resourcePath.length - 1);
      if (FileSystemUtil.typeSync(resourcePath) === 'file') {
        this.redirectLocation = this.pathname.substring(0, this.pathname.length - 1);
        staticActionMap.redirect();
        return;
      }

      resourcePath = Path.join(RootPath, '/Server/Resource/', decodeURIComponent(this.pathname));
      if (FileSystemUtil.typeSync(resourcePath) === 'directory') {
        if (true) {
          this.dirPath = resourcePath;
          staticActionMap.listdir();
          return;
        }
      }

    }

    if (this.targetType === 'file') {
      if (FileSystemUtil.typeSync(resourcePath) === 'file') {
        this.resourcePath = resourcePath;
        staticActionMap.found();
        return;
      } else if (FileSystemUtil.typeSync(resourcePath) === 'directory') {
        resourcePath += '/';
        let indexFile = Config.server.indexFile;
        for (let i = 0; i < indexFile.length; i++) {
          resourcePath = resourcePath + indexFile[i];
          if (FileSystemUtil.typeSync(resourcePath) === 'file') {
            this.redirectLocation = this.pathname + '/' + indexFile[i];
            staticActionMap.redirect();
            return;
          }
        }

        //check setting
        if (true) {
          this.redirectLocation = this.pathname + '/';
          staticActionMap.redirect();
          return;
        }
      }
    }
    staticActionMap.notfound();
  }
}


module.exports = Router;
