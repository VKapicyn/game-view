exports.port = 8888;
exports.token = 'super_sicret_parol_VIRO';
exports.dbName = 'sessions';
exports.adminLogins = ['Bank'];
exports.userDB = 'game_users';
exports.opsDB = 'game_ops';
/*exports.host = "smtp.gmail.com";
exports.sentEmail = "ivnprotsenko@gmail.com";
exports.sentPass = "";
exports.domen = "http://localhost:8080/";
exports.secretKey = "6Ld9WOoUAAAAAOu6VjnquCTJAQXkIU-SWJZrxs0m";
exports.isProduction = false;*/
exports.host = "mail.hosting.reg.ru";
exports.sentEmail = "in@viruni.ru";
exports.sentPass = "xudhyp-vibgi4-kIqhif";
exports.domen = "https://share.t2ch.io/";
exports.secretKey = "6LfdQusUAAAAAGUmih-t32U8LSL-4uLfhFBMXde7";
exports.isProduction = true;

exports.sendVerification = 
"[responser_name], здравствуйте!<br><br>Перейдите по ссылке ниже, чтобы получить доступ ко всем функциям нашего сайта"+
"<br><br><a class='btn btn-primary'"+
"href='[domen]verification/[verification_code]'>Нажмите сюда, чтобы подтвердить почту</a>";

exports.sendOperation = 
"[responser_name], здравствуйте!<br><br>[sender_name] [sender_lastname]"+
" поделился(лась) с Вами на [amount].<br>Со словами: [text]<br><br>Теперь вы на [place] уровне<br><br>"+
"Всегда рады помочь,<br>Команда VIR<br><br><i>Поделись VIRом!</i><br><br>[image]";

exports.moneyEveryDay = "[responser_name], здравствуйте!<br><br>Система поделилась с Вами на [moneyPlus].<br><br>"+
"Теперь у вас [amount] VIR и вы на [place] уровне<br><br>"+
"Всегда рады помочь,<br>Команда VIR<br><br><i>Поделись VIRом!</i><br><br>[image]";