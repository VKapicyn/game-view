const User = require('./models/user').User;
const License = require('./models/license').License;
const config = require('./config');
const Round = require('./models/round');
const userDB = require('./server').userDB;
const Operations = require('./models/ops').Operations;

async function loginsChange() {
    const ops = await Operations.findAll({dateFromat: true})

    let regedUsers = await User.getUserList(null);
        
    for(let j = 0; j < regedUsers.length; j++) {
        if(regedUsers[j].charAt(0) != 'V') {
            const login = await User.getAccessableLogins();
            let user = await User.find(regedUsers[j]);
            for(let i = 0; i < ops.length; i++) {
                let op = await Operations.findById(ops[i]._id);
                if(op.sender == regedUsers[i]) {
                    op.sender = login;
                } else if(op.responser == regedUsers[i]) {
                    op.responser = login;
                }
                await op.updateOpsDB();
            }
            user.login = login;
            user.status = 1;
            await user.updateDB();
        }
    }
}

loginsChange();
//process.exit();
