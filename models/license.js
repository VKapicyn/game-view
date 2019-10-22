const Round = require('./round');
const licenseDB = require('../server').licenseDB;

class License{
    constructor(name, opsTypes, sentence, sub, subsidy, objectsCanBuy, objectsCanSell){
        this.name = name || '';
        this.sub = sub || '';
        this.subsidy = subsidy || false;
        this.objectsCanBuy = objectsCanBuy || [];
        this.objectsCanSell = objectsCanSell || []; 
        this.opsTypes = opsTypes || [];
        this.sentence = sentence || [];
    }

    async toOffer(login, price) {
        this.sentence.map(sent => {
            if (sent.login==login && sent.round == Round.getRound())
                return;
        })

        this.sentence.push({login:login, status: false, price: price, round: Round.getRound()});
        await this.updateDB();
    }

    async save() {
        new Promise((res, rej) => {
            licenseDB.insert({
                subsidy: this.subsidy,
                objectsCanBuy: this.objectsCanBuy,
                objectsCanSell: this.objectsCanSell,
                name: this.name, 
                sub: this.sub,
                opsTypes: this.opsTypes, 
                sentence: this.sentence
            }, (err, item) => {res(item)}) 
        });
    }

    async updateDB() {
        return new Promise((res, rej) => {
            licenseDB.update({
                name: this.name
            }, {
                name: this.name, 
                sub: this.sub,
                opsTypes: this.opsTypes, 
                sentence: this.sentence
            }, {}, (err, replaced)=>{res(replaced)})
        });
    }

    static async acceptOffer(login, name) {
        return new Promise((res, rej) => {
            licenseDB.find({name: name}, async (err, license) =>{
                license = license[0];

                for (let j=0; j<license.sentence.length; j++){
                    if (license.sentence[j].login == login && license.sentence[j].round == Round.getRound()) {
                        license.sentence[j].status = true;

                        await (new License(license.name, license.opsTypes, license.sentence, license.sub, license.subsidy, license.objectsCanBuy, license.objectsCanSell)).updateDB();
                        break;
                    }
                }

                res(true);
            });
        });
    }

    static async getAllOffersForUser(login) {
        return new Promise((res, rej) => {
            licenseDB.find({}, (err, licenses) => {
                let userLicensesOffers = [];
                
                for (let i=0; i<licenses.length; i++){
                    for (let j=0; j<licenses[i].sentence.length; j++){
                        if (licenses[i].sentence[j].login == login && !licenses[i].sentence[j].status && licenses[i].sentence[j].round == Round.getRound()) {
                            userLicensesOffers.push({name: licenses[i].name, price: licenses[i].sentence[j].price})
                        }
                    }
                }

                res(userLicensesOffers);
            })
        });
    }

    static async getLisense(name) {
        return new Promise((res, rej) => {
            licenseDB.find({name: name}, (err, license) =>{
                res(new License(license[0].name, license[0].opsTypes, license[0].sentence, license[0].sub,  license[0].subsidy, license[0].objectsCanBuy, license[0].objectsCanSell));
            });
        })
    }

    static async findAll() {
        return new Promise((res, rej) => {
            licenseDB.find({}, (err, lics) => {
                res(lics)
            })
        })
    }

    static async getAllTypes() {
        let allLics = await License.findAll(), 
            result = [];

        allLics.map(x => {
            result.push(x.name);
        });
        return result;
    }

    static async find(name) {
        return new Promise((res, rej) => {
            licenseDB.find({name: name}, (err, lics) => {
                if (lics.length>0)
                    res(lics[0])
                else
                    res(null)
            })
        })
    }
}

module.exports.License = License;