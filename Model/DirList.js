/*jslint node: true*/
'use strict';

const Config = requireModule('Model/Config');
const Controller = requireModule('Model/Controller');
const Path = require('path');
const FileSystemUtil = requireModule('Util/FileSystemUtil');
const DateUtil = requireModule('Util/DateUtil');

const Extdescription = {
  "7z": "7z compressed archive file",
  "bz2": "BZzip2 compressed archive file",
  "gzip": "Gnu Zipped File",
  "rar": "WinRAR Compressed Archive",
  "tgz": "Gzipped Tar File",
  "3ga": "3GPP Audio File",
  "aif": "Audio Interchange File Format",
  "amr": "Adaptive Multi-Rate Codec File",
  "aup": "Audacity Project File",
  "flac": "Free Lossless Audio Codec File",
  "kar": "Karaoke files",
  "m4p": "iTunes Music Store Audio File",
  "mid": "Musical Instrument Digital Interface MIDI-sequention Sound",
  "mmf": "Synthetic Music Mobile Application File",
  "mp3": "MPEG Layer 3 Audio",
  "ogg": "Ogg Vorbis Audio File",
  "opus": "Opus Audio File",
  "ra": "Real Audio File",
  "wav": "WAVE Audio",
  "xspf": "XML Shareable Playlist Format",
  "dwg": "AutoCAD Drawing Database File",
  "bup": "DVD Info Backup File",
  "chm": "Compiled HTML Help File",
  "docm": "Word Open XML Macro-Enabled Document",
  "dot": "Microsoft Word Document Template File",
  "eps": "Adobe Encapsulated PostScript",
  "m3u": "Media Playlist File",
  "pages": "Pages Document",
  "pub": "Microsoft Publisher Document File",
  "sxw": "StarOffice Writer Document",
  "wpd": "WordPerfect Document File",
  "xml": "Extensible Markup Language",
  "azw": "Amazon Kindle ebook file",
  "epub": "Electronic Publication",
  "lit": "Microsoft eBook File",
  "mobi": "Mobipocket",
  "cda": "CD Audio Track Shortcut",
  "exe": "Executable file",
  "img": "Disk Image File",
  "kmz": "Keyhole Markup Language (Zipped)",
  "ps": "Adobe PostScript File",
  "torrent": "BitTorrent file",
  "vcf": "vCard File",
  "key": "Keynote Presentation",
  "pps": "PowerPoint Slide Show",
  "ppt": "Microsoft PowerPoint",
  "pptx": "Microsoft PowerPoint 2007 XML",
  "arw": "Sony Digital Camera Alpha Raw Image Format",
  "cr2": "Canon Digital Camera Raw Image File",
  "dcm": "Digital Imaging and Communications in Medicine Image File",
  "dmg": "Mac OS X Disk Image",
  "fpx": "FlashPix Bitmap Image File",
  "ico": "Microsoft icon file",
  "jpeg": "Joint Photographic Experts Group JFIF format",
  "nef": "Nikon Digital Camera Raw Image File",
  "pcd": "Photo CD",
  "pict": "Apple Macintosh QuickDraw/picture file",
  "psd": "Adobe Photoshop Document",
  "tga": "Truevision Targa Graphic File",
  "tiff": "Tagged Image File Format",
  "xcf": "eXperimental Computing Facility",
  "csv": "Comma Separated Values File",
  "xls": "Microsoft Excel Spreadsheet",
  "ai": "Adobe Illustrator File",
  "emz": "Windows Compressed Enhanced Metafile",
  "svg": "Scalable Vector Graphics File",
  "wmf": "Windows Metafile",
  "3g2": "3rd Generation Partnership Project Multimedia File",
  "3gpp": "Third Generation Partnership Project Media File",
  "avi": "Microsoft Audio/Visual Interleaved",
  "f4v": "Flash MP4 Video File",
  "h264": "H.264 Encoded Video File",
  "m2ts": "MPEG-2 Transport Stream",
  "mkv": "Matroska Video File",
  "mov": "QuickTime Movie",
  "mpeg": "Motion Picture Experts Group file interchange format",
  "mswmm": "Microsoft Windows Movie Maker Project File",
  "mxf": "Material Exchange Format File",
  "rm": "Real Media File",
  "ts": "Video Transport Stream File",
  "vob": "Video Object File",
  "wlmp": "Windows Live Movie Maker",
  "css": "Cascading Style Sheets",
  "html": "Hypertext Markup Language with a client-side image map",
  "json": "JavaScript Object Notation File",
  "js": "JavaScript File",
  "md": "Markdown File",
  "coffee": "CoffeeScript File"
};

class DirList extends Controller {
  constructor(request, response, dirPath, pathname) {
    super(request, response, null, null);
    this.dirPath = dirPath;
    this.pathname = pathname;
  }

  resolvePath() {
    //TODO resolve template path
    this.jadePath = Path.join(__dirname, '../Server/View/DirList.jade');
    this.ejsPath = Path.join(__dirname, '../Server/View/DirList.ejs');
  }

  readHTTPActionVariable() {
    return new Promise(function(resolve, reject) {
      resolve();
    });
  }

  //override
  mainLogic() {
    var self = this;
    this.assign('dirPath', decodeURIComponent(this.pathname));
    this.assign('display', Config.server.listDirectory.display);
    FileSystemUtil.list(this.dirPath).then(function(list) {
      //re-arrange file list
      let dirList = [];
      let fileList = [];
      for (let i = 0; i < list.length; i++) {
        list[i].atime = DateUtil.format(list[i].atime, 'yyyy-MM-dd hh:mm:ss');
        list[i].mtime = DateUtil.format(list[i].mtime, 'yyyy-MM-dd hh:mm:ss');
        list[i].ctime = DateUtil.format(list[i].ctime, 'yyyy-MM-dd hh:mm:ss');
        list[i].birthtime = DateUtil.format(list[i].birthtime, 'yyyy-MM-dd hh:mm:ss');
        list[i].href = encodeURIComponent(list[i].base);

        if (list[i].type === 'file') {
          list[i].size = FileSystemUtil.formatBytes(list[i].size);
          list[i].mime = Config.http.mime[list[i].ext] || '-';
          list[i].description = Extdescription[list[i].ext] || '-';
        } else {
          list[i].href += '/';
          list[i].mime = '-';
          list[i].description = '-';
        }
        fileList.push(list[i]);
      }
      let result = dirList.concat(fileList);
      self.assign('list', result);
      self.renderJade();
      //self.end(JSON.stringify(result));
    }).catch(function(err) {
      self.handleError(err);
    });
  }


}


module.exports = DirList;
