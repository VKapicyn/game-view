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
    } else if (req.sessionID == req.session.user.session && req.session.user.login == 'Admin') {
        next()
    } else {
        return;
    }
}