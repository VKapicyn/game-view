const Round = require('../models/round');
const Ops = require('../models/ops').Operations; 
const Credit = require('../models/credit').Credit;
const Advert = require('../models/advert').Advert;
const User = require('../models/user').User;
const { parse } = require('json2csv');

exports.txs = async (req, res) => {
    if (req.params.type === 'json')
        res.json(await Ops.findAll());
    else{
        let array = parse(await Ops.findAll({dateFromat: true}))
        while(array.indexOf('\n')!==-1 || array.indexOf('"')!==-1) {
            array = array.replace('\n','<br>');
            array = array.replace('"','');
        }
        res.send(array)
    }
}

exports.status = async (req, res) => {
    let round = await Round.getRound(),
        status = Round.Round.status;

    if (req.params.type === 'json')
        res.json({status, round});
    else 
        res.send(`status,round<br>${status},${round}`)
}

exports.credits = async (req, res) => {
    if (req.params.type === 'json')
        res.json(await Credit.findAll());
    else{
        let array = parse(await Credit.findAll())
        while(array.indexOf('\n')!==-1 || array.indexOf('"')!==-1) {
            array = array.replace('\n','<br>');
            array = array.replace('"','');
        }
        res.send(array)
    }
}

exports.adverts = async (req, res) => {
    if (req.params.type === 'json')
        res.json(await Advert.findAll());
    else{
        let array = parse(await Advert.findAll())
        while(array.indexOf('\n')!==-1 || array.indexOf('"')!==-1) {
            array = array.replace('\n','<br>');
            array = array.replace('"','');
        }
        res.send(array)
    }
}

exports.getPage = async (req, res) => {
    res.render('api.html');
}

exports.getMyLogin = async (req, res) => {
    let usr;
    try{
        usr = req.session.user.login
    } catch (e) {usr = null};
    
    res.json({usr})
}

exports.getMyStatus = async (req, res) => {
    let usr;
    try{
        usr = req.session.user.login
    } catch (e) {usr = null};
    const user = await User.find(usr);
    let status = user.status;
    res.json({status});
}