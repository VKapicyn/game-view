const roundModel = require('../models/round');

//TODO: вынести на страницу админки
var round = 1;

exports.setRound = (req, res) => {
    console.log(req.params.command)
    switch(req.params.command) {
        case 'pause':
            roundModel.status = 0;
            res.send('Приостановлено')
            break;
        case 'start': 
            roundModel.status = 1;
            res.send('Возобновлено')
            break;
        case 'end':
            ++round;
            res.send('round');
            break;
        default:
            if (Number.isInteger(req.params.command))
                round = req.params.command;
            break;
    }
}

exports.getRound = () => {
    return round;
}

exports.getRoundJSON = (req, res) => {
    res.send(round);
}