const blockchainDB = require('../server').BlockChain;
const config = require('../config');

class BlockChain{
    constructor(time, author, action, data, round){
        this.time = time || null;
        this.author = author || '';
        this.action = action || '';
        this.data = data || '';
        this.round = round || '';
    }

    static async getAll() {
        return new Promise((res, rej) => {
            blockchainDB.find({}, (err, bch) => {
                bch.sort((a, b)=>{
                    return b.time - a.time; // reverse chronological order
                });
                res(bch);
            })
        })
    }

    static async getOne(action) {
        return new Promise((res, rej) => {
            blockchainDB.find({action}, (err, bch) => {
                bch.sort((a, b)=>{
                    return b.time - a.time; // reverse chronological order
                });
                res(bch);
            })
        })
    }

    async save() {
        return new Promise((res, rej) => {
            blockchainDB.insert({
                time: this.time,
                author: this.author,
                action: this.action,
                data: this.data,
                round: this.round
            }, (err, item) => {res(item)}) 
        });
    }
}

module.exports.BlockChain = BlockChain;