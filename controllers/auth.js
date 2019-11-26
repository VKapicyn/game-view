const User = require('../models/user').User;
const License = require('../models/license').License;
const Ops = require('../models/ops').Operations;
const config = require('../config');
const Round = require('../models/round');

exports.logout = (req, res) => {
    delete req.session.user;
    res.redirect('/');
}

exports.login = async (req, res) => {
    let user = null;
    if (req.body.usertype == 'prjct')
        user = await User.find(req.body.login);
    else
        user = await User.findByEmail(req.body.login);

    if (user == null) {
        res.render('err.html', {err: 'Некорректный логин', url: '/'})
        return;
    }

    if (user.verify(req.body.pass) && req.body.login.length>=2) {
        req.session.user = {id: user._id, login: user.login, session: req.sessionID}
        req.session.save();
        res.redirect('/wallet');
    } else {
        res.render('err.html', {err: 'Некорректный логин или пароль', url: '/'})
    } 
}

exports.setUser = async (req, res) => {
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    let logins = await User.getAccessableLogins(),
        err = null,
        isReged = await User.isReged({email: req.body.email});
    err = (req.body.pass !== '' && req.body.pass === req.body.pass1 && req.body.pass.length>5) ? err : 'Некорректный пароль или пароли не совпадают';
    err = req.body.name ? err : 'Некорректное имя';
    err = req.body.lastname ? err : 'Некорректная фамилия';
    err = req.body.email.match(emailPattern) ? err : 'Некорректный email';
    err = isReged ? 'Пользователь с таким email уже зарегистрирован' : err;
    
    if (!isReged && err == null && req.body.login !== '') {
        let user = new User(logins[0], req.body.pass);
            user.name = req.body.name;
            user.lastname = req.body.lastname;
            user.email = req.body.email;
            
        await user.save();
        
    user.updateDB()

        req.session.user = {id: user._id, login: user.login, session: req.sessionID}
        req.session.save();
        res.redirect('/wallet');
    } else {
        res.render('err.html', {err, url: '/reg'})
    }
}

exports.setPrjct = async (req, res) => {
    let isReged = await User.find(req.body.login);

    if (isReged == null) {
        let user = new User(req.body.login, req.body.pass);
            user.name = req.body.name;

        await user.save();

        req.session.user = {id: user._id, login: user.login, session: req.sessionID}
        req.session.save();
        res.redirect('/wallet');
    } else {
        res.redirect('/reg');
    }
}

exports.getRegPage = async (req, res) => {
    res.render('reg.html');
}

exports.getRegPrjctPage = async (req, res) => {
    let logins = await User.getProjectLogins();
    res.render('regPrjct.html', {logins});
}

exports.getMainPage = async (req, res) => {
    let login = req.session.user.login;

    let user = await User.find(login),
        offLic = await License.getAllOffersForUser(login),
        actualLic = await User.getActualLic(login),
        historyLic = await User.getLicHistory(login),
        balance = await user.Balance(),
        round = Round.getRound();
        startLic = await License.getAllOffersForUser(login);
        acceptPrice = startLic.length>0 ? startLic[0].price: null;
    
    res.render('main.html', {user, offLic, actualLic, historyLic, defPrice: config.priceOfExtension, acceptPrice, round, balance});
}

exports.baseRoute = async (req, res) => {
    if (req.session.user != undefined) 
    {
        if (req.sessionID == req.session.user.session) {
            await exports.getMainPage(req, res)
        }
    }
    else
        res.render('main.html', {user: null});
}

exports.buyLic = async (req, res) => {
    let login = req.session.user.login,
        user = await User.find(login),
        lic = await License.getAllOffersForUser(login);

    if (await oplataLic(user, req.body.licName, lic[0].price)) {
        await user.acceptLicense(req.body.licName);
    }

    res.send('ok')
}

exports.sellLic = async (req, res) => {
    let login = req.session.user.login,
        user = await User.find(login);

    await user.burnLicense(req.body.licName);
    res.redirect('/')
}

exports.extend = async (req, res) => {
    let login = req.session.user.login,
        user = await User.find(login);
  
    if (await oplataLic(user, req.body.licName, config.priceOfExtension)) {
        await user.toExtend(req.body.licName);
    }

    res.redirect('/')
}

exports.setFio = async (req, res) => {
    let user = await User.find(req.session.user.login);

    if (req.body.Imya) 
        user.name = req.body.Imya;

    if (req.body.Familia)
        user.lastname = req.body.Familia;

    user.updateDB()
    res.redirect('/');
}

async function oplataLic(senderUser, licName, amount) {
    let responser = config.adminLogins[0],
    text = `Оплата лицнзии "${licName}"`;
    type = `Покупка лицензии`;

    let operation = new Ops(senderUser.login, responser, amount, text, type)
        responserUser = await User.find(responser);

    if (amount > 0 && await senderUser.Balance() >= amount) {
        operation = await operation.save();
        senderUser.Ops = operation;
        await senderUser.updateDB();
        await User.find(senderUser.name);
        responserUser.Ops = operation;
        await responserUser.updateDB();
        return true;
    } else {
        return false;
    }
}