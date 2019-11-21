const Round = require('../models/round');

exports.getPage = async (req, res) => {
  const returnObj = {
    round: Round.getRound(),
  };
  return res.render('smartContracts.html', returnObj);
}