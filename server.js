const express = require('express');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const cors = require('cors');
const nunjucks = require('nunjucks');
const session = require('express-session')
const nedbStore = require('nedb-session-store')( session );
const app = express();
let config = require('./config.js');

let userDB = new Datastore({filename: 'users'});
userDB.loadDatabase();
let opsDB = new Datastore({filename: 'operations'});
opsDB.loadDatabase();
let tokensDB = new Datastore({filename: 'tokens'});
tokensDB.loadDatabase();

module.exports.userDB = userDB;
module.exports.opsDB = opsDB;
module.exports.tokensDB = tokensDB;

nunjucks.configure(__dirname + '/src/views', {
    autoescape: true,
    cache: false,
    express: app
});

app.use(
    bodyParser.urlencoded({
        extended: true
    }),
    bodyParser.json(),
    session({
        secret: config.token,
        resave: false,
        saveUninitialized: true,
        store: new nedbStore({filename:'sessions'})
      }),
    cors(),
    bodyParser(),
    express.static(__dirname + '/src'),
    function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    }
);

require('./models/round').onLoad();
module.exports.express = express;
app.use('/', require('./router').router);
app.listen(require('./config.js').port);
console.log(`Running at Port ${config.port}`);
module.exports.app = app;