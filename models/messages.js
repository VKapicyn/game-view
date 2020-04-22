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
        transporter.sendMail({
            from: config.sentEmail,
            to: email,
            subject: "Подтверждение почты на сайте",
            html: name+", здравствуйте!<br><br>Перейдите по ссылке ниже, чтобы получить доступ ко всем функциям нашего сайта"+
            "<br><br><a class='btn btn-primary'"+
            "href='"+config.domen+"verification/"+verification+"'>Нажмите сюда, чтобы подтвердить почту</a>"
        });
    };

    static async operation(email, responserName, senderName, senderLastName, amount, text, place) {
        if(email) {
            transporter.sendMail({
                from: config.sentEmail,
                to: email,
                subject: "С Вами поделились VIRом!",
                html: responserName+", здравствуйте!<br><br>"+senderName+" "+senderLastName+
                " поделился(лась) с Вами на "+amount+".<br>Со словами: "+text+"<br><br>Теперь вы на "+place+" месте в рейтинге<br><br>"+
                "Всегда рады помочь,<br>Команда VIR<br><br><i>Поделитесь VIRом!</i><br><br>"+
                "<img src='cid:uniq-логотип2.png' alt='' width='32px' height='32px'>",
                attachments: [{
                    filename: 'логотип2.png',
                    path: __dirname + '/../src/img/логотип2.png',
                    cid: 'uniq-логотип2.png'
                }]
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
        for(let i = 0; i < users.length; i++) {
            if(users[i].email) {
                transporter.sendMail({
                    from: config.sentEmail,
                    to: users[i].email,
                    subject: "С Вами поделились VIRом!",
                    html: users[i].name+", здравствуйте!<br><br>Система поделилась с Вами на 50.<br><br>"+
                    "Всегда рады помочь,<br>Команда VIR<br><br><i>Поделитесь VIRом!</i><br><br>"+
                    "<img src='cid:uniq-логотип2.png' alt='логотип2' width='32px' height='32px'>",
                    attachments: [{
                        filename: 'логотип2.png',
                        path: __dirname + '/../src/img/логотип2.png',
                        cid: 'uniq-логотип2.png'
                    }]
                });
            }
        }
    }
    return;
}

module.exports.Messages = Messages;
