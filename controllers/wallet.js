const User = require('../models/user').User;
const Ops = require('../models/ops').Operations;
const License = require('../models/license').License;
const roundModel = require('../models/round').Round;
const Round = require('../models/round');
const Messages = require('../models/messages').Messages;
const Credit = require('../models/credit').Credit;
const Subsidy = require('../models/subsidy').Subsidy;
const config = require('../config');
const path = require('path');

exports.charge = async (req, res) => {
    let sender = req.body.responser,
        responser = req.session.user.login,
        amount = req.body.amount;
    
    let operation = new Ops(sender, responser, amount, 'Взыскание банком', 'Взыскание'),
        senderUser = await User.find(sender),
        responserUser = await User.find(responser);

    if (amount > 0) {
        operation = await operation.save();
        senderUser.Ops = operation;
        senderUser.updateDB();
        responserUser.Ops = operation;
        responserUser.updateDB();
    }

    
    res.redirect('/wallet');
}

exports.permission = async (req, res) => {
    let sender = req.session.user.login,
        responser = config.adminLogins[0],
        round = Round.getRound().toString(),
        amount = Number(round) == 2 ? 10 : 25;
    
    let operation = new Ops(sender, responser, amount, 'Оплата услуг проектной группы', 'Маркетплейс'),
        senderUser = await User.find(sender),
        responserUser = await User.find(responser);

        console.log(senderUser)
    if (amount > 0 && !senderUser.permission[round]) {
        operation = await operation.save();
        let obj = {};
            obj[round] = true;
        senderUser.permission = obj;
        console.log(senderUser)
        senderUser.Ops = operation;
        senderUser.updateDB();
        responserUser.Ops = operation;
        responserUser.updateDB();
    }
    res.redirect('/board');
}
exports.subsidy = async (req, res) => {
    let sender = config.adminLogins[0],
        responser = req.session.user.login,
        amount = req.body.subsidy,
        rounds = await Round.getRoundList();
    
    let operation = new Ops(sender, responser, amount, 'Выдача субсидии', 'Субсидия'),
        senderUser = await User.find(sender),
        responserUser = await User.find(responser);

    if (amount > 0 && (await Subsidy.getSubsidyLimit(responserUser.login)) >= amount) {
        let subsidy = new Subsidy(responserUser.login, rounds[rounds.length-1], amount);
        subsidy.save();
        operation = await operation.save();
        senderUser.Ops = operation;
        senderUser.updateDB();
        responserUser.Ops = operation;
        responserUser.updateDB();
    }
    res.redirect('/wallet');
}

exports.credit = async (req, res) => {
    let sender = config.adminLogins[0],
        responser = req.session.user.login,
        amount = req.body.credit,
        rounds = await Round.getRoundList();
    
    let operation = new Ops(sender, responser, amount, 'Выдача займа', 'Кредит'),
        senderUser = await User.find(sender),
        responserUser = await User.find(responser);

    if (amount > 0 && (await Credit.getCreditLimit(responserUser.login)) >= amount) {
        let credit = new Credit(responserUser.login, rounds[rounds.length-1], amount);
        credit.save();
        operation = await operation.save();
        senderUser.Ops = operation;
        senderUser.updateDB();
        responserUser.Ops = operation;
        responserUser.updateDB();
    }
    res.redirect('/wallet');
}

exports.getWalletPage = async (req, res) => {
    let user = await User.find(req.session.user.login),
        ops = await Ops.getOpsByUser(req.session.user.login),
        userList = await User.getUserList(req.session.user.login),
        charge = require('./admin').isAdmin(req.session.user.login);
        userName = await User.findAll();
        place = null;

        const items = await User.findAll();
        items.sort((a,b) => (a.balance > b.balance) ? 1 : ((b.balance > a.balance) ? -1 : 0)); 
        for (let i=0; i<items.length; i++) {
            console.log(req.session.user.login);
            if(items[i].login == req.session.user.login) place = i+1;
        }
    if (user) {
        userList.sort();
        /*let _licTypes = await User.getActualLic(user.login),
            __licTypes = await License.find(_licTypes);
    
        if (__licTypes != null) {
            licTypes = __licTypes.opsTypes;
            licTypes = licTypes.concat(config.licExp);
            licTypes = licTypes.concat(__licTypes.objectsCanBuy);
            licList = licList.concat(licTypes);
        }*/
    
        console.log(user.balance);
        res.render('wallet.html', {
            //actualLic: __licTypes,
            //licList,
            user,
            ops,
            userList,
            place,
            userName,
            stop: (charge || await User.isProject(req.session.user.login)) ? false: (roundModel.status == 1 ? false : true),
            charge,
            bankProcent: config.bankProcent,
            subsidyProcent: config.subsidyProcent,
            //subsidyLimit: await Subsidy.getSubsidyLimit(req.session.user.login),
            //creditLimit: await Credit.getCreditLimit(req.session.user.login)
        });
    } else {
        res.redirect('/reg')
    }
}

exports.send = async (req, res) => {
    if (req.body.amount) {
        if (req.body.text == '')
            req.body.text = 'Без комментария'

        let place = null;

        if (req.body.responser == 'Всем') {
            let sender = req.session.user.login,
                amount = Math.floor(req.body.amount);
                text = req.body.text;
                type = req.body.liclist;
                count = req.body.count;
        
            let senderUser = await User.find(sender),
                responsersUser = await User.findAll();


            if (await senderUser.balance >= amount * responsersUser.length && amount > 0) {
                for( let i=0; i<responsersUser.length; i++) {
                    if (responsersUser[i].login != senderUser.login) {
                        let operation = new Ops(sender, responsersUser[i].login, amount, text, type, count);

                        operation = await operation.save();
                        senderUser.Ops = operation;
                        await senderUser.updateDB();
                        responsersUser[i].Ops = operation;
                        await responsersUser[i].updateDB();

                        const items = await User.findAll();
                        items.sort((a,b) => (a.balance > b.balance) ? 1 : ((b.balance > a.balance) ? -1 : 0)); 

                        await Messages.setPlaces();

                        let responser = await User.find(responsersUser[i].login);

                        await Messages.operation(responser.email, responser.name, senderUser.name, senderUser.lastname,
                            amount, text, responsers.place);
                    }
                }          
            }

            res.redirect('/wallet')
        } else {
            let sender = req.session.user.login,
                responser = req.body.responser,
                amount = Math.floor(req.body.amount),
                text = req.body.text;
                type = req.body.liclist;
                count = req.body.count;
        
            let operation = new Ops(null, sender, responser, amount, text, count, type),
                senderUser = await User.find(sender),
                responserUser = await User.find(responser);

            if (amount > 0 && await senderUser.balance >= amount) {
                operation = await operation.save();
                console.log(operation);
                senderUser.Ops = operation;
                senderUser.updateDB();
                responserUser.Ops = operation;
                responserUser.updateDB();

                const items = await User.findAll();
                items.sort((a,b) => (a.balance > b.balance) ? 1 : ((b.balance > a.balance) ? -1 : 0)); 

                await Messages.setPlaces();

                let responserUs = await User.find(responser);

                await Messages.operation(responserUs.email, responserUs.name, senderUser.name, senderUser.lastname, 
                    amount, text, responserUs.place);
            }

            res.redirect('/wallet');
        }
    } else {
        res.render('err.html', {err: 'Неудалось выполнить транзакцию!', url: '/wallet'});
    }
}