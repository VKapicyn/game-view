const Datastore = require('nedb');
let userDB = new Datastore({filename: 'users'});
userDB.loadDatabase();
const config = require('../config');
const advertDB = require('../server').advertDB;
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: config.host,
    port: 465,
    secure: true,
    requireTLS: true,
    auth: {
      user: config.sentEmail,
      pass: config.sentPass
    }
});

class User {
    constructor(login, pass, ops, balance, name, lastname, licenses, email, permission, regdate, status, statusVerification, emailSent) {
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
    }

    set Ops(item) {
        if (item.sender == this.login) {
            this.balance = +this.balance - Number(item.amount);
        }
        else  
            this.balance = +this.balance + Number(item.amount);

        this.ops.push(item._id);
    }

    async findPlace(login) {
        const items = await User.findAll();
        items.sort((a,b) => (a.balance < b.balance) ? 1 : ((b.balance < a.balance) ? -1 : 0)); 
        
        let place = null;
        for(let i = 0; i < items.length; i++) {
            if(items[i].login == login) {
                place = i+1;
                console.log(place);
            }
        }
        return place;
    }

    async Balance() {
        let timestamp = Date.now();

        let place = await this.findPlace(this.login);

        if (!this.regdate) {
            let regDate = Date.now();
            if (new Date(regDate).getHours() < 5) {
                regDate = new Date((Number(new Date(regDate).getTime())-86400000));
            }
            regDate = new Date(regDate).setHours(5);
            regDate = new Date(regDate).setMinutes(0);
            regDate = new Date(regDate).setSeconds(0);

            this.regdate = new Date(regDate).getTime();
            await this.updateDB(this.login);
        }
        let dailyBalance = Math.floor((( timestamp - this.regdate )/86400000)) * 50;
        dailyBalance = dailyBalance > 0 ? dailyBalance : 0;
        console.log(dailyBalance);
        if(this.email && this.emailSent < (dailyBalance / 50)) {
            transporter.sendMail({
                from: config.sentEmail,
                to: this.email,
                subject: "С Вами поделились VIRом!",
                html: this.name+", здравствуйте!<br><br>Система поделилась с Вами на "+(dailyBalance-this.emailSent*50)+".<br>Теперь вы на "+place+" месте в рейтинге<br><br>"+
                "Всегда рады помочь,<br>Команда VIR<br><br><i>Поделитесь VIRом!</i><br><br>"+
                "<img src='cid:uniq-логотип2.png' alt='логотип2' width='32px' height='32px'>",
                attachments: [{
                    filename: 'логотип2.png',
                    path: __dirname + '/../src/img/логотип2.png',
                    cid: 'uniq-логотип2.png'
                }]
            });
            this.emailSent = dailyBalance / 50;
            console.log(this.emailSent + " + " + dailyBalance/50);
            await this.updateDB(this.login);
        }
        return new Promise((res, rej) => {
            advertDB.find({author: this.login, offerType: 'buy', contrAgent: '', status: true}, (err, items) => {
                let minus = 0;
                items.map(item => {
                    minus = Number(minus)+Number(item.price)
                })
                res(Number(this.balance - minus) + Number(dailyBalance))
            })
        })
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
                emailSent: this.emailSent
            }, {}, (err, replaced)=>{
                res(replaced)
            })
            
        })
    }

    static async updateOne(login1, login2){
        return new Promise((res, rej)=>{ 
            userDB.updateOne({
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
                status: this.status,
                statusVerification: this.statusVerification,
                emailSent: this.emailSent
            }, {}, (err, replaced)=>{
                res(replaced)
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
                    let user = new User(uD.login, uD.pass, uD.ops, uD.balance, uD.name, uD.lastname, uD.licenses, uD.email, uD.permission, uD.regdate, uD.status, uD.statusVerification, uD.emailSent);
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
                    let user = new User(uD.login, uD.pass, uD.ops, uD.balance, uD.name, uD.lastname, uD.licenses, uD.email, uD.permission, uD.regdate, uD.status, uD.statusVerification, uD.emailSent);
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
                    users.push(new User(uDs[i].login, uDs[i].pass, uDs[i].ops, uDs[i].balance, uDs[i].name, uDs[i].lastname, uDs[i].licenses, uDs[i].email, uDs[i].permission, uDs[i].regdate, uDs[i].status, uDs[i].statusVerification, uDs[i].emailSent))
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
            emailSent: this.emailSent
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