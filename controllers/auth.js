const User = require('../models/user').User;
const License = require('../models/License').License;
const Ops = require('../models/ops').Operations;
const config = require('../config');

exports.logout = (req, res) => {
    delete req.session.user;
    res.redirect('/');
}

exports.login = async (req, res) => {
    let user = await User.find(req.body.login);

    if (user == null) {
        res.redirect('/main/logerrlogin')
        return;
    }

    if (user.verify(req.body.pass)) {
        req.session.user = {id: user._id, login: user.login, session: req.sessionID}
        req.session.save();
        res.redirect('/wallet');
    } else {
        res.redirect('/main/logerrpass');
    } 
}

exports.setUser = async (req, res) => {
    let isReged = await User.find(req.body.login);

    if (isReged == null) {
        let user = new User(req.body.login, req.body.pass);
        await user.save();

        req.session.user = {id: user._id, login: user.login, session: req.sessionID}
        req.session.save();
        res.redirect('/wallet');
    } else {
        res.redirect('/main/regerr');
    }
}

exports.getRegPage = async (req, res) => {
    let logins = await User.getAccessableLogins();
    res.render('reg.html', {logins});
}

exports.getMainPage = async (req, res) => {
    let login = req.session.user.login;

    let user = await User.find(login),
        offLic = await License.getAllOffersForUser(login),
        actualLic = await User.getActualLic(login),
        historyLic = await User.getLicHistory(login);
    
    res.render('main.html', {user, offLic, actualLic, historyLic, defPrice: config.priceOfExtension});
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
    text = `Покупка ${licName}`;
    type = config.lic[0];

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