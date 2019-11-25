const blockchainDB = require('../server').BlockChain;
const config = require('../config');

class BlockChain{
    constructor(time, author, action, data){
        this.time = time || null;
        this.author = author || '';
        this.action = action || '';
        this.data = data || '';
    }

    static async getAll() {
        return new Promise((res, rej) => {
            blockchainDB.find({}, (err, bch) => {
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
                data: this.data
            }, (err, item) => {res(item)}) 
        });
    }
}

module.exports.BlockChain = BlockChain;