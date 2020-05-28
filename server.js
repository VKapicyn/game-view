const express = require('express');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const cors = require('cors');
const nunjucks = require('nunjucks');
const Messages = require('./models/messages').Messages;
const session = require('express-session');
const nedbStore = require('nedb-session-store')( session );
const app = express();
let config = require('./config.js');

let tokensDB = new Datastore({filename: 'tokens'});
tokensDB.loadDatabase();

let rounDB = new Datastore({filename: 'rounds'}); // new db
rounDB.loadDatabase();
let advertDB = new Datastore({filename: 'adverts'}); // new db
advertDB.loadDatabase();
let SubsidyDB = new Datastore({filename: 'subsidy'}); // new db
SubsidyDB.loadDatabase();

module.exports.tokensDB = tokensDB;

module.exports.rounDB = rounDB; // new db connection
module.exports.SubsidyDB = SubsidyDB; // new db connection

Messages.moneyEveryDay();

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
console.log(`Server started on ${require('./config.js').port}`);
module.exports.app = app;