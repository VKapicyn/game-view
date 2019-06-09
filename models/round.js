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

exports.getRoundList = () => {
    let rounds = [];

    for (let i=1; i<=Round.round; i++) {
        rounds.push(i);
    }

    return rounds;
}

module.exports.Round = Round