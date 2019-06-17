const User = require('../models/user').User;
const Ops = require('../models/ops').Operations;
const License = require('../models/license').License;
const roundModel = require('../models/round').Round

exports.charge = async (req, res) => {
    let sender = req.body.responser,
        responser = req.session.user.login,
        amount = req.body.amount;
    
    let operation = new Ops(sender, responser, amount, 'Возврат займа банку', 'Кредит'),
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
        charge = require('./admin').isAdmin(req.session.user.login),
        baseLic = require('../config').baseLic,
        licList = require('../config').lic,
        specBalance = await user.Balance();

    
    licTypes = await User.getActualLic(user.login);
    licTypes = await License.find(licTypes);


    if (licTypes != null) {
        licTypes = licTypes.opsTypes;
        licTypes.push('Зарплата');
        licList = licList.concat(licTypes);
    }

    res.render('wallet.html', {
        baseLic,
        licList,
        user,
        ops,
        userList,
        stop: charge ? false: (roundModel.status == 1 ? false : true),
        charge,
        specBalance
    });
}

exports.send = async (req, res) => {
    if (req.body.text == '')
        req.body.text = 'Без комментария'

    if (req.body.responser == 'Всем') {
        let sender = req.session.user.login,
            amount = req.body.amount;
            text = req.body.text;
            type = req.body.liclist;
    
        let senderUser = await User.find(sender),
            responsersUser = await User.findAll();


        if (await senderUser.Balance() >= amount * responsersUser.length && amount > 0) {
            for( let i=0; i<responsersUser.length; i++) {
                if (responsersUser[i].login != senderUser.login) {
                    let operation = new Ops(sender, responsersUser[i].login, amount, text, type);

                    operation = await operation.save();
                    senderUser.Ops = operation;
                    await senderUser.updateDB();
                    responsersUser[i].Ops = operation;
                    await responsersUser[i].updateDB();
                }
            }          
        }

        res.redirect('/wallet')
    } else {
        let sender = req.session.user.login,
            responser = req.body.responser,
            amount = req.body.amount,
            text = req.body.text;
            type = req.body.liclist;
    
        let operation = new Ops(sender, responser, amount, text, type),
            senderUser = await User.find(sender),
            responserUser = await User.find(responser);

        if (amount > 0 && await senderUser.Balance() >= amount) {
            operation = await operation.save();
            senderUser.Ops = operation;
            senderUser.updateDB();
            responserUser.Ops = operation;
            responserUser.updateDB();
        }
        
        res.redirect('/wallet');
    }
}