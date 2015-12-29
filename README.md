TabJS
====
Just another simple Node.js web framework.
```js
'use strict';

const Controller = requireModule('Model/Controller');

class IndexController extends Controller {

  //override
  mainLogic() {
    this.assign({
      title: 'Hello TabJS',
      text: 'Developing with TabJS is easy.',
    });
    this.renderJade();
  }

}

module.exports = IndexController;
```
##Install
install via npm:
```bash
$ npm install tabjs
```
install latest version:
```bash
$ npm install https://github.com/Tabjy/TabJS.git
```
To initialize project structure, create index.js in project root path:
```js
require('tabjs')
```
Then, run:
```bash
$ node . --tabjs install
```
Start server:
```bash
$ node .
```

##Project Structure
```
.
├── index.js
├── Config/
│   ├── Dashboard.json
│   ├── Database.json
│   ├── Dying.json
│   ├── General.json
│   ├── Http.json
│   └── Server.json
├── Log/
├── node_modules/
│   └── tabjs/
└── Server/
    ├── Controller/
    ├── Initial/
    ├── Model/
    ├── Resource/
    └── View/

```
##TODOs
 * Documentations
 * Server dashboard
 * Multiple database support
 * Alert while going down
 * Session data save to database
 * Reboot server on uncaught exception
 * Better RESTful controller
 * Byte serving support

## License

  [MIT](LICENSE)
