const Ops = require('../models/ops').Operations;

exports.getTxPage = async (req, res) => {
    res.render('txs.html', {
        ops: await Ops.findAll()
    })
}