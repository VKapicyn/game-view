const User = require('../models/user').User;
const License = require('../models/license').License;
const Round = require('../models/round');
const Ops = require('../models/ops').Operations;
const Credit = require('../models/credit').Credit;
const Subsidy = require('../models/subsidy').Subsidy;
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

    res.render('adminLicense.html', {lics, users, round, objects: config.objects})
}

exports.repayment = async (req, res) => {
    let responser = config.adminLogins[0],
        round = req.body.round;

    let userCredits = await Credit.findAll();
    let responserUser = await User.find(responser);

    for (let i=0; i<userCredits.length; i++) {
        let operation = new Ops(userCredits[i].login, responser, Math.round(userCredits[i].amount*(+100+config.bankProcent))/100, 'Возврат кредита', 'Взыскание'),
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

exports.subsidyRepayment = async (req, res) => {
    let responser = config.adminLogins[0],
        round = req.body.round;

    let userSubsidy = await Subsidy.findAll();
    let responserUser = await User.find(responser);

    for (let i=0; i<userSubsidy.length; i++) {
        let procent = 0;
        let ostatok = 0;
        let itog = 0;

        let operation = new Ops(userSubsidy[i].login, responser, itog, 'Возврат cубсидии', 'Взыскание'),
            senderUser = await User.find(userSubsidy[i].login);
        
        if (!userSubsidy[i].status && userSubsidy[i].round === Number(round)) {
            let subsidy = await Subsidy.findOne(userSubsidy[i].login, userSubsidy[i].amount, userSubsidy[i].round);
            operation = await operation.save();
            senderUser.Ops = operation;
            senderUser.updateDB();
            responserUser.Ops = operation;
            responserUser.updateDB();
            subsidy.updateDB(1);
        } else continue;
    }

    res.redirect('/admin/subsidy');
}

exports.getCreditPage = async (req, res) => {
    let credits = await Credit.findAll();
    let rounds = await Round.getRoundList();
    let round = rounds[rounds.length-1];
    credits.sort((a, b) => a.round > b.round ? -1 : 1)

    res.render('adminCredit.html', {credits, round})
}
exports.getSubsidyPage = async (req, res) => {
    let subsidy = await Subsidy.findAll();
    let rounds = await Round.getRoundList();
    let round = rounds[rounds.length-1];
    subsidy.sort((a, b) => a.round > b.round ? -1 : 1)

    res.render('adminSubsidy.html', {subsidy, round})
}

exports.createLicense = async (req, res) => {
    let licName = req.body.licname,
        subsidy = req.body.subsidy,
        objectsCanBuy = req.body.tobuy,
        objectsCanSell = req.body.tosell,
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

    let lic = new License(licName, opsMass, [], sub, subsidy, objectsCanBuy, objectsCanSell);
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