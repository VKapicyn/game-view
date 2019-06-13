const User = require('../models/user').User;
const License = require('../models/license').License;
const Round = require('../models/round');

exports.getPage = async (req, res) => {
    let round = await Round.getRound(),
        status = Round.Round.status;

    res.render('admin.html', {round, status})
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

exports.getLicensePage = async (req, res) => {
    let users = await User.findAll();
    let lics = await License.findAll();
    let round = Round.getRound();

    res.render('adminLicense.html', {lics, users, round})
}

exports.createLicense = async (req, res) => {
    let licName = req.body.licname,
        opsMass = [];
        i = 0;

    while (true) {
        let opsName = 'ops'+i;
        if (req.body[opsName] == undefined || req.body[opsName] == '') 
            break;

        opsMass.push(req.body[opsName]);
        ++i;
    }

    let lic = new License(licName, opsMass);
        await lic.save()
    res.redirect('/admin/license');
}

exports.addOffer = async (req, res) => {
    let lic = {},
        login = req.body.user,
        price = req.body.price,
        licName = req.body.licname;

    lic = await License.getLisense(licName);
    await lic.toOffer(login, price);
    
    res.redirect('/admin/license');
}