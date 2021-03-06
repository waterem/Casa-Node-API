const express = require('express');
const router = express.Router();
const lightningLogic = require('logic/lightning.js');
const auth = require('middlewares/auth.js');
const safeHandler = require('utils/safeHandler');

router.get('/btc', auth.jwt, safeHandler((req, res) =>
  lightningLogic.getWalletBalance()
    .then(balance => res.json(balance))
));

// Should not include auth because the user isn't registered yet. Once the user initializes a wallet, that wallet is
// locked and cannot be updated unless a full system reset is initiated.
router.post('/init', safeHandler((req, res) => {

  const password = req.body.password;
  const seed = req.body.seed;

  if (seed.length !== 24) { // eslint-disable-line no-magic-numbers
    throw new Error('Invalid seed length');
  }

  // TODO validate password requirements

  return lightningLogic.initializeWallet(password, seed)
    .then(response => res.json(response));
}));

router.get('/lightning', auth.jwt, safeHandler((req, res) =>
  lightningLogic.getChannelBalance()
    .then(balance => res.json(balance))
));

// Should not include auth because the user isn't registered yet. The user can get a seed phrase as many times as they
// would like until the wallet has been initialized.
router.get('/seed', safeHandler((req, res) =>
  lightningLogic.generateSeed()
    .then(seed => res.json(seed))
));

router.post('/unlock', auth.jwt, safeHandler((req, res) =>
  lightningLogic.unlockWallet(req.body.password)
    .then(response => res.json(response))
));

module.exports = router;
