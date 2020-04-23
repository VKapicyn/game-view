const User = require('./models/user').User;
const Operations = require('./models/ops').Operations;

async function loginsChange() {
    const ops = await Operations.findAll();
    let users = await User.findAll();;
        
    for(let i = 0; i < users.length; i++) {
        if(users[i].login && users[i].login.charAt(0) != 'V') {
            let login = await User.getAccessableLogins();
            let user = await User.find(users[i].login);
            for(let j = 0; j < ops.length; j++) {
                let op = await Operations.findById(ops[j]._id);
                if(op.sender == user.login) {
                    op.sender = login;
                } else if(op.responser == user.login) {
                    op.responser = login;
                }
                console.log(op);
                await op.updateOpsDB(op.sender, op.responser);
            }
            user.login = login;
            user.status = 1;
            await user.updateOne(users[i].login, login);
        }
    }
}

loginsChange();
