const config = require('./config');
const Round = require('./models/round');
const User = require('./models/user').User;

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

exports.isPremium = async (req, res, next) => {
    if (req.session.user == undefined) {
        return;
    } else if (req.sessionID == req.session.user.session) {
        let flag1 = false;
        config.adminLogins.map( (admin => {
            if (req.session.user.login == admin)
                flag1 = true;
        }))

        let flag2 = false,
            usr = await User.find(req.session.user.login);

        if (usr.permission){
            console.log(usr.permission)
            if (usr.permission[Round.getRound().toString()])
                flag2 = true;
        }


        if (flag1 || flag2) {
            next();
        } else {
            res.render('pre.html', {round: Round.getRound()})
        }

    } else {
        res.render('pre.html',{round: Round.getRound()})
    }
}