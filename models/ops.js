const opsDB = require('../server').opsDB;
const roundModel = require('../models/round');

class Operations {
    constructor(sender, responser, amount, text){
        this.sender = sender;
        this.responser = responser;
        this.amount = amount;
        this.text = text;
        this.date = new Date();
        this.round = roundModel.getRound()
    }

    async save() {
        await opsDB.insert({
            sender: this.sender,
            responser: this.responser,
            amount: this.amount,
            text:  this.text,
            date: this.date,
            round: this.round
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

    static async find() {
        //opsDB.find({}).
        return null;
    }

    static async findAll() {
        return new Promise( (res, rej) => {
            opsDB.find({}).sort({date:-1}).exec((err, ops) => {
                res(ops)
            });
        })
    }
}

module.exports.Operations = Operations;