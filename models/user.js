const Datastore = require('nedb');
let userDB = new Datastore({filename: 'users'});
userDB.loadDatabase();
const config = require('../config');

class User {
    constructor(login, pass, ops, balance, name, lastname, licenses, email, permission, regdate, status, statusVerification,
    emailSent, dayPlus, weekPlus, monthPlus, place) {
        this.login = login;
        this.pass = pass;
        this.ops = ops || []
        this.balance = balance || 0;
        this.name = name || '';
        this.lastname = lastname || '';
        this.licenses = licenses || [];
        this.email = email || '';
        this.permission = permission || {};
        this.regdate = regdate || 0;
        this.status = status || 0;
        this.statusVerification = statusVerification || 0;
        this.emailSent = emailSent || 0;
        this.dayPlus = dayPlus || 0;
        this.weekPlus = weekPlus || 0;
        this.monthPlus = monthPlus || 0;
        this.place = place || 0;
    }

    set Ops(item) {
        console.log(item);
        if (item.sender == this.login) {
            this.balance = +this.balance - Number(item.amount);
        }
        else  
            this.balance = +this.balance + Number(item.amount);

        this.ops.push(item._id);
    }

    async updateDB(){
        return new Promise((res, rej)=>{
            userDB.update({
                login: this.login
            }, {
                login: this.login, 
                pass: this.pass, 
                balance: this.balance,
                ops: this.ops,
                name: this.name,
                lastname: this.lastname,
                licenses: this.licenses,
                email: this.email,
                permission: this.permission,
                regdate: this.regdate,
                status: this.status,
                statusVerification: this.statusVerification,
                emailSent: this.emailSent,
                dayPlus: this.dayPlus,
                weekPlus: this.weekPlus,
                monthPlus: this.monthPlus,
                place: this.place
            }, {}, (err, replaced)=>{
                res(replaced)
            })
            
        })
    }

    async updateOne(login1, login2){
        return new Promise((res, rej)=>{ 
            userDB.update({
                login: login1
            }, {
                login: login2, 
                pass: this.pass, 
                balance: this.balance,
                ops: this.ops,
                name: this.name,
                lastname: this.lastname,
                licenses: this.licenses,
                email: this.email,
                permission: this.permission,
                regdate: this.regdate,
                status: 1,
                statusVerification: this.statusVerification,
                emailSent: this.emailSent,
                dayPlus: this.dayPlus,
                weekPlus: this.weekPlus,
                monthPlus: this.monthPlus,
                place: this.place
            }, {}, (err, replaced)=>{
                res(replaced)
            })
        })
    }

    async updateBalance(login, balance){
        return new Promise((res, rej)=>{ 
            userDB.update({
                login: login
            }, {
                login: this.login, 
                pass: this.pass, 
                balance: balance,
                ops: this.ops,
                name: this.name,
                lastname: this.lastname,
                licenses: this.licenses,
                email: this.email,
                permission: this.permission,
                regdate: this.regdate,
                status: this.status,
                statusVerification: this.statusVerification,
                emailSent: this.emailSent,
                dayPlus: this.dayPlus,
                weekPlus: this.weekPlus,
                monthPlus: this.monthPlus,
                place: this.place
            }, {}, (err, replaced)=>{
                res(replaced)
            })
        })
    }

    async updateProgress(login, day, week, month){
        return new Promise((res, rej)=>{ 
            userDB.update({
                login: login
            }, {
                login: this.login, 
                pass: this.pass, 
                balance: this.balance,
                ops: this.ops,
                name: this.name,
                lastname: this.lastname,
                licenses: this.licenses,
                email: this.email,
                permission: this.permission,
                regdate: this.regdate,
                status: this.status,
                statusVerification: this.statusVerification,
                emailSent: this.emailSent,
                dayPlus: day,
                weekPlus: week,
                monthPlus: month,
                place: this.place
            }, {}, (err, replaced)=>{
                res(replaced)
            })
        })
    }

    async updatePlace(login, place){
        return new Promise((res, rej)=>{ 
            userDB.update({
                login: login
            }, {
                login: this.login, 
                pass: this.pass, 
                balance: this.balance,
                ops: this.ops,
                name: this.name,
                lastname: this.lastname,
                licenses: this.licenses,
                email: this.email,
                permission: this.permission,
                regdate: this.regdate,
                status: this.status,
                statusVerification: this.statusVerification,
                emailSent: this.emailSent,
                dayPlus: this.day,
                weekPlus: this.week,
                monthPlus: this.month,
                place: place
            }, {}, (err, replaced)=>{
                res(replaced)
            })
        })
    }

    async clearOps(login){
        return new Promise((res, rej)=>{ 
            userDB.update({
                login: login
            }, {
                login: this.login, 
                pass: this.pass, 
                balance: 1000,
                ops: this.ops,
                name: this.name,
                lastname: this.lastname,
                licenses: this.licenses,
                email: this.email,
                permission: this.permission,
                regdate: Date.now(),
                status: this.status,
                statusVerification: this.statusVerification,
                emailSent: this.emailSent,
                dayPlus: this.dayPlus,
                weekPlus: this.weekPlus,
                monthPlus: this.monthPlus,
                place: this.place
            }, {}, (err, replaced)=>{
                res(replaced)
            })
        })
    }
    
    async deleteOne(login){
        return new Promise((res, rej)=>{ 
            userDB.remove({
                login: login
            })
        })
    }

