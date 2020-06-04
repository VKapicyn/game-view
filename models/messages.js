const config = require('../config');
const advertDB = require('../server').advertDB;
const User = require('../models/user').User;
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

class Messages {
    static async emailVerification(email, name, verification) {
        let textSend = config.sendVerification.replace("[responser_name]", name);
        textSend = textSend.replace("[domen]", config.domen);
        textSend = textSend.replace("[verification_code]", verification);
        transporter.sendMail({
            from: config.sentEmail,
            to: email,
            subject: "Подтверждение почты на сайте",
            html: textSend
        });
    };

    static async operation(email, responserName, senderName, senderLastName, amount, text, place) {
        if(email) {
            let textSend = config.sendOperation.replace("[responser_name]", responserName);
            textSend = textSend.replace("[sender_name]", senderName);
            textSend = textSend.replace("[sender_lastname]", senderLastName);
            textSend = textSend.replace("[amount]", amount);
            textSend = textSend.replace("[text]", text);
            textSend = textSend.replace("[place]", place);
            textSend = textSend.replace("[image]", "<img src='https://share.t2ch.io/img/%D0%BB%D0%BE%D0%B3%D0%BE%D1%82%D0%B8%D0%BF2.png' width='32px' height='32px'>");
            transporter.sendMail({
                from: config.sentEmail,
                to: email,
                subject: "С Вами поделились VIRом!",
                html: textSend
            });
        }
    }

    static async moneyEveryDay() {
        await checkDate();
        setInterval(checkDate, 3600000);
    }

    static async setPlaces() {
        let users = await User.findAll();
        let plus = 0, zero = 0, minus = 0;
        for (let i=0; i<users.length; i++) {
            if(users[i].balance == 1000) zero++;
            else if(users[i].balance > 1000) plus++;
            else minus++;
        }
        users.sort((a,b) => (a.balance > b.balance) ? 1 : ((b.balance > a.balance) ? -1 : 0));
        for(let i = 0; i < users.length; i++) {
            let prevUser;
            let user = await User.find(users[i].login);
            if(i > 0) prevUser = await User.find(users[i-1].login);
            if(user.balance == 1000) user.place = 0;
            else if(i == 0 && user.balance < 1000) {
                user.place = minus;
            } else if(i == 0 && user.balance > 1000) {
                user.place = -1;
            } else if(i > 0 && user.balance == prevUser.balance) {
                user.place = prevUser.place;
            } else if(user.balance > 1000 && prevUser.balance < 1000) {
                user.place = -1; 
            } else {
                user.place = prevUser.place-1;
            }
            console.log("place, ", user.place);
            await user.updatePlace(user.login, user.place);
        }
    }
}

async function checkDate() {
    const hour = new Date().getHours();
    let users = await User.findAll();
    if(hour < 5 && hour > 3) {
        users.sort((a,b) => (a.balance > b.balance) ? 1 : ((b.balance > a.balance) ? -1 : 0));
        for(let i = 0; i < users.length; i++) {
            if(users[i].email && users[i].balance < 1000) {
                let user = await User.find(users[i].login);
                let moneyPlus = 0;
                if(user.balance > 970) {
                    moneyPlus = 1000 - user.balance;
                    user.balance = 1000;
                } else {
                    moneyPlus = 30;
                    user.balance += 30;
                }
                await user.updateBalance(user.login, user.balance);
                let textSend = config.moneyEveryDay.replace("[responser_name]", user.name);
                textSend = textSend.replace("[amount]", user.balance+moneyPlus);
                textSend = textSend.replace("[place]", user.place);
                textSend = textSend.replace("[moneyPlus]", moneyPlus);
                textSend = textSend.replace("[image]", "<img src='https://share.t2ch.io/img/%D0%BB%D0%BE%D0%B3%D0%BE%D1%82%D0%B8%D0%BF2.png' width='32px' height='32px'>");
                transporter.sendMail({
                    from: config.sentEmail,
                    to: users[i].email,
                    subject: "С Вами поделились VIRом!",
                    html: textSend
                });
            }
        }
        for(let i = 0; i < users.length; i++) {
            let prevUser;
            let user = await User.find(users[i].login);
            if(i > 0) prevUser = await User.find(users[i-1].login);
            if(user.balance == 1000) user.place = 0;
            else if(i == 0 && user.balance < 1000) {
                user.place = minus;
            } else if(i == 0 && user.balance > 1000) {
                user.place = -1;
            } else if(i > 0 && user.balance == prevUser.balance) {
                user.place = prevUser.place;
            } else if(user.balance > 1000 && prevUser.balance < 1000) {
                user.place = -1; 
            } else {
                user.place = prevUser.place-1;
            }
            await user.updatePlace(user.login, user.place);
        }
    } else if(hour < 1) {
        const dateMonth = new Date().getMonth();
        const dayOfWeek = new Date().getDay();
        const dateDay = new Date().getDate();
        let plus = 0, zero = 0, minus = 0;
        for (let i=0; i<users.length; i++) {
            if(users[i].balance == 1000) zero++;
            else if(users[i].balance > 1000) plus++;
            else minus++;
        }
        users.sort((a,b) => (a.balance > b.balance) ? 1 : ((b.balance > a.balance) ? -1 : 0));
        for(let i = 0; i < users.length; i++) {
            let prevUser;
            let user = await User.find(users[i].login);
            if(i > 0) prevUser = await User.find(users[i-1].login);
            if(user.balance == 1000) user.place = 0;
            else if(i == 0 && user.balance < 1000) {
                user.place = minus;
            } else if(i == 0 && user.balance > 1000) {
                user.place = -1;
            } else if(i > 0 && user.balance == prevUser.balance) {
                user.place = prevUser.place;
            } else if(user.balance > 1000 && prevUser.balance < 1000) {
                user.place = -1; 
            } else {
                user.place = prevUser.place-1;
            }
            await user.updatePlace(user.login, user.place);
            user.dayPlus = user.place;
            if(dateDay == 0) user.monthPlus = user.place;
            if(dayOfWeek == 1) user.weekPlus = user.place;
            await user.updateProgress(users[i].login, user.dayPlus, user.weekPlus, user.monthPlus);
        }
    }
    return;
}

module.exports.Messages = Messages;
