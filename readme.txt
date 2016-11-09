Tips
    Need mysql database, dump is available at ./test.sql
    Need redis server on localhost:6379 with default configuration
    Need RabbitMQ server on localhost:5672 with default configuration
    Install node_modules with "#npm install"
    Launch app with "#npm start" or "#nodemon start" or "#pm2 start bin/www"
    Launch worker for RabbitMQ with "#nodemon ./bin/worker.js"
    
Install express + mongo
    http://cwbuecheler.com/web/tutorials/2013/node-express-mongo/
Best/bad practice
    http://expressjs.com/fr/advanced/best-practice-performance.html
    https://blog.risingstack.com/node-js-best-practices/
    https://www.toptal.com/nodejs/top-10-common-nodejs-developer-mistakes

    https://github.com/alanjames1987/Node.js-Best-Practices
    https://devcenter.heroku.com/articles/node-best-practices
Promise
    https://www.promisejs.org/
    https://60devs.com/best-practices-for-using-promises-in-js.html
socket
    http://socket.io/get-started/chat/
    http://stackoverflow.com/questions/24609991/using-socket-io-in-express-4-and-express-generators-bin-www
    http://gulivert.ch/create-a-chat-app-with-nodejs-express-and-socket-io/
Module export
    https://www.sitepoint.com/understanding-module-exports-exports-node-js/
Redis
    https://github.com/NodeRedis/node_redis
Express-session
    https://www.npmjs.com/package/express-session
Optimization
    http://www.kinderas.com/technology/2014/2/9/making-a-fast-website
    https://github.com/dmauro/node-jade-compress
    https://www.npmjs.com/package/express-istatic
--------------------------------------------------------------

# npm install express-generator -g
# express node-expressgenerator1

   install dependencies:
     $ cd node-expressgenerator1 && npm install

   run the app:
     $ DEBUG=node-expressgenerator1:* npm start

# cd node-expressgenerator1/
# npm install
npm WARN deprecated jade@1.11.0: Jade has been renamed to pug, please install the latest version of pug instead of jade
npm WARN deprecated transformers@2.1.0: Deprecated, use jstransformer
node-expressgenerator1@0.0.0 /var/www/html/node-expressgenerator1
├─┬ body-parser@1.15.2
│ ├── bytes@2.4.0
│ ├── content-type@1.0.2
│ ├── depd@1.1.0
│ ├─┬ http-errors@1.5.0
│ │ ├── inherits@2.0.1
│ │ ├── setprototypeof@1.0.1
│ │ └── statuses@1.3.0
│ ├── iconv-lite@0.4.13
│ ├─┬ on-finished@2.3.0
│ │ └── ee-first@1.1.1
│ ├── qs@6.2.0
│ ├─┬ raw-body@2.1.7
│ │ └── unpipe@1.0.0
│ └─┬ type-is@1.6.13
│   ├── media-typer@0.3.0
│   └─┬ mime-types@2.1.11
│     └── mime-db@1.23.0
├─┬ cookie-parser@1.4.3
│ ├── cookie@0.3.1
│ └── cookie-signature@1.0.6
├─┬ debug@2.2.0
│ └── ms@0.7.1
├─┬ express@4.13.4
│ ├─┬ accepts@1.2.13
│ │ └── negotiator@0.5.3
│ ├── array-flatten@1.1.1
│ ├── content-disposition@0.5.1
│ ├── cookie@0.1.5
│ ├── escape-html@1.0.3
│ ├── etag@1.7.0
│ ├── finalhandler@0.4.1
│ ├── fresh@0.3.0
│ ├── merge-descriptors@1.0.1
│ ├── methods@1.1.2
│ ├── parseurl@1.3.1
│ ├── path-to-regexp@0.1.7
│ ├─┬ proxy-addr@1.0.10
│ │ ├── forwarded@0.1.0
│ │ └── ipaddr.js@1.0.5
│ ├── qs@4.0.0
│ ├── range-parser@1.0.3
│ ├─┬ send@0.13.1
│ │ ├── destroy@1.0.4
│ │ ├── http-errors@1.3.1
│ │ ├── mime@1.3.4
│ │ └── statuses@1.2.1
│ ├─┬ serve-static@1.10.3
│ │ └─┬ send@0.13.2
│ │   ├── http-errors@1.3.1
│ │   └── statuses@1.2.1
│ ├── utils-merge@1.0.0
│ └── vary@1.0.1
├─┬ jade@1.11.0
│ ├── character-parser@1.2.1
│ ├─┬ clean-css@3.4.19
│ │ ├─┬ commander@2.8.1
│ │ │ └── graceful-readlink@1.0.1
│ │ └─┬ source-map@0.4.4
│ │   └── amdefine@1.0.0
│ ├── commander@2.6.0
│ ├─┬ constantinople@3.0.2
│ │ └── acorn@2.7.0
│ ├─┬ jstransformer@0.0.2
│ │ ├── is-promise@2.1.0
│ │ └─┬ promise@6.1.0
│ │   └── asap@1.0.0
│ ├─┬ mkdirp@0.5.1
│ │ └── minimist@0.0.8
│ ├─┬ transformers@2.1.0
│ │ ├─┬ css@1.0.8
│ │ │ ├── css-parse@1.0.4
│ │ │ └── css-stringify@1.0.5
│ │ ├─┬ promise@2.0.0
│ │ │ └── is-promise@1.0.1
│ │ └─┬ uglify-js@2.2.5
│ │   ├─┬ optimist@0.3.7
│ │   │ └── wordwrap@0.0.3
│ │   └── source-map@0.1.43
│ ├─┬ uglify-js@2.7.3
│ │ ├── async@0.2.10
│ │ ├── source-map@0.5.6
│ │ ├── uglify-to-browserify@1.0.2
│ │ └─┬ yargs@3.10.0
│ │   ├── camelcase@1.2.1
│ │   ├─┬ cliui@2.1.0
│ │   │ ├─┬ center-align@0.1.3
│ │   │ │ ├─┬ align-text@0.1.4
│ │   │ │ │ ├─┬ kind-of@3.0.4
│ │   │ │ │ │ └── is-buffer@1.1.4
│ │   │ │ │ ├── longest@1.0.1
│ │   │ │ │ └── repeat-string@1.5.4
│ │   │ │ └── lazy-cache@1.0.4
│ │   │ ├── right-align@0.1.3
│ │   │ └── wordwrap@0.0.2
│ │   ├── decamelize@1.2.0
│ │   └── window-size@0.1.0
│ ├── void-elements@2.0.1
│ └─┬ with@4.0.3
│   ├── acorn@1.2.2
│   └── acorn-globals@1.0.9
├─┬ morgan@1.7.0
│ ├── basic-auth@1.0.4
│ └── on-headers@1.0.1
└── serve-favicon@2.3.0

# npm install pm2 -g
# npm install nodemon -g
