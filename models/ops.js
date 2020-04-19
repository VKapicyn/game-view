const opsDB = require('../server').opsDB;
const roundModel = require('../models/round');

class Operations {
    constructor(sender, responser, amount, text, type, count){
        this.sender = sender;
        this.responser = responser;
        this.amount = amount;
        this.text = text;
        this.count = count || 1;
        this.date = new Date();
        this.type = type || 'Другое';
        this.round = roundModel.getRound()
    }

    async save() {
        return new Promise((res, rej) => {
            opsDB.insert({
                sender: this.sender,
                responser: this.responser,
                amount: this.amount,
                text:  this.text,
                count: this.count,
                date: this.date,
                round: this.round,
                type: this.type
            }, (err, item) => {res(item)})
        });
    }

    async updateDB(){
        return new Promise((res, rej)=>{
            userDB.update({
                sender: this.sender
            }, {
                sender: this.sender,
                responser: this.responser,
                amount: this.amount,
                text:  this.text,
                count: this.count,
                date: this.date,
                round: this.round,
                type: this.type
            }, {}, (err, replaced)=>{
                res(replaced)
            })
            
        })
    }

    static async getOpsByUser(login) {
        return new Promise( (res, rej) => {
            opsDB.find({'$or': [
                {sender: login},
                 {responser: login}
                ]})
            .sort({date: -1})
            .exec((err, item) => {
                res(item)
            });
        });
    }

    static async getOpsBySenderAndRound(login, round) {
        return new Promise( (res, rej) => {
            opsDB.find({'$and': [
                {sender: login},
                 {round: Number(round)}
                ]})
            .exec((err, item) => {
                res(item)
            });
        });
    }

    static async getByRound(round) {
        return new Promise( (res, req) => {
            let search = {};
            if (round != 'all')
                search = {round: Number(round)};

            opsDB.find(search, (err, items)=> {
                res(items);
            })
        })
    }

    static async find() {
        //opsDB.find({}).
        return null;
    }

    static async findAll(date) {
        return new Promise( (res, rej) => {
            opsDB.find({}).sort({date:-1}).exec((err, ops) => {
                if (date) {
                    ops.map(op => {
                        op.date = op.date.toLocaleString("ru-RU", {
                            second: 'numeric',
                            minute: 'numeric', 
                            hour: 'numeric',
                            day: 'numeric', 
                            month: 'numeric', 
                            year:'numeric'});
                    })
                }
                res(ops)
            });
        })
    }
}

module.exports.Operations = Operations;