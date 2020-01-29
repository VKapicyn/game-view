const rounDB = require('../server').roundDB;
const config = require('../config');
let Round = {};

Round.status = 1;
Round.round = 0;
Round.time = 0;

exports.getRound = () => {
    return Round.round;
}

exports.startTimer = () => {
    setTimeout( function  run() {
        if (Round.time < config.roundTime && Round.status == 1) {
            ++Round.time;
            setTimeout(run, 1000);
        }
    }, 1);
}

exports.nextRound = async () => {
    await exports.update(Round.round, (1+Round.round))
    ++Round.round;
    Round.time = 0;
    exports.startTimer();
    return Round.round;
}

exports.getTimeNow = () => {
    return Round.time;
}

exports.prevRound = async () => {
    if (Round.round>0) {
        await exports.update(Round.round, (Round.round-1))
        --Round.round;
    }
    return Round.round;
}

exports.getRoundList = () => {
    let rounds = [];

    for (let i=1; i<=Round.round; i++) {
        rounds.push(i);
    }

    return rounds;
}

exports.onLoad = async () => {
    return new Promise((res, rej) => {
        rounDB.find({}, (err, item) => {
            Round.round = item[0].round;
            res(Round.round)
        });
    })
}

exports.update = async (last, _new) => {
    return new Promise((res, rej)=>{ 
        rounDB.update({
            round: last
        }, {
            round: _new
        }, {}, (err, replaced)=>{res(replaced)})
    })
}

module.exports.Round = Round