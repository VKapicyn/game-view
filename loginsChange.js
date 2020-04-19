const User = require('../models/user').User;
const License = require('../models/license').License;
const Ops = require('../models/ops').Operations;
const config = require('../config');
const Round = require('../models/round');
const userDB = require('../server').userDB;
const Ops = require('../models/ops').Operations;

async function loginsChange() {
    const ops = await Ops.findAll({dateFromat: true})

    let regedUsers = await User.getUserList(null);
        
    for(let j = 0; j < regedUsers.length; j++) {
        if(regedUsers[j].charAt(0) != 'V') {
            const login = User.getAccessableLogins();
            const user = await User.find(regedUsers[j]);
            user.login = login;
            for(let i = 0; i < ops.length; i++) {
                if(ops[i].sender == regedUsers[j]) {
                    ops[i].sender == login;
                } else if(ops[i].responser == regedUsers[j]) {
                    ops[i].responser == login
                }
                ops[i].updateDB();
            }
            user.updateDB;
        }
    }
}
