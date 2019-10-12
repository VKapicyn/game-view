const User = require('../models/user').User;
const License = require('../models/license').License;
const Round = require('../models/round');
const Ops = require('../models/ops').Operations;
const Credit = require('../models/credit').Credit;
const config = require('../config');

exports.getPage = async (req, res) => {
    let round = await Round.getRound(),
        status = Round.Round.status;

    res.render('admin.html', {round, status})
}

exports.isAdmin = (login) => {
    adminList = require('../config').adminLogins;
    let flag = false;
    adminList.map(admin => {
        if (admin == login)
            flag = true;
    });
    
    return flag;
}

exports.getLicensePage = async (req, res) => {
    let users = await User.findAll();
    let lics = await License.findAll();
    let round = Round.getRound();

    res.render('adminLicense.html', {lics, users, round})
}

exports.repayment = async (req, res) => {
    let responser = config.adminLogins[0],
        round = req.body.round;

    let userCredits = await Credit.findAll();
    let responserUser = await User.find(responser);

    for (let i=0; i<userCredits.length; i++) {
        let operation = new Ops(userCredits[i].login, responser, Math.round(userCredits[i].amount*110)/100, 'Возврат кредита', 'Взыскание'),
            senderUser = await User.find(userCredits[i].login);
        
        if (!userCredits[i].status && userCredits[i].round === Number(round)) {
            let credit = await Credit.findOne(userCredits[i].login, userCredits[i].amount, userCredits[i].round);
            operation = await operation.save();
            senderUser.Ops = operation;
            senderUser.updateDB();
            responserUser.Ops = operation;
            responserUser.updateDB();
            credit.updateDB(1);
        } else continue;
    }

    res.redirect('/admin/credits');
}

exports.getCreditPage = async (req, res) => {
    let credits = await Credit.findAll();
    let rounds = await Round.getRoundList();
    let round = rounds[rounds.length-1];
    credits.sort((a, b) => a.round > b.round ? -1 : 1)

    res.render('adminCredit.html', {credits, round})
}

exports.createLicense = async (req, res) => {
    let licName = req.body.licname,
        sub = req.body.sub,
        opsMass = [];
        i = 0;

    while (true) {
        let opsName = 'ops'+i;
        if (req.body[opsName] == undefined || req.body[opsName] == '') 
            break;

        opsMass.push(req.body[opsName]);
        ++i;
    }

    let lic = new License(licName, opsMass, [], sub);
        await lic.save()
    res.redirect('/admin/license');
}

exports.addOffer = async (req, res) => {
    let lic = {},
        login = req.body.user,
        price = req.body.price,
        licName = req.body.licname;

    lic = await License.getLisense(licName);
    await lic.toOffer(login, price);
    
    res.redirect('/admin/license');
}