/*jslint node: true*/
'use strict';

const MongoClient = require('mongodb').MongoClient;
const Config = requireModule('Model/Config');
const Log = requireModule('Lib/Log');

//mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]

class Database {
  static initializeDb() {
    var dbSetting = Config.database;
    var self = this;
    var url = 'mongodb://' + dbSetting.username + ':' + dbSetting.passphrase + '@' + dbSetting.host + ':' + dbSetting.port + '/' + dbSetting.dbName;
    return new Promise(function(resolve, reject) {
      if (!dbSetting.enabled){
        resolve();
        return;
      }
      MongoClient.connect(url, function(error, db) {
        if (error) {
          Log.error(error.stack);
          reject(error);
          return;
        }
        Log.success('Connected to mongodb://' + dbSetting.username + ':********@' + dbSetting.host + ':' + dbSetting.port + '/' + dbSetting.dbName);
        self.db = db;
        resolve();
      });
    });
  }

  static getDb() {
    return this.db;
  }

  static getMongoDBLib(){
    return require('mongodb');
  }
}

Database.db = null;

module.exports = Database;
