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
}

async function checkDate() {
    const date = new Date().getHours();
    if(date < 6 && date > 4) {
        let users = await User.findAll();
        users.sort((a,b) => (a.balance > b.balance) ? 1 : ((b.balance > a.balance) ? -1 : 0));
        for(let i = 0; i < users.length; i++) {
            if(users[i].email) {
                let textSend = config.moneyEveryDay.replace("[responser_name]", users[i].name);
                textSend = textSend.replace("[place]", i+1);
                textSend = textSend.replace("[image]", "<img src='https://share.t2ch.io/img/%D0%BB%D0%BE%D0%B3%D0%BE%D1%82%D0%B8%D0%BF2.png' width='32px' height='32px'>");
                transporter.sendMail({
                    from: config.sentEmail,
                    to: users[i].email,
                    subject: "С Вами поделились VIRом!",
                    html: textSend
                });
            }
        }
    }
    return;
}

module.exports.Messages = Messages;
