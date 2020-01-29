const Round = require('../models/round');
const Ops = require('../models/ops').Operations; 
const Credit = require('../models/credit').Credit;
const Advert = require('../models/advert').Advert;
const License = require('../models/license').License;
const User = require('../models/user').User;
const BlockChain = require('../models/blockChain').BlockChain;

exports.txs = async (req, res) => {
    res.json(await Ops.findAll())
}

exports.status = async (req, res) => {
    let round = await Round.getRound(),
        status = Round.Round.status;

    res.json({status, round});
}

exports.credits = async (req, res) => {
    res.json(await Credit.findAll());
}

exports.adverts = async (req, res) => {
    res.json(await Advert.findAll());
}

exports.hasLic = async (req, res) => {
    let lics = await License.findAll();
    let flag = false;
    lics.map(lic => {
        if ((lic.name[0]+lic.name[1]).toUpperCase() == req.body.lic) {
            lic.sentence.map(sent => {
                if (sent.login == req.body.login && sent.status && sent.round == Round.getRound()) {
                    flag = true
                }
            })
        }
    })
    res.json(flag)
}
exports.getLic = async (req, res) => {
    let lics = await License.findAll();
    let result = [];
    lics.map(lic => {
        result.push((lic.name[0]+lic.name[1]).toUpperCase());
    })
    res.send(result);
}
exports.getLogins = async (req, res) => {
    res.send(await User.getUserList());
}

exports.getMyLogin = async (req, res) => {
    let usr;
    try{
        usr = req.session.user.login
    } catch (e) {usr = null}
    res.json({usr})
}

exports.getLogs = async (req, res) => {
    res.json(await BlockChain.getAll())
}