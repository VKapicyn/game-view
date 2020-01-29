const Round = require('../models/round');
const request = require('async-request');
const User = require('../models/user').User;
const BlockChain = require('../models/blockchain').BlockChain;
const Ops = require('../models/ops').Operations;

exports.getPage = async (req, res) => {
  let scs = await request('http://localhost:9000/api/sk/actual/'+Round.getRound(), {
    method: 'GET', 
  })
  let getBalances = JSON.parse(scs.body);
  for (let i=0; i<getBalances.length; i++) {
    let _bal = await User.find(getBalances[i]._id);

    getBalances[i].resBalance = _bal ? _bal.balance : 0;
  }

  const returnObj = {
    round: Round.getRound(),
    scs: getBalances,
    logs: await BlockChain.getAll()
  };

  return res.render('smartContracts.html', returnObj);
}

exports.createSC = async (req, res) => {
  try{
    tryCreate = await request('http://localhost:9000/api/sk/create', {
      method: 'POST', 
      data: {
        text: req.body.scText,
        user: req.session.user.login,
        round: Round.getRound()
      }
    });
    if (JSON.parse(tryCreate.body).err) {
      res.send({error: JSON.parse(tryCreate.body).err})
    } else  {
      let log = new BlockChain(new Date(), req.session.user.login, tryCreate.body.replace("\"",'').replace("\"",''), 'создал контракт',Round.getRound())
      await log.save();
      console.log(JSON.parse(tryCreate.body));
      res.send({'id':JSON.parse(tryCreate.body), error: 0})
    }
  } catch(e) {
    console.log(e)
    res.send({error: 'Блокчейн сервер недоступен'})
  }
}

/*
exports.createSC = async (req, res) => {
  let tryCreate;
  try {
    tryCreate = await request('http://localhost:9000/api/sk/create', {
      method: 'POST', 
      data: {
        text: req.body.scText,
        user: req.session.user.login,
        round: Round.getRound()
      }
    });
    if (JSON.parse(tryCreate.body).err) {
      let _scs = await request('http://localhost:9000/api/sk/actual/'+Round.getRound(), {
        method: 'GET', 
      })
      const returnObj = {
        logs: await BlockChain.getAll(),
        round: Round.getRound(),
        scs: JSON.parse(_scs.body),
        error: JSON.parse(tryCreate.body).err
      };
  
      let log = new BlockChain(new Date(), req.session.user.login, 'null' , 'Ошибка: '+JSON.parse(tryCreate.body).err)
      await log.save();
      return res.render('smartContracts.html', returnObj);
    } else  {
      let log = new BlockChain(new Date(), req.session.user.login, tryCreate.body, 'создал контракт')
      await log.save();
    }

  } catch (e) {

  }
  res.redirect('/smartcontracts');
}
*/

exports.callField = async (req, res) => {
  console.log('call Field')
  try {
    scs = await request('http://localhost:9000/api/callField', {
      method: 'POST', 
      data: {
        skId: req.body.skId,
        fieldId: req.body.fieldId,
        user: req.session.user.login,
        data: req.body.data,
      }
    })

    if (JSON.parse(scs.body).err) {
      let _scs = await request('http://localhost:9000/api/sk/actual/'+Round.getRound(), {
        method: 'GET', 
      })
      const returnObj = {
        logs: await BlockChain.getAll(),
        round: Round.getRound(),
        scs: JSON.parse(_scs.body),
        error: JSON.parse(scs.body).err,
        skParam: req.body.skId
      };

      return res.render('smartContracts.html', returnObj);
    } else {
      let log = new BlockChain(new Date(), req.session.user.login, req.body.skId, req.body.fieldName+': '+req.body.data,Round.getRound())
      await log.save();
      return res.redirect('back');
    }
  } catch(e) {
  }
}

//FIXME: распределить баласн один раз за раунд? только создатель?
exports.distributeBalance = async (_login, contract) => {
  let _scs, results;
  if (contract == 'all') {
    _scs = await request('http://localhost:9000/api/sk/results/'+contract, {
      method: 'GET', 
    })
  }
  else {
    _scs = await request('http://localhost:9000/api/sk/results/'+contract, {
      method: 'GET', 
    })
    results = JSON.parse(_scs.body);//
    results = results.result;
  }

  let sumBalance = 0;
  results.map(result => {
    if (result.balance != null)
      sumBalance += Number(result.balance);
  })

  let _bal = await User.find(contract);
  let contBal = _bal ? _bal.balance : 0;

  let log = new BlockChain(new Date(), _login, contract, `распределил баланс: ${contBal}; (требовалось: ${sumBalance})`,Round.getRound())
  await log.save();

  if (contBal >= sumBalance && contBal>0) {
    for (let i=0; i<results.length; i++) { 
      if (results[i].balance != null)
        {
            let sender = contract,
                responser = results[i].user,
                amount = results[i].balance,
                text = 'Выплата контракта';
                type = 'Смарт-контракт';
                count = 1;
        
            let operation = new Ops(sender, responser, amount, text, type, count),
                senderUser = await User.find(sender),
                responserUser = await User.find(responser);

            if (!responserUser) {
                responserUser = new User(responser, config.skPass, [], 0, 'codeSK');
                await responserUser.save();
            }

            console.log(amount, await senderUser.Balance())
            if (amount > 0 && await senderUser.Balance() >= amount) {
                operation = await operation.save();
                senderUser.Ops = operation;
                await senderUser.updateDB();
                responserUser.Ops = operation;
                await responserUser.updateDB();
            }
        }
    }
  }
}

exports.distributeController = async (req, res) => {
  if (req.params.scId != 'all') {
    await exports.distributeBalance(req.session.user.login, req.params.scId)
  }

  res.redirect('back');
}

//TODO:потом
exports.distributeControllerAdmin = async (req, res) => {
  let log = new BlockChain(new Date(), 'Система', req.body.skId, 'распределил баланс',Round.getRound())
  await log.save();
  if (req.session.admin)
    await exports.distributeBalance(req.session.admin,'all')
  res.redirect('/admin/round');
}

exports.getScPage = async (req, res) => {
  try{
    let logs = await BlockChain.getOne(req.params.scId);
    logs.map(l => {
      let t = new Date(l.time)
      l.time = `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`
    })
    let sc = (await request('http://localhost:9000/api/sk/'+req.params.scId, {method: 'GET'})).body
    res.render('sc.html', {
      sc: JSON.parse(sc),
      logs
    })
  } catch(e) {
    res.render('err.html',{err:e, url: '/smartcontracts'})
  }
}