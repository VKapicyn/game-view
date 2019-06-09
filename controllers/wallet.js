const User = require('../models/user').User;
const Ops = require('../models/ops').Operations;
const roundModel = require('../models/round').Round

exports.charge = async (req, res) => {
    let sender = req.body.responser,
        responser = req.session.user.login,
        amount = req.body.amount;
    
    console.log(sender, responser, amount)
    let operation = new Ops(sender, responser, amount, 'Возврат займа банку'),
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

exports.getWalletPage = async (req, res) => {
    let user = await User.find(req.session.user.login),
        ops = await Ops.getOpsByUser(req.session.user.login),
        userList = await User.getUserList(req.session.user.login),
        charge = require('./admin').isAdmin(req.session.user.login);

    res.render('wallet.html', {
        user,
        ops,
        userList,
        stop: (roundModel.status == 1) ? false : true,
        charge
    });
}

exports.send = async (req, res) => {
    if (req.body.text == '')
        req.body.text = 'Без комментария'

    if (req.body.responser == 'Всем') {
        let sender = req.session.user.login,
            responser = req.body.responser,
            amount = req.body;
            text = req.body.text;
    
        let operation = new Ops(sender, responser, amount, text),
            senderUser = await User.find(sender),
            responsersUser = await User.findAll();

        if (sender.balance >= amount * responsersUser.length && amount > 0) {
            operation = await operation.save();
            senderUser.Ops(operations);
            senderUser.updateDB();
            responserUser.Ops(operations);
            responserUser.updateDB();
        }

        res.redirect('/wallet')
    } else {
        let sender = req.session.user.login,
            responser = req.body.responser,
            amount = req.body.amount,
            text = req.body.text;
    
        let operation = new Ops(sender, responser, amount, text),
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
}