    async burnLicense(){
        for (let i=0; i<this.licenses.length; i++) {
            if (this.licenses[i].round == Round.getRound() && this.licenses[i].status == true){
                this.licenses[i].status = false;
                await this.updateDB();
                break;
            }
        }
    }

    async acceptLicense(name) {
        this.licenses.push({name: name, round: Round.getRound(), status: true})
        await this.updateDB();
        await License.acceptOffer(this.login, name)
    }

    async toExtend(name) {
        this.licenses.map( lic => {
            if (lic.name == name && lic.round == (Round.getRound()-1))
                lic.status = false;
        });
        this.licenses.push({name: name, round: Round.getRound(), status: true})
        await this.updateDB();
    }

    static async isReged(email) {
        return new Promise((resolve, reject) => {
            userDB.find(email, (err, uD) => {
                if (uD.length>0) {
                    resolve(true);
                }
                else 
                    resolve(false);
            });
        })
    }

    static async findByEmail(email){
        return new Promise((res, rej) => {
            userDB.find({email: email}, (err, uD) => {
                if (uD.length>0) {
                    uD = uD[0];
                    let user = new User(uD.login, uD.pass, uD.ops, uD.balance, uD.name, uD.lastname, uD.licenses, uD.email, uD.permission,
                        uD.regdate, uD.status, uD.statusVerification, uD.emailSent, uD.dayPlus, uD.weekPlus, uD.monthPlus, uD.place);
                    res(user);
                }
                else 
                    res(null);
            });
        }) 
    }

    static async find(login){
        return new Promise((res, rej) => {
            userDB.find({login: login}, (err, uD) => {
                if (uD.length>0) {
                    uD = uD[0];
                    let user = new User(uD.login, uD.pass, uD.ops, uD.balance, uD.name, uD.lastname, uD.licenses, uD.email, uD.permission,
                        uD.regdate, uD.status, uD.statusVerification, uD.emailSent, uD.dayPlus, uD.weekPlus, uD.monthPlus, uD.place);
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
                    users.push(new User(uDs[i].login, uDs[i].pass, uDs[i].ops, uDs[i].balance, uDs[i].name, uDs[i].lastname, 
                        uDs[i].licenses, uDs[i].email, uDs[i].permission, uDs[i].regdate, uDs[i].status, uDs[i].statusVerification, 
                        uDs[i].emailSent, uDs[i].dayPlus, uDs[i].weekPlus, uDs[i].monthPlus, uDs[i].place))
                }

                res(users)
            });
        });
    }
    
    static async getActualLic(login, _round) {
        let round = _round || Round.getRound();
        let user = await User.find(login);

        let actualLic = null;
        user.licenses.map( lic => {
            if (lic.round == round && ((!_round && lic.status == true) || _round))
                actualLic = lic.name;
        });

        return actualLic;
    }

    static async getLicHistory(login) {
        let round = Round.getRound();
        let user = await User.find(login);

        let histlLic = [];
        user.licenses.map( lic => {
            if (lic.round < round || (lic.round == round && !lic.status))
                histlLic.push(lic);
        });

        return histlLic;
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

    static async getProjectLogins() {
        let loginList = config.newProjects;

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

    static async getAccessableLogins() {
        let i = 1;
        let login = "V0"+i;

        let regedUsers = await User.getUserList(null);
        while(regedUsers.indexOf(login) != -1) {
            if(i < 9) login = "V0"+ ++i;
            else login = "V"+ ++i;
        }
        return login.toString();
    }

    static async isProject(user) {
        let result = false;

        if(config.newProjects)
            for (let i=0; i<config.newProjects.length; i++) {
                if (user.login == config.newProjects[i] || user == config.newProjects[i]) {
                    result = true;
                    break;
                }
            }
        
        return result;
    }

    static async recalcBalances(ops, lic, __round) {
        let userList = await User.findAll();
        __round = __round === 'all' ? Round.getRound() : __round;

        if (lic != 'all') {
            for (let i=0; i<userList.length; i++) {
                if ((await User.getActualLic(userList[i].login, __round)) != lic) {
                    userList.splice(i, 1);
                    --i;
                }
            }
        }

        for (let i=0; i<userList.length; i++) {
            userList[i].balance = 0;
            for(let j=0; j<ops.length; j++) {
                if (ops[j].responser == userList[i].login)
                    userList[i].balance = +userList[i].balance + Number(ops[j].amount);
                if (ops[j].sender == userList[i].login)
                    userList[i].balance = +userList[i].balance - Number(ops[j].amount);
            }
        }
        

        return userList;
    }

    static removeAdmins(users) {
        for (let i=0; i<users.length; i++) {
            for(let j=0; j<config.adminLogins.length; j++) {
                if (users[i].login == config.adminLogins[j]) {
                    users.splice(i,1);
                    --i
                }   
            }
        }
        return users;
    }

    async save(){
        await userDB.insert({
            login: this.login,
            pass: this.pass, 
            balance: this.balance,
            ops: this.ops,
            name: this.name,
            lastname: this.lastname,
            licenses: this.licenses, 
            email: this.email, 
            permission: this.permission,
            regdate: this.regdate,
            status: this.status,
            statusVerification: this.statusVerification,
            emailSent: this.emailSent,
            dayPlus: this.dayPlus,
            weekPlus: this.weekPlus,
            monthPlus: this.monthPlus,
            place: this.place
        }, (err, item) => {})   
    }

    async verify(pass) {
        if (this.pass === pass)
            return true
        else
            return false
    }
}

module.exports.userDB = userDB;
module.exports.User = User;