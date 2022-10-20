const express = require('express');
const router = express.Router();
const { Users } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validateToken = require('../middlewares/AuthMiddleware');

// create user / register
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  //   we distructure here bq we're interested on protecting the password.
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  await Users.create({ username, password: hashedPassword });
  res.json('success registering new user');
});

// login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await Users.findOne({ where: { username: username } });
  if (!existingUser) {
    res.status(401).json({ error: 'User not found.' });
    return;
  }
  const match = await bcrypt.compare(password, existingUser.password);
  if (!match) {
    res.status(401).json({ error: 'Incorrect password' });
    return;
  }
  const accessToken = jwt.sign(
    { username: existingUser.username, id: existingUser.id },
    'importantsecret'
  );
  /*give the accessToken as a response so we can grab it on the frontend and 
  store it in a cookie (safer) or in the session storage (easier).*/
  res.json({ token: accessToken, username: username, id: existingUser.id });
});

// Verify token authenticity at initial loading of the page.
router.get('/auth', validateToken, (req, res) => {
  res.json(req.user);
  // this is a decoded token that includes the username and the id as per the middleware defined.
});

// delete user
router.delete('/:userId', async (req, res) => {
  const userId = req.params.userId;
  await Users.destroy({ where: { id: userId } });
  res.status(200).json({ message: 'User was deleted.' });
});

// log out user
router.post('/', (req, res) => {
  req.user = null;
  res.status(200).json({ message: 'User logged out' });
});

module.exports = router;
