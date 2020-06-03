const User = require('./models/user').User;
const Operations = require('./models/ops').Operations;

async function delete_V01_V07() {
    const ops = await Operations.findAll();
    let users = await User.findAll();;
        
    for(let i = 0; i < users.length; i++) {
        if(users[i].login && (users[i].login == 'V01' || users[i].login == 'V07')) {
            let user = await User.find(users[i].login);
            for(let j = 0; j < ops.length; j++) {
                let op = await Operations.findById(ops[j]._id);
                if(op.sender == user.login) {
                    op.deleteOne(op._id);
                } else if(op.responser == user.login) {
                    op.deleteOne(op._id);
                }
            }
            await user.deleteOne(users[i].login);
        }
    }
}

delete_V01_V07();
