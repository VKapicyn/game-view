const Round = require('./round');
const SubsidyDB = require('../server').subsidyDB;
const config = require('../config');

class Subsidy{
    constructor(login, round, amount, status){
        this.login = login || '';
        this.round = round || 1;
        this.amount = amount || 0;
        this.status = status || 0;
    }

    static async getSubsidyLimit(user) {
        let rounds = await Round.getRoundList();
        let usrSubsidy = await Subsidy.findByRound(rounds[rounds.length-1]);
        let sum = 0;
        usrSubsidy.map(x => {
            if (x.login === user)
                sum += Number(x.amount);
        })

        return config.subsidyLimit - sum;
    }

    static async findOne(login, amount, round) {
        return new Promise((res, rej) => {
            SubsidyDB.find({login: login, amount: amount, round: round}, (err, credit) => {
                res(new Credit(credit[0].login, credit[0].round, credit[0].amount, credit[0].status));
            })
        });
    }

    static async findAll() {
        return new Promise((res, rej) => {
            SubsidyDB.find({}, (err, credits) => {
                res(credits);
            });
        });
    }

    static async findAllByRound(round) {
        return new Promise((res, rej) => {
            SubsidyDB.find({}, (err, credits) => {
                let response = {};
                for (let i=0; i<credits.length; i++) {
                    if (credits[i].round == round || !round) {
                        if (response[credits[i].login]) 
                            response[credits[i].login] = +response[credits[i].login] +Number(credits[i].amount);
                        else
                            response[credits[i].login] = Number(credits[i].amount);
                    }
                }

                var result = Object.keys(response).map(function(key) {
                    let obj = {};
                    obj[key] = response[key]
                    return obj;
                  });

                res(result);
            })
        });
    }

    static async findByRound(r) {
        return new Promise((res, rej) => {
            SubsidyDB.find({round: r}, (err, credits) => {
                res(credits);
            })
        })
    }

    async save() {
        return new Promise((res, rej) => {
            SubsidyDB.insert({
                login: this.login, 
                round: this.round, 
                amount: this.amount,
                status: this.status
            }, (err, item) => {res(item)}) 
        });
    }

    async updateDB(status) {
        return new Promise((res, rej) => {
            SubsidyDB.update({
                login: this.login,
                round: this.round, 
                amount: this.amount
            }, {
                login: this.login, 
                round: this.round, 
                amount: this.amount,
                status: status
            }, {}, (err, replaced)=>{res(replaced)})
        });
    }
}

module.exports.Subsidy = Subsidy;