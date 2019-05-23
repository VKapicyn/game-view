const express = require('express');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const cors = require('cors');
const nunjucks = require('nunjucks');
const session = require('express-session')
const nedbStore = require('nedb-session-store')( session );
const app = express();
const isReged = require('./middleware').isReged;
const isAdmin = require('./middleware').isAdmin;
const request = require('async-request')

let config = require('./config.js');
let stop = false;

let userDB = new Datastore({filename: 'users'});
userDB.loadDatabase();
let opsDB = new Datastore({filename: 'operations'});
opsDB.loadDatabase();

nunjucks.configure(__dirname + '/src/views', {
    autoescape: true,
    cache: false,
    express: app
});

app.use(bodyParser.urlencoded({
    extended: true
 }));

app.use(bodyParser.json());
app.use(
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

const router = express.Router();
//----- GAME start ----

router.get('/', (req, res) => {
    if (req.session.user != undefined) 
    {
        if (req.sessionID == req.session.user.session)
            res.render('main.html', {user: req.session.user.login})
    }
    else
        res.render('main.html', {user:null})
})
router.get('/main/:err', (req, res) => {
    console.log('tyt'+req.params.err)
    //if (req.params.err==undefined)
        res.render('main.html')
})
router.post('/log', (req, res) => {
    userDB.find({login: req.body.login}, (err, accaunt) => {
        if (err || accaunt.length == 0) {
            res.redirect('/main/logerrlogin')
            return
        }
        
        accaunt = accaunt[0]
        if (req.body.pass == accaunt.pass){
            req.session.user = {id: accaunt._id, login: accaunt.login, session: req.sessionID}
            req.session.save();
            res.redirect('/wallet');
        } else {
            res.redirect('/main/logerrpass')
        }     
    })   
})
router.get('/reg', async (req, res) => {
    res.render('reg.html')
})
router.post('/reg', async (req, res) => {
    userDB.find({login: req.body.login}, async (err, test) => {
        console.log(test)
        if (req.body.login && (req.body.pass == req.body.pass1) && test.length==0) {
            await userDB.insert({
                login: req.body.login,
                pass: req.body.pass,
                balance: 0,
                ops: []
            })
            userDB.find({login: req.body.login} , (err2, accaunt) => {
                console.log(accaunt)
                accaunt = accaunt[0]
                req.session.user = {id: accaunt._id, login: accaunt.login, session: req.sessionID}
                req.session.save();
                res.redirect('/wallet')
            })
        } else {
            res.redirect('/main/regerr')
        }
    })
})
router.get('/rait', (req, res) => {
    userDB.find({}).sort({balance: -1}).exec( (err, items) => {
        res.render('rait.html', {items})
    });
})

//TODO: перевод на русский и пр. изыскания кодировки
//+ норм тест
router.post('/rait', (req, res) => {
    userDB.find({}).sort({balance: -1}).exec( (err, items) => {
        console.log(0,req.body.mask)
        _items = []
        if (req.body.mask) {
            console.log(1, req.body.mask.length)
                if (req.body.mask.length == 1) {
                    // [0] - поиск по первой букве
                    items.map(item => {
                        if (JSON.stringify(item.login)[0+1].toLowerCase() == req.body.mask[0].toLowerCase())
                            _items.push(item)
                        console.log(JSON.stringify(item.login)[0+1])
                    })
                } else if (req.body.mask.length == 2) {
                    // [0] - поиск по первой букве, 
                    // [1] - и цифре
                    items.map(item => {
                        if (JSON.stringify(item.login)[0+1].toLowerCase() == req.body.mask[0].toLowerCase() && 
                            JSON.stringify(item.login)[1+1].toLowerCase() == req.body.mask[1].toLowerCase())

                            _items.push(item)
                    })
                } else if (req.body.mask.length == 3) {
                    if (req.body.mask[0] == '*') {
                        // [0]*, [1]*, [2] - символ
                        items.map(item => {
                            if (JSON.stringify(item.login)[2+1].toLowerCase() == req.body.mask[2].toLowerCase())
                                _items.push(item)
                        })
                    } else {
                        // [0] - символ, [1]*, [2] - символ
                        items.map(item => {
                            if (JSON.stringify(item.login)[0+1].toLowerCase() == req.body.mask[0].toLowerCase() && 
                                JSON.stringify(item.login)[2+1].toLowerCase() == req.body.mask[2].toLowerCase())
    
                                _items.push(item)
                        })
                    }
                } else if (req.body.mask.length == 4) {
                    //конкретный юзер
                    items.map(item => {
                        if (item.login == req.body.mask)
                            _items.push(item)
                    })
                }
                items = _items;
            } 
        res.render('rait.html', {items})
    });
})
router.get('/wallet', isReged, (req, res) => {
    userDB.find({login: req.session.user.login}, (err, accaunt) => {
        accaunt = accaunt[0]
        userDB.find({}, (err, items) => {
            res.render('wallet.html', {accaunt, items, ops: accaunt.ops.reverse(), stop})
        })
    })
})
router.post('/charge', isAdmin, async (req, res)=> {
    userDB.find({login: req.session.user.login}, async (err, sender) => {
        userDB.find({login: req.body.responser}, async (err, responser) => {
            sender = sender[0];
            responser = responser[0];
            chargeText = 'Возврат займа банку';

            if (sender.balance >= req.body.amount && req.body.amount>0) {
                sender.balance = Number(sender.balance) + Number(req.body.amount)
                responser.balance = Number(responser.balance) - Number(req.body.amount)
                sender.ops.push({"type":"input", "amount":req.body.amount, "user":responser.login, "text":chargeText})
                responser.ops.push({"type":"output", "amount":req.body.amount, "user":sender.login, "text":chargeText})
                opsDB.insert({sender: sender.login, responser: responser.login, amount: req.body.amount, text:chargeText, date: Date.now()})
                await userDB.update({
                    login: sender.login
                }, {
                    login: sender.login, 
                    pass: sender.pass, 
                    balance: sender.balance,
                    ops: sender.ops
                }, {}, (err, replaced)=>{})
                await userDB.update({
                    login: responser.login
                }, {
                    login: responser.login, 
                    pass: responser.pass,
                    balance: responser.balance,
                    ops: responser.ops
                }, {}, (err, replaced)=>{})
            }
            res.redirect('/wallet')
        })
    })
})
router.post('/send', isReged, async (req, res) => {
    if (req.body.text == "")
        req.body.text = "Без комментария"

    if (req.body.responser == 'Всем') {
        userDB.find({login: req.session.user.login}, async (err, sender) => {
            sender = sender[0]
            userDB.find({}, async (err, responser) => {
                if (req.body.amount > 0 && responser.length*req.body.amount <= sender.balance) {
                    for (let i=0; i<responser.length; i++) {
                        if (responser[i].login != sender.login) {
                            sender.balance = Number(sender.balance) - Number(req.body.amount)
                            responser[i].balance = Number(responser[i].balance) + Number(req.body.amount)
                            sender.ops.push({"type":"output", "amount":req.body.amount, "user":responser[i].login, "text":req.body.text})
                            responser[i].ops.push({"type":"input", "amount":req.body.amount, "user":sender.login, "text":req.body.text})
                            opsDB.insert({sender: sender.login, responser: responser[i].login, amount: req.body.amount, text:req.body.text, date: Date.now()})
                            await userDB.update({
                                login: sender.login
                            }, {
                                login: sender.login, 
                                pass: sender.pass, 
                                balance: sender.balance,
                                ops: sender.ops
                            }, {}, (err, replaced)=>{})
                            await userDB.update({
                                login: responser[i].login
                            }, {
                                login: responser[i].login, 
                                pass: responser[i].pass,
                                balance: responser[i].balance,
                                ops: responser[i].ops
                            }, {}, (err, replaced)=>{})
                        }
                    }
                    res.redirect('/wallet')
                }
            })
        })
    } else {
        userDB.find({login: req.session.user.login}, async (err, sender) => {
            userDB.find({login: req.body.responser}, async (err, responser) => {
                sender = sender[0]
                responser = responser[0]

                if (sender.balance >= req.body.amount && req.body.amount>0 && req.body.text.length<100) {
                    sender.balance = Number(sender.balance) - Number(req.body.amount)
                    responser.balance = Number(responser.balance) + Number(req.body.amount)
                    sender.ops.push({"type":"output", "amount":req.body.amount, "user":responser.login, "text":req.body.text})
                    responser.ops.push({"type":"input", "amount":req.body.amount, "user":sender.login, "text":req.body.text})
                    opsDB.insert({sender: sender.login, responser: responser.login, amount: req.body.amount, text:req.body.text, date: Date.now()})
                    await userDB.update({
                        login: sender.login
                    }, {
                        login: sender.login, 
                        pass: sender.pass, 
                        balance: sender.balance,
                        ops: sender.ops
                    }, {}, (err, replaced)=>{})
                    await userDB.update({
                        login: responser.login
                    }, {
                        login: responser.login, 
                        pass: responser.pass,
                        balance: responser.balance,
                        ops: responser.ops
                    }, {}, (err, replaced)=>{})
                    //TODO: add operations
                }
                res.redirect('/wallet')
            })
        })
    }
})
router.get('/txs', (req, res) => {
    opsDB.find({}).sort({date:-1}).exec((err, ops) => {
        res.render('txs.html', {ops})
    })
})
router.get('/logout', (req, res) => {
    delete req.session.user;
    res.redirect('/')
})

router.get('/onstart', (req, res) => {
    stop = false
    res.send('Запущенно')
})
router.get('/onpause', (req, res) => {
    res.send('Приостановленно')
})

//----- GAME end

app.use(router);


app.listen(require('./config.js').port);
console.log(`Running at Port ${config.port}`);