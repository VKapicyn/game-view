const User = require('./models/user').User;
const Operations = require('./models/ops').Operations;

async function loginsChange() {
    const ops = await Operations.findAll();
    let users = await User.findAll();;
        
    for(let i = 0; i < users.length; i++) {
        if(users[i].login && users[i].login.charAt(0) != 'V') {
            const login = await User.getAccessableLogins();
            for(let j = 0; j < ops.length; j++) {
                if(ops[j].sender == users[i].login) {
                    ops[j].sender = login;
                } else if(op.responser == users[i].login) {
                    ops[j].responser = login;
                }
                await ops[j].updateOpsDB();
            }
            users[i].login = login;
            users[i].status = 1;
            await users[i].updateDB();
        }
    }
}

loginsChange();
