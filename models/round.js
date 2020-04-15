const rounDB = require('../server').roundDB;
let Round = {};

Round.status = 1;
Round.round = 1;

exports.getRound = () => {
    return Round.round;
}

exports.nextRound = async () => {
    await exports.update(Round.round, (1+Round.round))
    ++Round.round;
    return Round.round;
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
    
    
    /*return new Promise((res, rej) => {
        rounDB.find({}, (err, item) => {
            Round.round = item[0].round;
            res(Round.round)
        });
    })*/
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