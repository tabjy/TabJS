/*jslint node: true*/
'use strict';

const Http = require('http');
const Config = requireModule('Model/Config');
const Router = requireModule('Model/Router');
const Log = requireModule('Lib/Log');

class Server {
  static start() {
    this._server = Http.createServer(function(request, response) {
      request.setTimeout(Config.server.timeout * 1000);
      response.setTimeout(Config.server.timeout * 1000);
      for (let name in Config.http.header) {
        response.setHeader(name, Config.http.header[name]);
      }
      new Router(request, response);
    });
    this._server.listen(Config.server.port, Config.server.host);
    Log.success('HTTP Server running at: http://' + Config.server.host + ':' + Config.server.port);
  }

  static getServerInstance() {
    return this._server;
  }
}

module.exports = Server;
