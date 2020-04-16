const userDB = require('../server').userDB;
const User = require('../models/user').User;
const Ops = require('../models/ops').Operations;
const Round = require('../models/round');
const config = require('../config');
const License = require('../models/license').License;

exports.getRaitPage = async (req, res) => {
    let admin,
        rounds = Round.getRoundList(),
        round = Round.getRound();

    let ops = await Ops.getByRound('all');
    
    if (req.session.user)
        admin = require('./admin').isAdmin(req.session.user.login);
    else 
        admin = false;

    userDB.find({}).sort({balance: 1}).exec( async (err, items) => {
        let objectTypes = [];
        console.log(config);
        /*config.objects.map(ob => {
            if (ob.status == 0) {
                objectTypes.push(ob.value);
            }
        })*/
        /*items.map(x => {
            config.objects.map(ob => {
                if (!x.objects)
                    x.objects = {};

                if (ob.status == 0) {
                    x.objects[ob.value] = 0;
                }
            })
    
            ops.map(o => {
                if (o.responser == x.login) {
                    if (x.objects[o.type]>=0)
                        x.objects[o.type] += +o.count;
                }
            })
        })*/

        for (let i=0; i<items.length; i++) {
            items[i] = new User(items[i].login, items[i].pass, items[i].ops, items[i].balance, items[i].name, items[i].lastname, items[i].licenses, items[i].email, items[i].permission, items[i].regdate);
            items[i].balance = await items[i].Balance();
        }
        items.sort((a,b) => (a.balance < b.balance) ? 1 : ((b.balance < a.balance) ? -1 : 0)); 
        res.render('rait.html', {items, admin, lices: await License.getAllTypes(), rounds, round, objectTypes});
    });
}

exports.raitSearchV2 = async (req, res) => {
    let round = req.body.round,
        baseLic = req.body.lic
        baseComp = req.body.companytype;

    let ops = await Ops.getByRound(round);
    let users = await User.recalcBalances(ops, baseLic, round);

    users = User.removeAdmins(users);
    users.sort((x, y) => {
        return Number(y.balance) - Number(x.balance)
    })

    for (let i=0; i<users.length; i++) {
        if (baseComp == 'all')
            break;
        
        if (baseComp == 'prj') {
            if (!(await User.isProject(users[i]))) {
                users.splice(users.indexOf(users[i]), 1)
                --i;
            }
        }
        else 
            if (baseComp == 'ind')
                if (await User.isProject(users[i])) {
                    users.splice(users.indexOf(users[i]), 1)
                    --i;
                }
        
    }

    users.map(x => {
        if (!x.objects) {
            x.objects = {};
        }

        config.objects.map(ob => {
            if (ob.status == 0) {
                x.objects[ob.value] = 0;
            }
        })

        ops.map(o => {
            if (o.responser == x.login) {
                if (x.objects[o.type]>=0)
                    x.objects[o.type] += +o.count;
            }
        })
    })

    let objectTypes = [];
    config.objects.map(ob => {
        if (ob.status == 0) {
            objectTypes.push(ob.value);
        }
    })

    //---
    let admin,
        rounds = Round.getRoundList();
    
    if (req.session.user)
        admin = require('./admin').isAdmin(req.session.user.login);
    else 
        admin = false;
    //---
    res.render('rait.html', {
        items: users,
        admin, rounds, baseLic,
        lices: await License.getAllTypes(), 
        round: (round=='all'?Round.getRound():round), 
        search: true,
        selected: [baseLic,round,baseComp],
        objectTypes
    })
}


//Not actual
exports.raitSearch = (req, res) => {
    userDB.find({}).sort({balance: -1}).exec( (err, items) => {
        //console.log(0,req.body.mask)
        _items = []
        if (req.body.mask) {
            //console.log(1, req.body.mask.length)
                if (req.body.mask.length == 1) {
                    // [0] - поиск по первой букве
                    items.map(item => {
                        if (JSON.stringify(item.login)[0+1].toLowerCase() == req.body.mask[0].toLowerCase())
                            _items.push(item)
                        //console.log(JSON.stringify(item.login)[0+1])
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
}