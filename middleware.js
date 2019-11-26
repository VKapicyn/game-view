const config = require('./config');
const Round = require('./models/round');
const User = require('./models/user').User;
//const tokensDB = require('./server').tokensDB;

exports.isAPI = (req, res, next) => {
    //Round.getRound().toString()
    const tokens = {}
    tokens[1] = "VHsqXz"
    tokens[2] = "bOt1sM"
    tokens[3] = "tRoYJg"
    tokens[4] = "vfmuQp"
    tokens[5] = "BxcIoT"

    if (req.params.token == tokens[Number(Round.getRound())])
        next();
    else
        res.render('err.html', {err: 'Некорректный token доступа к данным.', url: '/api'});
}

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

exports.isPremium = async (req, res, next) => {
    if (req.session.user == undefined) {
        res.render('err.html', {err: 'Авторизуйтесь!', url: '/'});
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