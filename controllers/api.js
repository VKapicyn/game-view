const Round = require('../models/round');
const Ops = require('../models/ops').Operations; 
const Credit = require('../models/credit').Credit;
const Advert = require('../models/advert').Advert;

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