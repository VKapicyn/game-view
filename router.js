const express = require('./server').express;
let controller = {}, middleware = {};

middleware.isAdmin = require('./middleware').isAdmin;
middleware.isReged = require('./middleware').isReged;

controller.rounds = require('./controllers/rounds');
controller.auth = require('./controllers/auth');
controller.wallet = require('./controllers/wallet');
controller.rait = require('./controllers/rait');
controller.txs = require('./controllers/txs');
controller.admin = require('./controllers/admin');

router = express.Router();

router.get('/', controller.auth.baseRoute)
router.get('/main/:err', controller.auth.getMainPage)
router.get('/reg', controller.auth.getRegPage)
router.get('/logout', controller.auth.logout)
router.get('/rait', controller.rait.getRaitPage)
router.get('/wallet', middleware.isReged, controller.wallet.getWalletPage)
router.get('/round/:command', controller.rounds.setRound)
router.get('/txs', controller.txs.getTxPage)
router.get('/admin', middleware.isAdmin, controller.admin.getPage)

router.post('/reg', controller.auth.setUser)
router.post('/log', controller.auth.login)
router.post('/rait', controller.rait.raitSearch)
router.post('/rait2', controller.rait.raitSearchV2)
router.post('/charge', middleware.isAdmin, controller.wallet.charge)
router.post('/send', middleware.isReged, controller.wallet.send)
router.post('/setfio', middleware.isReged, controller.auth.setFio)

module.exports.router = router