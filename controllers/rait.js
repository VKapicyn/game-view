const userDB = require('../server').userDB;
const User = require('../models/user').User;
const Ops = require('../models/ops').Operations;
const Round = require('../models/round');
const config = require('../config');

exports.getRaitPage = (req, res) => {
    let admin,
        groups = config.projectGoups,
        tables = config.tables, 
        rounds = Round.getRoundList(),
        round = Round.getRound();
    
    if (req.session.user)
        admin = require('./admin').isAdmin(req.session.user.login);
    else 
        admin = false;

    userDB.find({}).sort({balance: -1}).exec( (err, items) => {
        res.render('rait.html', {items, admin, groups, tables, rounds, round});
    });
}

exports.raitSearchV2 = async (req, res) => {
    let round = req.body.round,
        table = req.body.table,
        group = req.body.group;

    let ops = await Ops.getByRound(round);
    let users = await User.recalcBalances(table, group, ops);

    users = User.removeAdmins(users);
    users.sort((x, y) => {
        return Number(y.balance) - Number(x.balance)
    })

    //---
    let admin,
        groups = config.projectGoups,
        tables = config.tables, 
        rounds = Round.getRoundList();
    
    if (req.session.user)
        admin = require('./admin').isAdmin(req.session.user.login);
    else 
        admin = false;
    //---

    res.render('rait.html', {
        items: users,
        admin, groups, tables, rounds, 
        round: (round=='all'?Round.getRound():round), 
        search: true
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