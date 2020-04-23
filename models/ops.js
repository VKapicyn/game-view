const Datastore = require('nedb');
let opsDB = new Datastore({filename: 'operations'});
opsDB.loadDatabase();
//const roundModel = require('../models/round');

class Operations {
    constructor(_id, sender, responser, amount, text, count, type){
        this._id = _id || `f${(~~(Math.random()*1e8)).toString(16)}`;;
        this.sender = sender;
        this.responser = responser;
        this.amount = amount;
        this.text = text;
        this.count = count || 1;
        this.date = new Date();
        this.type = type || 'Другое';
        this.round = 1;
    }

    async save() {
        return new Promise((res, rej) => {
            opsDB.insert({
                _id: this._id,
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

    async updateOpsDB(sender2, responser2){
        return new Promise((res, rej)=>{
            opsDB.update({
                _id: this._id,
            }, {
                _id: this._id,
                sender: sender2,
                responser: responser2,
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

    static async findById(id){
        return new Promise((res, rej) => {
            opsDB.find({_id: id}, (err, uD) => {
                if (uD.length>0) {
                    uD = uD[0];
                    let op = new Operations(uD._id, uD.sender, uD.responser, uD.amount, uD.text, uD.count, uD.date, uD.round, uD.type);
                    res(op);
                }
                else 
                    res(null);
            });
        }) 
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