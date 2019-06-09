const config = require('./config');

exports.isReged = (req, res, next) => {
    if (req.session.user == undefined) {
        res.send('<h1>Авторизуйтесь!</h1>');
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