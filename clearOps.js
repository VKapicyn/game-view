const User = require('./models/user').User;
const Operations = require('./models/ops').Operations;

async function clearOps() {
    const ops = await Operations.findAll();
    let users = await User.findAll();;
        
    for(let i = 0; i < users.length; i++) {
        let user = await User.find(users[i].login);
        await user.updateBalance(user.login);
        console.log(user);
    }

    for(let j = 0; j < ops.length; j++) {
        let op = await Operations.findById(ops[j]._id);
        op.deleteOne(op._id);
    }
}

clearOps();
