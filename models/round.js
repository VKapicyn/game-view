let Round = {};

Round.status = 1;
Round.round = 1;

exports.getRound = () => {
    return Round.round;
}

exports.nextRound = () => {
    ++Round.round;
    return Round.round;
}

module.exports.Round = Round