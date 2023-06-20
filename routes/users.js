const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => {
  res.render('login');
});

// Register Page
router.get('/register', (req, res) => {
  res.render('register');
});

// Register Handle
router.post('/register', (req, res) => {
  const { name, email } = req.body;
  let errors = [];

  if (!name || !email) {
    errors.push({ msg: 'Please enter all fields' });
    return res.render('register', {
      errors,
      name,
      email
    });
  }

  User.findOne({ email: email, isActive: true })
    .then(user => {
      if (user) {
        errors.push({ msg: 'Email ID already exists' });
        res.render('register', {
          errors,
          name,
          email
        });
      } else {
        const newUser = new User({
          name,
          email
        });

        newUser.save()
          .then(user => {
            req.flash('success_msg', 'You are now registered and can log in');
            res.redirect('/users/login');
          })
          .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error');
          });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

// Login Handle
router.post('/login', (req, res) => {
  const { email } = req.body;

  User.findOne({ email: email })
    .exec()
    .then(user => {
      if (!user) {
        let errors = [];
        errors.push({ msg: 'This email is not registered' });
        res.render('login', {
          errors,
          email
        });
      } else {
        res.redirect(`/dashboard?user=${user.email}`);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
