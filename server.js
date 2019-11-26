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
let licenseDB = new Datastore({filename: 'license'});
licenseDB.loadDatabase();
let roundDB = new Datastore({filename: 'round'});
roundDB.loadDatabase();
let advertDB = new Datastore({filename: 'advert'});
advertDB.loadDatabase();
let creditDB = new Datastore({filename: 'credit'});
creditDB.loadDatabase();
let subsidyDB = new Datastore({filename: 'subsidy'});
subsidyDB.loadDatabase();
let tokensDB = new Datastore({filename: 'tokens'});
tokensDB.loadDatabase();

module.exports.userDB = userDB;
module.exports.opsDB = opsDB;
module.exports.licenseDB = licenseDB;
module.exports.roundDB = roundDB;
module.exports.advertDB = advertDB;
module.exports.creditDB = creditDB;
module.exports.subsidyDB = subsidyDB;
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