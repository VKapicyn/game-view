const Round = require('./round');
const creditDB = require('../server').creditDB;
const config = require('../config');

class Credit{
    constructor(login, round, amount, status){
        this.login = login || '';
        this.round = round || 1;
        this.amount = amount || 0;
        this.status = status || 0;
    }

    static async getCreditLimit(user) {
        let rounds = await Round.getRoundList();
        let usrCredits = await Credit.findByRound(rounds[rounds.length-1]);
        let sum = 0;
        usrCredits.map(x => {
            if (x.login === user)
                sum += Number(x.amount);
        })

        return config.creditLimit - sum;
    }

    static async findOne(login, amount, round) {
        return new Promise((res, rej) => {
            creditDB.find({login: login, amount: amount, round: round}, (err, credit) => {
                res(new Credit(credit[0].login, credit[0].round, credit[0].amount, credit[0].status));
            })
        });
    }

    static async findAll() {
        return new Promise((res, rej) => {
            creditDB.find({}, (err, credits) => {
                res(credits);
            })
        });
    }

    static async findByRound(r) {
        return new Promise((res, rej) => {
            creditDB.find({round: r}, (err, credits) => {
                res(credits);
            })
        })
    }

    async save() {
        return new Promise((res, rej) => {
            creditDB.insert({
                login: this.login, 
                round: this.round, 
                amount: this.amount,
                status: this.status
            }, (err, item) => {res(item)}) 
        });
    }

    async updateDB(status) {
        return new Promise((res, rej) => {
            creditDB.update({
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

module.exports.Credit = Credit;