const userDB = require('../server').userDB;
const config = require('../config');

class User {
    constructor(login, pass, ops, balance, name, lastname) {
        this.login = login;
        this.pass = pass;
        this.ops = ops || []
        this.balance = balance || 0;
        this.name = name || '';
        this.lastname = lastname || '';
    }

    set Ops(item) {
        if (item.sender == this.login)
            this.balance = +this.balance - item.amount;
        else  
            this.balance = +this.balance + Number(item.amount);

        this.ops.push(item._id);
    }

    async updateDB(){
        await userDB.update({
            login: this.login
        }, {
            login: this.login, 
            pass: this.pass, 
            balance: this.balance,
            ops: this.ops,
            name: this.name,
            lastname: this.lastname
        }, {}, (err, replaced)=>{})
    }

    static async find(login){
        return new Promise((res, rej) => {
            userDB.find({login: login}, (err, uD) => {
                if (uD.length>0) {
                    uD = uD[0];
                    let user = new User(uD.login, uD.pass, uD.ops, uD.balance, uD.name, uD.lastname);
                    res(user);
                }
                else 
                    res(null);
            });
        }) 
    }
    static async findAll() {
        return new Promise((res, rej) => {
            userDB.find({}, (err, uDs) => {
                let users = [];

                for (let i=0; i<uDs.length; i++) {
                    users.push(new User(uD[i].login, uD[i].pass, uD[i].ops, uD[i].balance, uD[i].name, uD[i].lastname))
                }

                res(users)
            });
        });
    }

    static async getUserList(without) {
        return new Promise((res, rej) => {
            userDB.find({}, (err, uDs) => {
                let userList = [];

                for (let i=0; i<uDs.length; i++) {
                    if (uDs[i].login != without)
                    userList.push(uDs[i].login)
                }
                
                res(userList)
            });
        });
    }

    static async getAccessableLogins() {
        let loginList = [];

        for (let i=0; i<config.tables.length; i++) {
            for (let j=0; j<config.projectGoups.length; j++) {
                loginList.push(config.tables[i]+config.projectGoups[j]);
            }
        }

        let regedUsers = await User.getUserList(null);
        for (let i=0; i<loginList.length; i++) {
            for (let j=0; j<regedUsers.length; j++) {
                if (loginList[i] == regedUsers[j]) {
                    loginList.splice(loginList.indexOf(loginList[i]),1)
                    --i;
                }
            }
        }
        
        return loginList;
    }

    async save(){
        await userDB.insert({
            login: this.login, 
            pass: this.pass, 
            balance: this.balance,
            ops: this.ops,
            name: this.name,
            lastname: this.lastname
        }, (err, item) => {})   
    }

    async verify(pass) {
        if (this.pass === pass)
            return true
        else
            return false
    }
}

module.exports.User = User;