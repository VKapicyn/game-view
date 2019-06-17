const Round = require('../models/round');
const advertDB = require('../server').advertDB;

class Advert{
    constructor(author, offerType, predmetType, predmet, round, num, price , status, contrAgent){
        this.author = author;
        this.offerType = offerType;
        this.predmet = predmet;
        this.predmetType = predmetType;
        this.price = price;
        this.round = round || Round.getRound();
        this.num = num || 0;
        this.status = (status==null||status==undefined)? true: status;
        this.contrAgent = contrAgent || '';
    }

    static async getNewNum(){
        return new Promise((res, rej) => {
            advertDB.find({}, (err, items) => {
                res(items.length+1)
            })
        })
    }

    static async find(num){
        return new Promise( (res, rej) => {
            advertDB.findOne({num: Number(num)}, (err, item) => {
                let ad = new Advert(
                    item.author, 
                    item.offerType, 
                    item.predmetType, 
                    item.predmet, 
                    item.round, 
                    item.num, 
                    item.price, 
                    item.status, 
                    item.contrAgent)
                res(ad);
            })
        })
    }

    async save() {
        return new Promise(async (res, rej) => {
            advertDB.insert({
                num: await Advert.getNewNum(),
                author: this.author,
                offerType: this.offerType,
                predmet: this.predmet,
                predmetType: this.predmetType,
                price: this.price,
                round: this.round,
                status: this.status,
                contrAgent: this.contrAgent
            }, (err, item) => {res(item)})
        });
    }

    async updateDB() {
        return new Promise((res, rej)=>{ 
            advertDB.update({
                num: this.num
            }, {
                num: this.num,
                author: this.author,
                offerType: this.offerType,
                predmet: this.predmet,
                price: this.price,
                round: this.round,
                roundAc: this.roundAc,
                status: this.status,
                contrAgent: this.contrAgent
            }, {}, (err, replaced)=>{
                res(replaced)
            })
        })
    }

    static async getMyActiveAds(login) {
        return new Promise((res, rej) => {
            advertDB.find({author: login}, (err, items)=>{
                let _items = [];
                items.map( x => {
                    if (x.contrAgent == '' && x.status)
                        _items.push(x);
                })
                _items.sort((x, y )=>{return y.num-x.num})

                res(_items)
            });
        })
    }

    static async getActiveAds(without, predmet, buysell) {
        return new Promise((res, rej) => {
            let search = {};
            if (predmet!=null) {
                switch(predmet) {
                    case 'word': predmet = 'Слово'; break;
                    case 'letter': predmet = 'Буква'; break;
                    case 'package': predmet = 'Пакет'; break;
                }
                search.predmetType = predmet;
            }
            if (buysell!=null) {
                search.offerType = buysell;
            }

            advertDB.find(search, (err, items)=>{
                let _items = [];
                items.map( x => {
                    if (x.contrAgent == '' && x.status && x.author != without){
                        _items.push(x);
                    }
                })
                _items.sort((x, y ) => {return y.num - x.num})

                res(_items)
            });
        })
    }

    static async cancelMyAd(num, login) {
        return new Promise((res, rej) => {
            advertDB.findOne({num: Number(num)}, async (err, item) => {
                if (login == item.author) {
                    let ad = new Advert(
                        item.author, 
                        item.offerType, 
                        item.predmetType, 
                        item.predmet, 
                        item.round, 
                        item.num, 
                        item.price, 
                        false, 
                        item.contrAgent
                    )
                    if (item.contrAgent == '')
                        await ad.updateDB();
    
                    res(ad);
                } else res(null);
            })
        })
    }

    static async myObligation(login) {
        return new Promise( (res, rej)=> {
            advertDB.find({'$or': [{author: login, offerType: 'sel'}, {contrAgent: login, offerType: 'buy'}]}, (err, items)=> {
                let _items = [];
                items.map( x => {
                    if (x.contrAgent == login || (x.author == login && x.contrAgent != '')) {
                        if (x.round == Round.getRound())
                            _items.push({
                                actual: 1, 
                                responser: x.contrAgent == login ? x.author : x.contrAgent,
                                predmet: x.predmet
                            });
                        else
                            _items.push({
                                actual: 0, 
                                responser: x.contrAgent == login ? x.author : x.contrAgent,
                                predmet: x.predmet
                            });
                    }
                });
                _items.sort((x, y) => {return y.actual-x.actual});

                res(_items);
            });
        });
    }
}

module.exports.Advert = Advert;