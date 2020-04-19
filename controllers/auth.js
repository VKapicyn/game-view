const User = require('../models/user').User;
const License = require('../models/license').License;
const Ops = require('../models/ops').Operations;
const config = require('../config');
const Round = require('../models/round');
const userDB = require('../server').userDB;
const nodemailer = require("nodemailer");

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

    console.log(req.body.login, user)
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
    const login = await User.getAccessableLogins();

    let regedUsers = await User.getUserList(null);
    console.log(regedUsers);
   
    let err = null,
        isReged = await User.isReged({email: req.body.email}),
        isRegedLogin = await User.find(login);

    req.body.email.replace(' ','');
    err = (req.body.pass !== '' && req.body.pass === req.body.pass1 && req.body.pass.length>5) ? err : 'Некорректный пароль или пароли не совпадают';
    err = req.body.name ? err : 'Некорректное имя';
    err = req.body.lastname ? err : 'Некорректное второе имя';
    err = req.body.email.match(emailPattern) ? err : 'Некорректный email';
    err = isReged ? 'Пользователь с таким email уже зарегистрирован' : err;
    //err = login ? 'Регистрация недоступна, превышен лимит игроков' : err;
    err = isRegedLogin ? 'Превыше лимит запросов на регистрацию, попробуйте еще раз через 1 минуту. При потворении ошибки - обратитесь к организаторам игры.' : err;

    if (!isReged && err == null && req.body.login !== '') {
        
        let user = new User(login, req.body.pass);
            user.name = req.body.name;
            user.lastname = req.body.lastname;
            user.email = req.body.email;
            user.balance = 1000;

            let regDate = Date.now();
            if (new Date(regDate).getHours() < 5) {
                regDate = new Date((Number(new Date(regDate).getTime())-86400000));
            }
            regDate = new Date(regDate).setHours(5);
            regDate = new Date(regDate).setMinutes(0);
            regDate = new Date(regDate).setSeconds(0);

            user.regdate = new Date(regDate).getTime();

            hashCode = function(s) {
                var h = 0, l = s.length, i = 0;
                if ( l > 0 )
                    while (i < l)
                        h = (h << 5) - h + s.charCodeAt(i++) | 0;
                return Math.abs(h);
            };
            user.statusVerification = await hashCode((req.body.name+Date.now()).toString());

            let transporter = nodemailer.createTransport({
                host: config.host,
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                  user: config.sentEmail,
                  pass: config.sentPass
                }
            });
            await transporter.sendMail({
                from: config.sentEmail,
                to: user.email,
                subject: "Подтверждение почты на сайте",
                html: user.name+", здравствуйте!<br><br>Перейдите по ссылке ниже, чтобы получить доступ ко всем функциям нашего сайта"+
                "<br><br><a class='btn btn-primary'"+
                "href='"+config.domen+"verification/"+user.statusVerification+"'>Нажмите сюда, чтобы подтвердить почту</a>"
            });

        await user.save();
        
        user.updateDB();

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
    try{
        if (!req.session.user.login)
            throw new Error('Нет такого логина')  
        let user = await User.find(req.session.user.login);
        if (!user)
            throw new Error('Нет такого юзера')
        res.redirect('/')
    } catch(e) {
        res.render('reg.html', {
            secretKey: config.secretKey
        })
    }

}

exports.getRegPrjctPage = async (req, res) => {
    let logins = await User.getProjectLogins();
    res.render('regPrjct.html', {logins});
}

exports.getMainPage = async (req, res) => {
    let login = req.session.user.login;

    let user = await User.find(login);

    if (user) {
        balance = await user.Balance()
    
        res.render('main.html', {user, balance});
    } else
        res.redirect('reg')
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

exports.emailVerification = async (req, res) => {
    const user = await User.find(req.session.user.login);
    const verification = req.params.code;
    if(user.statusVerification == verification) {
        console.log("VERIFIED!");
        user.status = 1;
        await user.updateDB();
        res.redirect('/wallet');
    } else {
        res.redirect('/reg');
    }
}