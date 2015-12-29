/*jslint node: true*/
'use strict';

const Config = requireModule('Model/Config');
const Path = require('path');
const Fs = require('fs');
const Zlib = require('zlib');
const Http = require('http');

class Static {
  constructor(request, response, resourcePath) {
    var mimeType = Config.http.mime;
    var extension = Path.extname(resourcePath).slice(1) || 'unknown';
    var contentType = mimeType[extension] || 'text/plain';
    response.setHeader('Content-Type', contentType);
    if (Config.http.clientCache.enabled) {
      let stat = Fs.statSync(resourcePath);
      let lastModified = stat.mtime.toUTCString();
      if (request.headers['if-modified-since'] === lastModified) {
        response.writeHead(304, Http.STATUS_CODES[304]);
        response.end();
        return;
      }

      let today = new Date();
      let expires = today.getTime() + Config.http.clientCache.lifetime * 1000;
      response.setHeader('Expires', (new Date(expires)).toUTCString());
      response.setHeader('Cache-Control', 'max-age=' + Config.http.clientCache.lifetime);
      response.setHeader('Last-Modified', lastModified);
    }

    var readStream = Fs.createReadStream(resourcePath);

    var compressionPriority = Config.server.compression.priority;
    var compressionFileType = Config.server.compression.fileType;
    var acceptEncoding = request.headers['accept-encoding'] || '';
    var compressionFunctionMap = {
      'gzip': function() {
        response.setHeader('Content-Encoding', 'gzip');
        readStream.pipe(Zlib.createGzip()).pipe(response);
      },
      'deflate': function() {
        response.setHeader('Content-Encoding', 'deflate');
        readStream.pipe(Zlib.createDeflate()).pipe(response);
      }
    };

    if (Config.server.compression.enabled && compressionFileType.indexOf(extension) !== -1) {
      for (let i = 0; i < compressionPriority.length; i++) {
        if(acceptEncoding.indexOf(compressionPriority[i]) !== -1){
          let compressionFunction = compressionFunctionMap[compressionPriority[i]];
          if (compressionFunction) {
            compressionFunction();
            return;
          }
        }
      }
    }
    readStream.pipe(response);
    return;
  }
}

module.exports = Static;
