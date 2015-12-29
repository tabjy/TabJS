/*jslint node: true*/
'use strict';

const Config = requireModule('Model/Config');
const Crypto = require('crypto');


class Session {
  constructor(id, data) {
    this.id = id;
    this.data = data || {};
    this.destory = (new Date().getTime()) + Config.http.session.lifetime * 1000;
  }

  static put(id, data) {
    return new Promise(function(resolve, reject) {
      if (!Session.sessionData[id]) {
        reject(new Error('Session with ID "' + id + '" not found.'));
      }
      for (let key in data) {
        Session.sessionData[id].data[key] = data[key];
      }
      resolve();
    });
  }

  static new() {
    return new Promise(function(resolve, reject) {
      Session._generateSessionId().then(function(id) {
        Session.sessionData[id] = new Session(id);
        resolve(id);
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  static get(id) {
    return new Promise(function(resolve, reject) {
      if (!Session.sessionData[id]) {
        reject(new Error('Session with ID "' + id + '" not found.'));
      }
      resolve(Session.sessionData[id].data);
    });
  }

  static destory(id) {
    return new Promise(function(resolve, reject) {
      if (!Session.sessionData[id]) {
        reject(new Error('Session with ID "' + id + '" not found.'));
      }
      Session.sessionData[id] = null;
      resolve();
    });
  }

  static refresh(id) {
    return new Promise(function(resolve, reject) {
      if (!Session.sessionData[id]) {
        reject(new Error('Session with ID "' + id + '" not found.'));
      }
      if ((new Date()).getTime() > Session.sessionData[id].destory) {
        return Session.destory(id).then(function() {
          resolve();
        }).catch(function(error) {
          reject(error);
        });
      } else {
        Session.sessionData[id].destory = (new Date().getTime()) + Config.http.session.lifetime * 1000;
        resolve();
      }
    });
  }



  static _generateSessionId() {
    return new Promise(function(resolve, reject) {
      Crypto.randomBytes(16, function(err, rnd) {
        if (err) {
          reject(err);
        }
        rnd[6] = (rnd[6] & 0x0f) | 0x40;
        rnd[8] = (rnd[8] & 0x3f) | 0x80;
        rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
        rnd.shift();
        resolve(rnd.join('-'));
      });
    });
  }
}

Session.sessionData = {};

module.exports = Session;
