const roundModel = require('../models/round');
const config = require('../config');

exports.setRound = async (req, res) => {
    switch(req.params.command) {
        case 'pause':
            roundModel.Round.status = 0;
            res.redirect('/admin/round')
            break;
        case 'start': 
            roundModel.startTimer()
            roundModel.Round.status = 1;
            res.redirect('/admin/round')
            break;
        case 'next':
            await roundModel.nextRound();
            res.redirect('/admin/round')
            break;
        case 'prev':
            await roundModel.prevRound();
            res.redirect('/admin/prev')
            break;
        default:
            if (Number.isInteger(req.params.command))
                round = req.params.command;
            break;
    }
}

exports.getRound = () => {
    return roundModel.getRound();
}

exports.getRoundJSON = (req, res) => {
    res.send(roundModel.getRound());
}

exports.timeNow = (req, res) => {
    res.json(roundModel.getTimeNow());
}

exports.timeEnd = (req, res) => {
    res.json(config.roundTime);
}