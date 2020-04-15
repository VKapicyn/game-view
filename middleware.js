const config = require('./config');
const Round = require('./models/round');
const User = require('./models/user').User;

exports.isReged = (req, res, next) => {
    if (req.session.user == undefined) {
        res.render('err.html', {err: 'Авторизуйтесь!', url: '/'});
    } else if (req.sessionID == req.session.user.session) {
        next()
    }
    else res.redirect('/');
}

exports.isAdmin = (req, res, next) => {
    if (req.session.user == undefined) {
        return;
    } else if (req.sessionID == req.session.user.session) {
        let flag = false;
        config.adminLogins.map( (admin => {
            if (req.session.user.login == admin)
                flag = true;
        }))

        if (flag) 
            next();
    } else {
        return;
    }
}

exports.isPremium = (req, res, next) => {

}
