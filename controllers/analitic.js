const User = require('../models/user').User;
const Ops = require('../models/ops').Operations;


exports.getPage = async (req, res) => {
    let users = await User.getUserList();
    let result = [];
    let round = req.body.round || 'all';
    let ops = await Ops.getByRound(round);

    for( let i=0; i<users.length; i++ ) {
        let txs = 0,
            volume = 0,
            netOne = new Set();
        for(let j=0; j<ops.length; j++) {
            if (ops[j].sender == users[i]) {
                ++txs;
                netOne.add(ops[j].responser);
                volume = +volume + Number(ops[j].amount);
            } 
            if (ops[j].responser == users[i])
                volume = +volume + Number(ops[j].amount); 
        }

        result.push({login: users[i], txs, volume, netOne: netOne.size, netTwo: '-'})
    }

    if (req.body.sort) {
        switch(req.body.sort) {
            case 'txs' : 
                result.sort((a, b) => a.txs > b.txs ? -1 : 1)
                break;
            case 'volume' : 
                result.sort((a, b) => a.volume > b.volume ? -1 : 1)
                break;
            case 'netOne' : 
                result.sort((a, b) => a.netOne > b.netOne ? -1 : 1)
                break;
            case 'netTwo' : 
                result.sort((a, b) => a.netTwo > b.netTwo ? -1 : 1)
                break;
        }
    }

    res.render('analitic.html', {users: result})
}

exports.getJsonData = (req, res) => {
    let data = [
        ['1','a'],
        ['1','a'],
        ['1','a'],
        ['1','a'],
        ['2','a'],
        ['2','a'],
        ['2','a'],
        ['2','b'],
        ['2','b'],
        ['3','b'],
        ['2','3'],
        ['1','3']
    ];
    res.json(data);
}