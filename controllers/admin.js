exports.getPage = async (req, res) => {
    res.render('admin.html')
}

exports.isAdmin = (login) => {
    adminList = require('../config').adminLogins;
    let flag = false;
    adminList.map(admin => {
        if (admin == login)
            flag = true;
    });
    
    return flag;
}