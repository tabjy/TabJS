/*jslint node: true*/
'use strict';

const extendObject = requireModule('Util/ExtendObject');
const Fs = require('fs');
const StringUtil = requireModule('Util/StringUtil');
const Path = require('path');
const RootPath = Path.dirname(require.main.filename);
const Mathjs = require('mathjs');
const FileSystemUtil = requireModule('Util/FileSystemUtil');
const Log = requireModule('Lib/Log');

class Config {
  constructor() {
    this._defaultDashboard = requireModule('Config/Dashboard.json');
    this._defaultDatabase = requireModule('Config/Database.json');
    this._defaultDying = requireModule('Config/Dying.json');
    this._defaultHttp = requireModule('Config/Http.json');
    this._defaultServer = requireModule('Config/Server.json');
    this._defaultGeneral = requireModule('Config/General.json');

    this._userDashboard = require(RootPath + '/Config/Dashboard.json', true);
    this._userDatabase = require(RootPath + '/Config/Database.json', true);
    this._userDying = require(RootPath + '/Config/Dying.json', true);
    this._userHttp = require(RootPath + '/Config/Http.json', true);
    this._userServer = require(RootPath + '/Config/Server.json', true);
    this._userGeneral = require(RootPath + '/Config/General.json', true);

    this.dashboard = extendObject(this._defaultDashboard, this._userDashboard, true);
    this.database = extendObject(this._defaultDatabase, this._userDatabase, true);
    this.dying = extendObject(this._defaultDying, this._userDying, true);
    this.http = extendObject(this._defaultHttp, this._userHttp, true);
    this.server = extendObject(this._defaultServer, this._userServer, true);
    this.general = extendObject(this._defaultGeneral, this._userGeneral, true);

    this.dying.autoReboot.timeInterval = Mathjs.eval(this.dying.autoReboot.timeInterval);
    this.dying.autoReboot.exceedRAM = Mathjs.eval(this.dying.autoReboot.exceedRAM);
    this.http.cookies.lifetime = Mathjs.eval(this.http.cookies.lifetime);
    this.http.clientCache.lifetime = Mathjs.eval(this.http.clientCache.lifetime);
    this.http.session.lifetime = Mathjs.eval(this.http.session.lifetime);
    this.server.timeout = Mathjs.eval(this.server.timeout);

    if (FileSystemUtil.typeSync(Path.join(RootPath, this.server.uploadDir) !== 'directory')) {
      Log.warn('upload directory does not exist!', 'System');
      Fs.mkdirSync(Path.join(RootPath, this.server.uploadDir));
      Log.success('upload directory created! ' + Path.join(RootPath, this.server.uploadDir), 'System');
    }
  }

}

module.exports = new Config();
