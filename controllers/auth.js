const User = require('../models/user').User;

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

exports.getMainPage = (req, res) => {
    res.render('main.html');
}

exports.baseRoute = async (req, res) => {
    if (req.session.user != undefined) 
    {
        if (req.sessionID == req.session.user.session) {
            let user = await User.find(req.session.user.login)
            res.render('main.html', {user});
        }
    }
    else
        res.render('main.html', {user: null});
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