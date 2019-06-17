const Advert = require('../models/advert').Advert;
const Round = require('../models/round');
const User = require('../models/user').User;
const Ops = require('../models/ops').Operations;

exports.getPage = async (req, res) => {
    let login = req.session.user.login;

    let myActiveAds = await Advert.getMyActiveAds(login),
        obligation = await Advert.myObligation(login),
        ads = await Advert.getActiveAds(login, null, null);

    res.render('board.html', {myActiveAds, obligation, ads});
}

exports.createAdv = async (req, res) => {
    actuals = await Advert.getMyActiveAds(req.session.user.login);

    if (actuals.length < 10 && isNumeric(req.body.fizPrice)) {
        let author = req.session.user.login,
            offertype = req.body.buysell,
            predmetType = req.body.predmet,
            fizPredmet = req.body.fizPredmet,
            fizPrice = req.body.fizPrice,
            num = await Advert.getNewNum();
        
        switch(predmetType) {
            case 'word': predmetType = 'Слово'; break;
            case 'letter': predmetType = 'Буква'; break;
            case 'package': predmetType = 'Пакет'; break;
        }

        if ( !(offertype=='buy' && fizPrice>(await(await User.find(author)).Balance())) ) {
            let adv = new Advert(
                author, 
                offertype, 
                predmetType, 
                fizPredmet, 
                null,
                num,
                fizPrice,
                true);

            await adv.save();
        }
    }
    res.redirect('/board')
}

exports.cancelAd = async (req, res) => {
    await Advert.cancelMyAd(req.params.num, req.session.user.login)
    res.redirect('/board');
}

exports.buyAd = async (req, res) => {
    let buyer = req.session.user.login,
        num = req.params.num;

    let ad = await Advert.find(num);

    let paied = await oplataAd(buyer, ad.author, ad)

    if (paied) {
        ad.contrAgent = buyer;
        ad.round = Round.getRound();
        await ad.updateDB();
    }
    
    res.redirect('/board')
}

exports.sellAd = async (req, res) => {
    let seller = req.session.user.login,
        num = req.params.num;

    let ad = await Advert.find(num);

    let paied = await oplataAd(ad.author, seller, ad);

    if (paied) {
        ad.contrAgent = seller;
        ad.round = Round.getRound();
        await ad.updateDB();
    }    

    res.redirect('/board')
}

exports.search = async (req, res) => {
    let predmet = req.query.predmet,
        buysell = req.query.buysell;

    let login = req.session.user.login;

    let myActiveAds = await Advert.getMyActiveAds(login),
        obligation = await Advert.myObligation(login),
        ads = await Advert.getActiveAds(login, predmet, buysell);

    res.render('board.html', {myActiveAds, obligation, ads});
}

function isNumeric(value) {
    return /^\d+$/.test(value);
}

async function oplataAd(sender, responser, ad) {
    let text = `Купля-продажа ( ${ad.predmet} )`;

    //TODO: переделать соответствии с лицензиями
    let type = ad.predmetType;
    /*switch(ad.predmetType) {
        case 'Слово': type = 'Сделка со словом'; break;
        case 'Буква': predmetType = 'Покупка буквы'; break;
        case 'Пакет': predmetType = 'Покупка пакета'; break;
    }*/

    let operation = new Ops(sender, responser, ad.price, text, type)
        responserUser = await User.find(responser),
        senderUser = await User.find(sender);

    if (ad.price > 0 && senderUser.balance >= ad.price) {
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