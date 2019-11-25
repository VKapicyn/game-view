const Round = require('../models/round');
const request = require('async-request');
const BlockChain = require('../models/blockchain')

exports.getPage = async (req, res) => {
  let scs = await request('http://localhost:9000/api/sk/actual/1', {
    method: 'GET', 
  })
  const returnObj = {
    round: Round.getRound(),
    scs: JSON.parse(scs.body)
  };
  return res.render('smartContracts.html', returnObj);
}

exports.createSC = async (req, res) => {
  let tryCreate;
  try {
    tryCreate = await request('http://localhost:9000/api/sk/create', {
      method: 'POST', 
      data: {
        text: req.body.scText,
        user: req.session.user.login
      }
    });
  } catch (e) {
    tryCreate = {err:'неизвестная ошибка'};
  }
  let scs;
  try {
    scs = await request('http://localhost:9000/api/sk/actual/1', {
      method: 'GET', 
    })
  } catch(e) {
    scs = [];
  }
  const returnObj = {
    round: Round.getRound(),
    scs: JSON.parse(scs.body),
    err: JSON.parse(tryCreate.body).sk.err ? JSON.parse(tryCreate.body).sk.err: null
  };
  return res.render('smartContracts.html', returnObj)
}

exports.callField = async (req, res) => {
  
}