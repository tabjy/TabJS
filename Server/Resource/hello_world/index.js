/*jslint node: true*/
'use strict';

const Controller = requireModule('Model/Controller');
const Config = requireModule('Model/Config');

class IndexController extends Controller {
  //override
  mainLogic() {
    this.assign({
      version: Config.general.version,
      build: Config.general.build,
    });
    this.renderJade();
  }
}

module.exports = IndexController;
