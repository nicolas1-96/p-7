const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/user/:id', auth, userCtrl.getOneUser);
router.delete('/:id', userCtrl.deleteAccount);
router.put('/user/:id', auth, multer, userCtrl.modifyUser);


module.exports = router;